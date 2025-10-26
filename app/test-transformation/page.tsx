'use client';

import React, { useState } from 'react';

export default function TestTransformationPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testTransformation = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test the workout API
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test-transformation-' + Date.now(),
          context: "Intermediate user, 1 year experience, last workout: chest & triceps yesterday, prefers strength training, has access to full gym equipment, goal: muscle building."
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Test the transformation
        const apiWorkout = data.workout_plan;
        
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

        setTestResult({
          apiResponse: data,
          transformedWorkout: transformedWorkout,
          success: true
        });
      } else {
        setTestResult({
          error: data.error,
          success: false
        });
      }
    } catch (error) {
      setTestResult({
        error: 'Network error: ' + error,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getSectionIcon = (sectionName: string): string => {
    switch (sectionName.toLowerCase()) {
      case 'warmup': return '🔥';
      case 'main workout': return '💪';
      case 'cardio': return '❤️';
      case 'cooldown': return '🧘';
      default: return '🏋️';
    }
  };

  const getExerciseCategory = (exerciseName: string): string => {
    const name = exerciseName.toLowerCase();
    if (name.includes('push') || name.includes('press') || name.includes('bench')) return 'push';
    if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'pull';
    if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return 'legs';
    if (name.includes('plank') || name.includes('crunch') || name.includes('core')) return 'core';
    if (name.includes('jump') || name.includes('run') || name.includes('cardio')) return 'cardio';
    return 'strength';
  };

  const getMuscleGroups = (exerciseName: string): string[] => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Transformation</h1>
        
        <div className="mb-8">
          <button
            onClick={testTransformation}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test API & Transformation'}
          </button>
        </div>

        {testResult && (
          <div className="space-y-6">
            {/* API Response */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">API Response</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(testResult.apiResponse, null, 2)}
              </pre>
            </div>

            {/* Transformed Workout */}
            {testResult.transformedWorkout && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Transformed Workout</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(testResult.transformedWorkout, null, 2)}
                </pre>
              </div>
            )}

            {/* Error */}
            {testResult.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {testResult.error}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            ← Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
