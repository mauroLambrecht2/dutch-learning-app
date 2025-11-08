import { useState } from 'react';
import { FluencyHistory } from '../FluencyHistory';
import type { FluencyHistoryEntry } from '../../types/fluency';

/**
 * Demo component for FluencyHistory
 * 
 * This demo shows various states and scenarios for the FluencyHistory component.
 * It uses mock data instead of real API calls for demonstration purposes.
 */

// Mock API for demo purposes
const mockApi = {
  async getFluencyHistory(scenario: string) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    switch (scenario) {
      case 'empty':
        return { history: [] };
      
      case 'single':
        return {
          history: [
            {
              userId: 'demo-user',
              previousLevel: null,
              newLevel: 'A1' as const,
              changedAt: '2025-01-01T09:00:00Z',
              changedBy: 'System'
            }
          ]
        };
      
      case 'multiple':
        return {
          history: [
            {
              userId: 'demo-user',
              previousLevel: 'B1' as const,
              newLevel: 'B2' as const,
              changedAt: '2025-03-15T14:30:00Z',
              changedBy: 'Teacher Johnson',
              reason: 'Excellent performance in B2 assessment'
            },
            {
              userId: 'demo-user',
              previousLevel: 'A2' as const,
              newLevel: 'B1' as const,
              changedAt: '2025-02-10T11:15:00Z',
              changedBy: 'Teacher Smith'
            },
            {
              userId: 'demo-user',
              previousLevel: 'A1' as const,
              newLevel: 'A2' as const,
              changedAt: '2025-01-20T10:00:00Z',
              changedBy: 'Teacher Smith'
            },
            {
              userId: 'demo-user',
              previousLevel: null,
              newLevel: 'A1' as const,
              changedAt: '2025-01-01T09:00:00Z',
              changedBy: 'System'
            }
          ]
        };
      
      case 'downgrade':
        return {
          history: [
            {
              userId: 'demo-user',
              previousLevel: 'B1' as const,
              newLevel: 'A2' as const,
              changedAt: '2025-02-15T13:00:00Z',
              changedBy: 'Teacher Johnson',
              reason: 'Needs more practice with A2 material'
            },
            {
              userId: 'demo-user',
              previousLevel: 'A2' as const,
              newLevel: 'B1' as const,
              changedAt: '2025-02-01T10:00:00Z',
              changedBy: 'Teacher Smith'
            },
            {
              userId: 'demo-user',
              previousLevel: null,
              newLevel: 'A2' as const,
              changedAt: '2025-01-15T09:00:00Z',
              changedBy: 'System'
            }
          ]
        };
      
      case 'error':
        throw new Error('Failed to fetch fluency history');
      
      default:
        return { history: [] };
    }
  }
};

// Mock FluencyHistory component that uses our mock API
function MockFluencyHistory({ scenario }: { scenario: string }) {
  const [history, setHistory] = useState<FluencyHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mockApi.getFluencyHistory(scenario);
        setHistory(data.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200 font-semibold text-sm">
          Failed to load history
        </p>
        <p className="text-red-600 dark:text-red-300 text-xs">{error}</p>
      </div>
    );
  }

  // Use the real component with mock data
  return <FluencyHistory userId="demo-user" accessToken="demo-token" />;
}

export function FluencyHistoryDemo() {
  const [scenario, setScenario] = useState('multiple');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            FluencyHistory Component Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive demonstration of the FluencyHistory component in various states
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Select Scenario
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setScenario('empty')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'empty'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Empty (No History)
            </button>
            <button
              onClick={() => setScenario('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Single Entry
            </button>
            <button
              onClick={() => setScenario('multiple')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'multiple'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Multiple Upgrades
            </button>
            <button
              onClick={() => setScenario('downgrade')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'downgrade'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              With Downgrade
            </button>
            <button
              onClick={() => setScenario('error')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'error'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Error State
            </button>
          </div>
        </div>

        {/* Component Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Component Preview
          </h2>
          <MockFluencyHistory key={scenario} scenario={scenario} />
        </div>

        {/* Scenario Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Current Scenario: {scenario}
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            {scenario === 'empty' && 'Shows initial A1 assignment when user has no level changes.'}
            {scenario === 'single' && 'Displays a single history entry for initial level assignment.'}
            {scenario === 'multiple' && 'Shows multiple level upgrades with dates, admins, and reasons.'}
            {scenario === 'downgrade' && 'Demonstrates level adjustment (downgrade) with orange indicators.'}
            {scenario === 'error' && 'Shows error state when API request fails.'}
          </p>
        </div>

        {/* Features List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Component Features
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Collapsible timeline interface</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Reverse chronological ordering (most recent first)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Visual indicators (green for upgrades, orange for adjustments)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Displays date, time, and admin information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Shows optional reason/notes for changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Loading and error state handling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Dark mode support</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FluencyHistoryDemo;
