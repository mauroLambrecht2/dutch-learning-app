/**
 * Demo file for ProgressTracker with Fluency History Integration
 * 
 * This file demonstrates the integration of the FluencyHistory component
 * into the ProgressTracker (profile page).
 * 
 * To run this demo:
 * 1. Start the development server: npm run dev
 * 2. Navigate to the Progress tab in the student dashboard
 * 3. Scroll down to see the Fluency Level History section below the certificate gallery
 * 
 * Expected behavior:
 * - Fluency Level History section appears below the Earned Certificates section
 * - The history component is collapsible with a header showing "Fluency Level History"
 * - Clicking the header expands/collapses the timeline
 * - The timeline shows level changes in reverse chronological order
 * - Each entry displays the date, previous/new level, and admin who made the change
 */

import { ProgressTracker } from '../ProgressTracker';

export function ProgressTrackerFluencyHistoryDemo() {
  // Mock access token for demo purposes
  const mockAccessToken = 'demo-token';

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-zinc-900">
          ProgressTracker with Fluency History Integration Demo
        </h1>
        
        <div className="bg-white border border-zinc-200 p-6 mb-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-zinc-900">Integration Details</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
            <li>FluencyHistory component is positioned below the certificate gallery</li>
            <li>The component is collapsible with expand/collapse functionality</li>
            <li>Section heading reads "Fluency Level History"</li>
            <li>Timeline displays level changes in reverse chronological order</li>
            <li>Each entry shows date, previous/new level badges, and admin information</li>
          </ul>
        </div>

        <div className="border-4 border-blue-500 rounded-lg p-2">
          <div className="text-xs text-blue-600 font-semibold mb-2 text-center">
            ↓ ProgressTracker Component with Fluency History ↓
          </div>
          <ProgressTracker accessToken={mockAccessToken} />
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">Note:</h3>
          <p className="text-xs text-yellow-800">
            This demo requires a valid access token and user ID to fetch real data.
            In a real application, the FluencyHistory component will display the user's
            level change history with proper authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProgressTrackerFluencyHistoryDemo;
