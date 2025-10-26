'use client';

import { useState } from 'react';
import SetDropdown from '../../components/SetDropdown';
import { ExerciseSet } from '../../lib/data';

export default function TestWeightsPage() {
  const [sets, setSets] = useState<ExerciseSet[]>([
    { id: 'set-1', reps: 10, weight: 4, completed: false, type: 'warmup' },
    { id: 'set-2', reps: 10, weight: 5, completed: false, type: 'working' },
    { id: 'set-3', reps: 8, weight: 6, completed: false, type: 'working' }
  ]);

  const handleUpdateSet = (setId: string, reps: number, weight: number) => {
    setSets(prev => prev.map(set => 
      set.id === setId ? { ...set, reps, weight, completed: true } : set
    ));
  };

  const handleAddSet = () => {
    const newSet: ExerciseSet = {
      id: `set-${sets.length + 1}`,
      reps: 10,
      weight: 0,
      completed: false,
      type: 'working'
    };
    setSets(prev => [...prev, newSet]);
  };

  const handleRemoveSet = (setId: string) => {
    setSets(prev => prev.filter(set => set.id !== setId));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Weight Suggestion Test</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Dumbbell Bicep Curl</h2>
          
          <SetDropdown
            sets={sets}
            onUpdateSet={handleUpdateSet}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Expected Result:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Set 1: 10 reps @ 4kg (warmup) - Orange badge</li>
            <li>• Set 2: 10 reps @ 5kg (working) - Blue badge</li>
            <li>• Set 3: 8 reps @ 6kg (working) - Blue badge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
