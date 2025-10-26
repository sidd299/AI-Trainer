'use client';

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [onboardingSummary, setOnboardingSummary] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    // Check localStorage for user data
    const storedUserId = localStorage.getItem('userId');
    const storedSummary = localStorage.getItem('onboardingSummary');
    
    setUserId(storedUserId);
    setOnboardingSummary(storedSummary);
  }, []);

  const testWorkoutAPI = async () => {
    if (!userId) {
      setTestResult({ error: 'No user ID found' });
      return;
    }

    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          context: "Intermediate user, 1 year experience, last workout: chest & triceps yesterday, prefers strength training, has access to full gym equipment, goal: muscle building."
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: 'Network error: ' + error });
    }
  };

  const createTestUser = () => {
    const testUserId = 'debug-user-' + Date.now();
    localStorage.setItem('userId', testUserId);
    localStorage.setItem('onboardingSummary', 'Test user for debugging');
    setUserId(testUserId);
    setOnboardingSummary('Test user for debugging');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Debug Page</h1>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2">
              <p><strong>User ID:</strong> {userId || 'Not found'}</p>
              <p><strong>Onboarding Summary:</strong> {onboardingSummary ? 'Found' : 'Not found'}</p>
            </div>
            {!userId && (
              <button
                onClick={createTestUser}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Create Test User
              </button>
            )}
          </div>

          {/* API Test */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">API Test</h2>
            <button
              onClick={testWorkoutAPI}
              disabled={!userId}
              className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            >
              Test Workout API
            </button>
          </div>

          {/* Results */}
          {testResult && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center">
            <a 
              href="/"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back to Main App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
