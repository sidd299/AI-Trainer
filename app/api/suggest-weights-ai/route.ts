import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

// AI prompt for suggesting sets, reps, and weights
const WEIGHT_SUGGESTION_PROMPT = `
You are an expert strength coach and exercise physiologist. Your task is to suggest optimal sets, reps, and weights for exercises based on the user's profile and exercise details.

## User Profile Context:
{user_context}

## Exercise Details:
{exercise_details}

## Guidelines for Weight Suggestions:

### 1. **Experience-Based Recommendations:**
- **Beginner (0-1 month)**: Start with very light weights, focus on form
- **Novice (1-3 months)**: Light to moderate weights, building confidence
- **Intermediate (3-12 months)**: Moderate weights, progressive overload
- **Advanced (1+ years)**: Higher weights, advanced techniques

### 2. **Exercise-Specific Considerations:**
- **Compound movements** (squat, deadlift, bench press): Higher weight, lower reps
- **Isolation exercises** (curls, extensions): Lower weight, higher reps
- **Machine exercises**: Can handle slightly higher weights safely
- **Dumbbell exercises**: Consider unilateral strength differences

### 3. **Set and Rep Guidelines:**
- **Strength focus**: 3-5 sets, 4-6 reps, higher weight
- **Hypertrophy focus**: 3-4 sets, 8-12 reps, moderate weight
- **Endurance focus**: 2-3 sets, 15+ reps, lighter weight
- **Beginner focus**: 2-3 sets, 10-15 reps, very light weight

### 4. **Progressive Loading:**
- **Warmup sets**: 50-70% of working weight
- **Working sets**: 80-100% of target weight
- **Final set**: Can be 100-110% for advanced users

### 5. **Safety Considerations:**
- Never suggest weights that could cause injury
- Consider user's body weight for relative strength
- Account for gender differences in strength standards
- Ensure proper form can be maintained

## Output Format:
Return ONLY a JSON object with this exact structure:

{
  "exercise_name": "Exercise Name",
  "sets": [
    {
      "id": "set-1",
      "type": "warmup",
      "reps": 10,
      "weight": 20,
      "completed": false
    },
    {
      "id": "set-2", 
      "type": "working",
      "reps": 8,
      "weight": 30,
      "completed": false
    },
    {
      "id": "set-3",
      "type": "working", 
      "reps": 8,
      "weight": 30,
      "completed": false
    }
  ],
  "reasoning": "Brief explanation of why these weights were chosen (2-3 sentences)",
  "safety_notes": "Any important safety considerations for this exercise"
}

## Important Notes:
- Weight should be in kg
- Include 2-4 sets total
- First set should be warmup (50-70% of working weight)
- Subsequent sets should be working sets
- Consider the user's experience level and body weight
- Ensure weights are realistic and safe
- Provide reasoning for your choices

Return only the JSON, no additional text or formatting.
`;

export async function POST(request: NextRequest) {
  try {
    const { user_context, exercise_details, user_id } = await request.json();
    
    if (!user_context || !exercise_details || !user_id) {
      return NextResponse.json(
        { error: 'user_context, exercise_details, and user_id are required' },
        { status: 400 }
      );
    }

    // Prepare the prompt with user context and exercise details
    const prompt = WEIGHT_SUGGESTION_PROMPT
      .replace('{user_context}', user_context)
      .replace('{exercise_details}', exercise_details);

    console.log('🤖 Generating AI weight suggestions for:', exercise_details);

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
            maxOutputTokens: 1024,
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
    let weightSuggestion;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      weightSuggestion = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Store the suggestion in database
    try {
      const { data: storedSuggestion, error: storeError } = await supabase
        .from('weight_suggestions')
        .insert({
          user_id: user_id,
          exercise_name: weightSuggestion.exercise_name,
          exercise_details: exercise_details,
          user_context: user_context,
          suggested_weight: weightSuggestion.sets[1]?.weight || 0, // Use first working set weight
          sets: weightSuggestion.sets,
          is_restricted: false,
          restriction_reason: null,
          user_profile: {
            reasoning: weightSuggestion.reasoning,
            safety_notes: weightSuggestion.safety_notes
          },
          calculation_details: {
            method: 'ai_prompt_based',
            prompt_used: prompt.substring(0, 500) + '...' // Store first 500 chars of prompt
          }
        })
        .select('*')
        .single();

      if (storeError) {
        console.warn('Failed to store AI weight suggestion:', storeError);
      } else {
        console.log('✅ AI weight suggestion stored successfully:', storedSuggestion?.id);
      }
    } catch (error) {
      console.warn('Failed to store AI weight suggestion:', error);
    }

    return NextResponse.json({
      success: true,
      ...weightSuggestion
    });

  } catch (error) {
    console.error('Error in AI weight suggestion API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate weight suggestions', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
