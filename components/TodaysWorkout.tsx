'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AICoachTips from './AICoachTips';

interface WorkoutSection {
  section: string;
  exercises: string[];
}

interface WorkoutPlan {
  today: WorkoutSection[];
  ai_coach_tips: string[];
}

interface TodaysWorkoutProps {
  userId?: string;
}

export default function TodaysWorkout({ userId }: TodaysWorkoutProps) {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          context: "User has 6 months experience, last workout: chest & triceps, plays football twice a week."
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkoutPlan(data.workout_plan);
      } else {
        setError(data.error || 'Failed to generate workout');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error generating workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSectionIcon = (section: string): string => {
    switch (section.toLowerCase()) {
      case 'warmup':
        return '🔥';
      case 'main workout':
        return '💪';
      case 'cardio':
        return '❤️';
      case 'cooldown':
        return '🧘';
      default:
        return '🏋️';
    }
  };

  const getSectionColor = (section: string): string => {
    switch (section.toLowerCase()) {
      case 'warmup':
        return 'bg-orange-100 border-orange-200';
      case 'main workout':
        return 'bg-blue-100 border-blue-200';
      case 'cardio':
        return 'bg-red-100 border-red-200';
      case 'cooldown':
        return 'bg-green-100 border-green-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Today's Workout Plan
        </h1>
        <p className="text-gray-600 mb-6">
          Get your personalized workout for today based on your fitness level and goals.
        </p>
        
        <button
          onClick={generateWorkout}
          disabled={loading || !userId}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {loading ? 'Generating Workout...' : 'Generate Today\'s Workout'}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
        >
          {error}
        </motion.div>
      )}

      {workoutPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* AI Coach Tips */}
          {workoutPlan.ai_coach_tips && workoutPlan.ai_coach_tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AICoachTips 
                tips={workoutPlan.ai_coach_tips}
                autoRotate={true}
                rotationInterval={3000}
              />
            </motion.div>
          )}
          {workoutPlan.today.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-2 rounded-lg p-6 ${getSectionColor(section.section)}`}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{getSectionIcon(section.section)}</span>
                <h2 className="text-xl font-bold text-gray-800 capitalize">
                  {section.section}
                </h2>
              </div>
              
              <div className="space-y-3">
                {section.exercises.map((exercise, exerciseIndex) => (
                  <motion.div
                    key={exerciseIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.1) + (exerciseIndex * 0.05) }}
                    className="flex items-center bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {exerciseIndex + 1}
                    </div>
                    <span className="text-gray-700">{exercise}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!userId && (
        <div className="text-center text-gray-500 mt-8">
          <p>Please complete onboarding first to generate your workout.</p>
          <p className="text-sm mt-2">Debug: No userId found in localStorage</p>
          <button
            onClick={() => {
              // Create a test user for debugging
              const testUserId = 'test-user-' + Date.now();
              localStorage.setItem('userId', testUserId);
              window.location.reload();
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Create Test User (Debug)
          </button>
        </div>
      )}
    </div>
  );
}
