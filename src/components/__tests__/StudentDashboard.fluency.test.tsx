import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StudentDashboard } from '../StudentDashboard';
import { api } from '../../utils/api';

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    getDays: vi.fn(),
    getClasses: vi.fn(),
    getProgress: vi.fn(),
    getProfile: vi.fn(),
    saveProgress: vi.fn(),
  },
}));

// Mock UI components
vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('../ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
}));

// Mock child components
vi.mock('../ClassPlayer', () => ({
  ClassPlayer: () => <div data-testid="class-player">Class Player</div>,
}));

vi.mock('../ProgressTracker', () => ({
  ProgressTracker: () => <div data-testid="progress-tracker">Progress Tracker</div>,
}));

vi.mock('../MistakeBank', () => ({
  MistakeBank: () => <div data-testid="mistake-bank">Mistake Bank</div>,
}));

vi.mock('../SpacedRepetition', () => ({
  SpacedRepetition: () => <div data-testid="spaced-repetition">Spaced Repetition</div>,
}));

vi.mock('../VocabularyList', () => ({
  VocabularyList: () => <div data-testid="vocabulary-list">Vocabulary List</div>,
}));

vi.mock('../FluencyLevelBadge', () => ({
  FluencyLevelBadge: ({ level, size, showLabel }: any) => (
    <div data-testid="fluency-badge" data-level={level} data-size={size} data-show-label={showLabel}>
      Fluency: {level}
    </div>
  ),
}));

describe('StudentDashboard - Fluency Level Integration', () => {
  const mockAccessToken = 'test-access-token';
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (api.getDays as any).mockResolvedValue({ days: [] });
    (api.getClasses as any).mockResolvedValue({ classes: [] });
    (api.getProgress as any).mockResolvedValue({
      progress: [],
      streak: 5,
      completedLessons: [],
      testsCompleted: 0,
      averageScore: 0,
      totalXP: 0,
      vocabulary: [],
    });
    (api.getProfile as any).mockResolvedValue({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      fluencyLevel: 'A2',
    });
  });

  it('should fetch and display user fluency level on mount', async () => {
    render(<StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(api.getProfile).toHaveBeenCalledWith(mockAccessToken);
    });

    await waitFor(() => {
      const badge = screen.getByTestId('fluency-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-level', 'A2');
    });
  });

  it('should display fluency level badge with correct props', async () => {
    render(<StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />);

    await waitFor(() => {
      const badge = screen.getByTestId('fluency-badge');
      expect(badge).toHaveAttribute('data-size', 'medium');
      expect(badge).toHaveAttribute('data-show-label', 'true');
    });
  });

  it('should display fluency level badge prominently in header', async () => {
    render(<StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />);

    await waitFor(() => {
      const badge = screen.getByTestId('fluency-badge');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toContain('A2');
    });

    // Verify it's in the header section (near the title)
    const header = screen.getByText('Dutch Learning').closest('div');
    expect(header).toContainElement(screen.getByTestId('fluency-badge'));
  });

  it('should default to A1 if fluency level is not provided', async () => {
    (api.getProfile as any).mockResolvedValue({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      // No fluencyLevel provided
    });

    render(<StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />);

    await waitFor(() => {
      const badge = screen.getByTestId('fluency-badge');
      expect(badge).toHaveAttribute('data-level', 'A1');
    });
  });

  it('should handle different fluency levels correctly', async () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

    for (const level of levels) {
      vi.clearAllMocks();
      (api.getProfile as any).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        fluencyLevel: level,
      });

      const { unmount } = render(
        <StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />
      );

      await waitFor(() => {
        const badge = screen.getByTestId('fluency-badge');
        expect(badge).toHaveAttribute('data-level', level);
      });

      unmount();
    }
  });

  it('should handle profile fetch errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (api.getProfile as any).mockRejectedValue(new Error('Failed to fetch profile'));

    render(<StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to load user profile:',
        expect.any(Error)
      );
    });

    // Should still display default A1 level
    await waitFor(() => {
      const badge = screen.getByTestId('fluency-badge');
      expect(badge).toHaveAttribute('data-level', 'A1');
    });

    consoleError.mockRestore();
  });

  it('should position fluency level separate from XP level display', async () => {
    render(<StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />);

    await waitFor(() => {
      const fluencyBadge = screen.getByTestId('fluency-badge');
      const streakDisplay = screen.getByText('Day Streak');
      
      // Fluency badge should be in header, streak should be in stats section
      expect(fluencyBadge).toBeInTheDocument();
      expect(streakDisplay).toBeInTheDocument();
      
      // They should not be in the same parent container
      const fluencyParent = fluencyBadge.closest('div');
      const streakParent = streakDisplay.closest('div');
      expect(fluencyParent).not.toBe(streakParent);
    });
  });

  it('should display fluency level on initial page load', async () => {
    render(<StudentDashboard accessToken={mockAccessToken} onLogout={mockOnLogout} />);

    // Verify API calls are made
    await waitFor(() => {
      expect(api.getProfile).toHaveBeenCalledTimes(1);
      expect(api.getDays).toHaveBeenCalledTimes(1);
      expect(api.getClasses).toHaveBeenCalledTimes(1);
      expect(api.getProgress).toHaveBeenCalledTimes(1);
    });

    // Verify fluency badge is displayed
    await waitFor(() => {
      expect(screen.getByTestId('fluency-badge')).toBeInTheDocument();
    });
  });
});
