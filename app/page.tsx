'use client';

import { useState, useEffect, useRef } from 'react';
import { todaysWorkout, TodayWorkout as TodayWorkoutType } from '@/lib/data';
import { WorkoutAction, geminiAI } from '@/lib/gemini';
import { WorkoutActionHandler } from '@/lib/workoutActions';
import TodayWorkout from '@/components/TodayWorkout';
import TodaysWorkout from '@/components/TodaysWorkout';
import OnboardingForm from '@/components/OnboardingForm';
import ProcessingOverlay from '@/components/ProcessingOverlay';
import ChangeNotification from '@/components/ChangeNotification';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function Home() {
  const [workout, setWorkout] = useState<TodayWorkoutType>(todaysWorkout);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [isProcessingChanges, setIsProcessingChanges] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [changeNotification, setChangeNotification] = useState<{
    isVisible: boolean;
    type: 'add' | 'delete' | 'modify' | 'swap' | 'none';
    description: string;
  }>({
    isVisible: false,
    type: 'none',
    description: ''
  });
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isVisible: boolean;
    title: string;
    description: string;
    changes: string[];
    pendingAction: WorkoutAction | null;
  }>({
    isVisible: false,
    title: '',
    description: '',
    changes: [],
    pendingAction: null
  });
  const [followUpMessage, setFollowUpMessage] = useState<string | null>(null);
  const [workoutKey, setWorkoutKey] = useState(0);
  const [lastWorkoutUpdate, setLastWorkoutUpdate] = useState<string>('');
  const [exerciseDetails, setExerciseDetails] = useState<{ [exerciseName: string]: string }>({});
  const [preCalculatedWeights, setPreCalculatedWeights] = useState<any>({});

  // Check if onboarding is complete on component mount
  useEffect(() => {
    // Check for reset parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'onboarding') {
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('userId');
      localStorage.removeItem('onboardingSummary');
      localStorage.removeItem('currentWorkout');
      setIsOnboardingComplete(false);
      // Remove the parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
      console.log('🔄 Onboarding reset via URL parameter');
      return;
    }
    
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (onboardingComplete === 'true') {
      setIsOnboardingComplete(true);
      
      // Load saved workout if it exists
      const savedWorkout = localStorage.getItem('currentWorkout');
      console.log('🔍 [PAGE LOAD] Checking for saved workout...');
      console.log('🔍 [PAGE LOAD] onboardingComplete:', onboardingComplete);
      console.log('🔍 [PAGE LOAD] savedWorkout exists:', !!savedWorkout);
      
      if (savedWorkout) {
        try {
          const parsedWorkout = JSON.parse(savedWorkout);
          console.log('📂 [PAGE LOAD] Loading saved workout from localStorage');
          console.log('📂 [PAGE LOAD] Sections:', parsedWorkout.sections?.length);
          console.log('📂 [PAGE LOAD] AI Tips:', parsedWorkout.ai_coach_tips?.length);
          console.log('📂 [PAGE LOAD] Full workout:', parsedWorkout);
          setWorkout(parsedWorkout);
          const newKey = Date.now();
          setWorkoutKey(newKey);
          console.log('📂 [PAGE LOAD] Workout loaded with key:', newKey);
        } catch (e) {
          console.error('❌ [PAGE LOAD] Failed to parse saved workout:', e);
        }
      } else {
        console.log('📂 [PAGE LOAD] No saved workout found in localStorage');
      }
    }
    
    // Add a way to reset onboarding for testing (press 'r' key)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey) {
        localStorage.removeItem('onboardingComplete');
        localStorage.removeItem('userId');
        localStorage.removeItem('onboardingSummary');
        setIsOnboardingComplete(false);
        console.log('🔄 Onboarding reset for testing');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Monitor workout state changes
  useEffect(() => {
    if (workout.sections.length > 0) {
      const workoutSummary = `${workout.sections.length} sections: ${workout.sections.map(s => s.name).join(', ')}`;
      console.log('🔄 Workout state changed:', workoutSummary);
      setLastWorkoutUpdate(workoutSummary);
    }
  }, [workout]);

  const handleUpdateWorkout = (updatedWorkout: TodayWorkoutType) => {
    console.log('🎯 handleUpdateWorkout CALLED in main page');
    console.log('📦 Received workout:', updatedWorkout);
    console.log('📊 Workout sections:', updatedWorkout.sections?.length);
    console.log('💡 AI Tips:', updatedWorkout.ai_coach_tips);
    
    // Store in window for debugging
    (window as any).__mainPageWorkout = updatedWorkout;
    (window as any).__workoutUpdateTime = new Date().toISOString();
    
    // Save to localStorage so it persists after page refresh
    try {
      localStorage.setItem('currentWorkout', JSON.stringify(updatedWorkout));
      console.log('💾 Workout saved to localStorage');
    } catch (e) {
      console.error('Failed to save workout to localStorage:', e);
    }
    
    setWorkout(updatedWorkout);
    const newKey = Date.now();
    setWorkoutKey(newKey);
    console.log('🔑 New workout key:', newKey);
    
    // Also update exercise details if they exist
    if (updatedWorkout.sections) {
      const details: any = {};
      updatedWorkout.sections.forEach(section => {
        section.exercises?.forEach(ex => {
          details[ex.name] = `${section.name} - ${ex.sets?.length || 0} sets`;
        });
      });
      setExerciseDetails(details);
      console.log('📝 Updated exercise details');
    }
    
    // Show success notification
    setChangeNotification({
      isVisible: true,
      type: 'modify',
      description: 'Your workout has been updated based on your chat!'
    });
    console.log('🔔 Notification shown');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setChangeNotification(prev => ({ ...prev, isVisible: false }));
      console.log('🔕 Notification hidden');
    }, 3000);
  };

  const handleWorkoutAction = async (action: WorkoutAction) => {
    console.log('🔄 Handling workout action:', action);
    
    if (action.type === 'confirm') {
      // Show confirmation dialog
      setConfirmationDialog({
        isVisible: true,
        title: 'Confirm Workout Changes',
        description: action.summary || 'Review the proposed changes to your workout plan.',
        changes: action.changes || [],
        pendingAction: action
      });
      return;
    }
    
    if (action.type === 'none') {
      // Just conversation, no changes needed
      return;
    }
    
    // Keep chat open for continuous conversation
    // setIsChatOpen(false);
    
    // Show processing overlay
    setIsProcessingChanges(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Apply the workout changes
    console.log('📝 Current workout before changes:', workout);
    const updatedWorkout = WorkoutActionHandler.executeAction(workout, action);
    console.log('📝 Updated workout after changes:', updatedWorkout);
    setWorkout(updatedWorkout);
    
    // Force a re-render by updating the state
    setTimeout(() => {
      console.log('🔄 Forcing re-render...');
      setWorkout(prev => ({ ...prev }));
    }, 100);
    
    // Hide processing overlay
    setIsProcessingChanges(false);
    
    // Show change notification
    const changeDescription = getChangeDescription(action);
    setChangeNotification({
      isVisible: true,
      type: action.type,
      description: changeDescription
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setChangeNotification(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const handleConfirmChanges = async () => {
    const { pendingAction } = confirmationDialog;
    if (!pendingAction) {
      console.log('❌ No pending action found');
      return;
    }
    
    console.log('✅ Confirming changes:', pendingAction);
    
    // Close confirmation dialog
    setConfirmationDialog(prev => ({ ...prev, isVisible: false }));
    
    // Convert confirm action to actual action type
    const actualAction: WorkoutAction = {
      type: 'confirm', // Keep as confirm since we now handle modifications directly
      data: pendingAction.data
    };
    
    console.log('🔄 Converted to actual action:', actualAction);
    
    // Process the confirmed action
    await handleWorkoutAction(actualAction);
    
    // Add follow-up message to chat
    addFollowUpMessage(true, pendingAction);
  };

  const handleCancelChanges = () => {
    const { pendingAction } = confirmationDialog;
    setConfirmationDialog(prev => ({ ...prev, isVisible: false }));
    
    // Add follow-up message to chat
    if (pendingAction) {
      addFollowUpMessage(false, pendingAction);
    }
  };

  const addFollowUpMessage = (confirmed: boolean, action: WorkoutAction) => {
    const message = confirmed 
      ? "Great! I've applied those changes to your workout. Is there anything else you'd like to adjust?"
      : "No problem! I've cancelled those changes. What else would you like to work on?";
    
    setFollowUpMessage(message);
  };

  const getChangeDescription = (action: WorkoutAction): string => {
    switch (action.type) {
      case 'add':
        const exerciseName = action.data?.newExercise?.name || 'new exercise';
        return `Added "${exerciseName}" to your workout plan`;
      case 'delete':
        return `Removed exercise from your workout plan`;
      case 'modify':
        return `Updated exercise parameters (reps, sets, or weight)`;
      case 'swap':
        return `Replaced exercise with a better alternative`;
      default:
        return `Workout plan has been updated`;
    }
  };

  const closeChangeNotification = () => {
    setChangeNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Test Gemini API
  const testGeminiAPI = async () => {
    console.log('🧪 Testing Gemini API...');
    try {
      const isWorking = await geminiAI.testAPI();
      if (isWorking) {
        alert('✅ Gemini API is working!');
      } else {
        alert('❌ Gemini API test failed');
      }
    } catch (error) {
      console.error('❌ API Test Error:', error);
      alert('❌ Gemini API test error: ' + error);
    }
  };



  // Handle workout updates from chat
  const handleWorkoutUpdate = (newWorkoutData: any) => {
    console.log('🔄 Updating workout from chat:', newWorkoutData);
    
    // Transform the new workout data to the expected format
    const transformedWorkout = createManualWorkoutFromAPI(newWorkoutData);
    
    // Update exercise details and pre-calculated weights if available
    if (newWorkoutData.weight_suggestions) {
      setPreCalculatedWeights(newWorkoutData.weight_suggestions);
    }
    
    setWorkout(transformedWorkout);
    setWorkoutKey(prev => prev + 1); // Force re-render
  };

  const handleOnboardingSubmit = async (fitnessJourney: string) => {
    setIsGeneratingWorkout(true);
    setOnboardingError(null);
    
    try {
      console.log('🚀 Submitting onboarding data to API...');
      
      // Generate a unique user ID (in a real app, this would come from authentication)
      // Generate a UUID v4 format
      const userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      // Call the onboarding API endpoint
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          userId, 
          paragraph: fitnessJourney 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process onboarding data');
      }
      
      console.log('✅ Onboarding API response:', data);
      console.log('📝 AI-generated summary:', data.summary);
      
      // Store the user ID and summary for future use
      localStorage.setItem('userId', userId);
      localStorage.setItem('onboardingSummary', data.summary);
      
      // Parse the workout from the onboarding response directly
      console.log('🚀 Parsing workout from onboarding response...');
      
      let workoutData;
      try {
        // Try to parse the summary as JSON (it contains the workout)
        const summaryText = data.summary;
        console.log('🔍 Summary text:', summaryText);
        
        // Extract JSON from the summary (remove markdown code blocks if present)
        const jsonMatch = summaryText.match(/```json\s*([\s\S]*?)\s*```/) || summaryText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : summaryText;
        console.log('🔍 Extracted JSON string:', jsonString);
        
        const parsedWorkout = JSON.parse(jsonString);
        console.log('✅ Parsed workout from onboarding:', parsedWorkout);
        
        workoutData = {
          success: true,
          workout_plan: parsedWorkout
        };
      } catch (parseError) {
        console.error('❌ Failed to parse onboarding response, falling back to workout API:', parseError);
        
        // Fallback to workout API if parsing fails
        console.log('🚀 Fallback: Generating workout plan from AI summary...');
        
        const workoutResponse = await fetch('/api/workout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            user_id: userId,
            context: data.summary
          })
        });

        workoutData = await workoutResponse.json();
        
        if (!workoutResponse.ok) {
          throw new Error(workoutData.error || 'Failed to generate workout plan');
        }
      }
      
      console.log('✅ Final workout data to use:', workoutData);
      console.log('🔍 Full API response structure:', JSON.stringify(workoutData, null, 2));
      
      // Extract exercise details for weight suggestions
      const exerciseDetails: { [exerciseName: string]: string } = {};
      if (workoutData.workout_plan?.today) {
        workoutData.workout_plan.today.forEach((section: any) => {
          if (section.exercises) {
            section.exercises.forEach((exercise: any) => {
              // Store the full exercise string as details for weight suggestions
              exerciseDetails[exercise] = exercise;
            });
          }
        });
      }
      console.log('🔍 Extracted exercise details:', exerciseDetails);
      setExerciseDetails(exerciseDetails); // Store exercise details for weight suggestions
      
      // Extract pre-calculated weight suggestions if available
      if (workoutData.workout_plan?.weight_suggestions) {
        console.log('🏋️ Found pre-calculated weight suggestions:', workoutData.workout_plan.weight_suggestions);
        setPreCalculatedWeights(workoutData.workout_plan.weight_suggestions);
      } else {
        console.log('⚠️ No pre-calculated weight suggestions found in API response');
        setPreCalculatedWeights({});
      }
      
      // Transform the API response to match the expected workout format
      console.log('🔄 Transforming workout data:', workoutData.workout_plan);
      console.log('🔍 API Response structure check:', {
        hasWorkoutPlan: !!workoutData.workout_plan,
        hasToday: !!workoutData.workout_plan?.today,
        todayLength: workoutData.workout_plan?.today?.length,
        firstSection: workoutData.workout_plan?.today?.[0],
        workoutPlanType: typeof workoutData.workout_plan,
        workoutPlanKeys: workoutData.workout_plan ? Object.keys(workoutData.workout_plan) : 'N/A'
      });
      
      // Always use manual creation for now to ensure it works
      console.log('🔧 Using manual workout creation...');
      console.log('🔍 Current workout state BEFORE update:', workout);
      const manualWorkout = createManualWorkoutFromAPI(workoutData.workout_plan);
      console.log('✅ Manual workout created:', manualWorkout);
      console.log('🔍 Setting workout state...');
      setWorkout(manualWorkout);
      setWorkoutKey(prev => prev + 1); // Force re-render
      console.log('✅ Workout state set - the useEffect will log the state change');
      setIsOnboardingComplete(true);
      localStorage.setItem('onboardingComplete', 'true');
      
      console.log('✅ Workout plan generated successfully');
    } catch (error) {
      console.error('❌ Error processing onboarding:', error);
      
      // Set error message for user feedback
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setOnboardingError(errorMessage);
      
      // Fallback: try to generate workout directly from the original text
      try {
        console.log('🔄 Fallback: Generating workout from original text...');
        const generatedWorkout = await geminiAI.generateWorkoutPlan(fitnessJourney);
        setWorkout(generatedWorkout);
        console.log('✅ Fallback workout generation successful');
        
        // Clear error if fallback succeeds
        setOnboardingError(null);
        setIsOnboardingComplete(true);
        localStorage.setItem('onboardingComplete', 'true');
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        // Keep the default workout if both attempts fail
        setOnboardingError('Failed to generate workout plan. Please try again.');
      }
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  // Utility function to get current user ID
  const getCurrentUserId = (): string | null => {
    return localStorage.getItem('userId');
  };

  // Transform API workout response to the expected format
  const transformAPIWorkoutToFormat = (apiWorkout: any): TodayWorkoutType => {
    console.log('🔄 Starting transformation with:', apiWorkout);
    
    if (!apiWorkout || !apiWorkout.today) {
      console.error('❌ Invalid API workout format:', apiWorkout);
      throw new Error('Invalid workout data format');
    }
    
    const sections = apiWorkout.today.map((section: any, index: number) => {
      console.log(`📝 Processing section ${index}:`, section);
      
      return {
        id: `section-${index}`,
        name: section.section,
        icon: getSectionIcon(section.section),
        isExpanded: false,
        exercises: section.exercises.map((exercise: any, exerciseIndex: number) => {
          console.log(`💪 Processing exercise ${exerciseIndex}:`, exercise);
          
          return {
            id: `exercise-${index}-${exerciseIndex}`,
            name: exercise,
            category: getExerciseCategory(exercise),
            muscleGroups: getMuscleGroups(exercise),
            isFavorite: false,
            notes: '',
            sets: createDefaultSets()
          };
        })
      };
    });

    const result = {
      date: new Date().toISOString().split('T')[0],
      sections: sections
    };
    
    console.log('✅ Transformation complete:', result);
    return result;
  };

  // Helper functions for transformation
  const getSectionIcon = (sectionName: string): string => {
    switch (sectionName.toLowerCase()) {
      case 'warmup': return '🔥';
      case 'main workout': return '💪';
      case 'cardio': return '❤️';
      case 'cooldown': return '🧘';
      default: return '🏋️';
    }
  };

  const getExerciseCategory = (exerciseName: string): string => {
    const name = exerciseName.toLowerCase();
    if (name.includes('push') || name.includes('press') || name.includes('bench')) return 'push';
    if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'pull';
    if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return 'legs';
    if (name.includes('plank') || name.includes('crunch') || name.includes('core')) return 'core';
    if (name.includes('jump') || name.includes('run') || name.includes('cardio')) return 'cardio';
    return 'strength';
  };

  const getMuscleGroups = (exerciseName: string): string[] => {
    const name = exerciseName.toLowerCase();
    const groups: string[] = [];
    if (name.includes('chest') || name.includes('bench') || name.includes('push')) groups.push('chest');
    if (name.includes('back') || name.includes('pull') || name.includes('row')) groups.push('back');
    if (name.includes('shoulder') || name.includes('press')) groups.push('shoulders');
    if (name.includes('bicep') || name.includes('curl')) groups.push('biceps');
    if (name.includes('tricep') || name.includes('dip')) groups.push('triceps');
    if (name.includes('leg') || name.includes('squat') || name.includes('lunge')) groups.push('legs');
    if (name.includes('core') || name.includes('abs') || name.includes('plank')) groups.push('core');
    return groups.length > 0 ? groups : ['full-body'];
  };

  const createDefaultSets = () => [
    { id: 'set-1', reps: 10, weight: 0, completed: false, type: 'warmup' as const },
    { id: 'set-2', reps: 10, weight: 0, completed: false, type: 'working' as const },
    { id: 'set-3', reps: 10, weight: 0, completed: false, type: 'working' as const }
  ];

  // Manual workout creation as fallback
  const createManualWorkoutFromAPI = (apiWorkout: any): TodayWorkoutType => {
    console.log('🔧 Creating manual workout from:', apiWorkout);
    console.log('🔍 API Workout type:', typeof apiWorkout);
    console.log('🔍 API Workout keys:', Object.keys(apiWorkout || {}));
    
    if (!apiWorkout || !apiWorkout.today) {
      console.error('❌ Invalid API workout for manual creation:', {
        apiWorkout,
        hasToday: !!apiWorkout?.today,
        todayType: typeof apiWorkout?.today
      });
      console.log('🔄 Returning default workout instead');
      return todaysWorkout; // Return default if API data is invalid
    }

    console.log('✅ API workout is valid, processing sections...');
    console.log('📊 Number of sections:', apiWorkout.today.length);

    const sections = apiWorkout.today.map((section: any, index: number) => {
      console.log(`📝 Processing section ${index}:`, section);
      console.log(`📝 Section name: "${section.section}"`);
      console.log(`📝 Number of exercises: ${section.exercises?.length || 0}`);
      
      const exercises = section.exercises.map((exercise: any, exerciseIndex: number) => {
        console.log(`💪 Exercise ${exerciseIndex}: "${exercise}"`);
        return {
          id: `exercise-${index}-${exerciseIndex}`,
          name: exercise,
          category: getExerciseCategory(exercise),
          muscleGroups: getMuscleGroups(exercise),
          isFavorite: false,
          notes: '',
          sets: createDefaultSets()
        };
      });

      const sectionResult = {
        id: `section-${index}`,
        name: section.section,
        icon: getSectionIcon(section.section),
        isExpanded: false,
        exercises: exercises
      };
      
      console.log(`✅ Section ${index} created:`, sectionResult);
      return sectionResult;
    });

    const result = {
      date: new Date().toISOString().split('T')[0],
      sections: sections,
      ai_coach_tips: apiWorkout.ai_coach_tips || []
    };
    
    console.log('🎉 Final workout created:', result);
    console.log('🧠 AI Coach Tips included:', result.ai_coach_tips);
    return result;
  };

  // Show onboarding form if not completed
  if (!isOnboardingComplete) {
    return (
      <OnboardingForm 
        onSubmit={handleOnboardingSubmit}
        isLoading={isGeneratingWorkout}
        error={onboardingError}
      />
    );
  }

  return (
    <main className="min-h-screen">
      {/* Original Workout Component with AI Reasoning */}
      <TodayWorkout 
        key={`workout-${workoutKey}-${workout.date}`}
        workout={workout} 
        onUpdateWorkout={handleUpdateWorkout}
        userContext={typeof window !== 'undefined' ? localStorage.getItem('onboardingSummary') || undefined : undefined}
        exerciseDetails={exerciseDetails}
        preCalculatedWeights={preCalculatedWeights}
      />
      
      {/* Reset Onboarding Button - Top Left */}
      <button
        onClick={() => {
          localStorage.removeItem('onboardingComplete');
          localStorage.removeItem('userId');
          localStorage.removeItem('onboardingSummary');
          localStorage.removeItem('currentWorkout');
          setIsOnboardingComplete(false);
          console.log('🔄 Onboarding reset');
        }}
        className="fixed top-4 left-4 bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-lg z-40 text-sm shadow-lg"
        title="Reset onboarding and start fresh"
      >
        Reset
      </button>

      {/* Processing Overlay */}
      <ProcessingOverlay 
        isVisible={isProcessingChanges}
        message="AI is making changes based on your inputs..."
      />

      {/* Change Notification */}
      <ChangeNotification
        isVisible={changeNotification.isVisible}
        changeType={changeNotification.type}
        changeDescription={changeNotification.description}
        onClose={closeChangeNotification}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isVisible={confirmationDialog.isVisible}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        changes={confirmationDialog.changes}
        onConfirm={handleConfirmChanges}
        onCancel={handleCancelChanges}
        isLoading={isProcessingChanges}
      />
    </main>
  );
}
