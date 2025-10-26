'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, Bot, User, Check, X as XIcon } from 'lucide-react';
import { TodayWorkout as TodayWorkoutType } from '@/lib/data';

interface ChatMessage {
  id: string;
  message_type: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: any;
}

interface ChatSession {
  id: string;
  session_name: string;
  current_workout: any;
  user_context: string;
  onboarding_context: string;
  is_active: boolean;
  created_at: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkout: TodayWorkoutType;
  userContext: string;
  onboardingContext: string;
  onWorkoutUpdate: (newWorkout: TodayWorkoutType) => void;
}

export default function ChatWindow({
  isOpen,
  onClose,
  currentWorkout,
  userContext,
  onboardingContext,
  onWorkoutUpdate
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingWorkoutChange, setPendingWorkoutChange] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dynamicUserContext, setDynamicUserContext] = useState<string>(userContext || '');
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [lastChangeRequest, setLastChangeRequest] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat session when component opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChatSession();
    }
  }, [isOpen, sessionId]);

  const initializeChatSession = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Create or get existing chat session
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: 'Hello! I\'m ready to help you with your workout plan.',
          current_workout: currentWorkout,
          user_context: dynamicUserContext || userContext,
          onboarding_context: onboardingContext
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.session_id);
        // Load existing messages
        loadChatHistory(data.session_id);
      } else {
        console.error('Failed to initialize chat session:', data.error);
      }
    } catch (error) {
      console.error('Error initializing chat session:', error);
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?userId=${localStorage.getItem('userId')}&sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message_type: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No user ID found');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: userMessage,
          session_id: sessionId,
          current_workout: currentWorkout,
          user_context: dynamicUserContext || userContext,
          onboarding_context: onboardingContext
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.updated_user_context) {
          setDynamicUserContext(data.updated_user_context);
        }
        
        // Clean AI response - extra safety layer
        let cleanedResponse = data.ai_response;
        
        // Check if response is JSON string (shouldn't happen, but just in case)
        if (cleanedResponse.trim().startsWith('{') && cleanedResponse.includes('"ai_message"')) {
          try {
            const parsed = JSON.parse(cleanedResponse);
            cleanedResponse = parsed.ai_message || parsed.message || cleanedResponse;
            console.log('🧹 [CHAT] Cleaned JSON from response');
          } catch (e) {
            console.warn('⚠️ [CHAT] Response looks like JSON but failed to parse');
          }
        }
        
        // Add AI response to messages
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          message_type: 'assistant',
          content: cleanedResponse,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);

        // Check if we should show the Confirm Changes button
        console.log('🤖 [AI RESPONSE] should_propose_changes:', data.should_propose_changes);
        console.log('🤖 [AI RESPONSE] Full response data:', data);
        
        if (data.should_propose_changes) {
          console.log('✅ [AI RESPONSE] Setting showConfirmButton to TRUE');
          setShowConfirmButton(true);
          setLastChangeRequest(userMessage);
        } else {
          console.log('⚠️ [AI RESPONSE] should_propose_changes is FALSE, button will NOT show');
        }
      } else {
        console.error('Failed to send message:', data.error);
        // Add error message
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          message_type: 'system',
          content: 'Sorry, I encountered an error. Please try again.',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message_type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmChangesClick = async () => {
    console.log('🟢 [CONFIRM BUTTON] Confirm Changes button clicked!');
    console.log('🟢 [CONFIRM BUTTON] sessionId:', sessionId);
    console.log('🟢 [CONFIRM BUTTON] lastChangeRequest:', lastChangeRequest);
    
    setShowConfirmButton(false);
    setIsLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      console.log('🟢 [CONFIRM BUTTON] userId:', userId);
      
      if (!userId || !sessionId) {
        console.error('❌ [CONFIRM BUTTON] Missing userId or sessionId!');
        return;
      }

      // Add a system message that user clicked confirm
      console.log('📤 [CONFIRM BUTTON] Adding system message...');
      const confirmMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        message_type: 'system',
        content: '🔄 Generating your updated workout plan...',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmMessage]);
      console.log('✅ [CONFIRM BUTTON] System message added');

      console.log('🌐 [CONFIRM BUTTON] Calling propose-workout-changes API...');
      console.log('📦 [CONFIRM BUTTON] Request body:', {
        session_id: sessionId,
        user_id: userId,
        change_request: lastChangeRequest
      });

      let response;
      try {
        response = await fetch('/api/chat/propose-workout-changes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId,
            change_request: lastChangeRequest
          }),
        });
        console.log('📡 [CONFIRM BUTTON] Fetch completed!');
      } catch (fetchError) {
        console.error('❌ [CONFIRM BUTTON] Fetch failed:', fetchError);
        throw fetchError;
      }

      console.log('📡 [CONFIRM BUTTON] Response status:', response.status);
      console.log('📡 [CONFIRM BUTTON] Response ok:', response.ok);

      let data;
      try {
        data = await response.json();
        console.log('📋 [CONFIRM BUTTON] JSON parsed successfully');
      } catch (jsonError) {
        console.error('❌ [CONFIRM BUTTON] JSON parse failed:', jsonError);
        const text = await response.text();
        console.log('📋 [CONFIRM BUTTON] Raw response text:', text);
        throw jsonError;
      }
      
      console.log('📋 [CONFIRM BUTTON] Proposal response data:', data);
      
      if (data.success) {
        console.log('✅ Proposal successful, showing confirmation dialog');
        setPendingWorkoutChange({
          proposal_id: data.proposal_id,
          new_workout_plan: data.new_workout_plan,
          change_summary: data.change_summary,
          ai_coach_tips: data.ai_coach_tips
        });
        setShowConfirmation(true);
        console.log('🔔 showConfirmation set to true');
      } else {
        console.error('❌ Proposal failed:', data.error);
        // Add error message
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          message_type: 'system',
          content: 'Sorry, I had trouble generating your new workout plan. Please try again.',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error proposing workout changes:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message_type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const transformAPIWorkoutToTodayWorkout = (apiWorkout: any): TodayWorkoutType => {
    console.log('📦 [TRANSFORM] Starting transformation');
    console.log('📦 [TRANSFORM] Input API workout:', apiWorkout);
    console.log('📦 [TRANSFORM] Has today array?', !!apiWorkout?.today);
    console.log('📦 [TRANSFORM] Today length:', apiWorkout?.today?.length);
    console.log('📦 [TRANSFORM] Has weight_suggestions?', !!apiWorkout?.weight_suggestions);
    
    if (!apiWorkout?.today) {
      console.error('❌ [TRANSFORM] ERROR: No today array found in API workout!');
      return {
        date: new Date().toISOString().split('T')[0],
        sections: [],
        ai_coach_tips: []
      };
    }
    
    // Transform the API workout format to TodayWorkout format
    const sections = apiWorkout.today.map((section: any, sectionIndex: number) => {
      const sectionName = section.section || section.name || `Section ${sectionIndex + 1}`;
      console.log(`🔄 [TRANSFORM] Section ${sectionIndex}: ${sectionName} - ${section.exercises?.length || 0} exercises`);
      
      return {
        id: `section-${sectionIndex}-${Date.now()}`,
        name: sectionName,
        icon: getSectionIcon(sectionName),
        isExpanded: false,
        exercises: (section.exercises || []).map((exerciseName: string, exerciseIndex: number) => {
          const weightSuggestions = apiWorkout.weight_suggestions?.[exerciseName];
          const sets = weightSuggestions?.sets || [];
          
          console.log(`  ✅ [TRANSFORM] Exercise: "${exerciseName}"`);
          console.log(`     - Has weight suggestions: ${!!weightSuggestions}`);
          console.log(`     - Sets count: ${sets.length}`);
          if (sets.length > 0) {
            console.log(`     - First set:`, sets[0]);
          }
          
          return {
            id: `exercise-${sectionIndex}-${exerciseIndex}-${Date.now()}`,
            name: exerciseName,
            category: getExerciseCategory(exerciseName),
            muscleGroups: getMuscleGroups(exerciseName),
            sets: sets.map((set: any, setIndex: number) => ({
              id: `set-${setIndex}-${Date.now()}`,
              reps: set.reps || 10,
              weight: set.weight || 0,
              completed: false,
              type: set.type || 'working'
            })),
            isFavorite: false,
            notes: weightSuggestions?.reasoning || ''
          };
        })
      };
    });

    const result = {
      date: new Date().toISOString().split('T')[0],
      sections: sections,
      ai_coach_tips: apiWorkout.ai_coach_tips || []
    };
    
    console.log('✅ [TRANSFORM] Final result:');
    console.log('   - Sections:', result.sections.length);
    console.log('   - AI Tips:', result.ai_coach_tips.length);
    console.log('   - Total exercises:', result.sections.reduce((acc: number, s: any) => acc + s.exercises.length, 0));
    console.log('   - Full result:', JSON.stringify(result, null, 2));
    
    return result;
  };

  const getSectionIcon = (sectionName: string): string => {
    const name = sectionName.toLowerCase();
    if (name.includes('warm')) return '🔥';
    if (name.includes('main') || name.includes('strength')) return '💪';
    if (name.includes('cardio')) return '❤️';
    if (name.includes('cool')) return '🧘';
    return '🏋️';
  };

  const getExerciseCategory = (exerciseName: string): string => {
    const name = exerciseName.toLowerCase();
    if (name.includes('push') || name.includes('press') || name.includes('bench')) return 'push';
    if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'pull';
    if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return 'legs';
    if (name.includes('plank') || name.includes('crunch') || name.includes('core')) return 'core';
    if (name.includes('cardio') || name.includes('run') || name.includes('bike')) return 'cardio';
    return 'strength';
  };

  const getMuscleGroups = (exerciseName: string): string[] => {
    const name = exerciseName.toLowerCase();
    const groups: string[] = [];
    
    if (name.includes('chest') || name.includes('bench') || name.includes('push')) groups.push('chest');
    if (name.includes('back') || name.includes('pull') || name.includes('row')) groups.push('back');
    if (name.includes('shoulder') || name.includes('press')) groups.push('shoulders');
    if (name.includes('leg') || name.includes('squat') || name.includes('lunge')) groups.push('legs');
    if (name.includes('core') || name.includes('abs') || name.includes('plank')) groups.push('core');
    
    return groups.length > 0 ? groups : ['full-body'];
  };

  const handleConfirmWorkoutChanges = async (accepted: boolean) => {
    if (!pendingWorkoutChange) return;

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch('/api/chat/confirm-workout-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: pendingWorkoutChange.proposal_id,
          user_id: userId,
          accepted: accepted
        }),
      });

      const data = await response.json();
      
      if (data.success && accepted) {
        console.log('✅ Confirmation accepted, RAW data received:', JSON.stringify(data, null, 2));
        console.log('📋 Data keys:', Object.keys(data));
        console.log('📋 Has new_workout_plan?', !!data.new_workout_plan);
        console.log('📋 Has weight_suggestions?', !!data.weight_suggestions);
        console.log('📋 new_workout_plan keys:', data.new_workout_plan ? Object.keys(data.new_workout_plan) : 'none');
        
        // Transform and update the workout in the parent component
        console.log('🔄 Starting transformation...');
        const transformedWorkout = transformAPIWorkoutToTodayWorkout(data.new_workout_plan);
        console.log('✅ Transformation complete!');
        console.log('📦 Transformed workout sections:', transformedWorkout.sections?.length);
        console.log('📦 Transformed workout tips:', transformedWorkout.ai_coach_tips?.length);
        console.log('📞 Calling onWorkoutUpdate with:', transformedWorkout);
        
        // Store in window for debugging
        (window as any).__lastWorkoutUpdate = transformedWorkout;
        (window as any).__rawAPIData = data;
        
        // CRITICAL: Save to localStorage BEFORE calling onWorkoutUpdate
        console.log('💾 Saving workout to localStorage BEFORE refresh...');
        try {
          localStorage.setItem('currentWorkout', JSON.stringify(transformedWorkout));
          console.log('✅ Workout saved to localStorage successfully');
          console.log('📦 Saved workout:', transformedWorkout);
        } catch (e) {
          console.error('❌ Failed to save to localStorage:', e);
        }
        
        onWorkoutUpdate(transformedWorkout);
        console.log('✅ onWorkoutUpdate called successfully');
        
        // Add system message about the change
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          message_type: 'system',
          content: `✅ Workout plan updated! ${data.change_summary}`,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, systemMessage]);

        // Close chat and refresh page to show changes
        setTimeout(() => {
          console.log('🚪 Closing chat window');
          onClose();
          
          // Refresh page after a short delay to ensure state is saved
          setTimeout(() => {
            console.log('🔄 Refreshing page to show updated workout');
            console.log('🔍 Verifying localStorage before refresh...');
            const saved = localStorage.getItem('currentWorkout');
            if (saved) {
              const parsed = JSON.parse(saved);
              console.log('✅ localStorage contains workout with', parsed.sections?.length, 'sections');
            }
            window.location.reload();
          }, 500);
        }, 2000);
      } else if (data.success && !accepted) {
        // Add system message about rejection
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          message_type: 'system',
          content: '❌ Workout changes were not applied. Your current workout plan remains unchanged.',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Error confirming workout changes:', error);
    } finally {
      setShowConfirmation(false);
      setPendingWorkoutChange(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Fitness Coach</h2>
                <p className="text-sm text-gray-500">Chat about your workout plan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Start a conversation about your workout plan!</p>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${
                    message.message_type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.message_type === 'user' 
                        ? 'bg-blue-500' 
                        : message.message_type === 'system'
                        ? 'bg-gray-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                      {message.message_type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : message.message_type === 'system' ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.message_type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.message_type === 'system'
                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.message_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            {/* Confirm Changes Button */}
            {showConfirmButton && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3"
              >
                <button
                  onClick={handleConfirmChangesClick}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md"
                >
                  <Check className="w-5 h-5" />
                  Confirm Changes
                </button>
              </motion.div>
            )}
            
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your workout plan..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Confirmation Dialog */}
      {console.log('🎭 Confirmation Dialog Render Check:', { showConfirmation, hasPendingChange: !!pendingWorkoutChange })}
      <AnimatePresence>
        {showConfirmation && pendingWorkoutChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Apply Workout Changes?
                </h3>
                <p className="text-gray-600">
                  {pendingWorkoutChange.change_summary}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">AI Coach Tips:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {pendingWorkoutChange.ai_coach_tips?.map((tip: string, index: number) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirmWorkoutChanges(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <XIcon className="w-4 h-4" />
                  Keep Current Plan
                </button>
                <button
                  onClick={() => handleConfirmWorkoutChanges(true)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}