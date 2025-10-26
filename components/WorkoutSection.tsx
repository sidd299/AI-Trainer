'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Sparkles } from 'lucide-react';
import { WorkoutSection as WorkoutSectionType, Exercise } from '@/lib/data';
import ExerciseCard from './ExerciseCard';

interface WorkoutSectionProps {
  section: WorkoutSectionType;
  onToggleExpanded: (sectionId: string) => void;
  onUpdateExercise: (exerciseId: string, updatedExercise: Partial<Exercise>) => void;
  onDeleteExercise: (exerciseId: string, permanent: boolean) => void;
  onSwapExercise: (exerciseId: string) => void;
  onAddExercise: (sectionId: string) => void;
  userContext?: string;
  exerciseDetails?: { [exerciseName: string]: string }; // Map of exercise names to their details
  preCalculatedWeights?: any; // Pre-calculated weight suggestions from workout API
}

export default function WorkoutSection({
  section,
  onToggleExpanded,
  onUpdateExercise,
  onDeleteExercise,
  onSwapExercise,
  onAddExercise,
  userContext,
  exerciseDetails,
  preCalculatedWeights,
}: WorkoutSectionProps) {
  const [showAddExercise, setShowAddExercise] = useState(false);

  const completedExercises = section.exercises.filter(exercise => 
    exercise.sets.every(set => set.completed)
  ).length;
  const totalExercises = section.exercises.length;
  const sectionProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const handleAddExercise = () => {
    onAddExercise(section.id);
    setShowAddExercise(false);
  };

  return (
    <motion.div
      layout
      className="glass-effect rounded-2xl p-3 ai-glow mb-3"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onToggleExpanded(section.id)}
          className="flex-1 flex items-center gap-3"
        >
          <span className="text-2xl">{section.icon}</span>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-ai-800">{section.name}</h2>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-ai-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${sectionProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm text-ai-600">
                {completedExercises}/{totalExercises}
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Small Add Exercise Button */}
          {section.isExpanded && (
            <button
              onClick={() => setShowAddExercise(!showAddExercise)}
              className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
              title="Add Exercise"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          
          <motion.div
            animate={{ rotate: section.isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-6 h-6 text-ai-600" />
          </motion.div>
        </div>
      </div>

      {/* AI Suggestion */}
      {section.isExpanded && section.exercises.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">AI Suggestion</span>
          </div>
          <p className="text-sm text-primary-600">
            Ready to add some exercises to your {section.name.toLowerCase()}? 
            Let's get started with a personalized workout plan!
          </p>
        </motion.div>
      )}


      {/* Add Exercise Confirmation */}
      <AnimatePresence>
        {showAddExercise && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 bg-white/80 rounded-xl border border-ai-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-ai-800">Add New Exercise</span>
            </div>
            <p className="text-sm text-ai-600 mb-2">
              I'll add a recommended exercise for your {section.name.toLowerCase()}. 
              You can customize it after adding!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAddExercise}
                className="flex-1 ai-button"
              >
                Add Exercise
              </button>
              <button
                onClick={() => setShowAddExercise(false)}
                className="flex-1 ai-button-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises */}
      <AnimatePresence>
        {section.isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {section.exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ExerciseCard
                  exercise={exercise}
                  onUpdateExercise={onUpdateExercise}
                  onDeleteExercise={onDeleteExercise}
                  onSwapExercise={onSwapExercise}
                  onAddExercise={() => onAddExercise(section.id)}
                  userContext={userContext}
                  exerciseDetails={exerciseDetails?.[exercise.name]}
                  preCalculatedWeights={preCalculatedWeights}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
