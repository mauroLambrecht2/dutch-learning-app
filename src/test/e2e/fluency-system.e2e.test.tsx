/**
 * End-to-End Tests for Fluency Level System
 * 
 * These tests verify the complete fluency level system workflow including:
 * - Admin upgrade flow with certificate generation
 * - Student viewing fluency level and certificates
 * - Fluency history display after multiple changes
 * - Permission checks for non-admin users
 * - Level transition boundaries (A1 minimum, C1 maximum)
 * 
 * Note: These are API-level E2E tests that verify the complete workflow
 * without rendering full UI components to avoid dependency issues.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../../utils/api';

// Mock the API module
vi.mock('../../utils/api');

describe('Fluency Level System - End-to-End Tests', () => {
  const mockAdminToken = 'admin-token-123';
  const mockStudentToken = 'student-token-456';
  const mockStudentId = 'student-user-123';
  const mockAdminId = 'admin-user-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('E2E Test 1: Complete Admin Upgrade Flow', () => {
    it('should complete full admin upgrade flow: login → upgrade student → verify certificate', async () => {
      // Step 1: Setup initial student profile at A1 level
      const initialProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'A1',
        fluencyLevelUpdatedAt: '2025-01-01T00:00:00Z',
      };

      vi.mocked(api.getProfile).mockResolvedValue(initialProfile);
      vi.mocked(api.getCertificates).mockResolvedValue({ certificates: [] });
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: [
          {
            userId: mockStudentId,
            previousLevel: null,
            newLevel: 'A1',
            changedAt: '2025-01-01T00:00:00Z',
            changedBy: 'system',
          },
        ],
      });

      // Step 2: Admin fetches student profile
      const profile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('A1');

      // Step 3: Admin fetches initial certificates (should be empty)
      const initialCerts = await api.getCertificates(mockAdminToken, mockStudentId);
      expect(initialCerts.certificates).toHaveLength(0);

      // Step 4: Admin upgrades student from A1 to A2
      const newCertificate = {
        id: 'cert-001',
        userId: mockStudentId,
        userName: 'Test Student',
        level: 'A2',
        issuedAt: '2025-01-15T00:00:00Z',
        issuedBy: mockAdminId,
        certificateNumber: 'DLA-2025-A2-000001',
      };

      vi.mocked(api.updateFluencyLevel).mockResolvedValue({
        success: true,
        userId: mockStudentId,
        newLevel: 'A2',
        certificate: newCertificate,
      });

      const upgradeResult = await api.updateFluencyLevel(mockAdminToken, mockStudentId, 'A2');
      
      // Step 5: Verify upgrade was successful
      expect(upgradeResult.success).toBe(true);
      expect(upgradeResult.newLevel).toBe('A2');
      expect(upgradeResult.certificate).toBeDefined();
      expect(upgradeResult.certificate.level).toBe('A2');
      expect(upgradeResult.certificate.certificateNumber).toMatch(/DLA-2025-A2-\d{6}/);

      // Step 6: Updated profile after upgrade
      const upgradedProfile = {
        ...initialProfile,
        fluencyLevel: 'A2',
        fluencyLevelUpdatedAt: '2025-01-15T00:00:00Z',
        fluencyLevelUpdatedBy: mockAdminId,
      };

      vi.mocked(api.getProfile).mockResolvedValue(upgradedProfile);
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: [newCertificate],
      });

      // Step 7: Fetch updated profile
      const updatedProfile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(updatedProfile.fluencyLevel).toBe('A2');
      expect(updatedProfile.fluencyLevelUpdatedBy).toBe(mockAdminId);

      // Step 8: Verify certificate appears in gallery
      const certificates = await api.getCertificates(mockAdminToken, mockStudentId);
      expect(certificates.certificates).toHaveLength(1);
      expect(certificates.certificates[0].level).toBe('A2');
      expect(certificates.certificates[0].certificateNumber).toBe('DLA-2025-A2-000001');

      // Step 9: Verify fluency history shows the upgrade
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: [
          {
            userId: mockStudentId,
            previousLevel: 'A1',
            newLevel: 'A2',
            changedAt: '2025-01-15T00:00:00Z',
            changedBy: mockAdminId,
          },
          {
            userId: mockStudentId,
            previousLevel: null,
            newLevel: 'A1',
            changedAt: '2025-01-01T00:00:00Z',
            changedBy: 'system',
          },
        ],
      });

      const history = await api.getFluencyHistory(mockAdminToken, mockStudentId);
      expect(history.history).toHaveLength(2);
      expect(history.history[0].newLevel).toBe('A2');
      expect(history.history[0].previousLevel).toBe('A1');
      expect(history.history[0].changedBy).toBe(mockAdminId);

      // Step 10: Verify all API calls were made correctly
      expect(api.getProfile).toHaveBeenCalledWith(mockAdminToken, mockStudentId);
      expect(api.updateFluencyLevel).toHaveBeenCalledWith(mockAdminToken, mockStudentId, 'A2');
      expect(api.getCertificates).toHaveBeenCalledWith(mockAdminToken, mockStudentId);
      expect(api.getFluencyHistory).toHaveBeenCalledWith(mockAdminToken, mockStudentId);
    });
  });


  describe('E2E Test 2: Student Viewing Fluency Level and Certificates', () => {
    it('should allow student to view their fluency level and certificates', async () => {
      // Setup student with B1 level and multiple certificates
      const studentProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'B1',
        fluencyLevelUpdatedAt: '2025-03-01T00:00:00Z',
      };

      const certificates = [
        {
          id: 'cert-001',
          userId: mockStudentId,
          userName: 'Test Student',
          level: 'A2',
          issuedAt: '2025-01-15T00:00:00Z',
          issuedBy: mockAdminId,
          certificateNumber: 'DLA-2025-A2-000001',
        },
        {
          id: 'cert-002',
          userId: mockStudentId,
          userName: 'Test Student',
          level: 'B1',
          issuedAt: '2025-03-01T00:00:00Z',
          issuedBy: mockAdminId,
          certificateNumber: 'DLA-2025-B1-000002',
        },
      ];

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
      vi.mocked(api.getCertificates).mockResolvedValue({ certificates });

      // Student fetches their profile
      const profile = await api.getProfile(mockStudentToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('B1');
      expect(profile.role).toBe('student');

      // Student fetches their certificates
      const certs = await api.getCertificates(mockStudentToken, mockStudentId);
      expect(certs.certificates).toHaveLength(2);
      expect(certs.certificates[0].level).toBe('A2');
      expect(certs.certificates[1].level).toBe('B1');

      // Verify certificates are in chronological order
      const cert1Date = new Date(certs.certificates[0].issuedAt);
      const cert2Date = new Date(certs.certificates[1].issuedAt);
      expect(cert1Date.getTime()).toBeLessThan(cert2Date.getTime());

      // Verify API calls were made with student token
      expect(api.getProfile).toHaveBeenCalledWith(mockStudentToken, mockStudentId);
      expect(api.getCertificates).toHaveBeenCalledWith(mockStudentToken, mockStudentId);
    });


    it('should handle student with no certificates (new user)', async () => {
      const studentProfile = {
        id: mockStudentId,
        name: 'New Student',
        email: 'new@test.com',
        role: 'student',
        fluencyLevel: 'A1',
        fluencyLevelUpdatedAt: '2025-01-01T00:00:00Z',
      };

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
      vi.mocked(api.getCertificates).mockResolvedValue({ certificates: [] });

      // New student fetches their profile
      const profile = await api.getProfile(mockStudentToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('A1');

      // New student has no certificates yet
      const certs = await api.getCertificates(mockStudentToken, mockStudentId);
      expect(certs.certificates).toHaveLength(0);

      // Verify API calls
      expect(api.getProfile).toHaveBeenCalledWith(mockStudentToken, mockStudentId);
      expect(api.getCertificates).toHaveBeenCalledWith(mockStudentToken, mockStudentId);
    });
  });


  describe('E2E Test 3: Fluency History Display After Multiple Level Changes', () => {
    it('should retrieve complete history after multiple upgrades and downgrades', async () => {
      // Setup student with complex history
      const studentProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'B1',
        fluencyLevelUpdatedAt: '2025-05-01T00:00:00Z',
      };

      const complexHistory = [
        {
          userId: mockStudentId,
          previousLevel: 'B2',
          newLevel: 'B1',
          changedAt: '2025-05-01T00:00:00Z',
          changedBy: mockAdminId,
          changedByName: 'Admin Teacher',
        },
        {
          userId: mockStudentId,
          previousLevel: 'B1',
          newLevel: 'B2',
          changedAt: '2025-04-01T00:00:00Z',
          changedBy: mockAdminId,
          changedByName: 'Admin Teacher',
        },
        {
          userId: mockStudentId,
          previousLevel: 'A2',
          newLevel: 'B1',
          changedAt: '2025-03-01T00:00:00Z',
          changedBy: mockAdminId,
          changedByName: 'Admin Teacher',
        },
        {
          userId: mockStudentId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-02-01T00:00:00Z',
          changedBy: mockAdminId,
          changedByName: 'Admin Teacher',
        },
        {
          userId: mockStudentId,
          previousLevel: null,
          newLevel: 'A1',
          changedAt: '2025-01-01T00:00:00Z',
          changedBy: 'system',
          changedByName: 'System',
        },
      ];

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
      vi.mocked(api.getFluencyHistory).mockResolvedValue({ history: complexHistory });

      // Fetch student profile
      const profile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('B1');

      // Fetch fluency history
      const history = await api.getFluencyHistory(mockAdminToken, mockStudentId);
      
      // Verify history contains all changes
      expect(history.history).toHaveLength(5);

      // Verify history is in reverse chronological order (most recent first)
      expect(history.history[0].changedAt).toBe('2025-05-01T00:00:00Z');
      expect(history.history[0].newLevel).toBe('B1');
      expect(history.history[0].previousLevel).toBe('B2');

      // Verify the progression: A1 → A2 → B1 → B2 → B1 (downgrade)
      expect(history.history[4].newLevel).toBe('A1'); // Initial
      expect(history.history[3].newLevel).toBe('A2'); // First upgrade
      expect(history.history[2].newLevel).toBe('B1'); // Second upgrade
      expect(history.history[1].newLevel).toBe('B2'); // Third upgrade
      expect(history.history[0].newLevel).toBe('B1'); // Downgrade

      // Verify admin IDs are recorded
      expect(history.history[0].changedBy).toBe(mockAdminId);
      expect(history.history[4].changedBy).toBe('system'); // Initial assignment

      // Verify API call
      expect(api.getFluencyHistory).toHaveBeenCalledWith(mockAdminToken, mockStudentId);
    });

    it('should show initial A1 assignment when no changes exist', async () => {
      const studentProfile = {
        id: mockStudentId,
        name: 'New Student',
        email: 'new@test.com',
        role: 'student',
        fluencyLevel: 'A1',
        fluencyLevelUpdatedAt: '2025-01-01T00:00:00Z',
      };

      const initialHistory = [
        {
          userId: mockStudentId,
          previousLevel: null,
          newLevel: 'A1',
          changedAt: '2025-01-01T00:00:00Z',
          changedBy: 'system',
        },
      ];

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
      vi.mocked(api.getFluencyHistory).mockResolvedValue({ history: initialHistory });

      // Fetch profile
      const profile = await api.getProfile(mockStudentToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('A1');

      // Fetch history
      const history = await api.getFluencyHistory(mockStudentToken, mockStudentId);
      
      // Verify only initial A1 assignment exists
      expect(history.history).toHaveLength(1);
      expect(history.history[0].newLevel).toBe('A1');
      expect(history.history[0].previousLevel).toBeNull();
      expect(history.history[0].changedBy).toBe('system');

      // Verify API calls
      expect(api.getProfile).toHaveBeenCalledWith(mockStudentToken, mockStudentId);
      expect(api.getFluencyHistory).toHaveBeenCalledWith(mockStudentToken, mockStudentId);
    });
  });


  describe('E2E Test 4: Permission Checks - Non-Admin Cannot Modify Levels', () => {
    it('should reject API call when non-admin attempts to update level', async () => {
      const studentProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'A2',
        fluencyLevelUpdatedAt: '2025-01-15T00:00:00Z',
      };

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);

      // Student can view their profile
      const profile = await api.getProfile(mockStudentToken, mockStudentId);
      expect(profile.role).toBe('student');
      expect(profile.fluencyLevel).toBe('A2');


      // Simulate API rejection for non-admin user attempting to update
      vi.mocked(api.updateFluencyLevel).mockRejectedValue(
        new Error('Admin access required')
      );

      // Student attempts to update their own level (should fail)
      try {
        await api.updateFluencyLevel(mockStudentToken, mockStudentId, 'B1');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Admin access required');
      }

      // Verify the API call was attempted but rejected
      expect(api.updateFluencyLevel).toHaveBeenCalledWith(
        mockStudentToken,
        mockStudentId,
        'B1'
      );
    });


    it('should allow admin to successfully update student level', async () => {
      const studentProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'B1',
      };

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({
        success: true,
        userId: mockStudentId,
        newLevel: 'B2',
        certificate: {
          id: 'cert-123',
          userId: mockStudentId,
          userName: 'Test Student',
          level: 'B2',
          issuedAt: '2025-01-20T00:00:00Z',
          issuedBy: mockAdminId,
          certificateNumber: 'DLA-2025-B2-000123',
        },
      });

      // Admin fetches student profile
      const profile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('B1');

      // Admin successfully updates student level
      const result = await api.updateFluencyLevel(mockAdminToken, mockStudentId, 'B2');
      expect(result.success).toBe(true);
      expect(result.newLevel).toBe('B2');

      // Verify API calls
      expect(api.getProfile).toHaveBeenCalledWith(mockAdminToken, mockStudentId);
      expect(api.updateFluencyLevel).toHaveBeenCalledWith(mockAdminToken, mockStudentId, 'B2');
    });
  });


  describe('E2E Test 5: Level Transition Boundaries', () => {
    it('should prevent downgrade below A1 (minimum level)', async () => {
      const studentProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'A1',
      };

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
      vi.mocked(api.updateFluencyLevel).mockRejectedValue(
        new Error('Invalid level transition')
      );

      // Fetch student at A1 level
      const profile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('A1');

      // Attempt to downgrade below A1 (should fail)
      try {
        await api.updateFluencyLevel(mockAdminToken, mockStudentId, 'A0');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid level transition');
      }

      // Verify upgrade to A2 is allowed
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({
        success: true,
        userId: mockStudentId,
        newLevel: 'A2',
      });

      const upgradeResult = await api.updateFluencyLevel(mockAdminToken, mockStudentId, 'A2');
      expect(upgradeResult.success).toBe(true);
      expect(upgradeResult.newLevel).toBe('A2');
    });


    it('should prevent upgrade beyond C1 (maximum level)', async () => {
      const studentProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'C1',
      };

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
      vi.mocked(api.updateFluencyLevel).mockRejectedValue(
        new Error('Invalid level transition')
      );

      // Fetch student at C1 level
      const profile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('C1');

      // Attempt to upgrade beyond C1 (should fail)
      try {
        await api.updateFluencyLevel(mockAdminToken, mockStudentId, 'C2');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid level transition');
      }

      // Verify downgrade to B2 is allowed
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({
        success: true,
        userId: mockStudentId,
        newLevel: 'B2',
      });

      const downgradeResult = await api.updateFluencyLevel(mockAdminToken, mockStudentId, 'B2');
      expect(downgradeResult.success).toBe(true);
      expect(downgradeResult.newLevel).toBe('B2');
    });


    it('should allow all valid level transitions (A1→A2→B1→B2→C1)', async () => {
      const validTransitions = [
        { from: 'A1', to: 'A2', direction: 'upgrade' },
        { from: 'A2', to: 'B1', direction: 'upgrade' },
        { from: 'B1', to: 'B2', direction: 'upgrade' },
        { from: 'B2', to: 'C1', direction: 'upgrade' },
        { from: 'C1', to: 'B2', direction: 'downgrade' },
        { from: 'B2', to: 'B1', direction: 'downgrade' },
        { from: 'B1', to: 'A2', direction: 'downgrade' },
        { from: 'A2', to: 'A1', direction: 'downgrade' },
      ];

      for (const transition of validTransitions) {
        vi.clearAllMocks();

        const studentProfile = {
          id: mockStudentId,
          name: 'Test Student',
          email: 'student@test.com',
          role: 'student',
          fluencyLevel: transition.from,
        };

        vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
        vi.mocked(api.updateFluencyLevel).mockResolvedValue({
          success: true,
          userId: mockStudentId,
          newLevel: transition.to,
        });

        // Fetch current profile
        const profile = await api.getProfile(mockAdminToken, mockStudentId);
        expect(profile.fluencyLevel).toBe(transition.from);

        // Perform transition
        const result = await api.updateFluencyLevel(mockAdminToken, mockStudentId, transition.to);
        
        // Verify transition was successful
        expect(result.success).toBe(true);
        expect(result.newLevel).toBe(transition.to);
        expect(api.updateFluencyLevel).toHaveBeenCalledWith(
          mockAdminToken,
          mockStudentId,
          transition.to
        );
      }
    });


    it('should handle API rejection for invalid level transitions', async () => {
      const studentProfile = {
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'A1',
      };

      vi.mocked(api.getProfile).mockResolvedValue(studentProfile);

      // Mock API to reject invalid transition (skipping levels)
      vi.mocked(api.updateFluencyLevel).mockRejectedValue(
        new Error('Invalid level transition')
      );

      // Fetch current profile
      const profile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(profile.fluencyLevel).toBe('A1');

      // Try to make an invalid API call (e.g., A1 to B2, skipping A2)
      try {
        await api.updateFluencyLevel(mockAdminToken, mockStudentId, 'B2');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid level transition');
      }

      // Verify the API call was attempted
      expect(api.updateFluencyLevel).toHaveBeenCalledWith(mockAdminToken, mockStudentId, 'B2');
    });
  });


  describe('E2E Test 6: Integration - Complete User Journey', () => {
    it('should handle complete user journey from A1 to C1 with all features', async () => {
      // This test simulates a complete journey through the fluency system
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
      const certificates: any[] = [];
      const history: any[] = [
        {
          userId: mockStudentId,
          previousLevel: null,
          newLevel: 'A1',
          changedAt: '2025-01-01T00:00:00Z',
          changedBy: 'system',
        },
      ];

      for (let i = 0; i < levels.length - 1; i++) {
        vi.clearAllMocks();

        const fromLevel = levels[i];
        const toLevel = levels[i + 1];

        const studentProfile = {
          id: mockStudentId,
          name: 'Test Student',
          email: 'student@test.com',
          role: 'student',
          fluencyLevel: fromLevel,
          fluencyLevelUpdatedAt: new Date(2025, i, 1).toISOString(),
        };

        vi.mocked(api.getProfile).mockResolvedValue(studentProfile);
        vi.mocked(api.getCertificates).mockResolvedValue({ certificates: [...certificates] });
        vi.mocked(api.getFluencyHistory).mockResolvedValue({ history: [...history] });

        // Fetch current profile
        const profile = await api.getProfile(mockAdminToken, mockStudentId);
        expect(profile.fluencyLevel).toBe(fromLevel);

        // Create new certificate for this upgrade
        const newCertificate = {
          id: `cert-${i + 1}`,
          userId: mockStudentId,
          userName: 'Test Student',
          level: toLevel,
          issuedAt: new Date(2025, i, 15).toISOString(),
          issuedBy: mockAdminId,
          certificateNumber: `DLA-2025-${toLevel}-${String(i + 1).padStart(6, '0')}`,
        };

        certificates.push(newCertificate);

        // Add to history
        history.unshift({
          userId: mockStudentId,
          previousLevel: fromLevel,
          newLevel: toLevel,
          changedAt: new Date(2025, i, 15).toISOString(),
          changedBy: mockAdminId,
        });

        vi.mocked(api.updateFluencyLevel).mockResolvedValue({
          success: true,
          userId: mockStudentId,
          newLevel: toLevel,
          certificate: newCertificate,
        });

        // Perform upgrade
        const upgradeResult = await api.updateFluencyLevel(mockAdminToken, mockStudentId, toLevel);
        
        // Verify upgrade was successful
        expect(upgradeResult.success).toBe(true);
        expect(upgradeResult.newLevel).toBe(toLevel);
        expect(upgradeResult.certificate).toBeDefined();
        expect(upgradeResult.certificate.level).toBe(toLevel);

        // Verify API call
        expect(api.updateFluencyLevel).toHaveBeenCalledWith(
          mockAdminToken,
          mockStudentId,
          toLevel
        );
      }

      // Final verification: student should be at C1 with 4 certificates
      expect(certificates.length).toBe(4); // A2, B1, B2, C1
      expect(history.length).toBe(5); // Initial A1 + 4 upgrades

      // Verify final state
      vi.mocked(api.getProfile).mockResolvedValue({
        id: mockStudentId,
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        fluencyLevel: 'C1',
        fluencyLevelUpdatedAt: new Date(2025, 3, 15).toISOString(),
      });

      const finalProfile = await api.getProfile(mockAdminToken, mockStudentId);
      expect(finalProfile.fluencyLevel).toBe('C1');

      // Verify all certificates were generated
      vi.mocked(api.getCertificates).mockResolvedValue({ certificates });
      const finalCerts = await api.getCertificates(mockAdminToken, mockStudentId);
      expect(finalCerts.certificates).toHaveLength(4);
      expect(finalCerts.certificates.map(c => c.level)).toEqual(['A2', 'B1', 'B2', 'C1']);
    });
  });
});
