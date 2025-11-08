/**
 * Fluency Level System Types
 * 
 * Type definitions for the CEFR-based fluency level tracking system.
 */

/**
 * CEFR fluency level codes
 */
export type FluencyLevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/**
 * Fluency level with metadata
 */
export interface FluencyLevel {
  code: FluencyLevelCode;
  name: string;
  description: string;
  color: string;
  icon: string;
}

/**
 * Certificate issued upon fluency level achievement
 */
export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  level: FluencyLevelCode;
  issuedAt: string;
  issuedBy: string;
  certificateNumber: string;
}

/**
 * History entry for fluency level changes
 */
export interface FluencyHistoryEntry {
  userId: string;
  previousLevel: FluencyLevelCode | null;
  newLevel: FluencyLevelCode;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

/**
 * User profile extension with fluency fields
 */
export interface UserProfileWithFluency {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  fluencyLevel: FluencyLevelCode;
  fluencyLevelUpdatedAt: string;
  fluencyLevelUpdatedBy?: string;
}
