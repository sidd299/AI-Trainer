'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { TodayWorkout as TodayWorkoutType } from '@/lib/data';

interface ChatButtonProps {
  currentWorkout: TodayWorkoutType;
  userContext: string;
  onboardingContext: string;
  onWorkoutUpdate: (newWorkout: TodayWorkoutType) => void;
}

export default function ChatButton({
  currentWorkout,
  userContext,
  onboardingContext,
  onWorkoutUpdate
}: ChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentWorkout={currentWorkout}
        userContext={userContext}
        onboardingContext={onboardingContext}
        onWorkoutUpdate={onWorkoutUpdate}
      />
    </>
  );
}