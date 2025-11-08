# StudentList Component

## Overview
The StudentList component displays a searchable list of all students in the system. It's designed for teachers to browse students and navigate to individual student profiles.

## Usage

### Basic Usage
```tsx
import { StudentList } from './components/StudentList';

function TeacherStudentsTab() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  return (
    <StudentList
      accessToken={accessToken}
      onSelectStudent={(studentId) => setSelectedStudent(studentId)}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `accessToken` | `string` | Yes | Authentication token for API calls |
| `onSelectStudent` | `(studentId: string) => void` | Yes | Callback when a student is clicked |

## Features

### Student Display
- **Name:** Student's full name
- **Email:** Student's email address
- **Fluency Badge:** Current fluency level with visual indicator
- **User Icon:** Visual representation for each student

### Search Functionality
- **Real-time filtering:** Updates as you type
- **Search by name:** Case-insensitive name matching
- **Search by email:** Case-insensitive email matching
- **Clear search:** Button to reset search when no results

### Interaction
- **Clickable cards:** Each student card is clickable
- **Hover effects:** Visual feedback on hover
- **Chevron indicator:** Shows cards are clickable

## Component Structure

```
StudentList
├── Header
│   ├── Title: "Students"
│   ├── Count: "X students"
│   └── Search Input
└── Student Cards
    └── For each student:
        ├── User Icon
        ├── Student Name
        ├── Fluency Badge
        ├── Email
        └── Chevron Icon
```

## States

### Loading State
```tsx
<div>
  <Spinner />
  <p>Loading students...</p>
</div>
```

### Error State
```tsx
<div>
  <p>Error message</p>
  <Button onClick={retry}>Try Again</Button>
</div>
```

### Empty State (No Students)
```tsx
<div>
  <UserIcon />
  <p>No students yet</p>
  <p>Students will appear here once they sign up</p>
</div>
```

### Empty State (No Search Results)
```tsx
<div>
  <UserIcon />
  <p>No students found</p>
  <Button onClick={clearSearch}>Clear search</Button>
</div>
```

### Success State
Displays grid of student cards with all information.

## Data Flow

1. **Component Mount:**
   - Calls `api.getUsers(accessToken)`
   - Filters to only show students (role === 'student')
   - Sets students state

2. **Search Input:**
   - User types in search box
   - `setSearchQuery()` updates state
   - `useEffect` filters students by query
   - Filtered list updates in real-time

3. **Student Selection:**
   - User clicks student card
   - `onSelectStudent(studentId)` is called
   - Parent component handles navigation

## API Integration

### Backend Endpoint
```
GET /users
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "fluencyLevel": "A2"
    }
  ]
}
```

**Access Control:**
- Requires teacher role
- Returns 403 if non-teacher attempts access

## Styling

### Card Styling
```css
/* Default */
border: 1px solid zinc-200
background: white

/* Hover */
border: 1px solid indigo-300
background: indigo-50
```

### Layout
- Responsive design
- Stacked cards with spacing
- Full-width cards for better touch targets

## Search Algorithm

```typescript
const query = searchQuery.toLowerCase();
const filtered = students.filter(student =>
  student.name.toLowerCase().includes(query) ||
  student.email.toLowerCase().includes(query)
);
```

**Features:**
- Case-insensitive
- Partial matching
- Searches both name and email
- Real-time updates

## Accessibility

- **Semantic HTML:** Proper button elements
- **Keyboard Navigation:** All cards are keyboard accessible
- **Screen Readers:** Descriptive labels and roles
- **Focus Indicators:** Clear focus states
- **Loading States:** Announced to screen readers

## Performance Considerations

### Optimization Strategies
1. **Memoization:** Consider memoizing filtered results
2. **Virtual Scrolling:** For large student lists (100+)
3. **Debouncing:** Could debounce search input
4. **Pagination:** For very large datasets

### Current Implementation
- Filters on every keystroke (acceptable for <100 students)
- All students loaded at once
- No pagination (suitable for small-medium classes)

## Testing

See `__tests__/StudentList.test.tsx` for test coverage:
- Student list rendering
- Search functionality
- Student selection
- Empty states
- Error handling
- Loading states

## Integration with TeacherDashboard

```tsx
function TeacherDashboard() {
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

  return (
    <Tabs>
      <TabsContent value="students">
        <StudentList
          accessToken={accessToken}
          onSelectStudent={setSelectedStudentId}
        />
      </TabsContent>
    </Tabs>
  );
}
```

## Error Handling

### Network Errors
```tsx
try {
  const response = await api.getUsers(accessToken);
  setStudents(response.users);
} catch (err) {
  setError(err.message);
  // Shows error state with retry button
}
```

### Empty Response
```tsx
if (response.users.length === 0) {
  // Shows "No students yet" empty state
}
```

### Permission Errors
```tsx
// Backend returns 403 if not teacher
// Frontend shows error message
```

## Related Components

- **StudentProfile:** Detailed view of individual student
- **FluencyLevelBadge:** Visual indicator of fluency level
- **TeacherDashboard:** Parent container component

## Example Scenarios

### Scenario 1: Teacher Browses Students
```tsx
// Teacher opens Students tab
<StudentList
  accessToken={teacherToken}
  onSelectStudent={handleSelect}
/>
// Sees list of all students
// Can scroll through list
```

### Scenario 2: Teacher Searches for Student
```tsx
// Teacher types "Alice" in search
// List filters to show only matching students
// Teacher clicks on Alice
// onSelectStudent("alice-id") is called
```

### Scenario 3: New Teacher (No Students)
```tsx
// Teacher with no students yet
// Sees empty state message
// "Students will appear here once they sign up"
```

## Future Enhancements

### Filtering
- Filter by fluency level
- Filter by progress status
- Filter by last activity date

### Sorting
- Sort by name (A-Z, Z-A)
- Sort by fluency level
- Sort by progress
- Sort by join date

### Bulk Actions
- Select multiple students
- Bulk level updates
- Export student data

### Additional Information
- Show last activity date
- Show progress percentage
- Show number of certificates

### Performance
- Implement pagination
- Add virtual scrolling
- Cache student data
- Lazy load student details

## Best Practices

### When to Use
- ✅ Teacher viewing all students
- ✅ Selecting student for detailed view
- ✅ Quick search for specific student

### When Not to Use
- ❌ Student viewing classmates (use different component)
- ❌ Public student directory (privacy concerns)
- ❌ Non-teacher roles (access control)

## Troubleshooting

### Students Not Loading
1. Check access token is valid
2. Verify user has teacher role
3. Check backend /users endpoint is working
4. Check network tab for errors

### Search Not Working
1. Verify searchQuery state is updating
2. Check filter logic in useEffect
3. Ensure case-insensitive comparison

### Click Not Working
1. Verify onSelectStudent prop is provided
2. Check button element is not disabled
3. Ensure studentId is being passed correctly
