'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, Sparkles } from 'lucide-react';
import { TodayWorkout as TodayWorkoutType, WorkoutSection as WorkoutSectionType, Exercise, availableExercises } from '@/lib/data';
import WorkoutSection from './WorkoutSection';
import AIWorkoutReasoning from './AICoachTips';
import InlineChatStrip from './InlineChatStrip';

interface TodayWorkoutProps {
  workout: TodayWorkoutType;
  onUpdateWorkout: (updatedWorkout: TodayWorkoutType) => void;
  userContext?: string;
  exerciseDetails?: { [exerciseName: string]: string };
  preCalculatedWeights?: any; // Pre-calculated weight suggestions from workout API
}

export default function TodayWorkout({ workout, onUpdateWorkout, userContext, exerciseDetails, preCalculatedWeights }: TodayWorkoutProps) {
  const [showSwapModal, setShowSwapModal] = useState<{ exerciseId: string; sectionId: string } | null>(null);

  const handleToggleSection = (sectionId: string) => {
    const updatedSections = workout.sections.map(section =>
      section.id === sectionId ? { ...section, isExpanded: !section.isExpanded } : section
    );
    onUpdateWorkout({ ...workout, sections: updatedSections });
  };

  const handleUpdateExercise = (exerciseId: string, updatedExercise: Partial<Exercise>) => {
    const updatedSections = workout.sections.map(section => ({
      ...section,
      exercises: section.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, ...updatedExercise } : exercise
      )
    }));
    onUpdateWorkout({ ...workout, sections: updatedSections });
  };

  const handleDeleteExercise = (exerciseId: string, permanent: boolean) => {
    const updatedSections = workout.sections.map(section => ({
      ...section,
      exercises: section.exercises.filter(exercise => exercise.id !== exerciseId)
    }));
    onUpdateWorkout({ ...workout, sections: updatedSections });
  };

  const handleSwapExercise = (exerciseId: string) => {
    const section = workout.sections.find(s => s.exercises.some(e => e.id === exerciseId));
    if (section) {
      setShowSwapModal({ exerciseId, sectionId: section.id });
    }
  };

  const handleAddExercise = (sectionId: string) => {
    const section = workout.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Find a suitable exercise from available exercises for this section
    const categoryMap: { [key: string]: string } = {
      'warmup': 'warmup',
      'main': 'strength',
      'cardio': 'cardio',
      'cooldown': 'cooldown'
    };

    const suitableExercises = availableExercises.filter(ex => 
      ex.category === categoryMap[sectionId] && 
      !section.exercises.some(secEx => secEx.id === ex.id)
    );

    if (suitableExercises.length > 0) {
      const newExercise = { ...suitableExercises[0], id: `new-${Date.now()}` };
      const updatedSections = workout.sections.map(s =>
        s.id === sectionId 
          ? { ...s, exercises: [...s.exercises, newExercise] }
          : s
      );
      onUpdateWorkout({ ...workout, sections: updatedSections });
    }
  };

  const handleSwapWithExercise = (newExerciseId: string) => {
    if (!showSwapModal) return;

    const newExercise = availableExercises.find(ex => ex.id === newExerciseId);
    if (!newExercise) return;

    const updatedSections = workout.sections.map(section =>
      section.id === showSwapModal.sectionId
        ? {
            ...section,
            exercises: section.exercises.map(exercise =>
              exercise.id === showSwapModal.exerciseId
                ? { ...newExercise, id: exercise.id, sets: exercise.sets }
                : exercise
            )
          }
        : section
    );
    onUpdateWorkout({ ...workout, sections: updatedSections });
    setShowSwapModal(null);
  };

  // Calculate overall progress
  const totalExercises = workout.sections.reduce((sum, section) => sum + section.exercises.length, 0);
  const completedExercises = workout.sections.reduce((sum, section) => 
    sum + section.exercises.filter(exercise => 
      exercise.sets.every(set => set.completed)
    ).length, 0
  );
  const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-ai-800">Today's Workout</h1>
        </div>
        <p className="text-ai-600 mb-4">
          {new Date(workout.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>

      </motion.div>

      {/* AI Workout Reasoning */}
      {workout.ai_coach_tips && workout.ai_coach_tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <AIWorkoutReasoning 
            tips={workout.ai_coach_tips}
            autoRotate={true}
            rotationInterval={3000}
          />
        </motion.div>
      )}

      {/* Fallback AI Motivation (if no AI tips available) */}
      {(!workout.ai_coach_tips || workout.ai_coach_tips.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-primary-700">AI Coach Tip</span>
          </div>
          <p className="text-sm text-primary-600">
            {overallProgress === 0 
              ? "Ready to start your workout? Let's begin with a proper warmup to get your body moving!"
              : overallProgress < 50
              ? "Great start! Keep the momentum going. Remember to maintain proper form throughout your exercises."
              : overallProgress < 100
              ? "You're doing amazing! Push through these final exercises to complete your workout."
              : "Congratulations! You've completed today's workout. Don't forget to hydrate and rest well!"
            }
          </p>
        </motion.div>
      )}

      {/* Inline Chat Strip - Cult Coach */}
      <InlineChatStrip 
        currentWorkout={workout}
        userContext={userContext || ''}
        onboardingContext={typeof window !== 'undefined' ? localStorage.getItem('onboardingSummary') || '' : ''}
        onWorkoutUpdate={onUpdateWorkout} 
      />

      {/* Workout Sections */}
      <div className="space-y-4">
        {workout.sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <WorkoutSection
              section={section}
              onToggleExpanded={handleToggleSection}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
              onSwapExercise={handleSwapExercise}
              onAddExercise={handleAddExercise}
              userContext={userContext}
              exerciseDetails={exerciseDetails}
              preCalculatedWeights={preCalculatedWeights}
            />
          </motion.div>
        ))}
      </div>

      {/* Swap Exercise Modal */}
      {showSwapModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSwapModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-ai-800">Swap Exercise</h3>
            </div>
            <p className="text-sm text-ai-600 mb-4">
              Choose a new exercise to replace the current one:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableExercises
                .filter(ex => ex.category === 'strength') // For now, only show strength exercises
                .map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => handleSwapWithExercise(exercise.id)}
                    className="w-full text-left p-3 rounded-xl border border-ai-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                  >
                    <div className="font-medium text-ai-800">{exercise.name}</div>
                    <div className="text-sm text-ai-600">
                      {exercise.muscleGroups.join(', ')}
                    </div>
                  </button>
                ))}
            </div>
            <button
              onClick={() => setShowSwapModal(null)}
              className="w-full mt-4 ai-button-secondary"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
