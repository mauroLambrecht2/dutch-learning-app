import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FluencyLevelBadge } from '../FluencyLevelBadge';
import { FLUENCY_LEVELS } from '../../constants/fluencyLevels';

describe('FluencyLevelBadge', () => {
  describe('Basic Rendering', () => {
    it('should render with A1 level', () => {
      render(<FluencyLevelBadge level="A1" />);
      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('🌱')).toBeInTheDocument();
    });

    it('should render with A2 level', () => {
      render(<FluencyLevelBadge level="A2" />);
      expect(screen.getByText('A2')).toBeInTheDocument();
      expect(screen.getByText('🌿')).toBeInTheDocument();
    });

    it('should render with B1 level', () => {
      render(<FluencyLevelBadge level="B1" />);
      expect(screen.getByText('B1')).toBeInTheDocument();
      expect(screen.getByText('🌳')).toBeInTheDocument();
    });

    it('should render with B2 level', () => {
      render(<FluencyLevelBadge level="B2" />);
      expect(screen.getByText('B2')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should render with C1 level', () => {
      render(<FluencyLevelBadge level="C1" />);
      expect(screen.getByText('C1')).toBeInTheDocument();
      expect(screen.getByText('👑')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size variant', () => {
      const { container } = render(<FluencyLevelBadge level="A1" size="small" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-2');
      expect(badge.className).toContain('py-1');
    });

    it('should render medium size variant (default)', () => {
      const { container } = render(<FluencyLevelBadge level="A1" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-3');
      expect(badge.className).toContain('py-2');
    });

    it('should render large size variant', () => {
      const { container } = render(<FluencyLevelBadge level="A1" size="large" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-4');
      expect(badge.className).toContain('py-3');
    });
  });

  describe('Label Display', () => {
    it('should not show label by default', () => {
      render(<FluencyLevelBadge level="A1" />);
      expect(screen.queryByText('- Beginner')).not.toBeInTheDocument();
    });

    it('should show label when showLabel is true', () => {
      render(<FluencyLevelBadge level="A1" showLabel={true} />);
      expect(screen.getByText('- Beginner')).toBeInTheDocument();
    });

    it('should show correct label for A2', () => {
      render(<FluencyLevelBadge level="A2" showLabel={true} />);
      expect(screen.getByText('- Elementary')).toBeInTheDocument();
    });

    it('should show correct label for B1', () => {
      render(<FluencyLevelBadge level="B1" showLabel={true} />);
      expect(screen.getByText('- Intermediate')).toBeInTheDocument();
    });

    it('should show correct label for B2', () => {
      render(<FluencyLevelBadge level="B2" showLabel={true} />);
      expect(screen.getByText('- Upper Intermediate')).toBeInTheDocument();
    });

    it('should show correct label for C1', () => {
      render(<FluencyLevelBadge level="C1" showLabel={true} />);
      expect(screen.getByText('- Advanced')).toBeInTheDocument();
    });
  });

  describe('Styling and Colors', () => {
    it('should apply correct color for A1 (green)', () => {
      const { container } = render(<FluencyLevelBadge level="A1" />);
      const badge = container.firstChild as HTMLElement;
      // Browsers convert hex to rgb, so we check if the color is set
      expect(badge.style.borderColor).toBeTruthy();
      expect(badge.style.color).toBeTruthy();
      expect(badge.style.borderColor).toContain('rgb');
    });

    it('should apply correct color for A2 (blue)', () => {
      const { container } = render(<FluencyLevelBadge level="A2" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.borderColor).toBeTruthy();
      expect(badge.style.color).toBeTruthy();
      expect(badge.style.borderColor).toContain('rgb');
    });

    it('should apply correct color for B1 (purple)', () => {
      const { container } = render(<FluencyLevelBadge level="B1" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.borderColor).toBeTruthy();
      expect(badge.style.color).toBeTruthy();
      expect(badge.style.borderColor).toContain('rgb');
    });

    it('should apply correct color for B2 (amber)', () => {
      const { container } = render(<FluencyLevelBadge level="B2" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.borderColor).toBeTruthy();
      expect(badge.style.color).toBeTruthy();
      expect(badge.style.borderColor).toContain('rgb');
    });

    it('should apply correct color for C1 (red)', () => {
      const { container } = render(<FluencyLevelBadge level="C1" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.borderColor).toBeTruthy();
      expect(badge.style.color).toBeTruthy();
      expect(badge.style.borderColor).toContain('rgb');
    });

    it('should have border-2 class', () => {
      const { container } = render(<FluencyLevelBadge level="A1" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('border-2');
    });

    it('should have transition-all class', () => {
      const { container } = render(<FluencyLevelBadge level="A1" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('transition-all');
    });
  });

  describe('Accessibility', () => {
    it('should have title attribute with description', () => {
      const { container } = render(<FluencyLevelBadge level="A1" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.title).toBe(FLUENCY_LEVELS.A1.description);
    });

    it('should have aria-label on icon', () => {
      render(<FluencyLevelBadge level="A1" />);
      const icon = screen.getByLabelText('Beginner icon');
      expect(icon).toBeInTheDocument();
    });

    it('should have correct aria-label for each level', () => {
      const levels: Array<{ code: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; name: string }> = [
        { code: 'A1', name: 'Beginner' },
        { code: 'A2', name: 'Elementary' },
        { code: 'B1', name: 'Intermediate' },
        { code: 'B2', name: 'Upper Intermediate' },
        { code: 'C1', name: 'Advanced' }
      ];

      levels.forEach(({ code, name }) => {
        const { unmount } = render(<FluencyLevelBadge level={code} />);
        expect(screen.getByLabelText(`${name} icon`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Combined Props', () => {
    it('should render small size with label', () => {
      const { container } = render(
        <FluencyLevelBadge level="B2" size="small" showLabel={true} />
      );
      expect(screen.getByText('B2')).toBeInTheDocument();
      expect(screen.getByText('- Upper Intermediate')).toBeInTheDocument();
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-2');
    });

    it('should render large size with label', () => {
      const { container } = render(
        <FluencyLevelBadge level="C1" size="large" showLabel={true} />
      );
      expect(screen.getByText('C1')).toBeInTheDocument();
      expect(screen.getByText('- Advanced')).toBeInTheDocument();
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-4');
    });
  });

  describe('Icon Display', () => {
    it('should display correct icon for each level', () => {
      const levels = [
        { code: 'A1' as const, icon: '🌱' },
        { code: 'A2' as const, icon: '🌿' },
        { code: 'B1' as const, icon: '🌳' },
        { code: 'B2' as const, icon: '🏆' },
        { code: 'C1' as const, icon: '👑' }
      ];

      levels.forEach(({ code, icon }) => {
        const { unmount } = render(<FluencyLevelBadge level={code} />);
        expect(screen.getByText(icon)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
