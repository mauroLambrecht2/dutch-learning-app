/**
 * ProgressTracker Fluency Display Demo
 * 
 * Visual demonstration of fluency level display in ProgressTracker.
 * Run this file to see the fluency level integration.
 */

import { useState } from 'react';
import { ProgressTracker } from '../ProgressTracker';

// Mock API for demo purposes
const mockApi = {
  getProfile: async () => ({
    id: 'demo-user-123',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'student' as const
  }),
  
  getProgress: async () => ({
    completedLessons: Array(15).fill({ id: 'lesson' }),
    vocabulary: Array(75).fill({ word: 'word' }),
    streak: 7,
    testsCompleted: 5,
    averageScore: 85,
    perfectScores: 2,
    activityLog: [
      { date: new Date().toISOString(), count: 3 },
      { date: new Date(Date.now() - 86400000).toISOString(), count: 2 },
      { date: new Date(Date.now() - 172800000).toISOString(), count: 4 }
    ]
  }),
  
  getFluencyLevel: async () => ({
    level: 'B1'
  })
};

// Replace the real API with mock for demo
(window as any).mockApi = mockApi;

export function ProgressTrackerFluencyDemo() {
  const [selectedLevel, setSelectedLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('B1');
  const mockAccessToken = 'demo-token';

  // Override the API for this demo
  const originalApi = (window as any).api;
  (window as any).api = {
    ...mockApi,
    getFluencyLevel: async () => ({ level: selectedLevel })
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-zinc-200 p-6">
          <h1 className="text-2xl text-zinc-900 mb-4" style={{ fontWeight: 700 }}>
            ProgressTracker Fluency Display Demo
          </h1>
          <p className="text-zinc-600 mb-4">
            This demo shows how fluency levels are displayed in the ProgressTracker component.
            The fluency level is shown alongside XP level with clear distinction.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm text-zinc-700" style={{ fontWeight: 600 }}>
              Select Fluency Level:
            </label>
            <div className="flex gap-2">
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 border-2 transition-all ${
                    selectedLevel === level
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-6">
          <h2 className="text-lg text-zinc-900 mb-4" style={{ fontWeight: 600 }}>
            Key Features Demonstrated:
          </h2>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Fluency level displayed in stats overview grid (5th column)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Clear distinction between XP Level (activity-based) and Fluency Level (proficiency-based)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Explanatory section clarifying the difference between the two levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Detailed fluency level display with badge, icon, and description</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Visual consistency with other stat cards using gradient backgrounds</span>
            </li>
          </ul>
        </div>

        <ProgressTracker accessToken={mockAccessToken} />
      </div>
    </div>
  );
}

// Restore original API when component unmounts
if (typeof window !== 'undefined') {
  const cleanup = () => {
    const originalApi = (window as any).originalApi;
    if (originalApi) {
      (window as any).api = originalApi;
    }
  };
  
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('beforeunload', cleanup);
  }
}

export default ProgressTrackerFluencyDemo;
