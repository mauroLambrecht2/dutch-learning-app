/**
 * FluencyLevelManager Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluencyLevelManager } from '../FluencyLevelManager';
import { api } from '../../utils/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../utils/api');
vi.mock('sonner');

describe('FluencyLevelManager', () => {
  const mockAccessToken = 'test-token';
  const mockUserId = 'user-123';
  const mockOnLevelChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Role-based visibility', () => {
    it('should render for teacher role', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A2"
          accessToken={mockAccessToken}
          userRole="teacher"
          onLevelChange={mockOnLevelChange}
        />
      );

      expect(screen.getByText('Fluency Level Management')).toBeInTheDocument();
    });

    it('should not render for student role', () => {
      const { container } = render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A2"
          accessToken={mockAccessToken}
          userRole="student"
          onLevelChange={mockOnLevelChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Current level display', () => {
    it('should display current fluency level', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="B1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      expect(screen.getByText('Current Level')).toBeInTheDocument();
      expect(screen.getByText('B1')).toBeInTheDocument();
    });
  });

  describe('Upgrade controls', () => {
    it('should enable upgrade button when not at max level', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A2"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      const upgradeButton = screen.getByText('↑ B1');
      expect(upgradeButton).not.toBeDisabled();
    });

    it('should disable upgrade button at max level (C1)', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="C1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      const upgradeButton = screen.getByText('↑ Max');
      expect(upgradeButton).toBeDisabled();
    });

    it('should show confirmation dialog when upgrade clicked', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      const upgradeButton = screen.getByText('↑ A2');
      fireEvent.click(upgradeButton);

      expect(screen.getByText('Confirm Level Change')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to change the fluency level?')).toBeInTheDocument();
    });
  });

  describe('Downgrade controls', () => {
    it('should enable downgrade button when not at min level', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="B2"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      const downgradeButton = screen.getByText('↓ B1');
      expect(downgradeButton).not.toBeDisabled();
    });

    it('should disable downgrade button at min level (A1)', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      const downgradeButton = screen.getByText('↓ Min');
      expect(downgradeButton).toBeDisabled();
    });

    it('should show confirmation dialog when downgrade clicked', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="B1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      const downgradeButton = screen.getByText('↓ A2');
      fireEvent.click(downgradeButton);

      expect(screen.getByText('Confirm Level Change')).toBeInTheDocument();
    });
  });

  describe('Confirmation dialog', () => {
    it('should show current and new level in confirmation', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A2"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↑ B1'));

      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should show certificate generation notice for upgrades', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↑ A2'));

      expect(screen.getByText(/certificate will be automatically generated/i)).toBeInTheDocument();
    });

    it('should close dialog when cancel clicked', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A2"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↑ B1'));
      expect(screen.getByText('Confirm Level Change')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Confirm Level Change')).not.toBeInTheDocument();
    });
  });

  describe('API integration', () => {
    it('should call API with correct parameters on upgrade', async () => {
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({ success: true });

      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A1"
          accessToken={mockAccessToken}
          userRole="teacher"
          onLevelChange={mockOnLevelChange}
        />
      );

      fireEvent.click(screen.getByText('↑ A2'));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(api.updateFluencyLevel).toHaveBeenCalledWith(
          mockAccessToken,
          mockUserId,
          'A2'
        );
      });
    });

    it('should call onLevelChange callback on successful update', async () => {
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({ success: true });

      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="B1"
          accessToken={mockAccessToken}
          userRole="teacher"
          onLevelChange={mockOnLevelChange}
        />
      );

      fireEvent.click(screen.getByText('↑ B2'));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(mockOnLevelChange).toHaveBeenCalledWith('B2');
      });
    });

    it('should show success toast on upgrade', async () => {
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({ success: true });

      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A2"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↑ B1'));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('upgraded to B1'),
          expect.objectContaining({
            description: 'Certificate generated automatically'
          })
        );
      });
    });

    it('should show success toast on downgrade without certificate notice', async () => {
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({ success: true });

      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="B2"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↓ B1'));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('downgraded to B1'),
          expect.objectContaining({
            description: undefined
          })
        );
      });
    });

    it('should show error toast on API failure', async () => {
      const errorMessage = 'Admin access required';
      vi.mocked(api.updateFluencyLevel).mockRejectedValue(new Error(errorMessage));

      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↑ A2'));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to update fluency level',
          expect.objectContaining({
            description: errorMessage
          })
        );
      });
    });

    it('should disable buttons while updating', async () => {
      let resolveUpdate: () => void;
      const updatePromise = new Promise<any>(resolve => {
        resolveUpdate = () => resolve({ success: true });
      });
      
      vi.mocked(api.updateFluencyLevel).mockReturnValue(updatePromise);

      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A2"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↑ B1'));
      fireEvent.click(screen.getByText('Confirm'));

      // Buttons should be disabled during update
      await waitFor(() => {
        expect(screen.getByText('↑ B1')).toBeDisabled();
        expect(screen.getByText('↓ A1')).toBeDisabled();
      });
      
      // Resolve the promise to clean up
      resolveUpdate!();
      await updatePromise;
    });
  });

  describe('Level progression indicator', () => {
    it('should display all levels in progression', () => {
      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="B1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      expect(screen.getByText('Level Progression')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing onLevelChange callback', async () => {
      vi.mocked(api.updateFluencyLevel).mockResolvedValue({ success: true });

      render(
        <FluencyLevelManager
          userId={mockUserId}
          currentLevel="A1"
          accessToken={mockAccessToken}
          userRole="teacher"
        />
      );

      fireEvent.click(screen.getByText('↑ A2'));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(api.updateFluencyLevel).toHaveBeenCalled();
      });
      // Should not throw error
    });

    it('should handle all level transitions correctly', async () => {
      const levels: Array<{ current: string; next: string }> = [
        { current: 'A1', next: 'A2' },
        { current: 'A2', next: 'B1' },
        { current: 'B1', next: 'B2' },
        { current: 'B2', next: 'C1' }
      ];

      for (const { current, next } of levels) {
        vi.clearAllMocks();
        vi.mocked(api.updateFluencyLevel).mockResolvedValue({ success: true });

        const { unmount } = render(
          <FluencyLevelManager
            userId={mockUserId}
            currentLevel={current as any}
            accessToken={mockAccessToken}
            userRole="teacher"
          />
        );

        fireEvent.click(screen.getByText(`↑ ${next}`));
        fireEvent.click(screen.getByText('Confirm'));

        await waitFor(() => {
          expect(api.updateFluencyLevel).toHaveBeenCalledWith(
            mockAccessToken,
            mockUserId,
            next
          );
        });

        unmount();
      }
    });
  });
});
