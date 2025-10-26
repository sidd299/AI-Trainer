'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIWorkoutReasoningProps {
  tips: string[];
  autoRotate?: boolean;
  rotationInterval?: number;
}

export default function AIWorkoutReasoning({ 
  tips, 
  autoRotate = true, 
  rotationInterval = 3000 
}: AIWorkoutReasoningProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Auto-rotate tips
  useEffect(() => {
    if (autoRotate && tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
      }, rotationInterval);

      return () => clearInterval(interval);
    }
  }, [autoRotate, tips.length, rotationInterval]);

  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-200 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center mb-2">
        <span className="text-xl mr-2">🧠</span>
        <h3 className="text-base font-bold text-purple-800">Why This Workout?</h3>
      </div>
      
      <div className="min-h-[1.5rem] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTipIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-purple-700 font-semibold text-sm"
          >
            "{tips[currentTipIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>
      
      {/* Progress indicators only */}
      <div className="flex justify-center mt-2 space-x-1">
        {tips.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              index === currentTipIndex ? 'bg-purple-600' : 'bg-purple-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
