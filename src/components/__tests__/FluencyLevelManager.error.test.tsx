/**
 * Error handling tests for FluencyLevelManager component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FluencyLevelManager } from '../FluencyLevelManager';
import { api } from '../../utils/api';
import { toast } from 'sonner';

vi.mock('../../utils/api');
vi.mock('sonner');

describe('FluencyLevelManager - Error Handling', () => {
  const mockProps = {
    userId: 'user-123',
    currentLevel: 'A2' as const,
    accessToken: 'token-123',
    userRole: 'teacher' as const,
    onLevelChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display error toast when update fails', async () => {
    vi.mocked(api.updateFluencyLevel).mockRejectedValue(
      new Error('Network error')
    );

    render(<FluencyLevelManager {...mockProps} />);
    
    // Click upgrade button
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    // Confirm in dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Level Change')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update fluency level',
        expect.objectContaining({
          description: 'Network error'
        })
      );
    });
  });

  it('should handle unauthorized error', async () => {
    const error: any = new Error('Unauthorized');
    error.status = 401;
    vi.mocked(api.updateFluencyLevel).mockRejectedValue(error);

    render(<FluencyLevelManager {...mockProps} />);
    
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update fluency level',
        expect.objectContaining({
          description: 'Unauthorized'
        })
      );
    });
  });

  it('should handle forbidden error', async () => {
    const error: any = new Error('Admin access required');
    error.status = 403;
    vi.mocked(api.updateFluencyLevel).mockRejectedValue(error);

    render(<FluencyLevelManager {...mockProps} />);
    
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update fluency level',
        expect.objectContaining({
          description: 'Admin access required'
        })
      );
    });
  });

  it('should handle invalid level transition error', async () => {
    vi.mocked(api.updateFluencyLevel).mockRejectedValue(
      new Error('Invalid level transition')
    );

    render(<FluencyLevelManager {...mockProps} />);
    
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update fluency level',
        expect.objectContaining({
          description: 'Invalid level transition'
        })
      );
    });
  });

  it('should handle generic error with fallback message', async () => {
    vi.mocked(api.updateFluencyLevel).mockRejectedValue('Unknown error');

    render(<FluencyLevelManager {...mockProps} />);
    
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update fluency level',
        expect.objectContaining({
          description: 'Please try again'
        })
      );
    });
  });

  it('should not call onLevelChange when update fails', async () => {
    vi.mocked(api.updateFluencyLevel).mockRejectedValue(
      new Error('Network error')
    );

    const onLevelChange = vi.fn();
    render(<FluencyLevelManager {...mockProps} onLevelChange={onLevelChange} />);
    
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(onLevelChange).not.toHaveBeenCalled();
  });

  it('should reset updating state after error', async () => {
    vi.mocked(api.updateFluencyLevel).mockRejectedValue(
      new Error('Network error')
    );

    render(<FluencyLevelManager {...mockProps} />);
    
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Should be able to try again
    expect(upgradeButton).not.toBeDisabled();
  });

  it('should close confirmation dialog after error', async () => {
    vi.mocked(api.updateFluencyLevel).mockRejectedValue(
      new Error('Network error')
    );

    render(<FluencyLevelManager {...mockProps} />);
    
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Level Change')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Dialog should be closed
    expect(screen.queryByText('Confirm Level Change')).not.toBeInTheDocument();
  });
});
