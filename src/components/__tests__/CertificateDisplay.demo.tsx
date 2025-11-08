import { useState } from 'react';
import { CertificateDisplay } from '../CertificateDisplay';
import type { Certificate, FluencyLevelCode } from '../../types/fluency';

/**
 * Demo component for CertificateDisplay
 * 
 * This component demonstrates the CertificateDisplay in both modes
 * with different fluency levels.
 */
export function CertificateDisplayDemo() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const mockCertificates: Certificate[] = [
    {
      id: 'cert-1',
      userId: 'user-1',
      userName: 'Alice Johnson',
      level: 'A1' as FluencyLevelCode,
      issuedAt: '2024-03-15T10:00:00Z',
      issuedBy: 'admin-1',
      certificateNumber: 'DLA-2024-A1-000123'
    },
    {
      id: 'cert-2',
      userId: 'user-1',
      userName: 'Alice Johnson',
      level: 'A2' as FluencyLevelCode,
      issuedAt: '2024-08-20T14:30:00Z',
      issuedBy: 'admin-1',
      certificateNumber: 'DLA-2024-A2-000456'
    },
    {
      id: 'cert-3',
      userId: 'user-2',
      userName: 'Bob Smith',
      level: 'B1' as FluencyLevelCode,
      issuedAt: '2025-01-10T09:15:00Z',
      issuedBy: 'admin-2',
      certificateNumber: 'DLA-2025-B1-000789'
    },
    {
      id: 'cert-4',
      userId: 'user-3',
      userName: 'Carol Williams',
      level: 'B2' as FluencyLevelCode,
      issuedAt: '2025-02-05T16:45:00Z',
      issuedBy: 'admin-1',
      certificateNumber: 'DLA-2025-B2-001012'
    },
    {
      id: 'cert-5',
      userId: 'user-4',
      userName: 'David Brown',
      level: 'C1' as FluencyLevelCode,
      issuedAt: '2025-03-01T11:20:00Z',
      issuedBy: 'admin-2',
      certificateNumber: 'DLA-2025-C1-001345'
    }
  ];

  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          CertificateDisplay Component Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating certificate display in thumbnail and full modes
        </p>
      </div>

      {/* Thumbnail Mode Gallery */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Thumbnail Mode (Gallery View)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Click any certificate to view in full mode
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {mockCertificates.map(cert => (
            <CertificateDisplay
              key={cert.id}
              certificate={cert}
              mode="thumbnail"
              onView={() => setSelectedCert(cert)}
            />
          ))}
        </div>
      </section>

      {/* Full Mode Display */}
      {selectedCert && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Full Mode (Selected Certificate)
            </h2>
            <button
              onClick={() => setSelectedCert(null)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
            <CertificateDisplay
              certificate={selectedCert}
              mode="full"
            />
          </div>
        </section>
      )}

      {/* Individual Full Mode Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Full Mode Examples (All Levels)
        </h2>
        <div className="space-y-8">
          {mockCertificates.map(cert => (
            <div key={cert.id} className="bg-white dark:bg-gray-800 p-8 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                {cert.level} - {cert.userName}
              </h3>
              <CertificateDisplay
                certificate={cert}
                mode="full"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Thumbnail Grid Variations */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Responsive Grid Layouts
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              2 Columns
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {mockCertificates.slice(0, 4).map(cert => (
                <CertificateDisplay
                  key={cert.id}
                  certificate={cert}
                  mode="thumbnail"
                  onView={() => setSelectedCert(cert)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              4 Columns
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {mockCertificates.map(cert => (
                <CertificateDisplay
                  key={cert.id}
                  certificate={cert}
                  mode="thumbnail"
                  onView={() => setSelectedCert(cert)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CertificateDisplayDemo;
