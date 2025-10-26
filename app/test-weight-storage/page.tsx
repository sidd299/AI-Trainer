'use client';

import { useState, useEffect } from 'react';

export default function TestWeightStoragePage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeightSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId') || 'test-123';
      const response = await fetch(`/api/weight-suggestions?userId=${userId}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        setError(data.error || 'Failed to fetch suggestions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testWeightSuggestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId') || 'test-123';
      const response = await fetch('/api/suggest-weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          exercise_name: 'Dumbbell Bicep Curl',
          user_context: 'Age: 25, Weight: 70, Gender: Male, Experience duration: Less than 6 months',
          exercise_details: 'Dumbbell Bicep Curls (3 sets of 10-15 reps)'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Weight suggestion created:', data);
        // Refresh the list
        await fetchWeightSuggestions();
      } else {
        setError(data.error || 'Failed to create suggestion');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightSuggestions();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Weight Suggestions Storage Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={testWeightSuggestion}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Test Weight Suggestion'}
              </button>
              
              <button
                onClick={fetchWeightSuggestions}
                disabled={loading}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Suggestions'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Suggestions List */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Weight Suggestions ({suggestions.length})
            </h2>
            
            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No weight suggestions found. Create one to test!
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{suggestion.exercise_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        suggestion.is_restricted 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {suggestion.is_restricted ? 'Restricted' : 'Allowed'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Suggested Weight:</strong> {suggestion.suggested_weight}kg</p>
                      <p><strong>User:</strong> {suggestion.user_profile?.weight}kg, {suggestion.user_profile?.gender}, {suggestion.user_profile?.experience_level}</p>
                      <p><strong>Created:</strong> {new Date(suggestion.created_at).toLocaleString()}</p>
                    </div>
                    
                    {suggestion.sets && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Sets:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.sets.map((set: any, setIndex: number) => (
                            <span key={setIndex} className={`px-2 py-1 rounded text-xs ${
                              set.type === 'warmup' 
                                ? 'bg-orange-100 text-orange-600' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {set.reps}×{set.weight}kg ({set.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {suggestion.restriction_reason && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-700 text-xs">{suggestion.restriction_reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Structure Info */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Weight Suggestions Table Structure</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
{`weight_suggestions:
├── id (UUID, Primary Key)
├── user_id (TEXT)
├── exercise_name (TEXT)
├── exercise_details (TEXT) - Original from first API
├── user_context (TEXT) - User onboarding data
├── suggested_weight (DECIMAL) - Base suggested weight
├── sets (JSONB) - Array of sets with weights/reps/types
├── is_restricted (BOOLEAN)
├── restriction_reason (TEXT)
├── user_profile (JSONB) - Weight, gender, experience
├── calculation_details (JSONB) - Multipliers, max allowed
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
