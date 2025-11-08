import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CertificateDisplay } from '../CertificateDisplay';
import type { Certificate } from '../../types/fluency';

describe('CertificateDisplay', () => {
  const mockCertificate: Certificate = {
    id: 'cert-123',
    userId: 'user-456',
    userName: 'John Doe',
    level: 'A2',
    issuedAt: '2025-01-15T10:30:00Z',
    issuedBy: 'admin-789',
    certificateNumber: 'DLA-2025-A2-001234'
  };

  describe('Thumbnail Mode', () => {
    it('renders certificate in thumbnail mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
        />
      );

      expect(screen.getByText('A2')).toBeInTheDocument();
      expect(screen.getByText('Elementary')).toBeInTheDocument();
      expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('displays level icon in thumbnail', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
        />
      );

      const icon = screen.getByRole('img', { name: /Elementary icon/i });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('🌿');
    });

    it('calls onView when thumbnail is clicked', () => {
      const onView = vi.fn();

      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
          onView={onView}
        />
      );

      const thumbnail = screen.getByText('A2').closest('div');
      if (thumbnail) {
        fireEvent.click(thumbnail);
      }

      expect(onView).toHaveBeenCalledTimes(1);
    });

    it('has cursor-pointer class in thumbnail mode', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
        />
      );

      const thumbnail = container.querySelector('.cursor-pointer');
      expect(thumbnail).toBeInTheDocument();
    });

    it('displays hover text in thumbnail', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
        />
      );

      expect(screen.getByText('View Certificate')).toBeInTheDocument();
    });
  });

  describe('Full Mode', () => {
    it('renders certificate in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('Certificate of Achievement')).toBeInTheDocument();
      expect(screen.getByText('Dutch Learning Application')).toBeInTheDocument();
    });

    it('displays user name in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays level information in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('A2')).toBeInTheDocument();
      expect(screen.getByText('Elementary')).toBeInTheDocument();
      expect(screen.getByText('Can communicate in simple and routine tasks')).toBeInTheDocument();
    });

    it('displays formatted date in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('January 15, 2025')).toBeInTheDocument();
    });

    it('displays certificate number in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      expect(screen.getByText('DLA-2025-A2-001234')).toBeInTheDocument();
    });

    it('displays level icon in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      const icon = screen.getByRole('img', { name: /Elementary icon/i });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('🌿');
    });

    it('does not have click handler in full mode', () => {
      const onView = vi.fn();

      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
          onView={onView}
        />
      );

      const fullCert = screen.getByText('Certificate of Achievement').closest('div');
      expect(fullCert).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Different Levels', () => {
    it('renders A1 certificate correctly', () => {
      const a1Cert: Certificate = {
        ...mockCertificate,
        level: 'A1'
      };

      render(
        <CertificateDisplay
          certificate={a1Cert}
          mode="thumbnail"
        />
      );

      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
    });

    it('renders B1 certificate correctly', () => {
      const b1Cert: Certificate = {
        ...mockCertificate,
        level: 'B1'
      };

      render(
        <CertificateDisplay
          certificate={b1Cert}
          mode="thumbnail"
        />
      );

      expect(screen.getByText('B1')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });

    it('renders B2 certificate correctly', () => {
      const b2Cert: Certificate = {
        ...mockCertificate,
        level: 'B2'
      };

      render(
        <CertificateDisplay
          certificate={b2Cert}
          mode="thumbnail"
        />
      );

      expect(screen.getByText('B2')).toBeInTheDocument();
      expect(screen.getByText('Upper Intermediate')).toBeInTheDocument();
    });

    it('renders C1 certificate correctly', () => {
      const c1Cert: Certificate = {
        ...mockCertificate,
        level: 'C1'
      };

      render(
        <CertificateDisplay
          certificate={c1Cert}
          mode="thumbnail"
        />
      );

      expect(screen.getByText('C1')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies level-specific color in thumbnail mode', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
        />
      );

      const thumbnail = container.querySelector('[style*="border-color"]');
      expect(thumbnail).toBeInTheDocument();
    });

    it('applies level-specific color in full mode', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      const fullCert = container.querySelector('[style*="border-color"]');
      expect(fullCert).toBeInTheDocument();
    });

    it('has proper aspect ratio in thumbnail mode', () => {
      const { container } = render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
        />
      );

      const thumbnail = container.querySelector('[style*="aspect-ratio"]');
      expect(thumbnail).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for icons in thumbnail', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="thumbnail"
        />
      );

      const icon = screen.getByRole('img', { name: /Elementary icon/i });
      expect(icon).toBeInTheDocument();
    });

    it('has proper ARIA labels for icons in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      const icon = screen.getByRole('img', { name: /Elementary icon/i });
      expect(icon).toBeInTheDocument();
    });

    it('has semantic heading structure in full mode', () => {
      render(
        <CertificateDisplay
          certificate={mockCertificate}
          mode="full"
        />
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Certificate of Achievement');

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('John Doe');
    });
  });
});
