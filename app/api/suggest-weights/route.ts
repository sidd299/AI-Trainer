import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

// Strength standards data based on strengthlevel.com
const STRENGTH_STANDARDS = {
  // Male standards (kg) - Intermediate level (50th percentile)
  male: {
    'barbell squat': { weight: 100, bodyweight: 80 }, // 1.25x bodyweight
    'barbell bench press': { weight: 85, bodyweight: 80 }, // 1.06x bodyweight
    'barbell deadlift': { weight: 120, bodyweight: 80 }, // 1.5x bodyweight
    'overhead press': { weight: 55, bodyweight: 80 }, // 0.69x bodyweight
    'barbell row': { weight: 75, bodyweight: 80 }, // 0.94x bodyweight
    'dumbbell bench press': { weight: 35, bodyweight: 80 }, // per arm
    'dumbbell shoulder press': { weight: 25, bodyweight: 80 }, // per arm
    'dumbbell row': { weight: 30, bodyweight: 80 }, // per arm
    'dumbbell bicep curl': { weight: 15, bodyweight: 80 }, // per arm
    'dumbbell tricep extension': { weight: 12, bodyweight: 80 }, // per arm
    'lat pulldown': { weight: 60, bodyweight: 80 },
    'seated row': { weight: 55, bodyweight: 80 },
    'leg press': { weight: 150, bodyweight: 80 }, // 1.88x bodyweight
    'calf raise': { weight: 80, bodyweight: 80 }, // bodyweight + 0x
    'lateral raise': { weight: 8, bodyweight: 80 }, // per arm
    'face pull': { weight: 20, bodyweight: 80 },
    'hammer curl': { weight: 12, bodyweight: 80 }, // per arm
    'tricep pushdown': { weight: 25, bodyweight: 80 },
    'incline bench press': { weight: 70, bodyweight: 80 },
    'romanian deadlift': { weight: 100, bodyweight: 80 },
    'walking lunge': { weight: 20, bodyweight: 80 }, // per leg
  },
  // Female standards (kg) - Intermediate level (50th percentile)
  female: {
    'barbell squat': { weight: 60, bodyweight: 60 }, // 1x bodyweight
    'barbell bench press': { weight: 40, bodyweight: 60 }, // 0.67x bodyweight
    'barbell deadlift': { weight: 80, bodyweight: 60 }, // 1.33x bodyweight
    'overhead press': { weight: 25, bodyweight: 60 }, // 0.42x bodyweight
    'barbell row': { weight: 40, bodyweight: 60 }, // 0.67x bodyweight
    'dumbbell bench press': { weight: 18, bodyweight: 60 }, // per arm
    'dumbbell shoulder press': { weight: 12, bodyweight: 60 }, // per arm
    'dumbbell row': { weight: 15, bodyweight: 60 }, // per arm
    'dumbbell bicep curl': { weight: 8, bodyweight: 60 }, // per arm
    'dumbbell tricep extension': { weight: 6, bodyweight: 60 }, // per arm
    'lat pulldown': { weight: 35, bodyweight: 60 },
    'seated row': { weight: 30, bodyweight: 60 },
    'leg press': { weight: 90, bodyweight: 60 }, // 1.5x bodyweight
    'calf raise': { weight: 60, bodyweight: 60 }, // bodyweight + 0x
    'lateral raise': { weight: 4, bodyweight: 60 }, // per arm
    'face pull': { weight: 12, bodyweight: 60 },
    'hammer curl': { weight: 6, bodyweight: 60 }, // per arm
    'tricep pushdown': { weight: 15, bodyweight: 60 },
    'incline bench press': { weight: 35, bodyweight: 60 },
    'romanian deadlift': { weight: 60, bodyweight: 60 },
    'walking lunge': { weight: 12, bodyweight: 60 }, // per leg
  }
};

// Experience level multipliers
const EXPERIENCE_MULTIPLIERS = {
  'beginner': 0.3, // 0-1 month
  'novice': 0.5,   // 1-3 months
  'intermediate': 0.7, // 3-12 months
  'advanced': 0.8  // 1+ years
};

// Exercise categories for safety restrictions
const EXERCISE_CATEGORIES = {
  'barbell_compound': ['barbell squat', 'barbell deadlift', 'overhead press', 'barbell row', 'barbell bench press'],
  'olympic_lifts': ['snatch', 'clean', 'clean & jerk', 'power clean'],
  'advanced_core': ['dragon flag', 'human flag', 'planche'],
  'plyometrics': ['box jump', 'burpee', 'jumping lunge', 'plyometric push-up'],
  'behind_neck': ['behind neck press', 'behind neck pull-up']
};

function getExerciseKey(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  // Map common exercise names to our standard keys
  const exerciseMap: { [key: string]: string } = {
    'squat': 'barbell squat',
    'barbell squats': 'barbell squat',
    'back squat': 'barbell squat',
    'bench press': 'barbell bench press',
    'barbell bench': 'barbell bench press',
    'deadlift': 'barbell deadlift',
    'barbell deadlift': 'barbell deadlift',
    'overhead press': 'overhead press',
    'ohp': 'overhead press',
    'barbell row': 'barbell row',
    'bent over row': 'barbell row',
    'dumbbell bench': 'dumbbell bench press',
    'dumbbell press': 'dumbbell bench press',
    'shoulder press': 'dumbbell shoulder press',
    'dumbbell shoulder': 'dumbbell shoulder press',
    'dumbbell row': 'dumbbell row',
    'bicep curl': 'dumbbell bicep curl',
    'bicep curls': 'dumbbell bicep curl',
    'tricep extension': 'dumbbell tricep extension',
    'tricep extensions': 'dumbbell tricep extension',
    'lat pulldown': 'lat pulldown',
    'pulldown': 'lat pulldown',
    'seated row': 'seated row',
    'cable row': 'seated row',
    'leg press': 'leg press',
    'calf raise': 'calf raise',
    'calf raises': 'calf raise',
    'lateral raise': 'lateral raise',
    'side raise': 'lateral raise',
    'face pull': 'face pull',
    'face pulls': 'face pull',
    'hammer curl': 'hammer curl',
    'hammer curls': 'hammer curl',
    'tricep pushdown': 'tricep pushdown',
    'pushdown': 'tricep pushdown',
    'incline bench': 'incline bench press',
    'incline press': 'incline bench press',
    'romanian deadlift': 'romanian deadlift',
    'rdl': 'romanian deadlift',
    'walking lunge': 'walking lunge',
    'lunges': 'walking lunge',
    'lunge': 'walking lunge'
  };

  // Try exact match first
  if (exerciseMap[name]) {
    return exerciseMap[name];
  }

  // Try partial matches
  for (const [key, value] of Object.entries(exerciseMap)) {
    if (name.includes(key) || key.includes(name)) {
      return value;
    }
  }

  // Return original name if no match found
  return name;
}

function isExerciseRestricted(exerciseName: string, experienceLevel: string): boolean {
  const exerciseKey = getExerciseKey(exerciseName);
  
  if (experienceLevel === 'beginner') {
    // Beginners: exclude all barbell compound lifts, Olympic lifts, advanced core, plyometrics
    return EXERCISE_CATEGORIES.barbell_compound.includes(exerciseKey) ||
           EXERCISE_CATEGORIES.olympic_lifts.includes(exerciseKey) ||
           EXERCISE_CATEGORIES.advanced_core.includes(exerciseKey) ||
           EXERCISE_CATEGORIES.plyometrics.includes(exerciseKey) ||
           EXERCISE_CATEGORIES.behind_neck.includes(exerciseKey);
  }
  
  if (experienceLevel === 'novice') {
    // Novice: exclude Olympic lifts, behind-neck, advanced plyometrics, very high-skill barbell lifts
    return EXERCISE_CATEGORIES.olympic_lifts.includes(exerciseKey) ||
           EXERCISE_CATEGORIES.behind_neck.includes(exerciseKey) ||
           EXERCISE_CATEGORIES.advanced_core.includes(exerciseKey) ||
           (EXERCISE_CATEGORIES.plyometrics.includes(exerciseKey) && exerciseKey.includes('advanced'));
  }
  
  return false;
}

function calculateSuggestedWeight(
  exerciseName: string,
  userWeight: number,
  userGender: string,
  experienceLevel: string
): { weight: number; isRestricted: boolean; reason?: string } {
  const exerciseKey = getExerciseKey(exerciseName);
  
  // Check if exercise is restricted for user's experience level
  if (isExerciseRestricted(exerciseKey, experienceLevel)) {
    return {
      weight: 0,
      isRestricted: true,
      reason: experienceLevel === 'beginner' 
        ? 'This exercise is not recommended for beginners. Consider using a machine-based alternative.'
        : 'This exercise requires more experience. Consider a lighter variation or alternative.'
    };
  }
  
  // Get strength standards
  const standards = STRENGTH_STANDARDS[userGender.toLowerCase() as keyof typeof STRENGTH_STANDARDS];
  if (!standards || !standards[exerciseKey as keyof typeof standards]) {
    // Fallback for unknown exercises
    return {
      weight: userWeight * 0.1, // Very conservative fallback
      isRestricted: false
    };
  }
  
  const standard = standards[exerciseKey as keyof typeof standards];
  const experienceMultiplier = EXPERIENCE_MULTIPLIERS[experienceLevel as keyof typeof EXPERIENCE_MULTIPLIERS] || 0.5;
  
  // Calculate weight based on user's bodyweight and experience
  let suggestedWeight: number;
  
  if (exerciseKey.includes('dumbbell') || exerciseKey.includes('lateral') || exerciseKey.includes('curl')) {
    // For dumbbell exercises, use the standard weight directly
    suggestedWeight = standard.weight * experienceMultiplier;
  } else {
    // For barbell/machine exercises, scale based on user's bodyweight
    const bodyweightRatio = userWeight / standard.bodyweight;
    suggestedWeight = (standard.weight * bodyweightRatio * experienceMultiplier);
  }
  
  // Ensure we never exceed 70% of 1RM
  const maxWeight = standard.weight * 0.7;
  suggestedWeight = Math.min(suggestedWeight, maxWeight);
  
  // Round to nearest 2.5kg for barbell exercises, 1kg for dumbbell
  if (exerciseKey.includes('barbell') || exerciseKey.includes('machine') || exerciseKey.includes('press') || exerciseKey.includes('squat') || exerciseKey.includes('deadlift')) {
    suggestedWeight = Math.round(suggestedWeight / 2.5) * 2.5;
  } else {
    suggestedWeight = Math.round(suggestedWeight);
  }
  
  // Ensure minimum weight
  suggestedWeight = Math.max(suggestedWeight, 2.5);
  
  return {
    weight: suggestedWeight,
    isRestricted: false
  };
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, exercise_name, user_context, exercise_details } = await request.json();
    
    if (!user_id || !exercise_name) {
      return NextResponse.json(
        { error: 'user_id and exercise_name are required' },
        { status: 400 }
      );
    }

    // Get user onboarding data
    let userData = null;
    if (user_context) {
      // Parse user context from onboarding
      try {
        const contextMatch = user_context.match(/Age: (\d+).*Weight: (\d+).*Gender: (\w+).*Experience duration: ([^-\n]+)/);
        if (contextMatch) {
          userData = {
            age: parseInt(contextMatch[1]),
            weight: parseInt(contextMatch[2]),
            gender: contextMatch[3],
            experience: contextMatch[4]
          };
        }
      } catch (error) {
        console.error('Error parsing user context:', error);
      }
    }

    // Fallback: try to get from database
    if (!userData) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();
      
      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        userData = user;
      }
    }

    // Default values if no user data found
    const userWeight = userData?.weight || 70;
    const userGender = userData?.gender || 'Male';
    const experience = userData?.experience || 'Less than 6 months';
    
    // Determine experience level
    let experienceLevel = 'intermediate';
    if (experience.includes('Less than 6 months') || experience.includes('0-1 month')) {
      experienceLevel = 'beginner';
    } else if (experience.includes('6 months - 1 year')) {
      experienceLevel = 'novice';
    } else if (experience.includes('1-2 years') || experience.includes('2-5 years') || experience.includes('More than 5 years')) {
      experienceLevel = 'advanced';
    }

    // Calculate suggested weight
    const suggestion = calculateSuggestedWeight(exercise_name, userWeight, userGender, experienceLevel);
    
    // Generate sets with progressive weight
    const sets = [];
    const baseWeight = suggestion.weight;
    
    // Extract set information from exercise_details if available
    let targetSets = 3;
    let targetReps = [10, 10, 8]; // Default rep ranges
    
    if (exercise_details) {
      // Parse exercise details from the first API
      // Example: "Barbell squats - 3 sets of 8-10" or "Dumbbell Bicep Curls (3 sets of 10-15 reps)"
      const setsMatch = exercise_details.match(/(\d+)\s*sets?/i);
      const repsMatch = exercise_details.match(/(\d+)-(\d+)\s*reps?/i);
      
      if (setsMatch) {
        targetSets = parseInt(setsMatch[1]);
      }
      
      if (repsMatch) {
        const minReps = parseInt(repsMatch[1]);
        const maxReps = parseInt(repsMatch[2]);
        // Create progressive rep ranges
        targetReps = [];
        for (let i = 0; i < targetSets; i++) {
          const repRange = minReps + Math.round((maxReps - minReps) * (i / Math.max(targetSets - 1, 1)));
          targetReps.push(repRange);
        }
      }
    }
    
    for (let i = 0; i < targetSets; i++) {
      let setWeight = baseWeight;
      let setType = 'working';
      let reps = targetReps[i] || (8 + (i * 2)); // Use parsed reps or default
      
      // Progressive loading: first set lighter, last set heavier
      if (i === 0) {
        setWeight = baseWeight * 0.8; // 80% of base weight
        setType = 'warmup'; // First set is warmup
      } else if (i === targetSets - 1) {
        setWeight = baseWeight * 1.1; // 110% of base weight
        setType = 'working'; // Last set is working set
      } else {
        setType = 'working'; // Middle sets are working sets
      }
      
      // Round weights appropriately
      if (exercise_name.toLowerCase().includes('barbell') || exercise_name.toLowerCase().includes('machine')) {
        setWeight = Math.round(setWeight / 2.5) * 2.5;
      } else {
        setWeight = Math.round(setWeight);
      }
      
      sets.push({
        id: `set-${i + 1}`,
        reps: reps,
        weight: Math.max(setWeight, 2.5),
        completed: false,
        type: setType
      });
    }

    const response = {
      success: true,
      exercise_name,
      suggested_weight: suggestion.weight,
      sets,
      is_restricted: suggestion.isRestricted,
      restriction_reason: suggestion.reason,
      user_context: {
        weight: userWeight,
        gender: userGender,
        experience_level: experienceLevel,
        experience: experience
      },
      calculation_details: {
        base_weight: suggestion.weight,
        experience_multiplier: EXPERIENCE_MULTIPLIERS[experienceLevel as keyof typeof EXPERIENCE_MULTIPLIERS],
        max_allowed: suggestion.weight / (EXPERIENCE_MULTIPLIERS[experienceLevel as keyof typeof EXPERIENCE_MULTIPLIERS] || 0.5) * 0.7
      }
    };

    // Store the suggestion in the dedicated weight_suggestions table
    try {
      const { data: weightSuggestion, error: weightError } = await supabase
        .from('weight_suggestions')
        .insert({
          user_id: user_id,
          exercise_name: exercise_name,
          exercise_details: exercise_details || null,
          user_context: user_context || null,
          suggested_weight: suggestion.weight,
          sets: sets,
          is_restricted: suggestion.isRestricted,
          restriction_reason: suggestion.reason || null,
          user_profile: {
            weight: userWeight,
            gender: userGender,
            experience_level: experienceLevel,
            experience: experience
          },
          calculation_details: {
            base_weight: suggestion.weight,
            experience_multiplier: EXPERIENCE_MULTIPLIERS[experienceLevel as keyof typeof EXPERIENCE_MULTIPLIERS],
            max_allowed: suggestion.weight / (EXPERIENCE_MULTIPLIERS[experienceLevel as keyof typeof EXPERIENCE_MULTIPLIERS] || 0.5) * 0.7
          }
        })
        .select('*')
        .single();

      if (weightError) {
        console.warn('Failed to store weight suggestion:', weightError);
      } else {
        console.log('✅ Weight suggestion stored successfully:', weightSuggestion?.id);
      }
    } catch (error) {
      console.warn('Failed to store weight suggestion:', error);
    }

    // Also store in gemini_responses for backward compatibility
    try {
      await supabase
        .from('gemini_responses')
        .insert({
          user_id: user_id,
          prompt: `Weight suggestion for ${exercise_name}`,
          response: JSON.stringify(response),
          type: 'weight_suggestion',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.warn('Failed to store weight suggestion in gemini_responses:', error);
    }

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in weight suggestion API:', error);
    return NextResponse.json(
      { error: 'Failed to suggest weights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
