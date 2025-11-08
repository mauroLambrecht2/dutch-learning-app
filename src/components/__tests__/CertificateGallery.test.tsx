import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CertificateGallery } from '../CertificateGallery';
import { api } from '../../utils/api';
import type { Certificate } from '../../types/fluency';

// Mock the api module
vi.mock('../../utils/api', () => ({
  api: {
    getCertificates: vi.fn()
  }
}));

// Mock CertificateDisplay component
vi.mock('../CertificateDisplay', () => ({
  CertificateDisplay: ({ certificate, mode, onView }: any) => (
    <div
      data-testid={`certificate-${mode}`}
      data-certificate-id={certificate.id}
      onClick={onView}
    >
      {mode === 'thumbnail' ? (
        <div>Thumbnail: {certificate.level}</div>
      ) : (
        <div>Full: {certificate.userName} - {certificate.level}</div>
      )}
    </div>
  )
}));

describe('CertificateGallery', () => {
  const mockUserId = 'user-123';
  const mockAccessToken = 'token-abc';

  const mockCertificates: Certificate[] = [
    {
      id: 'cert-1',
      userId: 'user-123',
      userName: 'John Doe',
      level: 'A1',
      issuedAt: '2025-01-15T10:00:00Z',
      issuedBy: 'admin-1',
      certificateNumber: 'DLA-2025-A1-000001'
    },
    {
      id: 'cert-2',
      userId: 'user-123',
      userName: 'John Doe',
      level: 'A2',
      issuedAt: '2025-03-20T14:30:00Z',
      issuedBy: 'admin-1',
      certificateNumber: 'DLA-2025-A2-000002'
    },
    {
      id: 'cert-3',
      userId: 'user-123',
      userName: 'John Doe',
      level: 'B1',
      issuedAt: '2025-06-10T09:15:00Z',
      issuedBy: 'admin-2',
      certificateNumber: 'DLA-2025-B1-000003'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching certificates', () => {
      vi.mocked(api.getCertificates).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Network error';
      vi.mocked(api.getCertificates).mockRejectedValue(new Error(errorMessage));

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load certificates')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(api.getCertificates).mockRejectedValue('String error');

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText('Failed to load certificates').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty State', () => {
    it('should display encouraging message when no certificates exist', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({ certificates: [] });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No Certificates Yet')).toBeInTheDocument();
        expect(
          screen.getByText(/Keep learning and practicing/i)
        ).toBeInTheDocument();
        expect(screen.getByText('🎓')).toBeInTheDocument();
      });
    });
  });

  describe('Gallery Display', () => {
    it('should fetch and display certificates on mount', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(api.getCertificates).toHaveBeenCalledWith(mockAccessToken, mockUserId);
      });

      await waitFor(() => {
        expect(screen.getByText('Thumbnail: A1')).toBeInTheDocument();
        expect(screen.getByText('Thumbnail: A2')).toBeInTheDocument();
        expect(screen.getByText('Thumbnail: B1')).toBeInTheDocument();
      });
    });

    it('should display certificates in responsive grid layout', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      const { container } = render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
      });
    });

    it('should render all certificates as thumbnails', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        const thumbnails = screen.getAllByTestId('certificate-thumbnail');
        expect(thumbnails).toHaveLength(3);
      });
    });
  });

  describe('Modal Interaction', () => {
    it('should open modal when certificate thumbnail is clicked', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Thumbnail: A1')).toBeInTheDocument();
      });

      const thumbnails = screen.getAllByTestId('certificate-thumbnail');
      fireEvent.click(thumbnails[0]);

      await waitFor(() => {
        expect(screen.getByTestId('certificate-full')).toBeInTheDocument();
        expect(screen.getByText(/Full: John Doe - A1/)).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      // Open modal
      await waitFor(() => {
        expect(screen.getByText('Thumbnail: A1')).toBeInTheDocument();
      });

      const thumbnails = screen.getAllByTestId('certificate-thumbnail');
      fireEvent.click(thumbnails[0]);

      await waitFor(() => {
        expect(screen.getByTestId('certificate-full')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByLabelText('Close certificate');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('certificate-full')).not.toBeInTheDocument();
      });
    });

    it('should close modal when backdrop is clicked', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      const { container } = render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      // Open modal
      await waitFor(() => {
        expect(screen.getByText('Thumbnail: A1')).toBeInTheDocument();
      });

      const thumbnails = screen.getAllByTestId('certificate-thumbnail');
      fireEvent.click(thumbnails[0]);

      await waitFor(() => {
        expect(screen.getByTestId('certificate-full')).toBeInTheDocument();
      });

      // Click backdrop
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(screen.queryByTestId('certificate-full')).not.toBeInTheDocument();
      });
    });

    it('should not close modal when certificate content is clicked', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      // Open modal
      await waitFor(() => {
        expect(screen.getByText('Thumbnail: A1')).toBeInTheDocument();
      });

      const thumbnails = screen.getAllByTestId('certificate-thumbnail');
      fireEvent.click(thumbnails[0]);

      await waitFor(() => {
        expect(screen.getByTestId('certificate-full')).toBeInTheDocument();
      });

      // Click certificate content
      const certificateContent = screen.getByTestId('certificate-full');
      fireEvent.click(certificateContent);

      // Modal should still be open
      expect(screen.getByTestId('certificate-full')).toBeInTheDocument();
    });
  });

  describe('Multiple Certificates', () => {
    it('should display different certificates when clicking different thumbnails', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Thumbnail: A1')).toBeInTheDocument();
      });

      // Click first certificate
      const thumbnails = screen.getAllByTestId('certificate-thumbnail');
      fireEvent.click(thumbnails[0]);

      await waitFor(() => {
        expect(screen.getByText(/Full: John Doe - A1/)).toBeInTheDocument();
      });

      // Close and open second certificate
      const closeButton = screen.getByLabelText('Close certificate');
      fireEvent.click(closeButton);

      fireEvent.click(thumbnails[1]);

      await waitFor(() => {
        expect(screen.getByText(/Full: John Doe - A2/)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call getCertificates with correct parameters', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(api.getCertificates).toHaveBeenCalledTimes(1);
        expect(api.getCertificates).toHaveBeenCalledWith(mockAccessToken, mockUserId);
      });
    });

    it('should refetch certificates when userId changes', async () => {
      vi.mocked(api.getCertificates).mockResolvedValue({
        certificates: mockCertificates
      });

      const { rerender } = render(
        <CertificateGallery
          userId={mockUserId}
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(api.getCertificates).toHaveBeenCalledTimes(1);
      });

      // Change userId
      rerender(
        <CertificateGallery
          userId="user-456"
          accessToken={mockAccessToken}
        />
      );

      await waitFor(() => {
        expect(api.getCertificates).toHaveBeenCalledTimes(2);
        expect(api.getCertificates).toHaveBeenLastCalledWith(mockAccessToken, 'user-456');
      });
    });
  });
});
