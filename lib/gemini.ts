import { TodayWorkout, Exercise, ExerciseSet } from './data';
import { GUIDELINES } from './aiGuidelines';

// Configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Try different models in order of preference
const AVAILABLE_MODELS = [
    'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro', 
    'gemini-pro'
];

let currentModel = AVAILABLE_MODELS[0];

console.log('🔑 API Key Status:', {
  hasKey: !!GEMINI_API_KEY,
  keyLength: GEMINI_API_KEY.length,
  keyPrefix: GEMINI_API_KEY.substring(0, 10),
  isValid: GEMINI_API_KEY.startsWith('AIzaSy'),
  hasApiKey: !!GEMINI_API_KEY
});

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
        currentModel = model;
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
 * Generate content using the working model
 */
async function generateContent(prompt: string): Promise<string> {
  try {
    const modelName = await findWorkingModel();
    
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

    console.log('✅ AI response generated successfully');
    return responseText;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

// Initialize model on startup
console.log('🔄 Starting Gemini model initialization...');
console.log('🔑 API Key available:', !!GEMINI_API_KEY);
console.log('🤖 GenAI instance: true');
console.log('📋 Listing available models...');

// Test API connection
findWorkingModel().then(model => {
  console.log(`✅ Using model: ${model}`);
  console.log(`📋 Selected model: ${model}`);
  console.log(`✅ Gemini model initialized successfully: ${model}`);
}).catch(error => {
  console.error('❌ Failed to initialize Gemini model:', error);
});

/**
 * Transform AI-generated workout data to match our Exercise interface
 */
function transformAIWorkoutToExerciseFormat(aiWorkout: any): TodayWorkout {
  const transformedSections = aiWorkout.sections.map((section: any, sectionIndex: number) => ({
    id: `section-${sectionIndex}`,
    name: section.title || section.name || `Section ${sectionIndex + 1}`,
    icon: getSectionIcon(section.title || section.name),
    isExpanded: true,
    exercises: section.exercises.map((exercise: any, exerciseIndex: number) => ({
      id: `exercise-${sectionIndex}-${exerciseIndex}`,
      name: exercise.name,
      category: getExerciseCategory(exercise.name),
      muscleGroups: getMuscleGroups(exercise.name),
      isFavorite: false,
      notes: exercise.notes || '',
      sets: createExerciseSets(exercise.sets, exercise.reps, exercise.weight)
    }))
  }));

  return {
    date: aiWorkout.date || new Date().toISOString().split('T')[0],
    sections: transformedSections
  };
}

/**
 * Create ExerciseSet array from AI exercise data
 */
function createExerciseSets(setsCount: number | string, reps: string | number, weight: string | number): ExerciseSet[] {
  const numSets = typeof setsCount === 'string' ? parseInt(setsCount) || 3 : setsCount || 3;
  const sets: ExerciseSet[] = [];
  
  for (let i = 0; i < numSets; i++) {
    sets.push({
      id: `set-${i + 1}`,
      reps: typeof reps === 'string' ? parseInt(reps.split('-')[0]) || 10 : reps || 10,
      weight: typeof weight === 'string' ? (weight === 'Bodyweight' ? 0 : parseInt(weight) || 0) : weight || 0,
      completed: false
    });
  }
  
  return sets;
}

/**
 * Get section icon based on section name
 */
function getSectionIcon(sectionName: string): string {
  const name = sectionName.toLowerCase();
  if (name.includes('warm') || name.includes('warmup')) return '🔥';
  if (name.includes('strength') || name.includes('weight')) return '💪';
  if (name.includes('cardio') || name.includes('cardio')) return '❤️';
  if (name.includes('cool') || name.includes('stretch')) return '🧘';
  if (name.includes('core') || name.includes('abs')) return '⚡';
  return '🏋️';
}

/**
 * Get exercise category based on exercise name
 */
function getExerciseCategory(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes('push') || name.includes('press') || name.includes('bench')) return 'push';
  if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'pull';
  if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return 'legs';
  if (name.includes('plank') || name.includes('crunch') || name.includes('core')) return 'core';
  if (name.includes('jump') || name.includes('run') || name.includes('cardio')) return 'cardio';
  return 'strength';
}

/**
 * Get muscle groups based on exercise name
 */
function getMuscleGroups(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase();
  const groups: string[] = [];
  
  if (name.includes('chest') || name.includes('bench') || name.includes('push')) groups.push('chest');
  if (name.includes('back') || name.includes('pull') || name.includes('row')) groups.push('back');
  if (name.includes('shoulder') || name.includes('press')) groups.push('shoulders');
  if (name.includes('bicep') || name.includes('curl')) groups.push('biceps');
  if (name.includes('tricep') || name.includes('dip')) groups.push('triceps');
  if (name.includes('leg') || name.includes('squat') || name.includes('lunge')) groups.push('legs');
  if (name.includes('core') || name.includes('abs') || name.includes('plank')) groups.push('core');
  
  return groups.length > 0 ? groups : ['full-body'];
}

// Export the main class
export class GeminiWorkoutAI {
  private model: string | null = null;

  async initializeModel(): Promise<void> {
    try {
      this.model = await findWorkingModel();
      console.log(`✅ Gemini model initialized: ${this.model}`);
    } catch (error) {
      console.error('❌ Failed to initialize model:', error);
      throw error;
    }
  }

  async generateWorkoutPlan(fitnessJourney: string): Promise<TodayWorkout> {
    try {
      const prompt = `
${GUIDELINES}

**SPECIFIC TASK:**
You are an expert fitness trainer creating a personalized workout plan. Based on the comprehensive user onboarding data below, generate a detailed workout plan that matches their experience level, goals, and capabilities.

**USER FITNESS PROFILE:**
${fitnessJourney}

**WORKOUT PLAN REQUIREMENTS:**
1. **Structure the workout** with appropriate sections (Warm-up, Main Training, Cool-down)
2. **Select exercises** that match their fitness level and goals
3. **Set appropriate volume** (sets/reps) based on their experience and current capabilities
4. **Include progression** that challenges them appropriately
5. **Add safety notes** and form cues
6. **Consider recovery** based on their recent workout history

**EXERCISE SELECTION GUIDELINES:**
- For beginners: Focus on compound movements and bodyweight exercises
- For intermediate: Mix of compound and isolation exercises
- For advanced: Complex movements and higher volume
- Always include proper warm-up and cool-down
- Consider their preferred split (Push/Pull/Legs, Full Body, etc.)

**OUTPUT FORMAT:**
Return a JSON structure with the following format:
{
  "date": "2024-01-01",
  "sections": [
    {
      "title": "Section Name (e.g., Warm-up, Upper Body, Cardio, Cool-down)",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-12",
          "weight": "Bodyweight or specific weight",
          "rest": "60 seconds",
          "notes": "Form cues, safety tips, or progression notes"
        }
      ]
    }
  ]
}

**IMPORTANT:** 
- Ensure exercises are appropriate for their current fitness level
- Include proper warm-up and cool-down
- Match the workout to their stated goals and preferences
- Consider any limitations mentioned in their profile
`;

      const response = await generateContent(prompt);
      
      // Try to parse the JSON response
      try {
        const workoutData = JSON.parse(response);
        // Transform AI-generated data to match our Exercise interface
        const transformedWorkout = transformAIWorkoutToExerciseFormat(workoutData);
        return transformedWorkout;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // Return a default workout if parsing fails
        const fallbackWorkout = {
      date: new Date().toISOString().split('T')[0],
      sections: [
            {
              title: "Strength Training",
          exercises: [
            {
                  name: "Push-ups",
                  sets: 3,
                  reps: "10-15",
                  weight: "Bodyweight",
                  rest: "60 seconds",
                  notes: "Focus on proper form"
                },
                {
                  name: "Squats",
                  sets: 3,
                  reps: "12-15",
                  weight: "Bodyweight",
                  rest: "60 seconds",
                  notes: "Keep knees behind toes"
            }
          ]
        }
      ]
    };
        return transformAIWorkoutToExerciseFormat(fallbackWorkout);
      }
    } catch (error) {
      console.error('Error generating workout plan:', error);
      throw error;
    }
  }

  async testAPI(): Promise<boolean> {
    try {
      await generateContent('Hello, this is a test message.');
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const geminiAI = new GeminiWorkoutAI();

// Export types for compatibility
export interface WorkoutAction {
  type: 'add' | 'delete' | 'modify' | 'swap' | 'confirm' | 'none';
  data?: any;
  summary?: string;
  changes?: string[];
}

export interface WorkoutModification {
  type: 'add_exercise' | 'modify_exercise' | 'remove_exercise';
  targetExerciseId?: string;
  exerciseData?: any;
  reason?: string;
}