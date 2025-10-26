import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { GUIDELINES } from '../../../../lib/aiGuidelines';

// Configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate new workout plan based on chat conversation
 */
async function generateNewWorkoutPlan(
  currentWorkout: any,
  userContext: string,
  onboardingContext: string,
  chatHistory: any[],
  changeRequest: string
): Promise<any> {
  try {
    const prompt = `
You are an AI fitness coach. Based on the user's chat conversation, you need to generate a NEW workout plan that incorporates their feedback and requests.

## Current Workout Plan:
${JSON.stringify(currentWorkout, null, 2)}

## User Context (Dynamic - Updated with each conversation):
${userContext}

## Original Onboarding Context:
${onboardingContext}

## Recent Chat History:
${chatHistory.slice(-10).map(msg => `${msg.message_type}: ${msg.content}`).join('\n')}

## User's Change Request:
${changeRequest}

## AI Guidelines:
${GUIDELINES}

## Instructions:
1. **Analyze the user's feedback** - What specific changes do they want?
2. **Generate a NEW workout plan** - Don't just modify the existing one, create a fresh plan
3. **Incorporate their preferences** - Use the updated user context and chat history
4. **Maintain safety** - Follow all the guidelines for their experience level
5. **Provide reasoning** - Explain why you made these changes

## Output Format:
Return ONLY a JSON object with this exact structure:

{
  "today": [
    {
      "section": "Warmup",
      "exercises": [
        "Exercise 1",
        "Exercise 2"
      ]
    },
    {
      "section": "Main Workout", 
      "exercises": [
        "Exercise 1",
        "Exercise 2",
        "Exercise 3"
      ]
    },
    {
      "section": "Cardio",
      "exercises": [
        "Exercise 1"
      ]
    },
    {
      "section": "Cooldown",
      "exercises": [
        "Exercise 1",
        "Exercise 2"
      ]
    }
  ],
  "ai_coach_tips": [
    "Tip 1 (5-6 words)",
    "Tip 2 (5-6 words)", 
    "Tip 3 (5-6 words)",
    "Tip 4 (5-6 words)"
  ],
  "change_summary": "Brief explanation of what changed and why (2-3 sentences)"
}

## Important Notes:
- Return only the JSON, no additional text or commentary
- Make sure the changes address the user's specific requests
- Keep the same structure but update exercises as needed
- Provide 4-5 AI coach tips that explain the reasoning behind the changes
- The change_summary should clearly explain what was modified

Return only the JSON object:
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
        maxOutputTokens: 1024,
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

    const apiUrl = `${GEMINI_BASE_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log('Making workout change proposal request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Workout change API error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract response text
    let responseText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      responseText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response from workout change API');
    }

    // Parse the JSON response
    let newWorkoutPlan;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      newWorkoutPlan = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse workout change response:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('✅ New workout plan generated successfully');
    return newWorkoutPlan;
  } catch (error) {
    console.error('Error generating new workout plan:', error);
    throw error;
  }
}

/**
 * Generate weight suggestions for the new workout plan
 */
async function generateWeightSuggestionsForNewWorkout(
  newWorkoutPlan: any,
  userContext: string,
  userId: string
): Promise<any> {
  const weightSuggestions: any = {};
  
  try {
    // Extract all exercises from all sections
    const allExercises: string[] = [];
    if (newWorkoutPlan.today && Array.isArray(newWorkoutPlan.today)) {
      newWorkoutPlan.today.forEach((section: any) => {
        if (section.exercises && Array.isArray(section.exercises)) {
          section.exercises.forEach((exercise: string) => {
            allExercises.push(exercise);
          });
        }
      });
    }

    console.log(`📋 Found ${allExercises.length} exercises to generate weight suggestions for new workout`);

    // Generate weight suggestions for each exercise
    for (const exercise of allExercises) {
      try {
        console.log(`🏋️ Generating weight suggestion for: ${exercise}`);
        
        const weightResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/suggest-weights-ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_context: userContext,
            exercise_details: exercise,
            user_id: userId
          })
        });

        if (weightResponse.ok) {
          const weightData = await weightResponse.json();
          if (weightData.success && weightData.sets) {
            weightSuggestions[exercise] = {
              exercise_name: weightData.exercise_name,
              sets: weightData.sets,
              reasoning: weightData.reasoning,
              safety_notes: weightData.safety_notes,
              success: true
            };
            console.log(`✅ Weight suggestion generated for: ${exercise} with ${weightData.sets.length} sets`);
          } else {
            console.warn(`⚠️ Failed to generate weight suggestion for: ${exercise}`, weightData.error);
            weightSuggestions[exercise] = {
              exercise_name: exercise,
              sets: [],
              reasoning: "Weight suggestions could not be generated",
              safety_notes: "Please consult a trainer for proper weight selection",
              success: false,
              error: weightData.error
            };
          }
        } else {
          console.warn(`⚠️ Weight suggestion API failed for: ${exercise}`, weightResponse.status);
          weightSuggestions[exercise] = {
            exercise_name: exercise,
            sets: [],
            reasoning: "Weight suggestions could not be generated",
            safety_notes: "Please consult a trainer for proper weight selection",
            success: false,
            error: `API failed with status ${weightResponse.status}`
          };
        }
      } catch (error) {
        console.error(`❌ Error generating weight suggestion for ${exercise}:`, error);
      }
    }

    console.log(`✅ Generated weight suggestions for ${Object.keys(weightSuggestions).length}/${allExercises.length} exercises`);
    return weightSuggestions;
  } catch (error) {
    console.error('❌ Error in generateWeightSuggestionsForNewWorkout:', error);
    return {};
  }
}

interface ProposeWorkoutRequest {
  session_id: string;
  user_id: string;
  change_request: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProposeWorkoutRequest = await request.json();
    const { session_id, user_id, change_request } = body;

    // Validate required fields
    if (!session_id || !user_id || !change_request) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, user_id, and change_request are required' },
        { status: 400 }
      );
    }

    console.log('🔄 Proposing workout changes for session:', session_id);

    // Get chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    // Get chat history
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('Error fetching chat history:', historyError);
    }

    // Generate new workout plan
    let newWorkoutPlan;
    try {
      newWorkoutPlan = await generateNewWorkoutPlan(
        session.current_workout || {},
        session.user_context || '',
        session.onboarding_context || '',
        chatHistory || [],
        change_request
      );
    } catch (error) {
      console.error('Error generating new workout plan:', error);
      return NextResponse.json(
        { error: 'Failed to generate new workout plan' },
        { status: 500 }
      );
    }

    // Generate weight suggestions ONLY for new exercises using BATCH API
    console.log('🏋️ Identifying new exercises that need weight suggestions...');
    
    // Get the current workout from session
    const currentWorkout = session.current_workout || {};
    const currentWeightSuggestions = currentWorkout.weight_suggestions || {};
    
    // Collect all exercises from the new workout
    const newExercises: string[] = [];
    const allExercises: string[] = [];
    
    if (newWorkoutPlan.today && Array.isArray(newWorkoutPlan.today)) {
      newWorkoutPlan.today.forEach((section: any) => {
        if (section.exercises && Array.isArray(section.exercises)) {
          section.exercises.forEach((exercise: string) => {
            allExercises.push(exercise);
            // Check if this exercise already has weight suggestions
            if (!currentWeightSuggestions[exercise]) {
              newExercises.push(exercise);
            }
          });
        }
      });
    }
    
    console.log(`📊 Total exercises: ${allExercises.length}, New exercises needing weights: ${newExercises.length}`);
    
    // Start with existing weight suggestions
    const weightSuggestions = { ...currentWeightSuggestions };
    
    // Generate weights ONLY for new exercises
    if (newExercises.length > 0) {
      console.log('🏋️ Generating weight suggestions for new exercises using BATCH API:', newExercises);
      
      try {
        // 🚀 NEW: Use batch API for all new exercises at once
        const weightResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/suggest-weights-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_context: session.user_context || '', 
            exercises: newExercises, 
            user_id: user_id 
          })
        });
        
        if (weightResponse.ok) {
          const batchData = await weightResponse.json();
          if (batchData.success && batchData.exercises && Array.isArray(batchData.exercises)) {
            // Merge batch results into weightSuggestions
            batchData.exercises.forEach((exerciseData: any) => {
              weightSuggestions[exerciseData.exercise_name] = {
                exercise_name: exerciseData.exercise_name,
                sets: exerciseData.sets,
                reasoning: exerciseData.reasoning,
                safety_notes: exerciseData.safety_notes,
                success: true
              };
            });
            console.log(`✅ Batch weight suggestions generated for ${batchData.exercises.length} new exercises`);
          } else {
            console.warn('⚠️ Batch API returned invalid format, falling back to individual calls');
            throw new Error('Invalid batch response format');
          }
        } else {
          console.warn(`⚠️ Batch weight API failed with status ${weightResponse.status}, falling back`);
          throw new Error(`Batch API failed with status ${weightResponse.status}`);
        }
      } catch (batchError) {
        console.error('❌ Batch weight generation failed, falling back to individual calls:', batchError);
        
        // FALLBACK: Generate weights individually with delays
        for (let i = 0; i < newExercises.length; i++) {
          const exercise = newExercises[i];
          try {
            if (i > 0) {
              console.log(`⏳ Waiting 2 seconds before next request to avoid rate limits...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            console.log(`🏋️ [Fallback ${i + 1}/${newExercises.length}] Generating weight for: ${exercise}`);
            
            const weightResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/suggest-weights-ai`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user_context: session.user_context || '', 
                exercise_details: exercise, 
                user_id: user_id 
              })
            });
            
            if (weightResponse.ok) {
              const weightData = await weightResponse.json();
              if (weightData.success && weightData.sets) {
                weightSuggestions[exercise] = {
                  exercise_name: weightData.exercise_name,
                  sets: weightData.sets,
                  reasoning: weightData.reasoning,
                  safety_notes: weightData.safety_notes,
                  success: true
                };
                console.log(`✅ Weight suggestion generated for new exercise: ${exercise}`);
              }
            }
          } catch (error) {
            console.error(`❌ Failed to generate weight for ${exercise}:`, error);
          }
        }
      }
      
      console.log(`✅ Weight generation complete: ${Object.keys(weightSuggestions).length} exercises have weights`);
    } else {
      console.log('✅ No new exercises - reusing all existing weight suggestions');
    }

    // Add weight suggestions to the workout plan
    newWorkoutPlan.weight_suggestions = weightSuggestions;

    // Store the workout change proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('workout_change_proposals')
      .insert({
        session_id: session_id,
        user_id: user_id,
        proposed_workout: newWorkoutPlan,
        change_summary: newWorkoutPlan.change_summary || 'Workout plan updated based on user feedback',
        ai_coach_tips: newWorkoutPlan.ai_coach_tips || [],
        weight_suggestions: weightSuggestions,
        status: 'pending'
      })
      .select('*')
      .single();

    if (proposalError) {
      console.error('Error storing workout proposal:', proposalError);
      return NextResponse.json(
        { error: 'Failed to store workout proposal' },
        { status: 500 }
      );
    }

    console.log('✅ Workout change proposal created:', proposal.id);

    return NextResponse.json({
      success: true,
      proposal_id: proposal.id,
      new_workout_plan: newWorkoutPlan,
      change_summary: newWorkoutPlan.change_summary,
      ai_coach_tips: newWorkoutPlan.ai_coach_tips,
      message: 'Workout change proposal created successfully'
    });

  } catch (error) {
    console.error('Propose workout changes API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
