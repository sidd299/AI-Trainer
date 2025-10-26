'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, Target, Zap } from 'lucide-react';

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  text: string;
  type: 'tip' | 'motivation' | 'reminder';
}

const suggestions: Suggestion[] = [
  {
    id: '1',
    icon: <Lightbulb className="w-4 h-4" />,
    text: "Remember to breathe deeply during your exercises",
    type: 'tip'
  },
  {
    id: '2',
    icon: <Target className="w-4 h-4" />,
    text: "Focus on form over speed for better results",
    type: 'tip'
  },
  {
    id: '3',
    icon: <Zap className="w-4 h-4" />,
    text: "You're doing great! Keep up the momentum",
    type: 'motivation'
  },
  {
    id: '4',
    icon: <Sparkles className="w-4 h-4" />,
    text: "Try increasing weight by 5% for progressive overload",
    type: 'tip'
  },
  {
    id: '5',
    icon: <Target className="w-4 h-4" />,
    text: "Don't forget to hydrate between sets",
    type: 'reminder'
  }
];

export default function AIFloatingSuggestions() {
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setCurrentSuggestion(randomSuggestion);
      setIsVisible(true);

      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    }, 8000); // Show new suggestion every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && currentSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto"
        >
          <div className={`p-3 rounded-xl shadow-lg backdrop-blur-sm border ${
            currentSuggestion.type === 'tip' 
              ? 'bg-blue-50/90 border-blue-200 text-blue-800'
              : currentSuggestion.type === 'motivation'
              ? 'bg-green-50/90 border-green-200 text-green-800'
              : 'bg-orange-50/90 border-orange-200 text-orange-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${
                currentSuggestion.type === 'tip' 
                  ? 'bg-blue-100'
                  : currentSuggestion.type === 'motivation'
                  ? 'bg-green-100'
                  : 'bg-orange-100'
              }`}>
                {currentSuggestion.icon}
              </div>
              <span className="text-sm font-medium">
                {currentSuggestion.text}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
