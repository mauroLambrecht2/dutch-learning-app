/**
 * FluencyLevelManager Component Demo
 * 
 * Visual demonstration of the FluencyLevelManager component in various states.
 * Run with: npm run dev and navigate to this component in Storybook or a demo page.
 */

import { useState } from 'react';
import { FluencyLevelManager } from '../FluencyLevelManager';
import { FluencyLevelCode } from '../../types/fluency';

export function FluencyLevelManagerDemo() {
  const [currentLevel, setCurrentLevel] = useState<FluencyLevelCode>('B1');
  const mockAccessToken = 'demo-token';
  const mockUserId = 'demo-user-123';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FluencyLevelManager Component Demo
          </h1>
          <p className="text-gray-600">
            Admin-only component for managing user fluency levels with confirmation dialogs.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Controls</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulate Current Level:
              </label>
              <div className="flex gap-2">
                {(['A1', 'A2', 'B1', 'B2', 'C1'] as FluencyLevelCode[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentLevel(level)}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${currentLevel === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher View */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Teacher View (Visible)</h2>
          <div className="max-w-md">
            <FluencyLevelManager
              userId={mockUserId}
              currentLevel={currentLevel}
              accessToken={mockAccessToken}
              userRole="teacher"
              onLevelChange={(newLevel) => {
                console.log('Level changed to:', newLevel);
                setCurrentLevel(newLevel);
              }}
            />
          </div>
        </div>

        {/* Student View */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Student View (Hidden)</h2>
          <div className="max-w-md bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <FluencyLevelManager
              userId={mockUserId}
              currentLevel={currentLevel}
              accessToken={mockAccessToken}
              userRole="student"
            />
            <p className="text-sm text-gray-500 italic">
              Component is hidden for students (role-based visibility)
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Component Features</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Role-based visibility:</strong> Only visible to teachers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Upgrade/Downgrade controls:</strong> Buttons for level transitions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Confirmation dialog:</strong> Prevents accidental changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Level boundaries:</strong> Cannot downgrade below A1 or upgrade beyond C1</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Visual progression:</strong> Shows current position in level sequence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Certificate notice:</strong> Informs about automatic certificate generation on upgrades</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Toast notifications:</strong> Success/error feedback using sonner</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Loading states:</strong> Disables controls during API calls</span>
            </li>
          </ul>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Usage Example</h2>
          <pre className="bg-gray-50 rounded-md p-4 overflow-x-auto text-sm">
            <code>{`import { FluencyLevelManager } from './components/FluencyLevelManager';

function StudentProfile({ student, accessToken, currentUser }) {
  const handleLevelChange = (newLevel) => {
    // Refresh student data after level change
    refetchStudentData();
  };

  return (
    <div>
      {/* Other profile content */}
      
      <FluencyLevelManager
        userId={student.id}
        currentLevel={student.fluencyLevel}
        accessToken={accessToken}
        userRole={currentUser.role}
        onLevelChange={handleLevelChange}
      />
    </div>
  );
}`}</code>
          </pre>
        </div>

        {/* Test Scenarios */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Test Scenarios</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="p-3 bg-gray-50 rounded-md">
              <strong>Scenario 1: Upgrade from A1</strong>
              <p className="text-gray-600 mt-1">
                Set level to A1, click upgrade button, confirm dialog, verify certificate notice appears
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <strong>Scenario 2: At Maximum Level (C1)</strong>
              <p className="text-gray-600 mt-1">
                Set level to C1, verify upgrade button is disabled
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <strong>Scenario 3: At Minimum Level (A1)</strong>
              <p className="text-gray-600 mt-1">
                Set level to A1, verify downgrade button is disabled
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <strong>Scenario 4: Cancel Confirmation</strong>
              <p className="text-gray-600 mt-1">
                Click upgrade/downgrade, then cancel in dialog, verify level unchanged
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FluencyLevelManagerDemo;
