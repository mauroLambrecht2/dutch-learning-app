# CertificateGallery Component

## Overview

The `CertificateGallery` component displays a responsive grid of earned certificates for a user. It fetches certificates from the API on mount, handles loading and error states, and provides a modal view for viewing full certificate details.

## Features

- **Responsive Grid Layout**: Displays certificates in a grid that adapts to screen size (1-4 columns)
- **Automatic Data Fetching**: Fetches certificates on component mount
- **Loading State**: Shows spinner while fetching data
- **Error Handling**: Displays user-friendly error messages
- **Empty State**: Shows encouraging message when no certificates exist
- **Modal View**: Click thumbnails to view full certificate details
- **Accessible**: Includes proper ARIA labels and keyboard navigation

## Usage

```tsx
import { CertificateGallery } from './components/CertificateGallery';

function ProfilePage() {
  const { userId, accessToken } = useAuth();

  return (
    <div>
      <h2>Earned Certificates</h2>
      <CertificateGallery
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
| `userId` | `string` | Yes | The user ID to fetch certificates for |
| `accessToken` | `string` | Yes | Authentication token for API requests |

## States

### Loading State
Displays an animated spinner while fetching certificates from the API.

### Error State
Shows a red error box with the error message if the API call fails.

### Empty State
Displays an encouraging message with a graduation cap emoji when the user has no certificates yet.

### Success State
Shows a responsive grid of certificate thumbnails that can be clicked to view full details.

## Modal Interaction

When a certificate thumbnail is clicked:
1. A modal overlay appears with the full certificate view
2. The modal can be closed by:
   - Clicking the X button in the top-right corner
   - Clicking outside the certificate (on the backdrop)
   - Pressing the Escape key (browser default)

## Grid Layout

The gallery uses a responsive grid that adjusts based on screen size:
- Mobile (default): 1 column
- Small screens (sm): 2 columns
- Large screens (lg): 3 columns
- Extra large screens (xl): 4 columns

## API Integration

The component uses the `api.getCertificates()` method to fetch certificates:

```typescript
const data = await api.getCertificates(accessToken, userId);
// Expected response: { certificates: Certificate[] }
```

## Dependencies

- `CertificateDisplay`: Used to render both thumbnail and full certificate views
- `api.getCertificates`: API method for fetching certificates
- React hooks: `useState`, `useEffect`

## Accessibility

- Loading spinner has appropriate ARIA attributes
- Close button has `aria-label="Close certificate"`
- Modal overlay prevents interaction with background content
- Certificate images have descriptive alt text (via CertificateDisplay)

## Testing

The component includes comprehensive tests covering:
- Loading state display
- Error handling
- Empty state message
- Certificate grid rendering
- Modal open/close interactions
- API integration
- Responsive layout

Run tests with:
```bash
npm test CertificateGallery.test.tsx
```

## Example Scenarios

### New User (No Certificates)
```tsx
<CertificateGallery userId="new-user" accessToken="token" />
// Shows: "No Certificates Yet" with encouraging message
```

### User with Multiple Certificates
```tsx
<CertificateGallery userId="experienced-user" accessToken="token" />
// Shows: Grid of certificate thumbnails (A1, A2, B1, etc.)
```

### Network Error
```tsx
<CertificateGallery userId="user-123" accessToken="invalid-token" />
// Shows: Error message with retry option
```

## Styling

The component uses Tailwind CSS classes for styling:
- Grid layout with responsive columns
- Hover effects on thumbnails
- Modal backdrop with semi-transparent overlay
- Smooth transitions and animations

## Performance Considerations

- Certificates are fetched only once on mount
- Component re-fetches if `userId` or `accessToken` changes
- Modal rendering is conditional (only when certificate is selected)
- Uses React's built-in optimization for re-renders

## Future Enhancements

Potential improvements for future versions:
- Certificate filtering by level or date
- Sorting options (newest first, by level, etc.)
- Download/print functionality for certificates
- Share certificate functionality
- Pagination for users with many certificates
- Certificate search functionality
