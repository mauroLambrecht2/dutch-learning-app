/**
 * Fluency Level Utilities
 * 
 * Utility functions for fluency level validation and transitions.
 */

import type { FluencyLevelCode } from '../types/fluency';
import {
  FLUENCY_LEVELS,
  FLUENCY_LEVEL_ORDER,
  MIN_FLUENCY_LEVEL,
  MAX_FLUENCY_LEVEL
} from '../constants/fluencyLevels';

/**
 * Validates if a string is a valid fluency level code
 */
export function isValidFluencyLevel(level: string): level is FluencyLevelCode {
  return FLUENCY_LEVEL_ORDER.includes(level as FluencyLevelCode);
}

/**
 * Gets the index of a fluency level in the progression order
 */
function getLevelIndex(level: FluencyLevelCode): number {
  return FLUENCY_LEVEL_ORDER.indexOf(level);
}

/**
 * Gets the next fluency level in progression (upgrade)
 * Returns null if already at maximum level
 */
export function getNextLevel(currentLevel: FluencyLevelCode): FluencyLevelCode | null {
  const currentIndex = getLevelIndex(currentLevel);
  
  if (currentIndex === -1) {
    throw new Error(`Invalid fluency level: ${currentLevel}`);
  }
  
  if (currentLevel === MAX_FLUENCY_LEVEL) {
    return null;
  }
  
  return FLUENCY_LEVEL_ORDER[currentIndex + 1];
}

/**
 * Gets the previous fluency level in progression (downgrade)
 * Returns null if already at minimum level
 */
export function getPreviousLevel(currentLevel: FluencyLevelCode): FluencyLevelCode | null {
  const currentIndex = getLevelIndex(currentLevel);
  
  if (currentIndex === -1) {
    throw new Error(`Invalid fluency level: ${currentLevel}`);
  }
  
  if (currentLevel === MIN_FLUENCY_LEVEL) {
    return null;
  }
  
  return FLUENCY_LEVEL_ORDER[currentIndex - 1];
}

/**
 * Checks if an upgrade from current level to target level is valid
 */
export function canUpgradeTo(currentLevel: FluencyLevelCode, targetLevel: FluencyLevelCode): boolean {
  if (!isValidFluencyLevel(currentLevel) || !isValidFluencyLevel(targetLevel)) {
    return false;
  }
  
  const nextLevel = getNextLevel(currentLevel);
  return nextLevel === targetLevel;
}

/**
 * Checks if a downgrade from current level to target level is valid
 */
export function canDowngradeTo(currentLevel: FluencyLevelCode, targetLevel: FluencyLevelCode): boolean {
  if (!isValidFluencyLevel(currentLevel) || !isValidFluencyLevel(targetLevel)) {
    return false;
  }
  
  const previousLevel = getPreviousLevel(currentLevel);
  return previousLevel === targetLevel;
}

/**
 * Validates if a level transition is allowed
 */
export function isValidTransition(
  currentLevel: FluencyLevelCode,
  targetLevel: FluencyLevelCode
): boolean {
  if (currentLevel === targetLevel) {
    return false; // No transition needed
  }
  
  return canUpgradeTo(currentLevel, targetLevel) || canDowngradeTo(currentLevel, targetLevel);
}

/**
 * Gets fluency level metadata by code
 */
export function getFluencyLevelMetadata(level: FluencyLevelCode) {
  return FLUENCY_LEVELS[level];
}

/**
 * Gets a formatted display string for a fluency level
 * Example: "A2 - Elementary"
 */
export function formatFluencyLevel(level: FluencyLevelCode, includeDescription = false): string {
  const metadata = getFluencyLevelMetadata(level);
  
  if (includeDescription) {
    return `${metadata.code} - ${metadata.name}: ${metadata.description}`;
  }
  
  return `${metadata.code} - ${metadata.name}`;
}

/**
 * Compares two fluency levels
 * Returns: -1 if level1 < level2, 0 if equal, 1 if level1 > level2
 */
export function compareFluencyLevels(
  level1: FluencyLevelCode,
  level2: FluencyLevelCode
): number {
  const index1 = getLevelIndex(level1);
  const index2 = getLevelIndex(level2);
  
  if (index1 < index2) return -1;
  if (index1 > index2) return 1;
  return 0;
}
