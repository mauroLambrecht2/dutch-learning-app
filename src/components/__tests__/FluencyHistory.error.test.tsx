/**
 * Error handling tests for FluencyHistory component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FluencyHistory } from '../FluencyHistory';
import { api } from '../../utils/api';

vi.mock('../../utils/api');

describe('FluencyHistory - Error Handling', () => {
  const mockProps = {
    userId: 'user-123',
    accessToken: 'token-123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(api.getFluencyHistory).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<FluencyHistory {...mockProps} />);
    
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error message when API call fails', async () => {
    vi.mocked(api.getFluencyHistory).mockRejectedValue(
      new Error('Network error')
    );

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display retry button on error', async () => {
    vi.mocked(api.getFluencyHistory).mockRejectedValue(
      new Error('Network error')
    );

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry API call when retry button is clicked', async () => {
    let callCount = 0;
    vi.mocked(api.getFluencyHistory).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network error');
      }
      return { history: [] };
    });

    render(<FluencyHistory {...mockProps} />);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Should show loading state
    expect(screen.getByText('Loading history...')).toBeInTheDocument();

    // Should eventually show collapsed history
    await waitFor(() => {
      expect(screen.getByText('Fluency Level History')).toBeInTheDocument();
    });

    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty history gracefully', async () => {
    vi.mocked(api.getFluencyHistory).mockResolvedValue({
      history: []
    });

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Fluency Level History')).toBeInTheDocument();
      expect(screen.getByText('Initial level assignment')).toBeInTheDocument();
    });
  });

  it('should handle null history array', async () => {
    vi.mocked(api.getFluencyHistory).mockResolvedValue({
      history: null as any
    });

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Fluency Level History')).toBeInTheDocument();
    });
  });

  it('should handle undefined history array', async () => {
    vi.mocked(api.getFluencyHistory).mockResolvedValue({} as any);

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Fluency Level History')).toBeInTheDocument();
    });
  });

  it('should display generic error message for unknown errors', async () => {
    vi.mocked(api.getFluencyHistory).mockRejectedValue('Unknown error');

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });
  });

  it('should handle timeout errors', async () => {
    vi.mocked(api.getFluencyHistory).mockRejectedValue(
      new Error('Request timeout')
    );

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Request timeout')).toBeInTheDocument();
    });
  });

  it('should handle server errors', async () => {
    const error: any = new Error('Internal server error');
    error.status = 500;
    vi.mocked(api.getFluencyHistory).mockRejectedValue(error);

    render(<FluencyHistory {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Internal server error')).toBeInTheDocument();
    });
  });
});
