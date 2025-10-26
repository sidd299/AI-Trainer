'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, User, Dumbbell, Target, Activity, Calendar, Zap } from 'lucide-react';

interface OnboardingFormProps {
  onSubmit: (fitnessJourney: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

interface OnboardingData {
  basicInfo: {
    age: string;
    weight: string;
    gender: string;
  };
  experience: {
    hasGymExperience: string;
    experienceDuration: string;
  };
  goals: {
    primaryGoal: string;
  };
  fitnessLevel: {
    pushups: string;
    pullups: string;
    squats: string;
  };
  workoutSplit: {
    splitType: string;
    customSplit: string;
  };
  currentState: {
    todayGoal: string;
    recentWorkouts: string;
  };
}

export default function OnboardingForm({ onSubmit, isLoading, error }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    basicInfo: { age: '', weight: '', gender: '' },
    experience: { hasGymExperience: '', experienceDuration: '' },
    goals: { primaryGoal: '' },
    fitnessLevel: { pushups: '', pullups: '', squats: '' },
    workoutSplit: { splitType: '', customSplit: '' },
    currentState: { todayGoal: '', recentWorkouts: '' }
  });

  const steps = [
    {
      title: "Basic Information",
      icon: User,
      description: "Let's start with your basic details"
    },
    {
      title: "Gym Experience",
      icon: Dumbbell,
      description: "Tell us about your workout history"
    },
    {
      title: "Fitness Goals",
      icon: Target,
      description: "What do you want to achieve?"
    },
    {
      title: "Current Fitness Level",
      icon: Activity,
      description: "How strong are you right now?"
    },
    {
      title: "Workout Split",
      icon: Calendar,
      description: "What's your preferred training style?"
    },
    {
      title: "Today's Plan",
      icon: Zap,
      description: "What should we focus on today?"
    }
  ];

  const handleInputChange = (section: keyof OnboardingData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.basicInfo.age && formData.basicInfo.weight && formData.basicInfo.gender);
      case 1:
        return !!(formData.experience.hasGymExperience && 
               (formData.experience.hasGymExperience === 'No' || formData.experience.experienceDuration));
      case 2:
        return !!formData.goals.primaryGoal;
      case 3:
        return !!(formData.fitnessLevel.pushups && formData.fitnessLevel.pullups && formData.fitnessLevel.squats);
      case 4:
        return !!(formData.workoutSplit.splitType && 
               (formData.workoutSplit.splitType !== 'Custom' || formData.workoutSplit.customSplit));
      case 5:
        return !!(formData.currentState.todayGoal || formData.currentState.recentWorkouts);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatDataForAI = (): string => {
    return `
**ONBOARDING QUESTIONNAIRE RESPONSES:**

**1. Basic Information:**
- Age: ${formData.basicInfo.age}
- Weight: ${formData.basicInfo.weight}
- Gender: ${formData.basicInfo.gender}

**2. Gym Experience:**
- Previous gym experience: ${formData.experience.hasGymExperience}
${formData.experience.experienceDuration ? `- Experience duration: ${formData.experience.experienceDuration}` : ''}

**3. Fitness Goals:**
- Primary goal: ${formData.goals.primaryGoal}

**4. Current Fitness Level:**
- Push-ups: ${formData.fitnessLevel.pushups}
- Pull-ups: ${formData.fitnessLevel.pullups}
- Bodyweight squats: ${formData.fitnessLevel.squats}

**5. Workout Split:**
- Preferred split: ${formData.workoutSplit.splitType}
${formData.workoutSplit.customSplit ? `- Custom split details: ${formData.workoutSplit.customSplit}` : ''}

**6. Today's Focus:**
- Today's goal: ${formData.currentState.todayGoal}
${formData.currentState.recentWorkouts ? `- Recent workouts (last 3-4 days): ${formData.currentState.recentWorkouts}` : ''}

Please create a personalized workout plan based on this comprehensive information.
    `.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid(currentStep)) {
      const formattedData = formatDataForAI();
      await onSubmit(formattedData);
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const renderStep = () => {

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.basicInfo.age}
                onChange={(e) => handleInputChange('basicInfo', 'age', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 25"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={formData.basicInfo.weight}
                onChange={(e) => handleInputChange('basicInfo', 'weight', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 70"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.basicInfo.gender}
                onChange={(e) => handleInputChange('basicInfo', 'gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Have you worked out in gyms previously?</label>
              <select
                value={formData.experience.hasGymExperience}
                onChange={(e) => handleInputChange('experience', 'hasGymExperience', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {formData.experience.hasGymExperience === 'Yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">For how long?</label>
                <select
                  value={formData.experience.experienceDuration}
                  onChange={(e) => handleInputChange('experience', 'experienceDuration', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select duration</option>
                  <option value="Less than 6 months">Less than 6 months</option>
                  <option value="6 months - 1 year">6 months - 1 year</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2-5 years">2-5 years</option>
                  <option value="More than 5 years">More than 5 years</option>
                </select>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What is your primary goal?</label>
              <select
                value={formData.goals.primaryGoal}
                onChange={(e) => handleInputChange('goals', 'primaryGoal', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select your goal</option>
                <option value="Muscle building">Muscle building</option>
                <option value="Weight loss">Weight loss</option>
                <option value="Strength gain">Strength gain</option>
                <option value="General fitness">General fitness</option>
                <option value="Athletic performance">Athletic performance</option>
                <option value="Rehabilitation">Rehabilitation</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How many push-ups can you do?</label>
              <input
                type="text"
                value={formData.fitnessLevel.pushups}
                onChange={(e) => handleInputChange('fitnessLevel', 'pushups', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 15, 20-25, or 'can't do any'"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How many pull-ups can you do?</label>
              <input
                type="text"
                value={formData.fitnessLevel.pullups}
                onChange={(e) => handleInputChange('fitnessLevel', 'pullups', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 5, 10-12, or 'can't do any'"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How many bodyweight squats can you do?</label>
              <input
                type="text"
                value={formData.fitnessLevel.squats}
                onChange={(e) => handleInputChange('fitnessLevel', 'squats', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 20, 30-40, or 'unlimited'"
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What split do you follow?</label>
              <select
                value={formData.workoutSplit.splitType}
                onChange={(e) => handleInputChange('workoutSplit', 'splitType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select your split</option>
                <option value="Push-Pull-Legs">Push-Pull-Legs</option>
                <option value="Full Body">Full Body</option>
                <option value="Bro-split">Bro-split (one muscle group per day)</option>
                <option value="Upper/Lower">Upper/Lower</option>
                <option value="Custom">Custom</option>
                <option value="No preference">No preference</option>
              </select>
            </div>
            {formData.workoutSplit.splitType === 'Custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe your custom split</label>
                <textarea
                  value={formData.workoutSplit.customSplit}
                  onChange={(e) => handleInputChange('workoutSplit', 'customSplit', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="e.g., Chest & Triceps, Back & Biceps, Legs & Shoulders"
                  required
                />
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to focus on today?</label>
              <textarea
                value={formData.currentState.todayGoal}
                onChange={(e) => handleInputChange('currentState', 'todayGoal', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="e.g., Upper body strength, Cardio, or 'I'm not sure'"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What have you worked out in the last 3-4 days?</label>
              <textarea
                value={formData.currentState.recentWorkouts}
                onChange={(e) => handleInputChange('currentState', 'recentWorkouts', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="e.g., Monday: Chest & Triceps, Wednesday: Legs, Friday: Back & Biceps"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
            >
              <StepIcon className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {currentStepData.title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 max-w-md mx-auto"
            >
              {currentStepData.description}
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid(currentStep) || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI is aligning with your preferences...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate My Workout Plan</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.form>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold text-sm">AI</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">AI-Powered</h3>
                <p className="text-xs text-gray-500">Personalized recommendations</p>
              </div>
              <div className="p-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold text-sm">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Adaptive</h3>
                <p className="text-xs text-gray-500">Adjusts to your progress</p>
              </div>
              <div className="p-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold text-sm">💪</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Effective</h3>
                <p className="text-xs text-gray-500">Proven workout methods</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}