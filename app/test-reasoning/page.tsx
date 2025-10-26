'use client';

import React, { useState } from 'react';
import AICoachTips from '../../components/AICoachTips';

export default function TestReasoningPage() {
  const [testContext, setTestContext] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testWorkoutGeneration = async () => {
    if (!testContext.trim()) {
      setError('Please enter a test context');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test-reasoning-' + Date.now(),
          context: testContext
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkoutPlan(data.workout_plan);
      } else {
        setError(data.error || 'Failed to generate workout');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error generating workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleContexts = [
    "Beginner user, first time in gym, no previous experience, wants to build confidence, prefers bodyweight exercises, goal: general fitness.",
    "Intermediate user, 1 year experience, last workout: chest & triceps yesterday, prefers strength training, has access to full gym equipment, goal: muscle building.",
    "Advanced user, 3 years experience, last workout: heavy leg day yesterday, feeling sore, wants light recovery workout, goal: maintain fitness.",
    "Beginner user, 2 weeks experience, last workout: full body 2 days ago, prefers machine exercises, goal: weight loss."
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Test AI Workout Reasoning
          </h1>
          <p className="text-gray-600">
            Test different user contexts to see how the AI generates reasoning explanations.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Context</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Context (describe the user's situation):
            </label>
            <textarea
              value={testContext}
              onChange={(e) => setTestContext(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="e.g., Beginner user, first time in gym, no previous experience..."
            />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick test contexts:</p>
            <div className="space-y-2">
              {sampleContexts.map((context, index) => (
                <button
                  key={index}
                  onClick={() => setTestContext(context)}
                  className="block w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
                >
                  {context}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={testWorkoutGeneration}
            disabled={loading || !testContext.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Generating...' : 'Test Workout Generation'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {workoutPlan && (
          <div className="space-y-6">
            {/* AI Reasoning */}
            {workoutPlan.ai_coach_tips && (
              <div>
                <h2 className="text-xl font-semibold mb-4">AI Reasoning</h2>
                <AICoachTips 
                  tips={workoutPlan.ai_coach_tips}
                  autoRotate={true}
                  rotationInterval={3000}
                />
              </div>
            )}

            {/* Workout Plan */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Generated Workout</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(workoutPlan, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            ← Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
