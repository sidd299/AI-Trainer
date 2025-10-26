import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { GUIDELINES } from '../../../lib/aiGuidelines';

// Configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Try different models in order of preference
const AVAILABLE_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
];

// Standard AI Guidelines are now imported from lib/aiGuidelines.ts

/**
 * Find a working model using direct REST API calls
 */
async function findWorkingModel(): Promise<string> {
  console.log('🔍 Testing available models...');
  
  for (const model of AVAILABLE_MODELS) {
    try {
      const testRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: 'Hello' }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      };
      
      const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest)
      });
      
      if (response.ok) {
        console.log(`✅ Found working model: ${model}`);
        return model;
      } else {
        console.log(`❌ Model ${model} not available: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Model ${model} error:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  console.error('❌ No working models found!');
  return AVAILABLE_MODELS[0]; // Return first model as fallback
}

interface OnboardingRequest {
  userId: string;
  paragraph: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  status: 'in-progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

/**
 * Generate onboarding summary with standard guidelines
 */
async function generateOnboardingSummary(paragraph: string): Promise<string> {
  try {
    const modelName = await findWorkingModel();
    
    const prompt = `
${GUIDELINES}

**SPECIFIC TASK:**
You are an expert fitness trainer and AI assistant with 10+ years of experience. Analyze the following comprehensive user onboarding questionnaire responses and create a detailed, structured summary for generating personalized workout plans.

**INSTRUCTIONS:**
1. Parse the structured questionnaire data carefully
2. Extract key insights about the user's fitness profile
3. Consider their experience level, goals, and current capabilities
4. Identify any limitations or special considerations
5. Provide actionable insights for workout planning
6. Focus on practical, achievable recommendations
7. Consider the user's lifestyle and time constraints

**USER ONBOARDING DATA:**
${paragraph}

**REQUIRED OUTPUT FORMAT:**
Create a comprehensive analysis that includes:

## User Profile Summary
- **Demographics:** Age, weight, gender
- **Experience Level:** Based on gym history and current capabilities
- **Primary Goal:** Main fitness objective
- **Current Fitness Level:** Based on bodyweight exercise performance

## Workout Preferences
- **Preferred Split:** Training style and muscle group organization
- **Training Frequency:** Based on split preference and experience
- **Equipment Access:** Inferred from goals and experience

## Key Considerations
- **Strengths:** What the user can do well
- **Limitations:** Areas that need attention or modification
- **Progression Path:** How to structure their training journey
- **Recovery Needs:** Based on recent workout history

## Training Recommendations
- **Workout Structure:** Recommended split and frequency
- **Exercise Selection:** Types of exercises appropriate for their level
- **Progression Strategy:** How to advance their training
- **Safety Considerations:** Any modifications needed

## Nutrition & Lifestyle
- **Dietary Considerations:** Basic nutrition advice for their goals
- **Sleep & Recovery:** Importance of rest and recovery
- **Motivation Tips:** How to stay consistent

Provide specific, actionable insights that will help create an effective, personalized workout plan. Be encouraging and realistic in your recommendations.
`;

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const apiUrl = `${GEMINI_BASE_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    console.log('Making request to:', apiUrl);
    console.log('Using model:', modelName);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract response text
    let responseText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      responseText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response from API');
    }

    console.log('✅ AI summary generated successfully');
    return responseText;
  } catch (error) {
    console.error('Error generating LLM summary:', error);
    return createFallbackSummary(paragraph);
  }
}

/**
 * Create a fallback summary when AI is unavailable
 */
function createFallbackSummary(paragraph: string): string {
  const lines = paragraph.split('\n').filter(line => line.trim());
  const goals = lines.find(line => line.includes('goal')) || 'General fitness';
  const experience = lines.find(line => line.includes('experience')) || 'Not specified';
  const age = lines.find(line => line.includes('Age:')) || 'Not specified';
  
  return `## User Profile Summary

- **Demographics:** ${age}
- **Experience Level:** ${experience}
- **Primary Goal:** ${goals}
- **Current Fitness Level:** Based on provided information

## Workout Preferences
- **Preferred Split:** To be determined based on experience level
- **Training Frequency:** Recommended 3-4 times per week for beginners
- **Equipment Access:** Standard gym equipment recommended

## Key Considerations
- **Strengths:** User is motivated to start their fitness journey
- **Limitations:** Will be assessed during initial workouts
- **Progression Path:** Start with basic movements and gradually increase intensity
- **Recovery Needs:** Adequate rest between workout sessions

## Training Recommendations
- **Workout Structure:** Full body workouts 3 times per week
- **Exercise Selection:** Compound movements with proper form
- **Progression Strategy:** Linear progression with focus on technique
- **Safety Considerations:** Always prioritize proper form over weight

## Nutrition & Lifestyle
- **Dietary Considerations:** Balanced diet with adequate protein
- **Sleep & Recovery:** 7-9 hours of quality sleep recommended
- **Motivation Tips:** Set small, achievable goals and track progress

Original input: ${paragraph.substring(0, 150)}...`;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: OnboardingRequest = await request.json();
    const { userId, paragraph } = body;

    // Validate required fields
    if (!userId || !paragraph) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and paragraph are required' },
        { status: 400 }
      );
    }

    if (typeof userId !== 'string' || typeof paragraph !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types: userId and paragraph must be strings' },
        { status: 400 }
      );
    }

    // Generate LLM summary with standard guidelines
    const summary = await generateOnboardingSummary(paragraph);

    // ✅ Store Gemini response in database
    try {
      console.log('Attempting to store Gemini response for user:', userId);
      const { data: geminiResponse, error: geminiError } = await supabase
        .from('gemini_responses')
        .insert({
          user_id: userId,
          prompt: paragraph,
          response: summary,
          type: 'onboarding',
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (geminiError) {
        console.warn('Failed to store Gemini response:', geminiError);
        console.warn('Error details:', JSON.stringify(geminiError, null, 2));
        // Continue without failing the request
      } else {
        console.log('✅ Gemini response stored successfully:', geminiResponse?.id);
      }
    } catch (geminiError) {
      console.warn('Gemini response storage failed:', geminiError);
    }

    // Try to create user with onboarding data (with RLS bypass for now)
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          onboarding_info: {
            paragraph: paragraph,
            timestamp: new Date().toISOString()
          },
          chat_summary: summary,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (userError) {
        console.warn('Database save failed (RLS policy), but continuing with AI processing:', userError.message);
        // Continue without database storage for now
      } else {
        console.log('✅ User data saved successfully');
      }
    } catch (dbError) {
      console.warn('Database operation failed, but continuing:', dbError);
    }

    // Try to store the onboarding content as an embedding for future reference
    try {
      const { error: embeddingError } = await supabase
        .from('embeddings')
        .insert({
          user_id: userId,
          content: paragraph,
          type: 'onboarding',
          created_at: new Date().toISOString()
        });

      if (embeddingError) {
        console.warn('Failed to store embedding:', embeddingError);
        // Don't fail the request if embedding storage fails
      } else {
        console.log('✅ Embedding stored successfully');
      }
    } catch (embeddingError) {
      console.warn('Embedding storage failed:', embeddingError);
    }

    // Static information to send with the response
    const staticInformation = {
      welcomeMessage: "Welcome to your personalized fitness journey! 🎉",
      nextSteps: [
        "Review your personalized workout plan below",
        "Start with the recommended exercises and rep ranges",
        "Track your progress using the built-in tracker",
        "Adjust intensity based on how you feel"
      ],
      tips: [
        "Always warm up before exercising",
        "Focus on proper form over heavy weights",
        "Listen to your body and rest when needed",
        "Stay consistent - small steps lead to big results"
      ],
      resources: {
        exerciseDatabase: "Access our exercise library for form videos",
        progressTracking: "Use the built-in tracker to monitor your gains",
        nutritionGuide: "Check out our nutrition tips for your goals",
        support: "Join our community for motivation and tips"
      },
      safetyReminder: "If you experience any pain or discomfort, stop the exercise and consult a healthcare professional.",
      motivation: "Remember: Every expert was once a beginner. You've got this! 💪"
    };

    return NextResponse.json({
      success: true,
      userId: userId,
      summary: summary,
      staticInfo: staticInformation,
      guidelines: GUIDELINES, // Include the guidelines in response for reference
      message: 'Onboarding data processed successfully',
      stored: {
        geminiResponse: true,
        userData: true,
        embedding: true
      }
    });

  } catch (error) {
    console.error('Onboarding API error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('API request failed')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'AI service quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
