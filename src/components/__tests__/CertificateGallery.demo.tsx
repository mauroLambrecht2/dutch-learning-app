import { useState } from 'react';
import { CertificateGallery } from '../CertificateGallery';
import type { Certificate } from '../../types/fluency';

/**
 * Demo component for CertificateGallery
 * 
 * This demo shows the CertificateGallery component in various states:
 * - Loading state
 * - Empty state (no certificates)
 * - Gallery with multiple certificates
 * - Error state
 */

// Mock API responses
const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    userId: 'demo-user',
    userName: 'Demo Student',
    level: 'A1',
    issuedAt: '2025-01-15T10:00:00Z',
    issuedBy: 'teacher-1',
    certificateNumber: 'DLA-2025-A1-000001'
  },
  {
    id: 'cert-2',
    userId: 'demo-user',
    userName: 'Demo Student',
    level: 'A2',
    issuedAt: '2025-03-20T14:30:00Z',
    issuedBy: 'teacher-1',
    certificateNumber: 'DLA-2025-A2-000002'
  },
  {
    id: 'cert-3',
    userId: 'demo-user',
    userName: 'Demo Student',
    level: 'B1',
    issuedAt: '2025-06-10T09:15:00Z',
    issuedBy: 'teacher-2',
    certificateNumber: 'DLA-2025-B1-000003'
  },
  {
    id: 'cert-4',
    userId: 'demo-user',
    userName: 'Demo Student',
    level: 'B2',
    issuedAt: '2025-09-05T16:45:00Z',
    issuedBy: 'teacher-2',
    certificateNumber: 'DLA-2025-B2-000004'
  }
];

// Mock the API
const createMockApi = (scenario: 'loading' | 'empty' | 'success' | 'error') => {
  return {
    getCertificates: async () => {
      if (scenario === 'loading') {
        await new Promise(() => {}); // Never resolves
      }
      if (scenario === 'error') {
        throw new Error('Failed to fetch certificates from server');
      }
      if (scenario === 'empty') {
        return { certificates: [] };
      }
      // Success case
      await new Promise(resolve => setTimeout(resolve, 500));
      return { certificates: mockCertificates };
    }
  };
};

export function CertificateGalleryDemo() {
  const [scenario, setScenario] = useState<'loading' | 'empty' | 'success' | 'error'>('success');
  const [key, setKey] = useState(0);

  const handleScenarioChange = (newScenario: typeof scenario) => {
    setScenario(newScenario);
    setKey(prev => prev + 1); // Force remount
  };

  // Mock the api module for demo
  if (typeof window !== 'undefined') {
    (window as any).__mockApi = createMockApi(scenario);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          CertificateGallery Component Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Interactive demonstration of the certificate gallery component
        </p>

        {/* Scenario selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Scenario
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleScenarioChange('success')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'success'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Success (4 Certificates)
            </button>
            <button
              onClick={() => handleScenarioChange('empty')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'empty'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Empty State
            </button>
            <button
              onClick={() => handleScenarioChange('loading')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'loading'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Loading State
            </button>
            <button
              onClick={() => handleScenarioChange('error')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario === 'error'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Error State
            </button>
          </div>
        </div>

        {/* Component display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Certificate Gallery
          </h2>
          <CertificateGallery
            key={key}
            userId="demo-user"
            accessToken="demo-token"
          />
        </div>

        {/* Usage notes */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Usage Notes
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>• Click on certificate thumbnails to view full certificate details</li>
            <li>• The gallery displays certificates in a responsive grid layout</li>
            <li>• Empty state shows an encouraging message for users without certificates</li>
            <li>• Loading state displays a spinner while fetching data</li>
            <li>• Error state shows user-friendly error messages</li>
            <li>• Modal can be closed by clicking the X button or clicking outside</li>
          </ul>
        </div>

        {/* Props documentation */}
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Component Props
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                userId: string
              </code>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                The user ID to fetch certificates for
              </p>
            </div>
            <div>
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                accessToken: string
              </code>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Authentication token for API requests
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificateGalleryDemo;
