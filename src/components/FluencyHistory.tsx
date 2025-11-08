import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { FluencyHistoryEntry } from '../types/fluency';
import { getFluencyLevelMetadata } from '../utils/fluencyLevelUtils';
import { FluencyLevelBadge } from './FluencyLevelBadge';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { withRetry } from '../utils/apiWithRetry';

export interface FluencyHistoryProps {
  userId: string;
  accessToken: string;
}

/**
 * FluencyHistory Component
 * 
 * Displays a collapsible timeline of fluency level changes.
 * Shows history entries with date, previous/new level, and admin name.
 * Implements reverse chronological ordering.
 * Shows initial A1 assignment if no changes exist.
 * 
 * @param userId - The user ID to fetch history for
 * @param accessToken - Authentication token for API requests
 */
export function FluencyHistory({ userId, accessToken }: FluencyHistoryProps) {
  const [history, setHistory] = useState<FluencyHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wrap API call with retry logic
        const getFluencyHistoryWithRetry = withRetry(api.getFluencyHistory);
        const data = await getFluencyHistoryWithRetry(accessToken, userId);
        
        setHistory(data.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fluency history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, accessToken]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    
    const fetchHistory = async () => {
      try {
        const getFluencyHistoryWithRetry = withRetry(api.getFluencyHistory);
        const data = await getFluencyHistoryWithRetry(accessToken, userId);
        setHistory(data.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fluency history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <LoadingSpinner 
        size="medium" 
        message="Loading history..." 
        className="py-8"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load history"
        message={error}
        onRetry={handleRetry}
        className="p-4"
      />
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📜</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Fluency Level History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {history.length === 0 
                ? 'Initial level assignment' 
                : `${history.length} level ${history.length === 1 ? 'change' : 'changes'}`}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Timeline content */}
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-gray-900">
          {history.length === 0 ? (
            // No history - show initial A1 assignment
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
              </div>
              <div className="flex-1 pb-8">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FluencyLevelBadge level="A1" size="small" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Initial Level
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Started at {getFluencyLevelMetadata('A1').name} level
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Show history timeline
            <div className="space-y-0">
              {history.map((entry, index) => {
                const isUpgrade = entry.previousLevel === null || 
                  (entry.previousLevel && entry.previousLevel < entry.newLevel);
                const isFirst = index === 0;
                const isLast = index === history.length - 1;

                return (
                  <div key={`${entry.userId}-${entry.changedAt}`} className="flex gap-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          isUpgrade 
                            ? 'bg-green-500' 
                            : 'bg-orange-500'
                        }`}
                      ></div>
                      {!isLast && (
                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                      )}
                    </div>

                    {/* Entry content */}
                    <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                      <div className={`border rounded-lg p-4 ${
                        isUpgrade
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      }`}>
                        {/* Date and time */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {formatDate(entry.changedAt)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatTime(entry.changedAt)}
                          </span>
                        </div>

                        {/* Level change */}
                        <div className="flex items-center gap-3 mb-3">
                          {entry.previousLevel && (
                            <>
                              <FluencyLevelBadge level={entry.previousLevel} size="small" />
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                              </svg>
                            </>
                          )}
                          <FluencyLevelBadge level={entry.newLevel} size="small" />
                        </div>

                        {/* Change description */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {entry.previousLevel ? (
                            <>
                              {isUpgrade ? 'Upgraded' : 'Adjusted'} from{' '}
                              <span className="font-semibold">
                                {getFluencyLevelMetadata(entry.previousLevel).name}
                              </span>{' '}
                              to{' '}
                              <span className="font-semibold">
                                {getFluencyLevelMetadata(entry.newLevel).name}
                              </span>
                            </>
                          ) : (
                            <>
                              Initial level set to{' '}
                              <span className="font-semibold">
                                {getFluencyLevelMetadata(entry.newLevel).name}
                              </span>
                            </>
                          )}
                        </p>

                        {/* Admin info */}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Changed by: <span className="font-medium">{entry.changedBy}</span>
                        </p>

                        {/* Optional reason */}
                        {entry.reason && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                            "{entry.reason}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
