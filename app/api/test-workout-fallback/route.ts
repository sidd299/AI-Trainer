import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, context } = body;

    // Generate a fallback workout based on context
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

    return NextResponse.json({
      success: true,
      user_id: user_id,
      workout_plan: workoutPlan,
      message: 'Fallback workout generated successfully (Gemini API unavailable)'
    });

  } catch (error) {
    console.error('Fallback workout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
