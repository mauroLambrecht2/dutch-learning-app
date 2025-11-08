/**
 * Tests for ErrorDisplay component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  it('should render error message', () => {
    render(<ErrorDisplay message="Something went wrong" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render default title', () => {
    render(<ErrorDisplay message="Test error" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render custom title', () => {
    render(<ErrorDisplay title="Custom Error" message="Test error" />);
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay message="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorDisplay message="Test error" />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay message="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ErrorDisplay message="Test error" className="custom-class" />
    );
    
    const errorDiv = container.firstChild;
    expect(errorDiv).toHaveClass('custom-class');
  });

  it('should have error icon', () => {
    const { container } = render(<ErrorDisplay message="Test error" />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
