import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';

// Mock fetch globally
global.fetch = vi.fn();

describe('Fluency Level API Methods', () => {
  const mockAccessToken = 'test-access-token';
  const mockUserId = 'user-123';
  const mockCertificateId = 'cert-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFluencyLevel', () => {
    it('should fetch fluency level for a user', async () => {
      const mockResponse = {
        userId: mockUserId,
        fluencyLevel: 'A2',
        fluencyLevelUpdatedAt: '2025-01-01T00:00:00Z',
        metadata: {
          code: 'A2',
          name: 'Elementary',
          description: 'Can communicate in simple and routine tasks',
          color: '#3b82f6',
          icon: '🌿'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getFluencyLevel(mockAccessToken, mockUserId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/fluency/${mockUserId}`),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`
          }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(api.getFluencyLevel(mockAccessToken, mockUserId))
        .rejects.toThrow('Failed to fetch fluency level');
    });
  });

  describe('updateFluencyLevel', () => {
    it('should update fluency level for a user', async () => {
      const mockResponse = {
        success: true,
        userId: mockUserId,
        newLevel: 'B1',
        certificate: {
          id: 'cert-789',
          level: 'B1'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.updateFluencyLevel(mockAccessToken, mockUserId, 'B1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/fluency/${mockUserId}`),
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`
          },
          body: JSON.stringify({ newLevel: 'B1' })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error with message from response when update fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Admin access required' })
      });

      await expect(api.updateFluencyLevel(mockAccessToken, mockUserId, 'B1'))
        .rejects.toThrow('Admin access required');
    });
  });

  describe('getFluencyHistory', () => {
    it('should fetch fluency history for a user', async () => {
      const mockResponse = {
        history: [
          {
            userId: mockUserId,
            previousLevel: 'A1',
            newLevel: 'A2',
            changedAt: '2025-01-01T00:00:00Z',
            changedBy: 'admin-123'
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getFluencyHistory(mockAccessToken, mockUserId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/fluency/history/${mockUserId}`),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`
          }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(api.getFluencyHistory(mockAccessToken, mockUserId))
        .rejects.toThrow('Failed to fetch fluency history');
    });
  });

  describe('getCertificates', () => {
    it('should fetch all certificates for a user', async () => {
      const mockResponse = {
        certificates: [
          {
            id: 'cert-123',
            userId: mockUserId,
            level: 'A2',
            issuedAt: '2025-01-01T00:00:00Z',
            certificateNumber: 'DLA-2025-A2-000001'
          },
          {
            id: 'cert-456',
            userId: mockUserId,
            level: 'B1',
            issuedAt: '2025-02-01T00:00:00Z',
            certificateNumber: 'DLA-2025-B1-000002'
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getCertificates(mockAccessToken, mockUserId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/certificates/${mockUserId}`),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`
          }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(api.getCertificates(mockAccessToken, mockUserId))
        .rejects.toThrow('Failed to fetch certificates');
    });
  });

  describe('getCertificate', () => {
    it('should fetch a specific certificate', async () => {
      const mockResponse = {
        id: mockCertificateId,
        userId: mockUserId,
        userName: 'John Doe',
        level: 'B1',
        issuedAt: '2025-02-01T00:00:00Z',
        issuedBy: 'admin-123',
        certificateNumber: 'DLA-2025-B1-000002'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getCertificate(mockAccessToken, mockUserId, mockCertificateId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/certificates/${mockUserId}/${mockCertificateId}`),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`
          }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when certificate not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(api.getCertificate(mockAccessToken, mockUserId, mockCertificateId))
        .rejects.toThrow('Failed to fetch certificate');
    });
  });
});
