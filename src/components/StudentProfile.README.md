# StudentProfile Component

## Overview
The StudentProfile component displays comprehensive information about a student, including their learning progress, fluency level, certificates, and history. When viewed by a teacher, it includes admin controls for managing the student's fluency level.

## Usage

### Basic Usage (Teacher View)
```tsx
import { StudentProfile } from './components/StudentProfile';

function TeacherView() {
  return (
    <StudentProfile
      userId="student-123"
      accessToken={accessToken}
      currentUserRole="teacher"
      onBack={() => navigate('/students')}
    />
  );
}
```

### Student Viewing Own Profile
```tsx
<StudentProfile
  userId={currentUserId}
  accessToken={accessToken}
  currentUserRole="student"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | Yes | The ID of the student whose profile to display |
| `accessToken` | `string` | Yes | Authentication token for API calls |
| `currentUserRole` | `'teacher' \| 'student'` | Yes | Role of the current user viewing the profile |
| `onBack` | `() => void` | No | Callback function when back button is clicked |

## Features

### For All Users
- **Student Information:** Name, email, fluency level badge
- **Learning Statistics:** 
  - Day streak
  - XP level and total XP
  - Lessons completed
  - Words learned
  - Tests taken
  - Average test score
- **Certificate Gallery:** All earned certificates
- **Fluency History:** Timeline of level changes

### For Teachers Only
- **Fluency Level Management:** Admin controls to upgrade/downgrade student's fluency level
- **Positioned prominently** at the top of the profile for easy access

## Component Structure

```
StudentProfile
├── Header
│   ├── Back Button (if onBack provided)
│   ├── Student Name
│   ├── Fluency Level Badge
│   └── Email
├── Admin Controls Section (teacher only)
│   └── FluencyLevelManager
├── Stats Overview (4 cards)
│   ├── Day Streak
│   ├── XP Level
│   ├── Lessons Completed
│   └── Words Learned
├── Detailed Statistics (3 cards)
│   ├── Tests Taken
│   ├── Average Score
│   └── Total XP
├── Certificate Gallery
└── Fluency History
```

## States

### Loading State
Displays a spinner and "Loading student profile..." message while fetching data.

### Error State
Shows error message with optional back button if data fails to load.

### Success State
Displays full profile with all sections populated.

## Data Flow

1. **Initial Load:**
   - Fetches user profile via `api.getProfile()`
   - Fetches progress data via `api.getProgress()`
   - Calculates statistics from progress data

2. **Level Change (Teacher Only):**
   - Teacher changes level via FluencyLevelManager
   - `handleFluencyLevelChange()` is called
   - Profile and progress data are reloaded
   - All displays update with new information

## Integration Points

### With TeacherDashboard
```tsx
// TeacherDashboard manages navigation
const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

if (selectedStudentId) {
  return (
    <StudentProfile
      userId={selectedStudentId}
      accessToken={accessToken}
      currentUserRole="teacher"
      onBack={() => setSelectedStudentId(null)}
    />
  );
}
```

### With StudentList
```tsx
// StudentList triggers navigation
<StudentList
  accessToken={accessToken}
  onSelectStudent={(studentId) => setSelectedStudentId(studentId)}
/>
```

## Styling

The component uses Tailwind CSS with the app's design system:
- **Background:** `bg-zinc-50` for main area
- **Cards:** White background with `border-zinc-200`
- **Gradients:** Colorful gradient cards for statistics
- **Typography:** Consistent with app's font weights and sizes

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Button roles and labels
- Loading and error states announced
- Keyboard navigation support

## Performance Considerations

- Data fetched only once on mount
- Refresh only triggered by explicit level changes
- Memoization opportunities for statistics calculations
- Lazy loading of certificate images (if implemented)

## Testing

See `__tests__/StudentProfile.integration.test.tsx` for comprehensive test coverage including:
- Admin controls visibility
- Role-based rendering
- Data refresh after changes
- Navigation functionality
- Error handling

## Related Components

- **FluencyLevelManager:** Admin controls for level management
- **FluencyLevelBadge:** Visual display of fluency level
- **CertificateGallery:** Grid of earned certificates
- **FluencyHistory:** Timeline of level changes
- **StudentList:** List view for selecting students

## Example Scenarios

### Scenario 1: Teacher Reviews Student Progress
```tsx
// Teacher clicks student from list
<StudentProfile
  userId="student-abc"
  accessToken={teacherToken}
  currentUserRole="teacher"
  onBack={() => goBackToList()}
/>
// Sees full profile with admin controls
// Can upgrade student's level
// Profile refreshes to show new certificate
```

### Scenario 2: Student Views Own Profile
```tsx
// Student navigates to their profile
<StudentProfile
  userId={currentUser.id}
  accessToken={studentToken}
  currentUserRole="student"
/>
// Sees all information except admin controls
// Can view their certificates and history
```

## Future Enhancements

- **Edit Profile:** Allow students to update their information
- **Progress Charts:** Visual graphs of learning progress
- **Goals:** Set and track learning goals
- **Achievements:** Display unlocked achievements
- **Activity Feed:** Recent learning activities
- **Comparison:** Compare with class average
