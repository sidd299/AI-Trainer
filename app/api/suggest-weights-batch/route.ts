import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

// Batch AI prompt for suggesting weights for multiple exercises
const BATCH_WEIGHT_SUGGESTION_PROMPT = `
I will give you multiple exercises and onboarding inputs for the user. You have to suggest sets, reps and weight for ALL exercises according to the following guidelines:

User Context:
{user_context}

Exercises:
{exercises_list}

Guidelines:
- Suggested weights according to bodyweight multipliers provided below
- For dumbbell exercises: suggest weight of just 1 dumbbell (user holds one in each hand)
- For barbell exercises: include weight of 20kg bar in total
- Suggest in Kgs
- Gym dumbbells available: 2.5kg, 5kg, 7.5kg, 10kg, 12.5kg, 15kg, etc. (round to nearest 2.5kg)
- Barbell weights should be multiples of 5kg (round accordingly)
- DO NOT suggest sets with same weights and same reps - use your intelligence to vary them
- For compound exercises (squats, deadlifts, bench press, rows): suggest 2 warmup sets + 3 working sets
- For all other exercises (isolation, machines): suggest 3 working sets directly (no warmup)

Strength Standards (Multiplier × Bodyweight):

LEGS:
- Squats: Male (Beginner: 0.525, Novice: 0.875, Intermediate: 1.05), Female (Beginner: 0.35, Novice: 0.525, Intermediate: 0.875)
- Leg Press: Male (Beginner: 0.7, Novice: 1.225, Intermediate: 1.925), Female (Beginner: 0.35, Novice: 0.875, Intermediate: 1.4)
- Front Squat: Male (Beginner: 0.525, Novice: 0.7, Intermediate: 0.875), Female (Beginner: 0.35, Novice: 0.525, Intermediate: 0.7)
- Hip Thrust: Male (Beginner: 0.35, Novice: 0.7, Intermediate: 1.225), Female (Beginner: 0.35, Novice: 0.7, Intermediate: 1.05)
- Leg Extension: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 0.875), Female (Beginner: 0.175, Novice: 0.35, Intermediate: 0.7)
- Seated Leg Curl: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 0.7), Female (Beginner: 0.175, Novice: 0.315, Intermediate: 0.525)
- Lying Leg Curl: Male (Beginner: 0.175, Novice: 0.35, Intermediate: 0.525), Female (Beginner: 0.14, Novice: 0.28, Intermediate: 0.42)
- Goblet Squat: Male (Beginner: 0.14, Novice: 0.245, Intermediate: 0.385), Female (Beginner: 0.105, Novice: 0.175, Intermediate: 0.28)
- Dumbbell Lunges: Male (Beginner: 0.07, Novice: 0.14, Intermediate: 0.28), Female (Beginner: 0.07, Novice: 0.14, Intermediate: 0.21)
- Hip Abduction: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 1.05), Female (Beginner: 0.175, Novice: 0.525, Intermediate: 0.7)
- Machine Calf Raises: Male (Beginner: 0.35, Novice: 0.7, Intermediate: 1.225), Female (Beginner: 0.175, Novice: 0.525, Intermediate: 0.875)
- Seated Calf Raise: Male (Beginner: 0.175, Novice: 0.525, Intermediate: 0.875), Female (Beginner: 0.175, Novice: 0.35, Intermediate: 0.7)
- Barbell Glute Bridge: Male (Beginner: 0.35, Novice: 0.7, Intermediate: 1.05), Female (Beginner: 0.35, Novice: 0.7, Intermediate: 1.05)

BACK:
- Pull Ups: Male (Beginner: <1, Novice: 3.5kg added, Intermediate: 9.8kg added), Female (Beginner: <1, Novice: <1, Intermediate: 4.2kg added)
- Barbell Bent Over Rows: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 0.7), Female (Beginner: 0.175, Novice: 0.28, Intermediate: 0.455)
- Lat Pull Down: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 0.7), Female (Beginner: 0.21, Novice: 0.315, Intermediate: 0.49)
- Dumbbell Row: Male (Beginner: 0.14, Novice: 0.245, Intermediate: 0.385), Female (Beginner: 0.07, Novice: 0.14, Intermediate: 0.245)
- Seated Cable Row: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 0.7), Female (Beginner: 0.21, Novice: 0.35, Intermediate: 0.525)
- Barbell Shrug: Male (Beginner: 0.35, Novice: 0.7, Intermediate: 1.05), Female (Beginner: 0.175, Novice: 0.35, Intermediate: 0.7)
- T Bar Row: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 0.7), Female (Beginner: 0.175, Novice: 0.315, Intermediate: 0.525)
- Dumbbell Shrug: Male (Beginner: 0.14, Novice: 0.245, Intermediate: 0.42), Female (Beginner: 0.07, Novice: 0.14, Intermediate: 0.28)
- Machine Row: Male (Beginner: 0.35, Novice: 0.525, Intermediate: 0.875), Female (Beginner: 0.175, Novice: 0.35, Intermediate: 0.525)
- Chest Supported Dumbbell Row: Male (Beginner: 0.07, Novice: 0.175, Intermediate: 0.35), Female (Beginner: 0.07, Novice: 0.14, Intermediate: 0.245)
- Dumbbell Reverse Fly: Male (Beginner: 0.035, Novice: 0.07, Intermediate: 0.175), Female (Beginner: 0.035, Novice: 0.07, Intermediate: 0.105)
- Cable Reverse Fly: Male (Beginner: 0.035, Novice: 0.105, Intermediate: 0.245), Female (Beginner: 0.035, Novice: 0.07, Intermediate: 0.14)
- Machine Reverse Fly: Male (Beginner: 0.175, Novice: 0.35, Intermediate: 0.525), Female (Beginner: 0.035, Novice: 0.07, Intermediate: 0.14)
- Dumbbell Pull Over: Male (Beginner: 0.105, Novice: 0.21, Intermediate: 0.315), Female (Beginner: 0.07, Novice: 0.14, Intermediate: 0.21)
- Straight Arm Pull Down: Male (Beginner: 0.175, Novice: 0.35, Intermediate: 0.525), Female (Beginner: 0.07, Novice: 0.14, Intermediate: 0.28)
- Bent Over Dumbbell Row: Male (Beginner: 0.105, Novice: 0.21, Intermediate: 0.315), Female (Beginner: 0.07, Novice: 0.14, Intermediate: 0.21)

Output Format (JSON only, no additional text):
{
  "exercises": [
    {
      "exercise_name": "Exercise 1",
      "sets": [
        {"id": "set-1", "type": "warmup", "reps": 10, "weight": 20, "completed": false},
        {"id": "set-2", "type": "working", "reps": 8, "weight": 30, "completed": false},
        {"id": "set-3", "type": "working", "reps": 7, "weight": 30, "completed": false}
      ],
      "reasoning": "Brief explanation",
      "safety_notes": "Safety considerations"
    }
  ]
}
`;

export async function POST(request: NextRequest) {
  try {
    const { user_context, exercises, user_id } = await request.json();
    
    if (!user_context || !exercises || !Array.isArray(exercises) || exercises.length === 0 || !user_id) {
      return NextResponse.json(
        { error: 'user_context, exercises (array), and user_id are required' },
        { status: 400 }
      );
    }

    // Format exercises as a numbered list
    const exercisesList = exercises.map((ex, idx) => `${idx + 1}. ${ex}`).join('\n');

    // Prepare the prompt with user context and exercises list
    const prompt = BATCH_WEIGHT_SUGGESTION_PROMPT
      .replace('{user_context}', user_context)
      .replace('{exercises_list}', exercisesList);

    console.log(`🤖 Generating AI weight suggestions for ${exercises.length} exercises in batch`);

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096, // Increased for batch processing
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON response
    let batchSuggestions;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      batchSuggestions = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure
    if (!batchSuggestions.exercises || !Array.isArray(batchSuggestions.exercises)) {
      throw new Error('Invalid response format: missing exercises array');
    }

    // Store each suggestion in database (async, don't wait)
    batchSuggestions.exercises.forEach(async (suggestion: any) => {
      try {
        await supabase
          .from('weight_suggestions')
          .insert({
            user_id: user_id,
            exercise_name: suggestion.exercise_name,
            exercise_details: suggestion.exercise_name,
            user_context: user_context,
            suggested_weight: suggestion.sets.find((s: any) => s.type === 'working')?.weight || 0,
            sets: suggestion.sets,
            is_restricted: false,
            restriction_reason: null,
            user_profile: {
              reasoning: suggestion.reasoning,
              safety_notes: suggestion.safety_notes
            },
            calculation_details: {
              method: 'ai_batch_prompt',
              batch_size: exercises.length
            }
          });
      } catch (error) {
        console.warn(`Failed to store weight suggestion for ${suggestion.exercise_name}:`, error);
      }
    });

    console.log(`✅ Generated ${batchSuggestions.exercises.length} weight suggestions in batch`);

    return NextResponse.json({
      success: true,
      exercises: batchSuggestions.exercises,
      total_processed: batchSuggestions.exercises.length
    });

  } catch (error) {
    console.error('Error in batch AI weight suggestion API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate batch weight suggestions', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

