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

/**
 * Generate fallback workout when Gemini API is unavailable
 */
function generateFallbackWorkout(context: string): string {
  const isBeginner = context.toLowerCase().includes('beginner') || context.toLowerCase().includes('first time');
  const isIntermediate = context.toLowerCase().includes('intermediate') || context.toLowerCase().includes('1 year');
  const lastWorkout = context.toLowerCase().includes('chest') ? 'chest' : 
                     context.toLowerCase().includes('legs') ? 'legs' : 'upper';

  let workoutPlan;
  
  if (isBeginner) {
    workoutPlan = {
      today: [
        {
          section: "Warmup",
          exercises: [
            "5-minute light walking",
            "Arm circles - 10 each direction",
            "Leg swings - 10 each leg"
          ]
        },
        {
          section: "Main Workout",
          exercises: [
            "Bodyweight squats - 3 sets of 10-15",
            "Wall push-ups - 3 sets of 8-12",
            "Plank - 3 sets of 20-30 seconds",
            "Glute bridges - 3 sets of 12-15",
            "Bird dog - 3 sets of 8 each side"
          ]
        },
        {
          section: "Cardio",
          exercises: [
            "Brisk walking - 15 minutes"
          ]
        },
        {
          section: "Cooldown",
          exercises: [
            "Static stretching - 10 minutes",
            "Deep breathing exercises"
          ]
        }
      ],
      ai_coach_tips: [
        "Beginner-safe exercises only",
        "Bodyweight for building confidence",
        "Full body for balanced development",
        "Low intensity prevents injury risk",
        "Focus on proper form first"
      ]
    };
  } else if (lastWorkout === 'chest') {
    workoutPlan = {
      today: [
        {
          section: "Warmup",
          exercises: [
            "5-minute light cardio",
            "Arm circles and shoulder rolls",
            "Dynamic stretching"
          ]
        },
        {
          section: "Main Workout",
          exercises: [
            "Pull-ups or Lat pulldowns - 3 sets of 8-12",
            "Seated cable rows - 3 sets of 10-12",
            "Dumbbell shoulder press - 3 sets of 8-10",
            "Lateral raises - 3 sets of 12-15",
            "Bicep curls - 3 sets of 10-12",
            "Hammer curls - 3 sets of 10-12"
          ]
        },
        {
          section: "Cardio",
          exercises: [
            "Elliptical - 20 minutes moderate"
          ]
        },
        {
          section: "Cooldown",
          exercises: [
            "Back and shoulder stretches",
            "Foam rolling upper body"
          ]
        }
      ],
      ai_coach_tips: [
        "Avoiding chest after yesterday's workout",
        "Back & shoulders for balanced training",
        "Pull-ups for compound upper body",
        "Biceps isolation for arm development",
        "Moderate volume prevents overtraining risk"
      ]
    };
  } else {
    workoutPlan = {
      today: [
        {
          section: "Warmup",
          exercises: [
            "5-minute light cardio",
            "Dynamic stretching",
            "Movement preparation"
          ]
        },
        {
          section: "Main Workout",
          exercises: [
            "Barbell squats - 3 sets of 8-10",
            "Romanian deadlifts - 3 sets of 8-10",
            "Walking lunges - 3 sets of 10 each leg",
            "Leg press - 3 sets of 12-15",
            "Calf raises - 3 sets of 15-20"
          ]
        },
        {
          section: "Cardio",
          exercises: [
            "Treadmill - 20 minutes moderate"
          ]
        },
        {
          section: "Cooldown",
          exercises: [
            "Leg stretches - 10 minutes",
            "Foam rolling legs"
          ]
        }
      ],
      ai_coach_tips: [
        "Leg day for lower body strength",
        "Compound movements for efficiency",
        "Progressive overload for growth",
        "Balanced workout for all muscles",
        "Proper form prevents injury"
      ]
    };
  }

  return JSON.stringify(workoutPlan);
}

/**
 * Generate weight suggestions for all exercises in the workout using BATCH API
 */
async function generateWeightSuggestionsForWorkout(workout: any, userContext: string, userId: string): Promise<any> {
  const weightSuggestions: any = {};
  
  try {
    // Extract all exercises from all sections
    const allExercises: string[] = [];
    if (workout.today && Array.isArray(workout.today)) {
      workout.today.forEach((section: any) => {
        if (section.exercises && Array.isArray(section.exercises)) {
          section.exercises.forEach((exercise: string) => {
            allExercises.push(exercise);
          });
        }
      });
    }

    console.log(`📋 Found ${allExercises.length} exercises to generate weight suggestions for`);
    console.log('📋 Exercise list:', allExercises);

    if (allExercises.length === 0) {
      return {};
    }

    // 🚀 NEW: Use batch API to generate all weight suggestions in ONE call
    console.log('🎯 Exercises to generate weights for (batch):', allExercises);
    console.log(`📤 Sending batch request for ${allExercises.length} exercises`);
    
    try {
      // Import and call the batch API handler directly instead of making an HTTP request
      const { POST: batchHandler } = await import('../suggest-weights-batch/route');
      
      // Create a mock request object
      const mockRequest = {
        json: async () => ({
          user_context: userContext,
          exercises: allExercises,
          user_id: userId
        })
      } as NextRequest;
      
      const weightResponse = await batchHandler(mockRequest);
      
      // Parse the response (NextResponse)
      const batchData = await weightResponse.json();
      console.log('✅ Batch API response received');
      console.log('📦 Response data:', JSON.stringify(batchData, null, 2));

      if (weightResponse.status === 200 && batchData.success && batchData.exercises && Array.isArray(batchData.exercises)) {
        console.log('✅ Batch API succeeded with status 200');
        
        // Convert array response to object keyed by ORIGINAL exercise string (not just the name)
        // We need to match the batch API response back to the original exercise strings
        batchData.exercises.forEach((exerciseData: any) => {
          // Find the original exercise string that matches this exercise name
          const matchingExercise = allExercises.find(ex => {
            // Extract the exercise name from the full string (e.g., "Barbell squats - 3 sets of 8-10" -> "Barbell squats")
            const exerciseNamePart = ex.split(' - ')[0].trim();
            return exerciseNamePart === exerciseData.exercise_name || ex === exerciseData.exercise_name;
          });
          
          const keyToUse = matchingExercise || exerciseData.exercise_name;
          console.log(`🔗 Mapping "${exerciseData.exercise_name}" to key: "${keyToUse}"`);
          
          weightSuggestions[keyToUse] = {
            exercise_name: exerciseData.exercise_name,
            sets: exerciseData.sets,
            reasoning: exerciseData.reasoning,
            safety_notes: exerciseData.safety_notes,
            success: true
          };
        });
        
        console.log(`✅ Batch weight suggestions generated for ${batchData.exercises.length}/${allExercises.length} exercises`);
        console.log('📋 Weight suggestion keys:', Object.keys(weightSuggestions));
        console.log('📋 Sample suggestion:', Object.keys(weightSuggestions).length > 0 ? weightSuggestions[Object.keys(weightSuggestions)[0]] : 'none');
      } else {
        console.warn('⚠️ Batch API returned invalid format, falling back to individual calls');
        console.warn('⚠️ Batch response status:', weightResponse.status);
        console.warn('⚠️ Batch response data:', batchData);
        throw new Error('Invalid batch response format');
      }
    } catch (batchError) {
      console.error('❌ Batch weight generation failed, falling back to individual calls:', batchError);
      
      // FALLBACK: Generate weight suggestions individually (old method)
      console.log('🔄 Falling back to individual weight generation for each exercise...');
      const { POST: individualHandler } = await import('../suggest-weights-ai/route');
      
      for (const exercise of allExercises) {
        try {
          console.log(`🏋️ [Fallback] Generating weight suggestion for: ${exercise}`);
          
          const mockRequest = {
            json: async () => ({
              user_context: userContext,
              exercise_details: exercise,
              user_id: userId
            })
          } as NextRequest;
          
          const weightResponse = await individualHandler(mockRequest);
          const weightData = await weightResponse.json();

          if (weightResponse.status === 200 && weightData.success && weightData.sets) {
            weightSuggestions[exercise] = {
              exercise_name: weightData.exercise_name,
              sets: weightData.sets,
              reasoning: weightData.reasoning,
              safety_notes: weightData.safety_notes,
              success: true
            };
            console.log(`✅ Weight suggestion generated for: ${exercise} with ${weightData.sets.length} sets`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Error generating weight suggestion for ${exercise}:`, error);
          weightSuggestions[exercise] = {
            exercise_name: exercise,
            sets: [],
            reasoning: "Weight suggestions could not be generated",
            safety_notes: "Please consult a trainer for proper weight selection",
            success: false
          };
        }
      }
    }

    console.log(`✅ Final: Generated weight suggestions for ${Object.keys(weightSuggestions).length}/${allExercises.length} exercises`);
    console.log('✅ Final weight suggestion keys:', Object.keys(weightSuggestions));
    console.log('✅ Sample weight suggestion:', Object.keys(weightSuggestions).length > 0 ? weightSuggestions[Object.keys(weightSuggestions)[0]] : 'none');
    return weightSuggestions;
  } catch (error) {
    console.error('❌ Error in generateWeightSuggestionsForWorkout:', error);
    return {};
  }
}

/**
 * Generate today's workout using the new guidelines
 */
async function generateTodaysWorkout(context: string): Promise<string> {
  try {
    const modelName = await findWorkingModel();
    
    const prompt = `
${GUIDELINES}

User Context:
${context}
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

    console.log('✅ Today\'s workout generated successfully');
    return responseText;
  } catch (error) {
    console.error('Error generating today\'s workout:', error);
    throw error;
  }
}

interface WorkoutRequest {
  user_id: string;
  context: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: WorkoutRequest = await request.json();
    const { user_id, context } = body;

    // Validate required fields
    if (!user_id || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and context are required' },
        { status: 400 }
      );
    }

    if (typeof user_id !== 'string' || typeof context !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types: user_id and context must be strings' },
        { status: 400 }
      );
    }

    // Generate today's workout
    let workoutPlan;
    try {
      workoutPlan = await generateTodaysWorkout(context);
    } catch (error) {
      console.log('Gemini API failed, using fallback workout generation');
      workoutPlan = generateFallbackWorkout(context);
    }

    // Try to parse the JSON response
    let parsedWorkout;
    try {
      parsedWorkout = JSON.parse(workoutPlan);
      
      // Ensure ai_coach_tips exists, add fallback if missing
      if (!parsedWorkout.ai_coach_tips) {
        parsedWorkout.ai_coach_tips = [
          "Balanced workout for all muscles",
          "Compound movements for efficiency",
          "Moderate volume prevents overtraining",
          "Progressive overload for growth"
        ];
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Use fallback workout if parsing fails
      parsedWorkout = JSON.parse(generateFallbackWorkout(context));
    }

    // 🎯 Generate weight suggestions for all exercises and wait for completion
    console.log('🏋️ Generating weight suggestions for all exercises...');
    const weightSuggestions = await generateWeightSuggestionsForWorkout(parsedWorkout, context, user_id);
    
    // Add weight suggestions to the workout plan
    parsedWorkout.weight_suggestions = weightSuggestions;
    
    console.log('✅ All weight suggestions completed, returning workout with weights');

    // ✅ Store Gemini response in database
    try {
      console.log('Attempting to store Gemini response for user:', user_id);
      const { data: geminiResponse, error: geminiError } = await supabase
        .from('gemini_responses')
        .insert({
          user_id: user_id,
          prompt: context,
          response: workoutPlan,
          type: 'daily_workout',
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

    return NextResponse.json({
      success: true,
      user_id: user_id,
      workout_plan: parsedWorkout,
      raw_response: workoutPlan,
      message: 'Today\'s workout generated successfully'
    });

  } catch (error) {
    console.error('Workout API error:', error);
    
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
