import type { FluencyLevelCode } from '../types/fluency';
import { FLUENCY_LEVELS } from '../constants/fluencyLevels';

export interface FluencyLevelBadgeProps {
  level: FluencyLevelCode;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * FluencyLevelBadge Component
 * 
 * Displays a user's fluency level with icon and color coding.
 * Supports multiple size variants and optional label display.
 * 
 * @param level - The CEFR fluency level code (A1, A2, B1, B2, C1)
 * @param size - Size variant: 'small', 'medium', or 'large' (default: 'medium')
 * @param showLabel - Whether to show the level name (e.g., "A2 - Elementary") (default: false)
 */
export function FluencyLevelBadge({ 
  level, 
  size = 'medium', 
  showLabel = false 
}: FluencyLevelBadgeProps) {
  const metadata = FLUENCY_LEVELS[level];

  // Size-specific styles
  const sizeStyles = {
    small: {
      container: 'px-2 py-1 gap-1',
      icon: 'text-sm',
      code: 'text-xs',
      label: 'text-xs'
    },
    medium: {
      container: 'px-3 py-2 gap-2',
      icon: 'text-base',
      code: 'text-sm',
      label: 'text-sm'
    },
    large: {
      container: 'px-4 py-3 gap-3',
      icon: 'text-xl',
      code: 'text-base',
      label: 'text-base'
    }
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`inline-flex items-center ${styles.container} border-2 transition-all`}
      style={{
        backgroundColor: `${metadata.color}15`,
        borderColor: metadata.color,
        color: metadata.color
      }}
      title={metadata.description}
    >
      <span className={styles.icon} role="img" aria-label={`${metadata.name} icon`}>
        {metadata.icon}
      </span>
      <span className={styles.code} style={{ fontWeight: 700 }}>
        {metadata.code}
      </span>
      {showLabel && (
        <span className={styles.label} style={{ fontWeight: 600 }}>
          - {metadata.name}
        </span>
      )}
    </div>
  );
}
