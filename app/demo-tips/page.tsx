'use client';

import React from 'react';
import AICoachTips from '../../components/AICoachTips';

export default function DemoTipsPage() {
  const sampleTips = [
    "Avoiding chest after yesterday's workout",
    "Back & shoulders for balanced training",
    "Pull-ups for compound upper body",
    "Biceps isolation for arm development",
    "Moderate volume prevents overtraining risk",
    "Beginner-safe exercises only",
    "Recovery day for legs",
    "Compound movements for efficiency"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Workout Reasoning Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Watch the workout reasoning explanations rotate automatically every 3 seconds, or click the navigation buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Auto-rotating tips */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Auto-Rotating Tips
            </h2>
            <AICoachTips 
              tips={sampleTips}
              autoRotate={true}
              rotationInterval={3000}
            />
          </div>

          {/* Manual control tips */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Manual Control Tips
            </h2>
            <AICoachTips 
              tips={sampleTips}
              autoRotate={false}
            />
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            How It Works
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong>🧠 AI Workout Reasoning:</strong> The AI generates 4-5 explanations of WHY this specific workout was chosen.
            </p>
            <p>
              <strong>🔄 Auto-Rotation:</strong> Reasoning explanations automatically rotate every 3 seconds to educate users.
            </p>
            <p>
              <strong>👆 Manual Control:</strong> Users can click the dots or navigation buttons to control the explanations.
            </p>
            <p>
              <strong>📱 Responsive:</strong> The component works perfectly on all device sizes.
            </p>
            <p>
              <strong>🎨 Beautiful Design:</strong> Gradient background with smooth animations and transitions.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ← Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
