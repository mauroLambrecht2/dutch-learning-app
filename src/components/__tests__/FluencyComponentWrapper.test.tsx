/**
 * Tests for FluencyComponentWrapper component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FluencyComponentWrapper } from '../FluencyComponentWrapper';
import { toast } from 'sonner';

vi.mock('sonner');

// Component that throws an error
function ThrowError() {
  throw new Error('Component error');
}

describe('FluencyComponentWrapper', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    render(
      <FluencyComponentWrapper>
        <div>Test content</div>
      </FluencyComponentWrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render fallback UI when error occurs', () => {
    render(
      <FluencyComponentWrapper>
        <ThrowError />
      </FluencyComponentWrapper>
    );

    expect(screen.getByText(/Unable to display fluency information/)).toBeInTheDocument();
    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
  });

  it('should render custom fallback message', () => {
    render(
      <FluencyComponentWrapper fallbackMessage="Custom error message">
        <ThrowError />
      </FluencyComponentWrapper>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call toast.error when error occurs', () => {
    render(
      <FluencyComponentWrapper>
        <ThrowError />
      </FluencyComponentWrapper>
    );

    expect(toast.error).toHaveBeenCalledWith(
      'Component Error',
      expect.objectContaining({
        description: 'Component error'
      })
    );
  });

  it('should log error to console', () => {
    const consoleError = vi.fn();
    console.error = consoleError;

    render(
      <FluencyComponentWrapper>
        <ThrowError />
      </FluencyComponentWrapper>
    );

    expect(consoleError).toHaveBeenCalledWith(
      'Fluency component error:',
      expect.any(Error)
    );
  });

  it('should display warning icon in fallback', () => {
    const { container } = render(
      <FluencyComponentWrapper>
        <ThrowError />
      </FluencyComponentWrapper>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have yellow/warning styling in fallback', () => {
    const { container } = render(
      <FluencyComponentWrapper>
        <ThrowError />
      </FluencyComponentWrapper>
    );

    const fallbackDiv = container.querySelector('.bg-yellow-50');
    expect(fallbackDiv).toBeInTheDocument();
  });
});
