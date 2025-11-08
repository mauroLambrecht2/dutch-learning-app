# StudentDashboard Fluency Level Integration

## Overview

The StudentDashboard now displays the user's fluency level prominently in the header section, providing clear visibility of language proficiency separate from XP-based activity metrics.

## Features

### 1. Fluency Level Display
- **Location**: Header section, next to user name and role badge
- **Component**: `FluencyLevelBadge` with medium size and label
- **Data Source**: User profile fetched via `api.getProfile()`
- **Default**: A1 (Beginner) if not available

### 2. Visual Design
```
┌─────────────────────────────────────────────────────┐
│ Dutch Learning  [XINDY]  [🌿 A2 - Elementary]      │
│ Your personalized learning path                    │
└─────────────────────────────────────────────────────┘
```

### 3. Separation from XP System
- **Fluency Level**: Language proficiency (A1-C1) - in header
- **XP Level**: Activity-based gamification - in stats section
- **Clear Distinction**: Different positioning and visual treatment

## Implementation

### State Management
```typescript
const [fluencyLevel, setFluencyLevel] = useState<FluencyLevel>('A1');
const [userName, setUserName] = useState<string>('');
```

### Profile Loading
```typescript
const loadUserProfile = async () => {
  try {
    const profile = await api.getProfile(accessToken);
    setFluencyLevel(profile.fluencyLevel || 'A1');
    setUserName(profile.name || '');
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
};
```

### Badge Integration
```tsx
<FluencyLevelBadge 
  level={fluencyLevel} 
  size="medium" 
  showLabel={true} 
/>
```

## Data Flow

1. **Component Mount** → `loadUserProfile()` called
2. **API Call** → `api.getProfile(accessToken)` fetches user data
3. **State Update** → `setFluencyLevel(profile.fluencyLevel || 'A1')`
4. **Render** → `FluencyLevelBadge` displays current level

## Fluency Levels

| Level | Name | Icon | Description |
|-------|------|------|-------------|
| A1 | Beginner | 🌱 | Can understand and use familiar everyday expressions |
| A2 | Elementary | 🌿 | Can communicate in simple and routine tasks |
| B1 | Intermediate | 🌳 | Can deal with most situations while traveling |
| B2 | Upper Intermediate | 🏆 | Can interact with a degree of fluency and spontaneity |
| C1 | Advanced | 👑 | Can express ideas fluently and spontaneously |

## Error Handling

### Profile Fetch Failure
- Error logged to console
- Component continues to function
- Defaults to 'A1' level
- No UI disruption

### Missing Fluency Data
- Defaults to 'A1' (Beginner)
- Ensures badge always displays
- Consistent user experience

## Testing

### Run Integration Tests
```bash
npm test -- src/components/__tests__/StudentDashboard.fluency.test.tsx --run
```

### Test Coverage
- ✅ Profile fetching on mount
- ✅ Badge display with correct level
- ✅ Badge props validation
- ✅ Header positioning
- ✅ Default behavior (A1)
- ✅ All fluency levels (A1-C1)
- ✅ Error handling
- ✅ Separation from XP stats

## Requirements Satisfied

### Requirement 1.2: Display Current Fluency Level
✅ User profile displays current fluency level (A1-C1)

### Requirement 4.1: Prominent Profile Display
✅ Fluency level prominently displayed in header

### Requirement 4.6: Visual Indicators
✅ Displays with visual indicators (badges, colors, icons)

### Requirement 4.7: Visible on All Profiles
✅ Visible on user's own profile (ready for extension)

## Usage Example

```tsx
import { StudentDashboard } from './components/StudentDashboard';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  return (
    <StudentDashboard 
      accessToken={accessToken} 
      onLogout={handleLogout} 
    />
  );
}
```

## Future Enhancements

### For Teacher Views (Task 17)
When viewing student profiles as a teacher:
1. Display student's fluency level in profile header
2. Add `FluencyLevelManager` component for admin controls
3. Show fluency history timeline
4. Display earned certificates

### For ProgressTracker (Task 18)
When integrating with ProgressTracker:
1. Add fluency stat card alongside XP level
2. Include explanatory text about fluency vs XP
3. Show progress toward next fluency milestone
4. Maintain visual consistency

## Notes

### Design Decisions
- **Header Placement**: Fluency is part of user identity, not activity stats
- **Medium Size**: Balances visibility with header space
- **Show Label**: Provides context (e.g., "A2 - Elementary")
- **Default A1**: Ensures all users have a fluency level

### Performance
- Profile fetched once on mount
- No unnecessary re-fetching
- Efficient state management
- Minimal render overhead

### Accessibility
- Badge component includes semantic HTML
- Color is not the only indicator (icons + text)
- Readable labels for screen readers

## Related Components

- `FluencyLevelBadge`: Displays fluency level with styling
- `FluencyLevelManager`: Admin controls (Task 10)
- `CertificateGallery`: Earned certificates (Task 12)
- `FluencyHistory`: Level change timeline (Task 13)

## API Dependencies

### `api.getProfile(accessToken)`
Returns user profile with fluency data:
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  fluencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  fluencyLevelUpdatedAt: string;
  fluencyLevelUpdatedBy?: string;
}
```

## Troubleshooting

### Badge Not Displaying
1. Check if `api.getProfile()` is returning fluency data
2. Verify `FluencyLevelBadge` component is imported
3. Check console for profile fetch errors

### Wrong Level Displayed
1. Verify backend user profile has correct fluency level
2. Check if profile is being fetched on mount
3. Ensure state is updated after profile fetch

### Styling Issues
1. Verify Tailwind CSS classes are applied
2. Check if badge size prop is correct
3. Ensure parent container has proper layout

## Support

For issues or questions:
1. Check integration tests for expected behavior
2. Review implementation summary (TASK_14_IMPLEMENTATION_SUMMARY.md)
3. Consult design document (.kiro/specs/fluency-level-system/design.md)
