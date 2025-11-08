import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FluencyHistory } from '../FluencyHistory';
import { api } from '../../utils/api';
import type { FluencyHistoryEntry } from '../../types/fluency';

/**
 * Verification Tests for FluencyHistory Component
 * 
 * These tests verify that the component meets all requirements from the spec:
 * - Requirement 5.1: Records level changes in history log
 * - Requirement 5.2: Displays all level changes with dates
 * - Requirement 5.3: Shows which admin made each change
 * - Requirement 5.4: Displays history in reverse chronological order
 * - Requirement 5.5: Shows initial A1 assignment if no changes exist
 */

vi.mock('../../utils/api', () => ({
  api: {
    getFluencyHistory: vi.fn()
  }
}));

describe('FluencyHistory - Requirements Verification', () => {
  const mockUserId = 'user-123';
  const mockAccessToken = 'token-abc';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 5.1: Records level changes in history log', () => {
    it('should fetch and display history entries from the API', async () => {
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
        expect(api.getFluencyHistory).toHaveBeenCalledWith(
          mockAccessToken,
          mockUserId
        );
      });

      // Expand to verify content
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Upgraded from/i)).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 5.2: Displays all level changes with dates', () => {
    it('should display all history entries with formatted dates', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A2',
          newLevel: 'B1',
          changedAt: '2025-02-20T14:30:00Z',
          changedBy: 'Teacher Johnson'
        },
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T10:00:00Z',
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
        expect(screen.getByText('2 level changes')).toBeInTheDocument();
      });

      // Expand timeline
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        // Both dates should be displayed
        expect(screen.getByText(/February 20, 2025/i)).toBeInTheDocument();
        expect(screen.getByText(/January 15, 2025/i)).toBeInTheDocument();
      });
    });

    it('should display both date and time for each entry', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-15T14:30:00Z',
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
        // Date should be present
        expect(screen.getByText(/January 15, 2025/i)).toBeInTheDocument();
        // Time should also be present (format may vary)
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
        expect(timeElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Requirement 5.3: Shows which admin made each change', () => {
    it('should display admin name for each history entry', async () => {
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
          previousLevel: 'A2',
          newLevel: 'B1',
          changedAt: '2025-02-10T11:15:00Z',
          changedBy: 'Teacher Johnson'
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
        expect(screen.getByText(/Changed by:.*Teacher Smith/i)).toBeInTheDocument();
        expect(screen.getByText(/Changed by:.*Teacher Johnson/i)).toBeInTheDocument();
      });
    });

    it('should display System as admin for initial assignments', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
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

      // Expand timeline
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Changed by:.*System/i)).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 5.4: Displays history in reverse chronological order', () => {
    it('should display most recent changes first', async () => {
      const mockHistory: FluencyHistoryEntry[] = [
        {
          userId: mockUserId,
          previousLevel: 'B1',
          newLevel: 'B2',
          changedAt: '2025-03-01T10:00:00Z',
          changedBy: 'Teacher Johnson'
        },
        {
          userId: mockUserId,
          previousLevel: 'A2',
          newLevel: 'B1',
          changedAt: '2025-02-01T10:00:00Z',
          changedBy: 'Teacher Smith'
        },
        {
          userId: mockUserId,
          previousLevel: 'A1',
          newLevel: 'A2',
          changedAt: '2025-01-01T10:00:00Z',
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
        const dates = screen.getAllByText(/\w+ \d{1,2}, \d{4}/);
        // Most recent date (March) should appear before older dates
        const marchIndex = dates.findIndex(el => el.textContent?.includes('March'));
        const februaryIndex = dates.findIndex(el => el.textContent?.includes('February'));
        const januaryIndex = dates.findIndex(el => el.textContent?.includes('January'));
        
        expect(marchIndex).toBeLessThan(februaryIndex);
        expect(februaryIndex).toBeLessThan(januaryIndex);
      });
    });
  });

  describe('Requirement 5.5: Shows initial A1 assignment if no changes exist', () => {
    it('should display initial A1 assignment message when history is empty', async () => {
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
        expect(screen.getByText('Initial level assignment')).toBeInTheDocument();
      });

      // Expand to see full content
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Initial Level')).toBeInTheDocument();
        expect(screen.getByText(/Started at.*Beginner.*level/i)).toBeInTheDocument();
      });
    });

    it('should show A1 badge in initial assignment display', async () => {
      vi.mocked(api.getFluencyHistory).mockResolvedValue({
        history: []
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
        // Should contain A1 badge
        expect(screen.getByText('A1')).toBeInTheDocument();
      });
    });
  });

  describe('Additional Functionality', () => {
    it('should be collapsible to save space', async () => {
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

      // Should start collapsed
      expect(screen.queryByText('Initial Level')).not.toBeInTheDocument();

      // Should expand when clicked
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Initial Level')).toBeInTheDocument();
      });
    });

    it('should display visual indicators for level changes', async () => {
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
        // Should have timeline dots
        const timelineDots = container.querySelectorAll('.rounded-full');
        expect(timelineDots.length).toBeGreaterThan(0);
      });
    });

    it('should handle loading state gracefully', () => {
      vi.mocked(api.getFluencyHistory).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      // Should show loading spinner
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(api.getFluencyHistory).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <FluencyHistory 
          userId={mockUserId} 
          accessToken={mockAccessToken} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load history')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });
});

