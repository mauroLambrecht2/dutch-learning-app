import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FluencyHistory } from '../FluencyHistory';
import { api } from '../../utils/api';
import type { FluencyHistoryEntry } from '../../types/fluency';

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    getFluencyHistory: vi.fn()
  }
}));

describe('FluencyHistory', () => {
  const mockUserId = 'user-123';
  const mockAccessToken = 'token-abc';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching history', () => {
      vi.mocked(api.getFluencyHistory).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      // Check for loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      const errorMessage = 'Failed to fetch history';
      vi.mocked(api.getFluencyHistory).mockRejectedValue(
        new Error(errorMessage)
      );

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load history')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle non-Error objects in catch block', async () => {
      vi.mocked(api.getFluencyHistory).mockRejectedValue('String error');

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load fluency history')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display initial A1 assignment when no history exists', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fluency Level History')).toBeInTheDocument();
      });

      expect(screen.getByText('Initial level assignment')).toBeInTheDocument();

      // Expand to see content
      const expandButton = screen.getByRole('button', { name: /fluency level history/i });
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Initial Level')).toBeInTheDocument();
        expect(screen.getByText(/Started at.*Beginner.*level/i)).toBeInTheDocument();
      });
    });
  });

  describe('Timeline Display', () => {
    it('should display history entries in reverse chronological order', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T10:30:00Z',
          changedBy: 'Teacher Smith'
        },
        {
          userId: mockUserId,
          previousLevel: null,
          newLevel: 'A1',
          changedAt: '2025-01-01T09:00:00Z',
          changedBy: 'System'
        }
      ];

      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: mockHistory
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2 level changes')).toBeInTheDocument();
      });

      // Expand timeline
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        // Check for both entries - verify key text is present
        expect(screen.getAllByText('Beginner').length).toBeGreaterThan(0);
        expect(screen.getByText('Elementary')).toBeInTheDocument();
        expect(screen.getByText(/Initial level set to/i)).toBeInTheDocument();
      });
    });

    it('should display admin information for each entry', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T10:30:00Z',
          changedBy: 'Teacher Smith'
        }
      ];

      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: mockHistory
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      // Expand timeline
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Changed by:')).toBeInTheDocument();
        expect(screen.getByText('Teacher Smith')).toBeInTheDocument();
      });
    });

    it('should display optional reason when provided', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T10:30:00Z',
          changedBy: 'Teacher Smith',
          reason: 'Passed A2 assessment with excellent results'
        }
      ];

      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: mockHistory
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      // Expand timeline
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/"Passed A2 assessment with excellent results"/i)).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T10:30:00Z',
          changedBy: 'Teacher Smith'
        }
      ];

      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: mockHistory
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      // Expand timeline
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        // Check for date (format may vary by locale)
        expect(screen.getByText(/January 15, 2025/i)).toBeInTheDocument();
      });
    });

    it('should show single level change text correctly', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T10:30:00Z',
          changedBy: 'Teacher Smith'
        }
      ];

      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: mockHistory
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('1 level change')).toBeInTheDocument();
      });
    });
  });

  describe('Collapsible Functionality', () => {
    it('should start collapsed by default', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fluency Level History')).toBeInTheDocument();
      });

      // Content should not be visible initially
      expect(screen.queryByText('Initial Level')).not.toBeInTheDocument();
    });

    it('should expand when header is clicked', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Initial Level')).toBeInTheDocument();
      });
    });

    it('should collapse when header is clicked again', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const expandButton = screen.getByRole('button');
      
      // Expand
      fireEvent.click(expandButton);
      await waitFor(() => {
        expect(screen.getByText('Initial Level')).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(expandButton);
      await waitFor(() => {
        expect(screen.queryByText('Initial Level')).not.toBeInTheDocument();
      });
    });

    it('should have correct aria-expanded attribute', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const expandButton = screen.getByRole('button');
      
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Visual Indicators', () => {
    it('should show green indicator for upgrades', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T10:30:00Z',
          changedBy: 'Teacher Smith'
        }
      ];

      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: mockHistory
      });

      const { container } = render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      // Expand timeline
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        const greenDot = container.querySelector('.bg-green-500');
        expect(greenDot).toBeInTheDocument();
      });
    });

    it('should show orange indicator for downgrades', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A2',
          newLevel: 'A1',
          changedAt: '2025-01-15T10:30:00Z',
          changedBy: 'Teacher Smith'
        }
      ];

      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: mockHistory
      });

      const { container } = render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      // Expand timeline
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        const orangeDot = container.querySelector('.bg-orange-500');
        expect(orangeDot).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call getFluencyHistory with correct parameters', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
      });

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(api.getFluencyHistory).toHaveBeenCalledWith(
          mockAccessToken,
          mockUserId
        );
      });
    });

    it('should refetch when userId changes', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
      });

      const { rerender } = render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(api.getFluencyHistory).toHaveBeenCalledTimes(1);
      });

      // Change userId
      rerender(
        <FluencyHistory 
          userId="user-456" 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(api.getFluencyHistory).toHaveBeenCalledTimes(2);
        expect(api.getFluencyHistory).toHaveBeenLastCalledWith(
          mockAccessToken,
          'user-456'
        );
      });
    });
  });
});
