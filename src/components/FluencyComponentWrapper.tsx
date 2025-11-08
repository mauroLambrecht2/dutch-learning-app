/**
 * FluencyComponentWrapper
 * 
 * Wraps fluency components with error boundary and graceful degradation.
 * Provides consistent error handling for all fluency-related UI.
 */

import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { toast } from 'sonner';

interface FluencyComponentWrapperProps {
  children: ReactNode;
  fallbackMessage?: string;
}

export function FluencyComponentWrapper({ 
  children, 
  fallbackMessage = 'Unable to display fluency information' 
}: FluencyComponentWrapperProps) {
  const handleError = (error: Error) => {
    console.error('Fluency component error:', error);
    toast.error('Component Error', {
      description: error.message
    });
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {fallbackMessage}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                This section is temporarily unavailable. Please refresh the page.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
