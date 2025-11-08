# CertificateDisplay Component

## Overview

The `CertificateDisplay` component renders certificates earned by users upon achieving fluency level upgrades. It supports two display modes: thumbnail (compact preview) and full (complete certificate).

## Features

- **Dual Display Modes**: Thumbnail for galleries, full for detailed viewing
- **Visual Branding**: Consistent with app design using fluency level colors
- **Interactive Thumbnail**: Click handler for expanding to full view
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Proper ARIA labels and semantic HTML

## Usage

### Thumbnail Mode

```tsx
import { CertificateDisplay } from './components/CertificateDisplay';

function CertificateGallery() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <div className="grid grid-cols-3 gap-4">
      {certificates.map(cert => (
        <CertificateDisplay
          key={cert.id}
          certificate={cert}
          mode="thumbnail"
          onView={() => setSelectedCert(cert)}
        />
      ))}
    </div>
  );
}
```

### Full Mode

```tsx
import { CertificateDisplay } from './components/CertificateDisplay';

function CertificateModal({ certificate }: { certificate: Certificate }) {
  return (
    <div className="modal">
      <CertificateDisplay
        certificate={certificate}
        mode="full"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `certificate` | `Certificate` | Yes | Certificate data to display |
| `mode` | `'thumbnail' \| 'full'` | Yes | Display mode |
| `onView` | `() => void` | No | Callback when thumbnail is clicked |

## Certificate Data Structure

```typescript
interface Certificate {
  id: string;
  userId: string;
  userName: string;
  level: FluencyLevelCode;
  issuedAt: string; // ISO timestamp
  issuedBy: string;
  certificateNumber: string;
}
```

## Display Modes

### Thumbnail Mode

- Compact 4:3 aspect ratio card
- Shows level icon, code, and year
- Hover effect with "View Certificate" overlay
- Click handler triggers `onView` callback
- Ideal for certificate galleries

### Full Mode

- Complete certificate layout
- Includes user name, level details, date, and certificate number
- Decorative corner elements
- Professional certificate design
- Suitable for printing or downloading

## Styling

The component uses:
- Tailwind CSS for layout and utilities
- Dynamic inline styles for level-specific colors
- Consistent color scheme from `FLUENCY_LEVELS` constants
- Responsive design patterns

## Accessibility

- Semantic HTML structure
- ARIA labels for icons
- Keyboard navigation support (via click handlers)
- High contrast text for readability

## Related Components

- `FluencyLevelBadge`: Displays fluency level badges
- `CertificateGallery`: Grid display of multiple certificates
- `FluencyLevelManager`: Admin controls for level management

## Requirements Satisfied

- **3.2**: Certificate includes user name, level, date, and certificate number
- **3.5**: Certificate displayed in printable/downloadable format
- **3.7**: Visual branding consistent with application design
