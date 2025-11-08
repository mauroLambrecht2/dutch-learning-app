import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { StudentProfile } from '../StudentProfile';
import { api } from '../../utils/api';

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    getProfile: vi.fn(),
    getProgress: vi.fn(),
    getFluencyLevel: vi.fn(),
    updateFluencyLevel: vi.fn(),
    getCertificates: vi.fn(),
    getFluencyHistory: vi.fn(),
  },
}));

// Mock child components
vi.mock('../FluencyLevelBadge', () => ({
  FluencyLevelBadge: ({ level, showLabel }: any) => (
    <div data-testid="fluency-badge">
      {level} {showLabel && '- Label'}
    </div>
  ),
}));

vi.mock('../FluencyLevelManager', () => ({
  FluencyLevelManager: ({ userId, currentLevel, onLevelChange }: any) => (
    <div data-testid="fluency-manager">
      <span>Manager for {userId}</span>
      <span>Current: {currentLevel}</span>
      <button onClick={() => onLevelChange()}>Change Level</button>
    </div>
  ),
}));

vi.mock('../CertificateGallery', () => ({
  CertificateGallery: ({ userId }: any) => (
    <div data-testid="certificate-gallery">Certificates for {userId}</div>
  ),
}));

vi.mock('../FluencyHistory', () => ({
  FluencyHistory: ({ userId }: any) => (
    <div data-testid="fluency-history">History for {userId}</div>
  ),
}));

describe('StudentProfile - Admin Controls Integration', () => {
  const mockAccessToken = 'mock-token';
  const mockStudentId = 'student-123';

  const mockProfile = {
    id: mockStudentId,
    name: 'Test Student',
    email: 'student@test.com',
    role: 'student',
    fluencyLevel: 'A2',
  };

  const mockProgress = {
    completedLessons: ['lesson1', 'lesson2'],
    vocabulary: ['word1', 'word2', 'word3'],
    streak: 5,
    testsCompleted: 2,
    averageScore: 85,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getProfile as any).mockResolvedValue(mockProfile);
    (api.getProgress as any).mockResolvedValue(mockProgress);
    (api.getCertificates as any).mockResolvedValue({ certificates: [] });
    (api.getFluencyHistory as any).mockResolvedValue({ history: [] });
  });

  describe('Admin Controls Visibility', () => {
    it('should show FluencyLevelManager when viewed by teacher', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('fluency-manager')).toBeInTheDocument();
      });

      expect(screen.getByText('Fluency Level Management')).toBeInTheDocument();
    });

    it('should NOT show FluencyLevelManager when viewed by student', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="student"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Student')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('fluency-manager')).not.toBeInTheDocument();
      expect(screen.queryByText('Fluency Level Management')).not.toBeInTheDocument();
    });

    it('should position admin controls near fluency level display', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('fluency-manager')).toBeInTheDocument();
      });

      // Check that fluency badge is in the header
      const badges = screen.getAllByTestId('fluency-badge');
      expect(badges.length).toBeGreaterThan(0);

      // Check that manager appears before stats
      const manager = screen.getByTestId('fluency-manager');
      const stats = screen.getByText('Day Streak');
      
      // Manager should appear in the DOM before stats
      expect(manager.compareDocumentPosition(stats)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
  });

  describe('Admin Controls Functionality', () => {
    it('should refresh profile data after level change', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('fluency-manager')).toBeInTheDocument();
      });

      // Initial API calls
      expect(api.getProfile).toHaveBeenCalledTimes(1);
      expect(api.getProgress).toHaveBeenCalledTimes(1);

      // Simulate level change
      const changeButton = screen.getByText('Change Level');
      fireEvent.click(changeButton);

      // Should reload data
      await waitFor(() => {
        expect(api.getProfile).toHaveBeenCalledTimes(2);
        expect(api.getProgress).toHaveBeenCalledTimes(2);
      });
    });

    it('should pass correct props to FluencyLevelManager', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('fluency-manager')).toBeInTheDocument();
      });

      expect(screen.getByText(`Manager for ${mockStudentId}`)).toBeInTheDocument();
      expect(screen.getByText('Current: A2')).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    it('should display student information correctly', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Student')).toBeInTheDocument();
      });

      expect(screen.getByText('student@test.com')).toBeInTheDocument();
    });

    it('should display statistics correctly', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Day Streak')).toBeInTheDocument();
      });

      expect(screen.getByText('5')).toBeInTheDocument(); // streak
      expect(screen.getByText('2')).toBeInTheDocument(); // lessons completed
      expect(screen.getByText('3')).toBeInTheDocument(); // words learned
      expect(screen.getByText('85%')).toBeInTheDocument(); // average score
    });

    it('should display certificate gallery', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('certificate-gallery')).toBeInTheDocument();
      });

      expect(screen.getByText(`Certificates for ${mockStudentId}`)).toBeInTheDocument();
    });

    it('should display fluency history', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('fluency-history')).toBeInTheDocument();
      });

      expect(screen.getByText(`History for ${mockStudentId}`)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const onBack = vi.fn();

      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
          onBack={onBack}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Student')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should not show back button when onBack is not provided', async () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Student')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when profile fails to load', async () => {
      (api.getProfile as any).mockRejectedValue(new Error('Failed to load profile'));

      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(
        <StudentProfile
          userId={mockStudentId}
          accessToken={mockAccessToken}
          currentUserRole="teacher"
        />
      );

      expect(screen.getByText('Loading student profile...')).toBeInTheDocument();
    });
  });
});
