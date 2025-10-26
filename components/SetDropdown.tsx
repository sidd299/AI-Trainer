'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Plus, X } from 'lucide-react';
import { ExerciseSet } from '@/lib/data';

interface SetDropdownProps {
  sets: ExerciseSet[];
  onUpdateSet: (setId: string, reps: number, weight: number, completed?: boolean) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
}

export default function SetDropdown({ sets, onUpdateSet, onAddSet, onRemoveSet }: SetDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSets = sets.filter(set => set.completed).length;
  const totalSets = sets.length;

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white/60 rounded-xl border border-ai-200 hover:bg-white/80 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ai-700">
            Sets ({completedSets}/{totalSets})
          </span>
          {completedSets === totalSets && totalSets > 0 && (
            <Check className="w-4 h-4 text-green-500" />
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-ai-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 p-3 bg-white/40 rounded-xl border border-ai-200">
              {sets.map((set, index) => (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 bg-white/60 rounded-lg"
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
                      onChange={(e) => onUpdateSet(set.id, parseInt(e.target.value) || 0, set.weight, set.completed)}
                      className="w-16 px-2 py-1 text-sm bg-white/80 border border-ai-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Reps"
                    />
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => onUpdateSet(set.id, set.reps, parseInt(e.target.value) || 0, set.completed)}
                      className="w-16 px-2 py-1 text-sm bg-white/80 border border-ai-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Weight"
                    />
                    <span className="text-xs text-ai-500 self-center">kg</span>
                  </div>

                  <button
                    onClick={() => onUpdateSet(set.id, set.reps, set.weight, !set.completed)}
                    className={`p-1 rounded-md transition-all duration-200 ${
                      set.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-ai-100 text-ai-500 hover:bg-green-100 hover:text-green-600'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  {sets.length > 1 && (
                    <button
                      onClick={() => onRemoveSet(set.id)}
                      className="p-1 rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}

              <button
                onClick={onAddSet}
                className="w-full flex items-center justify-center gap-2 p-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Set
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
