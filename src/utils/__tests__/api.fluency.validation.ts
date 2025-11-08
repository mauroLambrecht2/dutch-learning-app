/**
 * Type validation for fluency API methods
 * This file ensures the API methods have correct signatures
 */

import { api } from '../api';

// Type checks - these will fail at compile time if signatures are wrong
const validateApiMethods = () => {
  // getFluencyLevel should accept accessToken and userId
  const _getFluencyLevel: (accessToken: string, userId: string) => Promise<any> = 
    api.getFluencyLevel;

  // updateFluencyLevel should accept accessToken, userId, and newLevel
  const _updateFluencyLevel: (accessToken: string, userId: string, newLevel: string) => Promise<any> = 
    api.updateFluencyLevel;

  // getFluencyHistory should accept accessToken and userId
  const _getFluencyHistory: (accessToken: string, userId: string) => Promise<any> = 
    api.getFluencyHistory;

  // getCertificates should accept accessToken and userId
  const _getCertificates: (accessToken: string, userId: string) => Promise<any> = 
    api.getCertificates;

  // getCertificate should accept accessToken, userId, and certificateId
  const _getCertificate: (accessToken: string, userId: string, certificateId: string) => Promise<any> = 
    api.getCertificate;

  return {
    _getFluencyLevel,
    _updateFluencyLevel,
    _getFluencyHistory,
    _getCertificates,
    _getCertificate
  };
};

// Example usage patterns
export const exampleUsage = async () => {
  const accessToken = 'example-token';
  const userId = 'user-123';
  const certificateId = 'cert-456';

  // Get fluency level
  await api.getFluencyLevel(accessToken, userId);

  // Update fluency level
  await api.updateFluencyLevel(accessToken, userId, 'B1');

  // Get fluency history
  await api.getFluencyHistory(accessToken, userId);

  // Get all certificates
  await api.getCertificates(accessToken, userId);

  // Get specific certificate
  await api.getCertificate(accessToken, userId, certificateId);
};

export default validateApiMethods;
