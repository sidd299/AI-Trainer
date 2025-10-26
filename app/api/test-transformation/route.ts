import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, context } = body;

    // Call the workout API
    const workoutResponse = await fetch('http://localhost:3001/api/workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id, context })
    });

    const workoutData = await workoutResponse.json();

    if (!workoutResponse.ok) {
      return NextResponse.json({ error: workoutData.error }, { status: 500 });
    }

    // Test transformation
    const apiWorkout = workoutData.workout_plan;
    
    const transformedWorkout = {
      date: new Date().toISOString().split('T')[0],
      sections: apiWorkout.today.map((section: any, index: number) => ({
        id: `section-${index}`,
        name: section.section,
        icon: getSectionIcon(section.section),
        isExpanded: true,
        exercises: section.exercises.map((exercise: any, exerciseIndex: number) => ({
          id: `exercise-${index}-${exerciseIndex}`,
          name: exercise,
          category: getExerciseCategory(exercise),
          muscleGroups: getMuscleGroups(exercise),
          isFavorite: false,
          notes: '',
          sets: [
            { id: 'set-1', reps: 10, weight: 0, completed: false },
            { id: 'set-2', reps: 10, weight: 0, completed: false },
            { id: 'set-3', reps: 10, weight: 0, completed: false }
          ]
        }))
      }))
    };

    return NextResponse.json({
      success: true,
      apiResponse: workoutData,
      transformedWorkout: transformedWorkout
    });

  } catch (error) {
    console.error('Test transformation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getSectionIcon(sectionName: string): string {
  switch (sectionName.toLowerCase()) {
    case 'warmup': return '🔥';
    case 'main workout': return '💪';
    case 'cardio': return '❤️';
    case 'cooldown': return '🧘';
    default: return '🏋️';
  }
}

function getExerciseCategory(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes('push') || name.includes('press') || name.includes('bench')) return 'push';
  if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'pull';
  if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return 'legs';
  if (name.includes('plank') || name.includes('crunch') || name.includes('core')) return 'core';
  if (name.includes('jump') || name.includes('run') || name.includes('cardio')) return 'cardio';
  return 'strength';
}

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
