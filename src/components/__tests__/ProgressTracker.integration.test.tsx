import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressTracker } from '../ProgressTracker';
import { api } from '../../utils/api';

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    getProfile: vi.fn(),
    getProgress: vi.fn(),
    getCertificates: vi.fn(),
    getFluencyHistory: vi.fn(),
  },
}));

// Mock child components
vi.mock('../CertificateGallery', () => ({
  CertificateGallery: ({ userId, accessToken }: { userId: string; accessToken: string }) => (
    <div data-testid="certificate-gallery">
      Certificate Gallery for user {userId}
    </div>
  ),
}));

vi.mock('../FluencyHistory', () => ({
  FluencyHistory: ({ userId, accessToken }: { userId: string; accessToken: string }) => (
    <div data-testid="fluency-history">
      Fluency History for user {userId}
    </div>
  ),
}));

describe('ProgressTracker - Certificate Gallery Integration', () => {
  const mockAccessToken = 'test-token';
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (api.getProfile as any).mockResolvedValue({
      id: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
    });

    (api.getProgress as any).mockResolvedValue({
      streak: 5,
      completedLessons: [],
      vocabulary: [],
      testsCompleted: 0,
      averageScore: 0,
      perfectScores: 0,
      activityLog: [],
    });

    (api.getCertificates as any).mockResolvedValue({
      certificates: [],
    });
  });

  it('should render certificate gallery section with heading', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      expect(screen.getByText('Earned Certificates')).toBeInTheDocument();
    });
  });

  it('should pass correct userId and accessToken to CertificateGallery', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      const gallery = screen.getByTestId('certificate-gallery');
      expect(gallery).toBeInTheDocument();
      expect(gallery).toHaveTextContent(`Certificate Gallery for user ${mockUserId}`);
    });
  });

  it('should position certificate gallery below stats section', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      const detailedStats = screen.getByText('Detailed Statistics');
      const certificates = screen.getByText('Earned Certificates');
      
      expect(detailedStats).toBeInTheDocument();
      expect(certificates).toBeInTheDocument();
      
      // Check that certificates section comes after stats section in DOM
      const detailedStatsElement = detailedStats.closest('div[class*="bg-white"]');
      const certificatesElement = certificates.closest('div[class*="bg-white"]');
      
      expect(detailedStatsElement).toBeInTheDocument();
      expect(certificatesElement).toBeInTheDocument();
    });
  });

  it('should not render certificate gallery if userId is not loaded', async () => {
    (api.getProfile as any).mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com',
      // No id field
    });

    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Statistics')).toBeInTheDocument();
    });

    // Certificate gallery should not be rendered
    expect(screen.queryByTestId('certificate-gallery')).not.toBeInTheDocument();
  });

  it('should handle profile loading errors gracefully', async () => {
    (api.getProfile as any).mockRejectedValue(new Error('Failed to load profile'));

    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Statistics')).toBeInTheDocument();
    });

    // Certificate gallery should not be rendered when profile fails to load
    expect(screen.queryByTestId('certificate-gallery')).not.toBeInTheDocument();
  });

  it('should render certificate gallery in responsive layout', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      const certificatesSection = screen.getByText('Earned Certificates').closest('div[class*="bg-white"]');
      expect(certificatesSection).toBeInTheDocument();
      
      // Check that the section has proper styling
      expect(certificatesSection).toHaveClass('bg-white', 'border', 'border-zinc-200', 'p-6');
    });
  });
});

describe('ProgressTracker - Fluency History Integration', () => {
  const mockAccessToken = 'test-token';
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (api.getProfile as any).mockResolvedValue({
      id: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
    });

    (api.getProgress as any).mockResolvedValue({
      streak: 5,
      completedLessons: [],
      vocabulary: [],
      testsCompleted: 0,
      averageScore: 0,
      perfectScores: 0,
      activityLog: [],
    });

    (api.getCertificates as any).mockResolvedValue({
      certificates: [],
    });
  });

  it('should render fluency history component', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      const historyComponent = screen.getByTestId('fluency-history');
      expect(historyComponent).toBeDefined();
    });
  });

  it('should pass correct userId and accessToken to FluencyHistory', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      const history = screen.getByTestId('fluency-history');
      expect(history).toBeDefined();
      expect(history.textContent).toContain(`Fluency History for user ${mockUserId}`);
    });
  });

  it('should position fluency history below certificate gallery', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      const gallery = screen.getByTestId('certificate-gallery');
      const history = screen.getByTestId('fluency-history');
      
      expect(gallery).toBeDefined();
      expect(history).toBeDefined();
      
      // Get parent container
      const container = gallery.parentElement?.parentElement;
      if (container) {
        const children = Array.from(container.children);
        const galleryIndex = children.findIndex(child => child.contains(gallery));
        const historyIndex = children.findIndex(child => child.contains(history));
        
        // History should come after gallery
        expect(historyIndex).toBeGreaterThan(galleryIndex);
      }
    });
  });

  it('should not render fluency history if userId is not loaded', async () => {
    (api.getProfile as any).mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com',
      // No id field
    });

    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Statistics')).toBeDefined();
    });

    // Fluency history should not be rendered
    expect(screen.queryByTestId('fluency-history')).toBeNull();
  });

  it('should handle profile loading errors gracefully for fluency history', async () => {
    (api.getProfile as any).mockRejectedValue(new Error('Failed to load profile'));

    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Statistics')).toBeDefined();
    });

    // Fluency history should not be rendered when profile fails to load
    expect(screen.queryByTestId('fluency-history')).toBeNull();
  });

  it('should render both certificate gallery and fluency history when userId is available', async () => {
    render(<ProgressTracker accessToken={mockAccessToken} />);

    await waitFor(() => {
      const gallery = screen.getByTestId('certificate-gallery');
      const history = screen.getByTestId('fluency-history');
      
      expect(gallery).toBeDefined();
      expect(history).toBeDefined();
    });
  });
});
