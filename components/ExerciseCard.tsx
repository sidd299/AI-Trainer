'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, Trash2, RefreshCw, Plus, Star, Loader2, Check, X } from 'lucide-react';
import { Exercise } from '@/lib/data';
import AITooltip from './AITooltip';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateExercise: (exerciseId: string, updatedExercise: Partial<Exercise>) => void;
  onDeleteExercise: (exerciseId: string, permanent: boolean) => void;
  onSwapExercise: (exerciseId: string) => void;
  onAddExercise: () => void;
  userContext?: string; // Add user context for weight suggestions
  exerciseDetails?: string; // Add exercise details from first API
  preCalculatedWeights?: any; // Pre-calculated weight suggestions from workout API
}

export default function ExerciseCard({ 
  exercise, 
  onUpdateExercise, 
  onDeleteExercise, 
  onSwapExercise,
  onAddExercise,
  userContext,
  exerciseDetails,
  preCalculatedWeights
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [isLoadingWeights, setIsLoadingWeights] = useState(false);
  const [weightsLoaded, setWeightsLoaded] = useState(false);

  const completedSets = exercise.sets.filter(set => set.completed).length;
  const totalSets = exercise.sets.length;
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  // Determine card color based on completion status
  const getCardColorClass = () => {
    if (completedSets === 0) {
      return 'bg-white'; // White if no sets logged
    } else if (completedSets === totalSets && totalSets > 0) {
      return 'bg-green-50 border-green-200'; // Green if all sets logged
    } else {
      return 'bg-yellow-50 border-yellow-200'; // Yellow if some sets logged
    }
  };

  const handleUpdateSet = (setId: string, reps: number, weight: number, completed?: boolean) => {
    const updatedSets = exercise.sets.map(set => 
      set.id === setId ? { ...set, reps, weight, completed: completed !== undefined ? completed : true } : set
    );
    onUpdateExercise(exercise.id, { sets: updatedSets });
  };

  const handleAddSet = () => {
    const newSet = {
      id: `set-${Date.now()}`,
      reps: 0,
      weight: 0,
      completed: false,
    };
    onUpdateExercise(exercise.id, { sets: [...exercise.sets, newSet] });
  };

  const handleRemoveSet = (setId: string) => {
    const updatedSets = exercise.sets.filter(set => set.id !== setId);
    onUpdateExercise(exercise.id, { sets: updatedSets });
  };

  const toggleFavorite = () => {
    onUpdateExercise(exercise.id, { isFavorite: !exercise.isFavorite });
  };

  const loadWeightSuggestions = () => {
    if (weightsLoaded || isLoadingWeights) return;
    
    setIsLoadingWeights(true);
    console.log('🔍 [ExerciseCard] Loading weight suggestions for:', exercise.name);
    console.log('🔍 [ExerciseCard] preCalculatedWeights available:', !!preCalculatedWeights);
    console.log('🔍 [ExerciseCard] Current exercise sets:', exercise.sets);
    
    try {
      // Check if sets already exist (pre-loaded from API)
      if (exercise.sets && exercise.sets.length > 0 && exercise.sets[0].weight > 0) {
        console.log('✅ [ExerciseCard] Sets already loaded for:', exercise.name);
        setWeightsLoaded(true);
        setIsLoadingWeights(false);
        return;
      }

      // Use weight suggestions from workout API response
      if (preCalculatedWeights && preCalculatedWeights[exercise.name]) {
        const weightData = preCalculatedWeights[exercise.name];
        console.log('📦 [ExerciseCard] Weight data found:', weightData);
        if (weightData.success && weightData.sets && weightData.sets.length > 0) {
          onUpdateExercise(exercise.id, { sets: weightData.sets });
          setWeightsLoaded(true);
          console.log('✅ Weight suggestions loaded from workout API for:', exercise.name, weightData.sets);
          setIsLoadingWeights(false);
          return;
        }
      }

      // If no weight suggestions available, show placeholder message
      console.log('⚠️ No weight suggestions available for:', exercise.name);
      console.log('⚠️ Available keys in preCalculatedWeights:', preCalculatedWeights ? Object.keys(preCalculatedWeights) : 'none');
      setWeightsLoaded(true);
      setIsLoadingWeights(false);
    } catch (error) {
      console.error('Error loading weight suggestions:', error);
      setIsLoadingWeights(false);
    }
  };


  // Load weight suggestions when exercise is expanded for the first time
  useEffect(() => {
    if (isExpanded && !weightsLoaded && !isLoadingWeights) {
      loadWeightSuggestions();
    }
  }, [isExpanded, weightsLoaded, isLoadingWeights]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`glass-effect rounded-2xl p-3 ai-glow interactive-card border-2 cursor-pointer hover:shadow-lg transition-all duration-200 ${getCardColorClass()}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Exercise Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Action Buttons - moved to front */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <AITooltip content="Mark as favorite">
                <button
                  onClick={toggleFavorite}
                  className={`p-1 rounded-md transition-all duration-200 ${
                    exercise.isFavorite
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-white/60 text-ai-500 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${exercise.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </AITooltip>

              <AITooltip content="Swap exercise">
                <button
                  onClick={() => onSwapExercise(exercise.id)}
                  className="p-1 rounded-md bg-white/60 text-ai-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </AITooltip>

              <button
                onClick={() => setShowDeleteOptions(!showDeleteOptions)}
                className="p-1 rounded-md bg-white/60 text-ai-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <h3 className="font-semibold text-ai-800">{exercise.name}</h3>
            {exercise.isFavorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.map((muscle, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-2 hover:bg-white/60 rounded-xl transition-colors duration-200"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-ai-600" />
          </motion.div>
        </button>
      </div>



      {/* Delete Options */}
      <AnimatePresence>
        {showDeleteOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 p-2 bg-red-50 rounded-xl border border-red-200"
          >
            <p className="text-sm text-red-700 mb-2">Choose deletion option:</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDeleteExercise(exercise.id, false);
                  setShowDeleteOptions(false);
                }}
                className="flex-1 py-2 px-3 text-sm bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                Delete for now
              </button>
              <button
                onClick={() => {
                  onDeleteExercise(exercise.id, true);
                  setShowDeleteOptions(false);
                }}
                className="flex-1 py-2 px-3 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete forever
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sets List - Direct Display */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            {isLoadingWeights || (!weightsLoaded && exercise.sets.length === 0) ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-ai-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading sets...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Sets Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-ai-700">
                    Sets ({exercise.sets.filter(set => set.completed).length}/{exercise.sets.length})
                  </h4>
                  <button
                    onClick={handleAddSet}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-600 rounded-md hover:bg-primary-200 transition-colors duration-200"
                  >
                    <Plus className="w-3 h-3" />
                    Add Set
                  </button>
                </div>

                {/* Sets List */}
                <div className="space-y-2">
                  {exercise.sets.map((set, index) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-ai-200"
                    >
                      <div className="flex flex-col items-center w-12">
                        <span className="text-sm font-medium text-ai-600">
                          {index + 1}
                        </span>
                        {set.type && (
                          <span className={`text-xs px-1 py-0.5 rounded-full ${
                            set.type === 'warmup' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {set.type}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex gap-2">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(set.id, parseInt(e.target.value) || 0, set.weight, set.completed)}
                          className="w-16 px-2 py-1 text-sm bg-white/80 border border-ai-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="Reps"
                        />
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(set.id, set.reps, parseInt(e.target.value) || 0, set.completed)}
                          className="w-16 px-2 py-1 text-sm bg-white/80 border border-ai-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="Weight"
                        />
                        <span className="text-xs text-ai-500 self-center">kg</span>
                      </div>

                      <button
                        onClick={() => handleUpdateSet(set.id, set.reps, set.weight, !set.completed)}
                        className={`p-2 rounded-md transition-all duration-200 ${
                          set.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-ai-100 text-ai-500 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {exercise.sets.length > 1 && (
                        <button
                          onClick={() => handleRemoveSet(set.id)}
                          className="p-2 rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
