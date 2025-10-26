'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus, Trash2, RefreshCw, Zap } from 'lucide-react';

interface ChangeNotificationProps {
  isVisible: boolean;
  changeType: 'add' | 'delete' | 'modify' | 'swap' | 'none';
  changeDescription: string;
  onClose: () => void;
}

const getChangeIcon = (type: string) => {
  switch (type) {
    case 'add':
      return <Plus className="w-5 h-5" />;
    case 'delete':
      return <Trash2 className="w-5 h-5" />;
    case 'modify':
      return <RefreshCw className="w-5 h-5" />;
    case 'swap':
      return <Zap className="w-5 h-5" />;
    default:
      return <CheckCircle className="w-5 h-5" />;
  }
};

const getChangeColor = (type: string) => {
  switch (type) {
    case 'add':
      return 'bg-green-500';
    case 'delete':
      return 'bg-red-500';
    case 'modify':
      return 'bg-blue-500';
    case 'swap':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export default function ChangeNotification({ 
  isVisible, 
  changeType, 
  changeDescription, 
  onClose 
}: ChangeNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4"
          >
            {/* Header */}
            <div className="flex items-center space-x-3 mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className={`${getChangeColor(changeType)} rounded-full p-2 text-white`}
              >
                {getChangeIcon(changeType)}
              </motion.div>
              
              <div>
                <motion.h4
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-semibold text-gray-900 text-sm"
                >
                  Workout Updated
                </motion.h4>
                <motion.p
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-gray-500"
                >
                  AI has made changes
                </motion.p>
              </div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-700 mb-3"
            >
              {changeDescription}
            </motion.p>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Got it!
            </motion.button>
          </motion.div>

          {/* Auto-close after 5 seconds */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-xl origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
