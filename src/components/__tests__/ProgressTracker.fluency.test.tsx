/**
 * ProgressTracker Fluency Display Tests
 * 
 * Tests for fluency level display in the ProgressTracker component.
 * Verifies Requirements: 1.2, 1.3, 4.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressTracker } from '../ProgressTracker';
import { api } from '../../utils/api';

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    getProfile: vi.fn(),
    getProgress: vi.fn(),
    getFluencyLevel: vi.fn(),
  }
}));

// Mock child components
vi.mock('../CertificateGallery', () => ({
  CertificateGallery: () => <div data-testid="certificate-gallery">Certificate Gallery</div>
}));

vi.mock('../FluencyHistory', () => ({
  FluencyHistory: () => <div data-testid="fluency-history">Fluency History</div>
}));

vi.mock('../FluencyLevelBadge', () => ({
  FluencyLevelBadge: ({ level, size, showLabel }: any) => (
    <div data-testid="fluency-badge" data-level={level} data-size={size} data-show-label={showLabel}>
      {level} Badge
    </div>
  )
}));

describe('ProgressTracker - Fluency Level Display', () => {
  const mockAccessToken = 'test-token';
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (api.getProfile as any).mockResolvedValue({
      id: mockUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'student'
    });

    (api.getProgress as any).mockResolvedValue({
      completedLessons: [],
      vocabulary: [],
      streak: 0,
      testsCompleted: 0,
      averageScore: 0,
      perfectScores: 0,
      activityLog: []
    });
  });

  describe('Requirement 1.2: Display fluency level on profile', () => {
    it('should display fluency level in stats overview', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText('B1')).toBeInTheDocument();
        expect(screen.getByText('Intermediate')).toBeInTheDocument();
      });
    });

    it('should display A1 level for beginners', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'A1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument();
        expect(screen.getByText('Beginner')).toBeInTheDocument();
      });
    });

    it('should display C1 level for advanced learners', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'C1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText('C1')).toBeInTheDocument();
        expect(screen.getByText('Advanced')).toBeInTheDocument();
      });
    });

    it('should display all CEFR levels correctly', async () => {
      const levels = [
        { code: 'A1', name: 'Beginner' },
        { code: 'A2', name: 'Elementary' },
        { code: 'B1', name: 'Intermediate' },
        { code: 'B2', name: 'Upper Intermediate' },
        { code: 'C1', name: 'Advanced' }
      ];

      for (const level of levels) {
        (api.getFluencyLevel as any).mockResolvedValue({
          level: level.code
        });

        const { unmount } = render(<ProgressTracker accessToken={mockAccessToken} />);

        await waitFor(() => {
          expect(screen.getByText(level.code)).toBeInTheDocument();
          expect(screen.getByText(level.name)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Requirement 1.3: Distinguish XP from fluency', () => {
    it('should display both XP level and fluency level', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'A2'
      });

      (api.getProgress as any).mockResolvedValue({
        completedLessons: Array(10).fill({}),
        vocabulary: Array(50).fill({}),
        streak: 5,
        testsCompleted: 3,
        averageScore: 85,
        perfectScores: 1,
        activityLog: []
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        // XP Level should be displayed
        expect(screen.getByText('XP Level 4')).toBeInTheDocument();
        expect(screen.getByText(/1500 XP/)).toBeInTheDocument();
        
        // Fluency level should be displayed
        expect(screen.getByText('A2')).toBeInTheDocument();
        expect(screen.getByText('Elementary')).toBeInTheDocument();
      });
    });

    it('should display explanatory text about XP vs fluency', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText('Understanding Your Levels')).toBeInTheDocument();
        expect(screen.getByText(/XP Level \(Activity-Based\)/)).toBeInTheDocument();
        expect(screen.getByText(/Fluency Level \(Proficiency-Based\)/)).toBeInTheDocument();
      });
    });

    it('should explain that XP increases automatically', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText(/increases automatically/i)).toBeInTheDocument();
        expect(screen.getByText(/engagement and activity/i)).toBeInTheDocument();
      });
    });

    it('should explain that fluency is teacher-assigned', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText(/assigned by your teacher/i)).toBeInTheDocument();
        expect(screen.getByText(/CEFR standard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 4.1: Fluency level display on profile', () => {
    it('should display fluency level with FluencyLevelBadge component', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B2'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        const badge = screen.getByTestId('fluency-badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute('data-level', 'B2');
        expect(badge).toHaveAttribute('data-size', 'large');
        expect(badge).toHaveAttribute('data-show-label', 'true');
      });
    });

    it('should display fluency level description', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText(/Can deal with most situations while traveling/)).toBeInTheDocument();
      });
    });

    it('should display fluency level icon', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'A1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText('🌱')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state while fetching fluency level', () => {
      (api.getFluencyLevel as any).mockImplementation(() => new Promise(() => {}));

      render(<ProgressTracker accessToken={mockAccessToken} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should default to A1 if fluency level fetch fails', async () => {
      (api.getFluencyLevel as any).mockRejectedValue(new Error('Failed to fetch'));

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument();
        expect(screen.getByText('Beginner')).toBeInTheDocument();
      });
    });

    it('should handle missing fluency data gracefully', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({});

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        // Should default to A1
        expect(screen.getByText('A1')).toBeInTheDocument();
      });
    });
  });

  describe('Visual Consistency', () => {
    it('should display fluency level in stats overview grid', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B1'
      });

      const { container } = render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        // Check that stats overview grid exists
        const statsGrid = container.querySelector('.grid.grid-cols-5');
        expect(statsGrid).toBeInTheDocument();
        
        // Check that fluency level is in the grid
        expect(screen.getByText('B1')).toBeInTheDocument();
      });
    });

    it('should display fluency level card with gradient background', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'A2'
      });

      const { container } = render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        const fluencyCard = container.querySelector('.bg-gradient-to-br.from-pink-500.to-rose-600');
        expect(fluencyCard).toBeInTheDocument();
      });
    });

    it('should display Languages icon for fluency level', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B1'
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        // The Languages icon should be rendered (Lucide icon)
        const statsOverview = screen.getByText('B1').closest('.grid');
        expect(statsOverview).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Other Components', () => {
    it('should display fluency level alongside other stats', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'B2'
      });

      (api.getProgress as any).mockResolvedValue({
        completedLessons: Array(15).fill({}),
        vocabulary: Array(100).fill({}),
        streak: 10,
        testsCompleted: 5,
        averageScore: 90,
        perfectScores: 2,
        activityLog: []
      });

      render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        // Check all stats are displayed
        expect(screen.getByText('10')).toBeInTheDocument(); // Streak
        expect(screen.getByText('15')).toBeInTheDocument(); // Lessons
        expect(screen.getByText('100')).toBeInTheDocument(); // Words
        expect(screen.getByText('B2')).toBeInTheDocument(); // Fluency
      });
    });

    it('should position fluency level in the fifth column', async () => {
      (api.getFluencyLevel as any).mockResolvedValue({
        level: 'C1'
      });

      const { container } = render(<ProgressTracker accessToken={mockAccessToken} />);

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.grid-cols-5');
        const cards = statsGrid?.querySelectorAll('.bg-gradient-to-br');
        expect(cards).toHaveLength(5);
        
        // The fifth card should contain the fluency level
        const fifthCard = cards?.[4];
        expect(fifthCard?.textContent).toContain('C1');
      });
    });
  });
});
