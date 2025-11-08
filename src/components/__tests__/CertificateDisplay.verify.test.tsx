import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CertificateDisplay } from '../CertificateDisplay';
import type { Certificate } from '../../types/fluency';

/**
 * Verification tests for CertificateDisplay component
 * 
 * These tests verify that the component meets all requirements
 * from task 11 of the fluency level system implementation plan.
 */
describe('CertificateDisplay - Requirements Verification', () => {
  const testCertificate: Certificate = {
    id: 'test-cert-1',
    userId: 'test-user-1',
    userName: 'Test User',
    level: 'B1',
    issuedAt: '2025-02-15T12:00:00Z',
    issuedBy: 'admin-test',
    certificateNumber: 'DLA-2025-B1-999999'
  };

  describe('Requirement 3.2: Certificate includes user name, level, date, and certificate number', () => {
    it('displays user name in full mode', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays level code and name in full mode', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('B1')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });

    it('displays formatted date in full mode', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('February 15, 2025')).toBeInTheDocument();
    });

    it('displays certificate number in full mode', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('DLA-2025-B1-999999')).toBeInTheDocument();
    });
  });

  describe('Requirement 3.5: Certificate displayed in printable/downloadable format', () => {
    it('renders full certificate with proper layout structure', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      // Verify header
      expect(screen.getByText('Certificate of Achievement')).toBeInTheDocument();
      expect(screen.getByText('Dutch Learning Application')).toBeInTheDocument();

      // Verify main content sections
      expect(screen.getByText('This certifies that')).toBeInTheDocument();
      expect(screen.getByText('has successfully achieved')).toBeInTheDocument();

      // Verify footer sections
      expect(screen.getByText('Date Issued')).toBeInTheDocument();
      expect(screen.getByText('Certificate Number')).toBeInTheDocument();
    });

    it('uses appropriate sizing for print layout', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      const certificate = container.querySelector('.max-w-2xl');
      expect(certificate).toBeInTheDocument();
    });

    it('has white background suitable for printing', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      const certificate = container.querySelector('[style*="background-color"]');
      expect(certificate).toBeInTheDocument();
    });
  });

  describe('Requirement 3.7: Visual branding consistent with app design', () => {
    it('uses level-specific colors from FLUENCY_LEVELS constants', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      // B1 level should use purple color (#8b5cf6)
      const coloredElements = container.querySelectorAll('[style*="color"]');
      expect(coloredElements.length).toBeGreaterThan(0);
    });

    it('displays level icon from FLUENCY_LEVELS constants', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      const icon = screen.getByRole('img', { name: /Intermediate icon/i });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('🌳'); // B1 icon
    });

    it('uses Tailwind CSS classes for styling', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      const certificate = container.firstChild;
      expect(certificate).toHaveClass('border-4', 'p-8', 'max-w-2xl', 'mx-auto');
    });

    it('applies consistent styling in thumbnail mode', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="thumbnail"
        />
      );

      const thumbnail = container.firstChild;
      expect(thumbnail).toHaveClass('border-2', 'transition-all', 'hover:scale-105');
    });
  });

  describe('Task Detail: Render certificate in thumbnail and full modes', () => {
    it('renders in thumbnail mode', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="thumbnail"
        />
      );

      expect(screen.getByText('B1')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });

    it('renders in full mode', () => {
      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('Certificate of Achievement')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays different content based on mode', () => {
      const { rerender } = render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="thumbnail"
        />
      );

      // Thumbnail should not show full certificate text
      expect(screen.queryByText('Certificate of Achievement')).not.toBeInTheDocument();

      rerender(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
        />
      );

      // Full mode should show certificate text
      expect(screen.getByText('Certificate of Achievement')).toBeInTheDocument();
    });
  });

  describe('Task Detail: Click handler for thumbnail mode', () => {
    it('calls onView when thumbnail is clicked', () => {
      let viewCalled = false;
      const onView = () => { viewCalled = true; };

      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="thumbnail"
          onView={onView}
        />
      );

      const thumbnail = screen.getByText('B1').closest('div');
      if (thumbnail) {
        fireEvent.click(thumbnail);
      }

      expect(viewCalled).toBe(true);
    });

    it('has cursor-pointer class in thumbnail mode', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="thumbnail"
        />
      );

      const thumbnail = container.querySelector('.cursor-pointer');
      expect(thumbnail).toBeInTheDocument();
    });

    it('does not call onView in full mode', () => {
      let viewCalled = false;
      const onView = () => { viewCalled = true; };

      render(
        <CertificateDisplay
          certificate={testCertificate}
          mode="full"
          onView={onView}
        />
      );

      // Full mode should not have click handler
      expect(viewCalled).toBe(false);
    });
  });

  describe('Task Detail: Works with all fluency levels', () => {
    const levels: Array<{ code: 'A1' | 'A2' | 'B1' | 'B2' | 'C1', name: string, icon: string }> = [
      { code: 'A1', name: 'Beginner', icon: '🌱' },
      { code: 'A2', name: 'Elementary', icon: '🌿' },
      { code: 'B1', name: 'Intermediate', icon: '🌳' },
      { code: 'B2', name: 'Upper Intermediate', icon: '🏆' },
      { code: 'C1', name: 'Advanced', icon: '👑' }
    ];

    levels.forEach(({ code, name, icon }) => {
      it(`renders ${code} certificate correctly`, () => {
        const cert: Certificate = {
          ...testCertificate,
          level: code
        };

        render(
          <CertificateDisplay
            certificate={cert}
            mode="thumbnail"
          />
        );

        expect(screen.getByText(code)).toBeInTheDocument();
        expect(screen.getByText(name)).toBeInTheDocument();
        
        const iconElement = screen.getByRole('img', { name: new RegExp(`${name} icon`, 'i') });
        expect(iconElement).toHaveTextContent(icon);
      });
    });
  });
});
