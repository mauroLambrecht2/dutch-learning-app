/**
 * Manual test script for fluency level utilities
 * 
 * Run this file with: npx tsx src/utils/__tests__/fluencyLevelUtils.manual-test.ts
 * Or simply verify the output manually
 */

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
import { FLUENCY_LEVELS, FLUENCY_LEVEL_ORDER } from '../../constants/fluencyLevels';

console.log('=== Fluency Level Utilities Manual Test ===\n');

// Test 1: Validate fluency levels
console.log('Test 1: isValidFluencyLevel');
console.log('  A1 is valid:', isValidFluencyLevel('A1')); // Should be true
console.log('  C2 is valid:', isValidFluencyLevel('C2')); // Should be false
console.log('  invalid is valid:', isValidFluencyLevel('invalid')); // Should be false
console.log('');

// Test 2: Get next level
console.log('Test 2: getNextLevel');
console.log('  Next after A1:', getNextLevel('A1')); // Should be A2
console.log('  Next after B2:', getNextLevel('B2')); // Should be C1
console.log('  Next after C1:', getNextLevel('C1')); // Should be null
console.log('');

// Test 3: Get previous level
console.log('Test 3: getPreviousLevel');
console.log('  Previous before C1:', getPreviousLevel('C1')); // Should be B2
console.log('  Previous before A2:', getPreviousLevel('A2')); // Should be A1
console.log('  Previous before A1:', getPreviousLevel('A1')); // Should be null
console.log('');

// Test 4: Can upgrade to
console.log('Test 4: canUpgradeTo');
console.log('  Can upgrade A1 to A2:', canUpgradeTo('A1', 'A2')); // Should be true
console.log('  Can upgrade A1 to B1:', canUpgradeTo('A1', 'B1')); // Should be false (skip level)
console.log('  Can upgrade C1 to anything:', canUpgradeTo('C1', 'A1' as any)); // Should be false
console.log('');

// Test 5: Can downgrade to
console.log('Test 5: canDowngradeTo');
console.log('  Can downgrade C1 to B2:', canDowngradeTo('C1', 'B2')); // Should be true
console.log('  Can downgrade B2 to A2:', canDowngradeTo('B2', 'A2')); // Should be false (skip level)
console.log('  Can downgrade A1 to anything:', canDowngradeTo('A1', 'A1' as any)); // Should be false
console.log('');

// Test 6: Valid transition
console.log('Test 6: isValidTransition');
console.log('  A1 to A2 is valid:', isValidTransition('A1', 'A2')); // Should be true
console.log('  C1 to B2 is valid:', isValidTransition('C1', 'B2')); // Should be true
console.log('  A1 to A1 is valid:', isValidTransition('A1', 'A1')); // Should be false
console.log('  A1 to B1 is valid:', isValidTransition('A1', 'B1')); // Should be false
console.log('');

// Test 7: Get metadata
console.log('Test 7: getFluencyLevelMetadata');
const a1Meta = getFluencyLevelMetadata('A1');
console.log('  A1 metadata:', a1Meta);
const c1Meta = getFluencyLevelMetadata('C1');
console.log('  C1 metadata:', c1Meta);
console.log('');

// Test 8: Format fluency level
console.log('Test 8: formatFluencyLevel');
console.log('  A1 formatted:', formatFluencyLevel('A1'));
console.log('  A1 with description:', formatFluencyLevel('A1', true));
console.log('  B2 formatted:', formatFluencyLevel('B2'));
console.log('');

// Test 9: Compare levels
console.log('Test 9: compareFluencyLevels');
console.log('  Compare A1 to A2:', compareFluencyLevels('A1', 'A2')); // Should be -1
console.log('  Compare C1 to A1:', compareFluencyLevels('C1', 'A1')); // Should be 1
console.log('  Compare B1 to B1:', compareFluencyLevels('B1', 'B1')); // Should be 0
console.log('');

// Test 10: Display all levels
console.log('Test 10: All Fluency Levels');
FLUENCY_LEVEL_ORDER.forEach(code => {
  const level = FLUENCY_LEVELS[code];
  console.log(`  ${level.icon} ${formatFluencyLevel(code)}`);
  console.log(`     ${level.description}`);
  console.log(`     Color: ${level.color}`);
});
console.log('');

console.log('=== All Manual Tests Complete ===');
