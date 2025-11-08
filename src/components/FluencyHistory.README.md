# FluencyHistory Component

## Overview

The `FluencyHistory` component displays a collapsible timeline of fluency level changes for a user. It shows the progression through CEFR levels (A1-C1) with visual indicators, dates, and admin information.

## Features

- **Collapsible Timeline**: Expandable/collapsible section to save space
- **Reverse Chronological Order**: Most recent changes appear first
- **Visual Indicators**: Color-coded timeline dots (green for upgrades, orange for adjustments)
- **Level Badges**: Uses FluencyLevelBadge component for consistent level display
- **Admin Attribution**: Shows which admin made each change
- **Initial State**: Displays initial A1 assignment when no history exists
- **Loading & Error States**: Graceful handling of async operations

## Usage

```tsx
import { FluencyHistory } from './components/FluencyHistory';

function UserProfile() {
  const { userId, accessToken } = useAuth();

  return (
    <div>
      <h2>Fluency Level History</h2>
      <FluencyHistory 
        userId={userId} 
        accessToken={accessToken} 
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | Yes | The user ID to fetch history for |
| `accessToken` | `string` | Yes | Authentication token for API requests |

## API Integration

The component fetches data from:
- `GET /fluency/history/:userId` - Returns array of history entries

Expected response format:
```json
{
  "history": [
    {
      "userId": "user-123",
      "previousLevel": "A1",
      "newLevel": "A2",
      "changedAt": "2025-01-15T10:30:00Z",
      "changedBy": "teacher-456",
      "reason": "Completed A2 assessment"
    }
  ]
}
```

## States

### Loading State
Shows a centered spinner while fetching history data.

### Error State
Displays a red alert box with error message if fetch fails.

### Empty State
When no history exists, shows a single entry indicating initial A1 level assignment.

### Timeline View
Displays all history entries in reverse chronological order with:
- Timeline dots (green for upgrades, orange for downgrades)
- Date and time of change
- Previous and new level badges
- Change description
- Admin who made the change
- Optional reason/note

## Styling

The component uses Tailwind CSS with dark mode support:
- Green theme for upgrades (`bg-green-50`, `border-green-200`)
- Orange theme for adjustments/downgrades (`bg-orange-50`, `border-orange-200`)
- Responsive design with proper spacing
- Smooth transitions for expand/collapse

## Accessibility

- Semantic HTML with proper button elements
- `aria-expanded` attribute on collapsible header
- Keyboard navigation support
- Screen reader friendly labels

## Requirements Satisfied

- **5.1**: Records level changes in history log
- **5.2**: Displays all level changes with dates
- **5.3**: Shows which admin made each change
- **5.4**: Displays history in reverse chronological order
- **5.5**: Shows initial A1 assignment if no changes exist

## Related Components

- `FluencyLevelBadge` - Used to display level badges in timeline
- `CertificateGallery` - Often displayed alongside history on profile
- `FluencyLevelManager` - Admin component that creates history entries

## Testing

See `__tests__/FluencyHistory.test.tsx` for comprehensive test coverage including:
- Loading state rendering
- Error handling
- Empty state display
- Timeline rendering with multiple entries
- Collapsible functionality
- Date formatting
