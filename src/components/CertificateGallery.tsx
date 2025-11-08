import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { Certificate } from '../types/fluency';
import { CertificateDisplay } from './CertificateDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { withRetry } from '../utils/apiWithRetry';

export interface CertificateGalleryProps {
  userId: string;
  accessToken: string;
}

/**
 * CertificateGallery Component
 * 
 * Displays a responsive grid of earned certificates with modal view.
 * Fetches certificates on mount and handles loading/error states.
 * Shows encouraging message when no certificates exist.
 * 
 * @param userId - The user ID to fetch certificates for
 * @param accessToken - Authentication token for API requests
 */
export function CertificateGallery({ userId, accessToken }: CertificateGalleryProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wrap API call with retry logic
        const getCertificatesWithRetry = withRetry(api.getCertificates);
        const data = await getCertificatesWithRetry(accessToken, userId);
        
        setCertificates(data.certificates || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [userId, accessToken]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    
    const fetchCertificates = async () => {
      try {
        const getCertificatesWithRetry = withRetry(api.getCertificates);
        const data = await getCertificatesWithRetry(accessToken, userId);
        setCertificates(data.certificates || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  // Loading state
  if (loading) {
    return (
      <LoadingSpinner 
        size="large" 
        message="Loading certificates..." 
        className="py-12"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load certificates"
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  // Empty state
  if (certificates.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🎓</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          No Certificates Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Keep learning and practicing! Your teacher will award you certificates as you progress through fluency levels.
        </p>
      </div>
    );
  }

  // Gallery view
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {certificates.map((certificate) => (
          <CertificateDisplay
            key={certificate.id}
            certificate={certificate}
            mode="thumbnail"
            onView={() => handleViewCertificate(certificate)}
          />
        ))}
      </div>

      {/* Modal for full certificate view */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close certificate"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Certificate display */}
            <CertificateDisplay
              certificate={selectedCertificate}
              mode="full"
            />
          </div>
        </div>
      )}
    </>
  );
}
