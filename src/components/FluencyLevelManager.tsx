/**
 * FluencyLevelManager Component
 * 
 * Admin-only component for managing user fluency levels.
 * Provides upgrade/downgrade controls with confirmation dialogs.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { FluencyLevelCode } from '../types/fluency';
import { FLUENCY_LEVELS, FLUENCY_LEVEL_ORDER, MIN_FLUENCY_LEVEL, MAX_FLUENCY_LEVEL } from '../constants/fluencyLevels';
import { api } from '../utils/api';
import { FluencyLevelBadge } from './FluencyLevelBadge';
import { withRetry } from '../utils/apiWithRetry';

interface FluencyLevelManagerProps {
  userId: string;
  currentLevel: FluencyLevelCode;
  accessToken: string;
  userRole: 'teacher' | 'student';
  onLevelChange?: (newLevel: FluencyLevelCode) => void;
}

export function FluencyLevelManager({
  userId,
  currentLevel,
  accessToken,
  userRole,
  onLevelChange
}: FluencyLevelManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<FluencyLevelCode | null>(null);

  // Only show for teachers
  if (userRole !== 'teacher') {
    return null;
  }

  const currentIndex = FLUENCY_LEVEL_ORDER.indexOf(currentLevel);
  const canUpgrade = currentLevel !== MAX_FLUENCY_LEVEL;
  const canDowngrade = currentLevel !== MIN_FLUENCY_LEVEL;

  const getNextLevel = (): FluencyLevelCode | null => {
    if (!canUpgrade) return null;
    return FLUENCY_LEVEL_ORDER[currentIndex + 1];
  };

  const getPreviousLevel = (): FluencyLevelCode | null => {
    if (!canDowngrade) return null;
    return FLUENCY_LEVEL_ORDER[currentIndex - 1];
  };

  const handleUpgradeClick = () => {
    const nextLevel = getNextLevel();
    if (nextLevel) {
      setPendingLevel(nextLevel);
      setShowConfirmDialog(true);
    }
  };

  const handleDowngradeClick = () => {
    const prevLevel = getPreviousLevel();
    if (prevLevel) {
      setPendingLevel(prevLevel);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirm = async () => {
    if (!pendingLevel) return;

    setIsUpdating(true);
    setShowConfirmDialog(false);

    try {
      // Wrap API call with retry logic
      const updateFluencyLevelWithRetry = withRetry(api.updateFluencyLevel, {
        maxRetries: 2 // Fewer retries for mutations
      });
      
      await updateFluencyLevelWithRetry(accessToken, userId, pendingLevel);
      
      const isUpgrade = FLUENCY_LEVEL_ORDER.indexOf(pendingLevel) > currentIndex;
      const action = isUpgrade ? 'upgraded' : 'downgraded';
      
      toast.success(
        `Fluency level ${action} to ${pendingLevel} - ${FLUENCY_LEVELS[pendingLevel].name}`,
        {
          description: isUpgrade ? 'Certificate generated automatically' : undefined
        }
      );

      if (onLevelChange) {
        onLevelChange(pendingLevel);
      }
    } catch (error) {
      toast.error('Failed to update fluency level', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsUpdating(false);
      setPendingLevel(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingLevel(null);
  };

  const nextLevel = getNextLevel();
  const prevLevel = getPreviousLevel();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Fluency Level Management
      </h3>

      <div className="space-y-4">
        {/* Current Level Display */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Current Level</p>
          <FluencyLevelBadge level={currentLevel} size="medium" showLabel />
        </div>

        {/* Available Transitions */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Available Actions</p>
          <div className="flex gap-2">
            {/* Downgrade Button */}
            <button
              onClick={handleDowngradeClick}
              disabled={!canDowngrade || isUpdating}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium
                transition-colors duration-200
                ${canDowngrade && !isUpdating
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                }
              `}
              title={prevLevel ? `Downgrade to ${prevLevel}` : 'Cannot downgrade below A1'}
            >
              {prevLevel ? `↓ ${prevLevel}` : '↓ Min'}
            </button>

            {/* Upgrade Button */}
            <button
              onClick={handleUpgradeClick}
              disabled={!canUpgrade || isUpdating}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium
                transition-colors duration-200
                ${canUpgrade && !isUpdating
                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                }
              `}
              title={nextLevel ? `Upgrade to ${nextLevel}` : 'Cannot upgrade beyond C1'}
            >
              {nextLevel ? `↑ ${nextLevel}` : '↑ Max'}
            </button>
          </div>
        </div>

        {/* Level Progression Indicator */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Level Progression</p>
          <div className="flex items-center gap-1">
            {FLUENCY_LEVEL_ORDER.map((level, index) => (
              <div
                key={level}
                className={`
                  flex-1 h-2 rounded-full transition-all duration-300
                  ${level === currentLevel
                    ? 'bg-gradient-to-r from-blue-400 to-blue-600 ring-2 ring-blue-300'
                    : index < currentIndex
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                  }
                `}
                title={`${level} - ${FLUENCY_LEVELS[level].name}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">A1</span>
            <span className="text-xs text-gray-400">C1</span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Level Change
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to change the fluency level?
              </p>
              
              <div className="flex items-center justify-center gap-4 py-3">
                <div className="text-center">
                  <FluencyLevelBadge level={currentLevel} size="medium" />
                  <p className="text-xs text-gray-500 mt-1">Current</p>
                </div>
                
                <div className="text-2xl text-gray-400">→</div>
                
                <div className="text-center">
                  <FluencyLevelBadge level={pendingLevel} size="medium" />
                  <p className="text-xs text-gray-500 mt-1">New</p>
                </div>
              </div>

              {FLUENCY_LEVEL_ORDER.indexOf(pendingLevel) > currentIndex && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-800">
                    ✓ A certificate will be automatically generated for this upgrade
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
