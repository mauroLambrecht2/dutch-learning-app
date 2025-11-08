/**
 * Unit tests for fluency level utilities
 * 
 * Note: These tests require a testing framework like Vitest to be configured.
 * Run with: npm test (once testing is set up)
 */

import { describe, it, expect } from 'vitest';
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
import type { FluencyLevelCode } from '../../types/fluency';

describe('fluencyLevelUtils', () => {
  describe('isValidFluencyLevel', () => {
    it('should return true for valid fluency levels', () => {
      expect(isValidFluencyLevel('A1')).toBe(true);
      expect(isValidFluencyLevel('A2')).toBe(true);
      expect(isValidFluencyLevel('B1')).toBe(true);
      expect(isValidFluencyLevel('B2')).toBe(true);
      expect(isValidFluencyLevel('C1')).toBe(true);
    });

    it('should return false for invalid fluency levels', () => {
      expect(isValidFluencyLevel('C2')).toBe(false);
      expect(isValidFluencyLevel('A0')).toBe(false);
      expect(isValidFluencyLevel('invalid')).toBe(false);
      expect(isValidFluencyLevel('')).toBe(false);
    });
  });

  describe('getNextLevel', () => {
    it('should return the next level in progression', () => {
      expect(getNextLevel('A1')).toBe('A2');
      expect(getNextLevel('A2')).toBe('B1');
      expect(getNextLevel('B1')).toBe('B2');
      expect(getNextLevel('B2')).toBe('C1');
    });

    it('should return null when at maximum level', () => {
      expect(getNextLevel('C1')).toBe(null);
    });

    it('should throw error for invalid level', () => {
      expect(() => getNextLevel('invalid' as FluencyLevelCode)).toThrow();
    });
  });

  describe('getPreviousLevel', () => {
    it('should return the previous level in progression', () => {
      expect(getPreviousLevel('C1')).toBe('B2');
      expect(getPreviousLevel('B2')).toBe('B1');
      expect(getPreviousLevel('B1')).toBe('A2');
      expect(getPreviousLevel('A2')).toBe('A1');
    });

    it('should return null when at minimum level', () => {
      expect(getPreviousLevel('A1')).toBe(null);
    });

    it('should throw error for invalid level', () => {
      expect(() => getPreviousLevel('invalid' as FluencyLevelCode)).toThrow();
    });
  });

  describe('canUpgradeTo', () => {
    it('should return true for valid upgrades', () => {
      expect(canUpgradeTo('A1', 'A2')).toBe(true);
      expect(canUpgradeTo('A2', 'B1')).toBe(true);
      expect(canUpgradeTo('B1', 'B2')).toBe(true);
      expect(canUpgradeTo('B2', 'C1')).toBe(true);
    });

    it('should return false for invalid upgrades', () => {
      expect(canUpgradeTo('A1', 'B1')).toBe(false); // Skipping a level
      expect(canUpgradeTo('C1', 'C1')).toBe(false); // Same level
      expect(canUpgradeTo('B2', 'B1')).toBe(false); // Downgrade
    });

    it('should return false when at maximum level', () => {
      expect(canUpgradeTo('C1', 'A1' as any)).toBe(false);
    });
  });

  describe('canDowngradeTo', () => {
    it('should return true for valid downgrades', () => {
      expect(canDowngradeTo('C1', 'B2')).toBe(true);
      expect(canDowngradeTo('B2', 'B1')).toBe(true);
      expect(canDowngradeTo('B1', 'A2')).toBe(true);
      expect(canDowngradeTo('A2', 'A1')).toBe(true);
    });

    it('should return false for invalid downgrades', () => {
      expect(canDowngradeTo('B2', 'A2')).toBe(false); // Skipping a level
      expect(canDowngradeTo('A1', 'A1')).toBe(false); // Same level
      expect(canDowngradeTo('A2', 'B1')).toBe(false); // Upgrade
    });

    it('should return false when at minimum level', () => {
      expect(canDowngradeTo('A1', 'A1' as any)).toBe(false);
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions (upgrades)', () => {
      expect(isValidTransition('A1', 'A2')).toBe(true);
      expect(isValidTransition('B1', 'B2')).toBe(true);
    });

    it('should return true for valid transitions (downgrades)', () => {
      expect(isValidTransition('C1', 'B2')).toBe(true);
      expect(isValidTransition('B1', 'A2')).toBe(true);
    });

    it('should return false for same level', () => {
      expect(isValidTransition('A1', 'A1')).toBe(false);
      expect(isValidTransition('B2', 'B2')).toBe(false);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidTransition('A1', 'B1')).toBe(false); // Skipping levels
      expect(isValidTransition('C1', 'A1')).toBe(false); // Too many levels
    });
  });

  describe('getFluencyLevelMetadata', () => {
    it('should return correct metadata for each level', () => {
      const a1 = getFluencyLevelMetadata('A1');
      expect(a1.code).toBe('A1');
      expect(a1.name).toBe('Beginner');
      expect(a1.color).toBe('#10b981');
      expect(a1.icon).toBe('🌱');

      const c1 = getFluencyLevelMetadata('C1');
      expect(c1.code).toBe('C1');
      expect(c1.name).toBe('Advanced');
      expect(c1.color).toBe('#ef4444');
      expect(c1.icon).toBe('👑');
    });
  });

  describe('formatFluencyLevel', () => {
    it('should format level without description by default', () => {
      expect(formatFluencyLevel('A1')).toBe('A1 - Beginner');
      expect(formatFluencyLevel('B2')).toBe('B2 - Upper Intermediate');
    });

    it('should format level with description when requested', () => {
      expect(formatFluencyLevel('A1', true)).toBe(
        'A1 - Beginner: Can understand and use familiar everyday expressions'
      );
      expect(formatFluencyLevel('C1', true)).toBe(
        'C1 - Advanced: Can express ideas fluently and spontaneously'
      );
    });
  });

  describe('compareFluencyLevels', () => {
    it('should return -1 when first level is lower', () => {
      expect(compareFluencyLevels('A1', 'A2')).toBe(-1);
      expect(compareFluencyLevels('A1', 'C1')).toBe(-1);
      expect(compareFluencyLevels('B1', 'B2')).toBe(-1);
    });

    it('should return 1 when first level is higher', () => {
      expect(compareFluencyLevels('A2', 'A1')).toBe(1);
      expect(compareFluencyLevels('C1', 'A1')).toBe(1);
      expect(compareFluencyLevels('B2', 'B1')).toBe(1);
    });

    it('should return 0 when levels are equal', () => {
      expect(compareFluencyLevels('A1', 'A1')).toBe(0);
      expect(compareFluencyLevels('B2', 'B2')).toBe(0);
      expect(compareFluencyLevels('C1', 'C1')).toBe(0);
    });
  });
});
