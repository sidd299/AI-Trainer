'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { TodayWorkout as TodayWorkoutType } from '@/lib/data';

interface InlineChatStripProps {
  currentWorkout: TodayWorkoutType;
  userContext: string;
  onboardingContext: string;
  onWorkoutUpdate: (workout: TodayWorkoutType) => void;
}

export default function InlineChatStrip({ 
  currentWorkout, 
  userContext, 
  onboardingContext, 
  onWorkoutUpdate 
}: InlineChatStripProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Inline Chat Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full glass-effect rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-all duration-200 border border-ai-200 hover:border-primary-300 group"
        >
          {/* Cult Coach Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {/* Text Input Mockup */}
          <div className="flex-1 text-left">
            <p className="text-sm text-ai-600 italic">
              I'm your Cult Coach, let me know if you want to modify or change today's workout
            </p>
          </div>

          {/* Chat Icon */}
          <div className="flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
          </div>
        </button>
      </motion.div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatWindow
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            currentWorkout={currentWorkout}
            userContext={userContext}
            onboardingContext={onboardingContext}
            onWorkoutUpdate={onWorkoutUpdate}
          />
        )}
      </AnimatePresence>
    </>
  );
}

