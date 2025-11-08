# FluencyLevelManager Component

Admin-only component for managing user fluency levels with upgrade/downgrade controls and confirmation dialogs.

## Overview

The `FluencyLevelManager` component provides teachers with the ability to manually control student fluency level progression. It implements role-based visibility, level transition validation, confirmation dialogs, and automatic certificate generation notifications.

## Features

- **Role-based Visibility**: Only visible to users with `teacher` role
- **Upgrade/Downgrade Controls**: Buttons for moving between adjacent levels
- **Level Boundaries**: Prevents downgrading below A1 or upgrading beyond C1
- **Confirmation Dialog**: Requires confirmation before applying level changes
- **Visual Progression**: Shows current position in the A1→A2→B1→B2→C1 sequence
- **Certificate Notification**: Informs admins that certificates are auto-generated on upgrades
- **Toast Notifications**: Success/error feedback using sonner
- **Loading States**: Disables controls during API operations
- **Callback Support**: Optional `onLevelChange` callback for parent component updates

## Usage

```tsx
import { FluencyLevelManager } from './components/FluencyLevelManager';

function StudentProfile({ student, accessToken, currentUser }) {
  const handleLevelChange = (newLevel) => {
    // Refresh student data or update local state
    console.log('Student level changed to:', newLevel);
  };

  return (
    <div>
      <h2>{student.name}'s Profile</h2>
      
      <FluencyLevelManager
        userId={student.id}
        currentLevel={student.fluencyLevel}
        accessToken={accessToken}
        userRole={currentUser.role}
        onLevelChange={handleLevelChange}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | Yes | ID of the user whose level is being managed |
| `currentLevel` | `FluencyLevelCode` | Yes | Current fluency level (A1, A2, B1, B2, or C1) |
| `accessToken` | `string` | Yes | Authentication token for API calls |
| `userRole` | `'teacher' \| 'student'` | Yes | Role of the current user (component only renders for teachers) |
| `onLevelChange` | `(newLevel: FluencyLevelCode) => void` | No | Callback invoked after successful level change |

## Component Structure

```
FluencyLevelManager
├── Current Level Display
│   └── FluencyLevelBadge (shows current level)
├── Available Actions
│   ├── Downgrade Button (↓ Previous Level)
│   └── Upgrade Button (↑ Next Level)
├── Level Progression Indicator
│   └── Visual bar showing position in A1→C1 sequence
└── Confirmation Dialog (modal)
    ├── Current Level Badge
    ├── Arrow Indicator
    ├── New Level Badge
    ├── Certificate Notice (for upgrades)
    └── Cancel/Confirm Buttons
```

## Behavior

### Role-Based Rendering

The component returns `null` for non-teacher users:

```tsx
if (userRole !== 'teacher') {
  return null;
}
```

### Level Transitions

Valid transitions follow the CEFR sequence:
- **Upgrade**: A1→A2→B1→B2→C1
- **Downgrade**: C1→B2→B1→A2→A1

Buttons are automatically disabled at boundaries:
- Downgrade disabled at A1 (minimum level)
- Upgrade disabled at C1 (maximum level)

### Confirmation Flow

1. User clicks upgrade or downgrade button
2. Confirmation dialog appears showing:
   - Current level badge
   - New level badge
   - Certificate generation notice (upgrades only)
3. User can cancel or confirm
4. On confirm:
   - API call to update level
   - Success/error toast notification
   - `onLevelChange` callback invoked (if provided)
   - Dialog closes

### API Integration

The component calls `api.updateFluencyLevel()`:

```typescript
await api.updateFluencyLevel(accessToken, userId, newLevel);
```

Expected API response:
```json
{
  "success": true,
  "fluencyLevel": "B1",
  "certificate": { ... }  // For upgrades
}
```

### Error Handling

Errors are caught and displayed via toast notifications:

```typescript
toast.error('Failed to update fluency level', {
  description: error.message
});
```

Common errors:
- `401 Unauthorized`: Invalid access token
- `403 Forbidden`: User is not a teacher
- `400 Bad Request`: Invalid level transition
- `404 Not Found`: User not found

## Styling

The component uses Tailwind CSS with the following color scheme:

- **Upgrade Button**: Green (`bg-green-50`, `text-green-700`)
- **Downgrade Button**: Orange (`bg-orange-50`, `text-orange-700`)
- **Disabled State**: Gray (`bg-gray-50`, `text-gray-400`)
- **Progression Bar**: 
  - Completed levels: Green (`bg-green-400`)
  - Current level: Blue gradient with ring (`bg-gradient-to-r from-blue-400 to-blue-600`)
  - Future levels: Gray (`bg-gray-200`)

## Testing

Comprehensive test coverage includes:

- Role-based visibility (teacher vs student)
- Current level display
- Upgrade/downgrade button states
- Confirmation dialog behavior
- API integration and error handling
- Toast notifications
- Loading states
- Edge cases (all level transitions, missing callbacks)

Run tests:
```bash
npm test -- FluencyLevelManager.test.tsx
```

## Requirements Satisfied

This component satisfies the following requirements from the fluency level system spec:

- **2.1**: Admin views controls to upgrade/downgrade user fluency level
- **2.2**: Admin upgrades user to next level in sequence
- **2.3**: Admin downgrades user to previous level in sequence
- **2.4**: Cannot downgrade below A1
- **2.5**: Cannot upgrade beyond C1
- **2.6**: Level changes recorded with timestamp and admin ID (via API)
- **2.7**: Certificate generation triggered on upgrade (via API)
- **2.8**: Non-admins cannot see modification controls

## Dependencies

- `react`: Component framework
- `sonner`: Toast notifications
- `../types/fluency`: Type definitions
- `../constants/fluencyLevels`: Level metadata and constants
- `../utils/api`: API integration
- `./FluencyLevelBadge`: Level display component

## Related Components

- **FluencyLevelBadge**: Displays fluency level with icon and color
- **CertificateDisplay**: Shows certificates generated from upgrades
- **FluencyHistory**: Displays timeline of level changes

## Future Enhancements

Potential improvements:
- Add reason/note field for level changes
- Show student's test scores or activity data to inform decisions
- Display level change history within the manager
- Bulk level updates for multiple students
- Undo functionality for recent changes
- Email notification to student on level change
