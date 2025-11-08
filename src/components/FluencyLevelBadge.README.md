# FluencyLevelBadge Component

A React component for displaying CEFR fluency levels with visual styling, icons, and optional labels.

## Overview

The `FluencyLevelBadge` component provides a consistent way to display language proficiency levels throughout the application. It supports all CEFR levels from A1 (Beginner) to C1 (Advanced) with color-coded styling and emoji icons.

## Features

- ✅ Displays all CEFR levels (A1, A2, B1, B2, C1)
- ✅ Three size variants (small, medium, large)
- ✅ Optional label display
- ✅ Color-coded by level
- ✅ Emoji icons for visual appeal
- ✅ Tooltip with level description
- ✅ Fully typed with TypeScript
- ✅ Accessible with ARIA labels
- ✅ Responsive and mobile-friendly

## Usage

### Basic Usage

```tsx
import { FluencyLevelBadge } from '@/components/FluencyLevelBadge';

function UserProfile() {
  return (
    <div>
      <h2>Current Level</h2>
      <FluencyLevelBadge level="B1" />
    </div>
  );
}
```

### With Label

```tsx
<FluencyLevelBadge level="A2" showLabel={true} />
// Displays: 🌿 A2 - Elementary
```

### Size Variants

```tsx
// Small size
<FluencyLevelBadge level="B2" size="small" />

// Medium size (default)
<FluencyLevelBadge level="B2" size="medium" />

// Large size
<FluencyLevelBadge level="B2" size="large" />
```

### Combined Props

```tsx
<FluencyLevelBadge 
  level="C1" 
  size="large" 
  showLabel={true} 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `FluencyLevelCode` | *required* | The CEFR level code: 'A1', 'A2', 'B1', 'B2', or 'C1' |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant of the badge |
| `showLabel` | `boolean` | `false` | Whether to display the level name (e.g., "Beginner") |

## Level Metadata

Each level has associated metadata:

| Level | Name | Icon | Color |
|-------|------|------|-------|
| A1 | Beginner | 🌱 | Green (#10b981) |
| A2 | Elementary | 🌿 | Blue (#3b82f6) |
| B1 | Intermediate | 🌳 | Purple (#8b5cf6) |
| B2 | Upper Intermediate | 🏆 | Amber (#f59e0b) |
| C1 | Advanced | 👑 | Red (#ef4444) |

## Examples

### In a Profile Header

```tsx
function ProfileHeader({ user }) {
  return (
    <div className="flex items-center gap-4">
      <Avatar src={user.avatar} />
      <div>
        <h2>{user.name}</h2>
        <div className="flex items-center gap-2">
          <FluencyLevelBadge 
            level={user.fluencyLevel} 
            showLabel={true} 
          />
          <span>Level {user.xpLevel}</span>
        </div>
      </div>
    </div>
  );
}
```

### In a Stats Card

```tsx
function StatsCard({ fluencyLevel }) {
  return (
    <div className="bg-white p-6 border">
      <div className="flex justify-between items-center">
        <h3>Language Proficiency</h3>
        <FluencyLevelBadge level={fluencyLevel} size="large" />
      </div>
    </div>
  );
}
```

### In a Student List

```tsx
function StudentListItem({ student }) {
  return (
    <div className="flex justify-between items-center p-4">
      <div>
        <p className="font-semibold">{student.name}</p>
        <p className="text-sm text-gray-500">{student.email}</p>
      </div>
      <FluencyLevelBadge 
        level={student.fluencyLevel} 
        size="small" 
        showLabel={true} 
      />
    </div>
  );
}
```

## Accessibility

The component includes several accessibility features:

- **Tooltip**: Hover over the badge to see the full level description
- **ARIA Labels**: Icon has an aria-label describing the level
- **Semantic HTML**: Uses appropriate HTML elements
- **Color + Text**: Doesn't rely solely on color to convey information

## Styling

The component uses:
- **Tailwind CSS** for layout and spacing
- **Inline styles** for dynamic colors (from level metadata)
- **Border and background** color-coded by level
- **Responsive** sizing with consistent proportions

## Testing

### Unit Tests

Run the test suite:

```bash
npm test FluencyLevelBadge.test.tsx
```

Tests cover:
- All five levels render correctly
- All three size variants
- Label display toggle
- Color application
- Accessibility features
- Combined prop scenarios

### Visual Testing

Use the demo component for manual visual testing:

```tsx
import { FluencyLevelBadgeDemo } from '@/components/__tests__/FluencyLevelBadge.demo';

// Temporarily add to your app to view all variants
<FluencyLevelBadgeDemo />
```

## Requirements Satisfied

This component satisfies the following requirements from the fluency level system spec:

- **Requirement 1.2**: Display current fluency level on user profile
- **Requirement 1.5**: Show level code and descriptive label
- **Requirement 4.6**: Visual indicators (badges, colors, icons) for levels

## Related Components

- `FluencyLevelManager` - Admin controls for changing levels
- `CertificateDisplay` - Shows earned certificates
- `FluencyHistory` - Timeline of level changes

## Dependencies

- `react` - Component framework
- `../types/fluency` - TypeScript type definitions
- `../constants/fluencyLevels` - Level metadata constants

## Notes

- The component is purely presentational and doesn't handle any data fetching
- Colors are defined in the `FLUENCY_LEVELS` constant and can be updated centrally
- The component uses inline styles for colors to support dynamic theming
- All levels use emoji icons for cross-platform compatibility
