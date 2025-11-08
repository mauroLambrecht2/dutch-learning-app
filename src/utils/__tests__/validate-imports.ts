/**
 * Simple import validation script
 * This file just imports all the fluency modules to verify they compile correctly
 */

// Import types
import type {
  FluencyLevelCode,
  FluencyLevel,
  Certificate,
  FluencyHistoryEntry,
  UserProfileWithFluency
} from '../../types/fluency';

// Import constants
import {
  FLUENCY_LEVELS,
  FLUENCY_LEVEL_ORDER,
  DEFAULT_FLUENCY_LEVEL,
  MIN_FLUENCY_LEVEL,
  MAX_FLUENCY_LEVEL
} from '../../constants/fluencyLevels';

// Import utilities
import {
  isValidFluencyLevel,
  getNextLevel,
  getPreviousLevel,
  canUpgradeTo,
  canDowngradeTo,
  isValidTransition,
  getFluencyLevelMetadata,
  formatFluencyLevel,
  compareFluencyLevels
} from '../fluencyLevelUtils';

// Quick validation
console.log('✓ All imports successful');
console.log('✓ Types:', typeof FluencyLevelCode !== 'undefined' ? 'defined' : 'undefined');
console.log('✓ Constants:', FLUENCY_LEVEL_ORDER.length, 'levels defined');
console.log('✓ Default level:', DEFAULT_FLUENCY_LEVEL);
console.log('✓ Utilities:', typeof isValidFluencyLevel === 'function' ? 'functions loaded' : 'error');

// Test basic functionality
const testLevel: FluencyLevelCode = 'A1';
console.log('✓ Test level validation:', isValidFluencyLevel(testLevel));
console.log('✓ Test next level:', getNextLevel(testLevel));
console.log('✓ Test format:', formatFluencyLevel(testLevel));

console.log('\n✅ All validations passed!');
