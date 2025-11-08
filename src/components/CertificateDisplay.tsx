import type { Certificate } from '../types/fluency';
import { FLUENCY_LEVELS } from '../constants/fluencyLevels';

export interface CertificateDisplayProps {
  certificate: Certificate;
  mode: 'thumbnail' | 'full';
  onView?: () => void;
}

/**
 * CertificateDisplay Component
 * 
 * Renders a certificate in either thumbnail or full display mode.
 * Thumbnail mode shows a compact preview with click handler.
 * Full mode displays the complete certificate with all details.
 * 
 * @param certificate - The certificate data to display
 * @param mode - Display mode: 'thumbnail' or 'full'
 * @param onView - Optional callback when thumbnail is clicked
 */
export function CertificateDisplay({ 
  certificate, 
  mode, 
  onView 
}: CertificateDisplayProps) {
  const levelMetadata = FLUENCY_LEVELS[certificate.level];
  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (mode === 'thumbnail') {
    return (
      <div
        onClick={onView}
        className="relative cursor-pointer group overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-lg"
        style={{
          backgroundColor: `${levelMetadata.color}10`,
          borderColor: levelMetadata.color,
          aspectRatio: '4/3',
          borderRadius: '8px'
        }}
      >
        {/* Thumbnail content */}
        <div className="flex flex-col items-center justify-center h-full p-4">
          <span className="text-4xl mb-2" role="img" aria-label={`${levelMetadata.name} icon`}>
            {levelMetadata.icon}
          </span>
          <div 
            className="text-2xl font-bold mb-1"
            style={{ color: levelMetadata.color }}
          >
            {certificate.level}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {levelMetadata.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {new Date(certificate.issuedAt).getFullYear()}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
            View Certificate
          </span>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div
      className="relative border-4 p-8 max-w-2xl mx-auto"
      style={{
        backgroundColor: 'white',
        borderColor: levelMetadata.color,
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Certificate of Achievement
        </h1>
        <div className="text-sm text-gray-600">
          Dutch Learning Application
        </div>
      </div>

      {/* Main content */}
      <div className="text-center mb-8">
        <p className="text-lg text-gray-700 mb-4">
          This certifies that
        </p>
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          {certificate.userName}
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          has successfully achieved
        </p>
        
        {/* Level badge */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-6xl" role="img" aria-label={`${levelMetadata.name} icon`}>
            {levelMetadata.icon}
          </span>
          <div>
            <div 
              className="text-5xl font-bold"
              style={{ color: levelMetadata.color }}
            >
              {certificate.level}
            </div>
            <div 
              className="text-xl font-semibold"
              style={{ color: levelMetadata.color }}
            >
              {levelMetadata.name}
            </div>
          </div>
        </div>

        <p className="text-base text-gray-600 italic max-w-md mx-auto mb-6">
          {levelMetadata.description}
        </p>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="flex justify-between items-end text-sm text-gray-600">
          <div>
            <div className="font-semibold text-gray-800">Date Issued</div>
            <div>{formattedDate}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-800">Certificate Number</div>
            <div className="font-mono">{certificate.certificateNumber}</div>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div 
        className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 opacity-20"
        style={{ borderColor: levelMetadata.color }}
      />
      <div 
        className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 opacity-20"
        style={{ borderColor: levelMetadata.color }}
      />
      <div 
        className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 opacity-20"
        style={{ borderColor: levelMetadata.color }}
      />
      <div 
        className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 opacity-20"
        style={{ borderColor: levelMetadata.color }}
      />
    </div>
  );
}
