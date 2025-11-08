/**
 * Error handling tests for CertificateGallery component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CertificateGallery } from '../CertificateGallery';
import { api } from '../../utils/api';

vi.mock('../../utils/api');

describe('CertificateGallery - Error Handling', () => {
  const mockProps = {
    userId: 'user-123',
    accessToken: 'token-123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(api.getCertificates).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<CertificateGallery {...mockProps} />);
    
    expect(screen.getByText('Loading certificates...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error message when API call fails', async () => {
    vi.mocked(api.getCertificates).mockRejectedValue(
      new Error('Network error')
    );

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load certificates')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display retry button on error', async () => {
    vi.mocked(api.getCertificates).mockRejectedValue(
      new Error('Network error')
    );

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry API call when retry button is clicked', async () => {
    let callCount = 0;
    vi.mocked(api.getCertificates).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network error');
      }
      return { certificates: [] };
    });

    render(<CertificateGallery {...mockProps} />);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Should show loading state
    expect(screen.getByText('Loading certificates...')).toBeInTheDocument();

    // Should eventually show empty state
    await waitFor(() => {
      expect(screen.getByText('No Certificates Yet')).toBeInTheDocument();
    });

    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty response gracefully', async () => {
    vi.mocked(api.getCertificates).mockResolvedValue({
      certificates: []
    });

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No Certificates Yet')).toBeInTheDocument();
    });
  });

  it('should handle null certificates array', async () => {
    vi.mocked(api.getCertificates).mockResolvedValue({
      certificates: null as any
    });

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No Certificates Yet')).toBeInTheDocument();
    });
  });

  it('should handle undefined certificates array', async () => {
    vi.mocked(api.getCertificates).mockResolvedValue({} as any);

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No Certificates Yet')).toBeInTheDocument();
    });
  });

  it('should display generic error message for unknown errors', async () => {
    vi.mocked(api.getCertificates).mockRejectedValue('Unknown error');

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load certificates')).toBeInTheDocument();
    });
  });

  it('should handle 401 unauthorized error', async () => {
    const error: any = new Error('Unauthorized');
    error.status = 401;
    vi.mocked(api.getCertificates).mockRejectedValue(error);

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
  });

  it('should handle 403 forbidden error', async () => {
    const error: any = new Error('Forbidden');
    error.status = 403;
    vi.mocked(api.getCertificates).mockRejectedValue(error);

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });

  it('should handle 404 not found error', async () => {
    const error: any = new Error('User not found');
    error.status = 404;
    vi.mocked(api.getCertificates).mockRejectedValue(error);

    render(<CertificateGallery {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});
