/**
 * Fluency Level Constants
 * 
 * CEFR level metadata and configuration constants.
 */

import type { FluencyLevel, FluencyLevelCode } from '../types/fluency';

/**
 * Complete fluency level metadata for all CEFR levels (A1-C1)
 */
export const FLUENCY_LEVELS: Record<FluencyLevelCode, FluencyLevel> = {
  A1: {
    code: 'A1',
    name: 'Beginner',
    description: 'Can understand and use familiar everyday expressions',
    color: '#10b981',
    icon: '🌱'
  },
  A2: {
    code: 'A2',
    name: 'Elementary',
    description: 'Can communicate in simple and routine tasks',
    color: '#3b82f6',
    icon: '🌿'
  },
  B1: {
    code: 'B1',
    name: 'Intermediate',
    description: 'Can deal with most situations while traveling',
    color: '#8b5cf6',
    icon: '🌳'
  },
  B2: {
    code: 'B2',
    name: 'Upper Intermediate',
    description: 'Can interact with a degree of fluency and spontaneity',
    color: '#f59e0b',
    icon: '🏆'
  },
  C1: {
    code: 'C1',
    name: 'Advanced',
    description: 'Can express ideas fluently and spontaneously',
    color: '#ef4444',
    icon: '👑'
  }
};

/**
 * Ordered array of fluency level codes for progression
 */
export const FLUENCY_LEVEL_ORDER: FluencyLevelCode[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Default fluency level for new users
 */
export const DEFAULT_FLUENCY_LEVEL: FluencyLevelCode = 'A1';

/**
 * Minimum fluency level (cannot downgrade below this)
 */
export const MIN_FLUENCY_LEVEL: FluencyLevelCode = 'A1';

/**
 * Maximum fluency level (cannot upgrade beyond this)
 */
export const MAX_FLUENCY_LEVEL: FluencyLevelCode = 'C1';
