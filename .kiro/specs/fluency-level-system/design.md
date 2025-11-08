# Design Document: Fluency Level System

## Overview

The fluency level system implements CEFR (Common European Framework of Reference for Languages) level tracking from A1 to C1, providing learners with a clear measure of language proficiency independent of the XP-based gamification system. The system uses a KV store architecture consistent with the existing application backend, with admin-controlled progression and automatic certificate generation upon level upgrades.

## Architecture

### System Components

The fluency level system integrates with the existing Dutch Learning App architecture:

1. **Backend (Edge Function)**: Extends the existing `make-server-a784a06a` edge function with new endpoints for fluency management
2. **Data Layer**: Uses the existing KV store (`kv_store_a784a06a` table) for persistent storage
3. **Frontend Components**: New React components for displaying fluency levels, certificates, and admin controls
4. **API Layer**: Extends the existing `api.ts` utility with fluency-related methods

### Data Flow

```
User Profile Display → API Request → Edge Function → KV Store
                                                    ↓
Admin Control Panel → API Request → Edge Function → KV Store → Certificate Generation
                                                    ↓
                                            Update User Profile
```

## Components and Interfaces

### Backend Components

#### 1. Fluency Level Management Endpoints

**GET /fluency/:userId**
- Retrieves fluency level information for a specific user
- Returns: current level, level history, earned certificates
- Authentication: Requires valid access token

**PATCH /fluency/:userId**
- Updates a user's fluency level (admin only)
- Request body: `{ newLevel: string, adminId: string }`
- Triggers certificate generation on upgrade
- Authentication: Requires admin role

**GET /fluency/history/:userId**
- Retrieves complete fluency level change history
- Returns: array of level changes with timestamps and admin info
- Authentication: Requires valid access token

#### 2. Certificate Management Endpoints

**GET /certificates/:userId**
- Retrieves all certificates earned by a user
- Returns: array of certificate objects
- Authentication: Requires valid access token

**GET /certificates/:userId/:certificateId**
- Retrieves a specific certificate with full details
- Returns: certificate object with metadata
- Authentication: Requires valid access token

### Frontend Components

#### 1. FluencyLevelBadge Component

```typescript
interface FluencyLevelBadgeProps {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}
```

Displays the user's current fluency level with appropriate styling and iconography.

#### 2. FluencyLevelManager Component (Admin Only)

```typescript
interface FluencyLevelManagerProps {
  userId: string;
  currentLevel: string;
  accessToken: string;
  onLevelChange: (newLevel: string) => void;
}
```

Provides admin controls for upgrading/downgrading user fluency levels.

#### 3. CertificateDisplay Component

```typescript
interface CertificateDisplayProps {
  certificate: Certificate;
  mode: 'thumbnail' | 'full';
  onView?: () => void;
}
```

Renders certificates in thumbnail or full view mode.

#### 4. CertificateGallery Component

```typescript
interface CertificateGalleryProps {
  userId: string;
  accessToken: string;
}
```

Displays all earned certificates in a grid layout on the user profile.

#### 5. FluencyHistory Component

```typescript
interface FluencyHistoryProps {
  userId: string;
  accessToken: string;
}
```

Shows the timeline of fluency level changes.

## Data Models

### User Profile Extension

The existing user profile stored at `user:{userId}` will be extended with:

```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  fluencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; // New field
  fluencyLevelUpdatedAt: string; // ISO timestamp
  fluencyLevelUpdatedBy?: string; // Admin user ID
}
```

### Fluency Level History Entry

Stored at `fluency-history:{userId}:{timestamp}`:

```typescript
{
  userId: string;
  previousLevel: string | null;
  newLevel: string;
  changedAt: string; // ISO timestamp
  changedBy: string; // Admin user ID
  reason?: string; // Optional note from admin
}
```

### Certificate Model

Stored at `certificate:{userId}:{certificateId}`:

```typescript
{
  id: string; // UUID
  userId: string;
  userName: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  issuedAt: string; // ISO timestamp
  issuedBy: string; // Admin user ID
  certificateNumber: string; // Unique identifier (e.g., "DLA-2025-A2-001234")
}
```

### Fluency Level Metadata

Stored at `fluency-levels:metadata`:

```typescript
{
  levels: [
    {
      code: 'A1',
      name: 'Beginner',
      description: 'Can understand and use familiar everyday expressions',
      color: '#10b981', // green
      icon: '🌱'
    },
    {
      code: 'A2',
      name: 'Elementary',
      description: 'Can communicate in simple and routine tasks',
      color: '#3b82f6', // blue
      icon: '🌿'
    },
    {
      code: 'B1',
      name: 'Intermediate',
      description: 'Can deal with most situations while traveling',
      color: '#8b5cf6', // purple
      icon: '🌳'
    },
    {
      code: 'B2',
      name: 'Upper Intermediate',
      description: 'Can interact with a degree of fluency and spontaneity',
      color: '#f59e0b', // amber
      icon: '🏆'
    },
    {
      code: 'C1',
      name: 'Advanced',
      description: 'Can express ideas fluently and spontaneously',
      color: '#ef4444', // red
      icon: '👑'
    }
  ]
}
```

## Error Handling

### Backend Error Scenarios

1. **Unauthorized Access**
   - Status: 401
   - Response: `{ error: "Unauthorized" }`
   - Occurs when: Invalid or missing access token

2. **Forbidden Action**
   - Status: 403
   - Response: `{ error: "Admin access required" }`
   - Occurs when: Non-admin user attempts to modify fluency levels

3. **Invalid Level Transition**
   - Status: 400
   - Response: `{ error: "Invalid level transition" }`
   - Occurs when: Attempting to downgrade below A1 or upgrade beyond C1

4. **User Not Found**
   - Status: 404
   - Response: `{ error: "User not found" }`
   - Occurs when: Specified user ID doesn't exist

5. **Certificate Generation Failure**
   - Status: 500
   - Response: `{ error: "Failed to generate certificate" }`
   - Occurs when: Certificate creation fails after level upgrade

### Frontend Error Handling

- Display user-friendly error messages using toast notifications (existing `sonner` library)
- Graceful degradation: Show placeholder if fluency data fails to load
- Retry mechanism for failed API calls
- Loading states for all async operations

## Testing Strategy

### Unit Tests

1. **Backend Functions**
   - Test fluency level validation logic
   - Test certificate generation with various inputs
   - Test admin permission checks
   - Test level transition validation (A1→A2→B1→B2→C1)

2. **Frontend Components**
   - Test FluencyLevelBadge rendering for all levels
   - Test admin controls visibility based on user role
   - Test certificate display in different modes
   - Test error state rendering

### Integration Tests

1. **API Endpoints**
   - Test complete fluency level upgrade flow
   - Test certificate retrieval after level change
   - Test history logging on level changes
   - Test admin-only endpoint access control

2. **User Flows**
   - Test admin upgrading a student's level
   - Test certificate appearing in student profile
   - Test fluency history display
   - Test non-admin users cannot access admin controls

### Edge Cases

1. **Concurrent Updates**
   - Multiple admins attempting to change the same user's level simultaneously
   - Solution: Use optimistic locking or last-write-wins with audit trail

2. **Level Downgrade**
   - Ensure certificates are not revoked when level is downgraded
   - Verify history accurately reflects downgrades

3. **Initial User Creation**
   - Ensure new users are assigned A1 level by default
   - Verify initial level is recorded in history

4. **Certificate Uniqueness**
   - Ensure certificate numbers are unique across all users
   - Implement counter-based certificate numbering

## Integration Points

### Profile Page Integration

The existing profile display will be enhanced with:
- Fluency level badge prominently displayed near user name
- Certificate gallery section below existing stats
- Fluency history timeline (collapsible section)

### Admin Dashboard Integration

For users with `role: 'teacher'`:
- Add fluency management section to student profile views
- Display current level with upgrade/downgrade controls
- Show level change history for audit purposes

### Progress Tracker Integration

The existing ProgressTracker component will be updated to:
- Display fluency level alongside XP level
- Clarify the distinction between XP (activity-based) and fluency (proficiency-based)
- Show next fluency milestone (if applicable)

## Security Considerations

1. **Role-Based Access Control**
   - Only users with `role: 'teacher'` can modify fluency levels
   - All level changes are logged with admin identifier
   - Students can view but not modify their own fluency data

2. **Data Validation**
   - Validate level codes against allowed values (A1, A2, B1, B2, C1)
   - Sanitize user inputs in admin controls
   - Verify user existence before level modifications

3. **Audit Trail**
   - All fluency level changes are permanently logged
   - Include timestamp, admin ID, and previous/new levels
   - Cannot be deleted or modified after creation

## Performance Considerations

1. **Caching Strategy**
   - Cache fluency level metadata (rarely changes)
   - Cache user's current level in profile data
   - Invalidate cache on level changes

2. **Certificate Generation**
   - Generate certificates asynchronously to avoid blocking level updates
   - Use lightweight certificate format (JSON metadata, not PDF generation)
   - Defer PDF rendering to client-side or on-demand

3. **History Queries**
   - Limit history display to most recent 20 entries by default
   - Implement pagination for users with extensive history
   - Index KV store keys for efficient prefix searches

## Future Enhancements

1. **Certificate Customization**
   - Allow admins to add custom notes to certificates
   - Support multiple certificate templates
   - PDF export functionality

2. **Automated Recommendations**
   - Suggest level upgrades based on test scores and activity
   - Provide admins with data-driven insights for level decisions

3. **Level Requirements**
   - Define minimum requirements for each level (e.g., vocabulary size, test scores)
   - Display progress toward next level requirements

4. **Public Certificates**
   - Generate shareable certificate URLs
   - Certificate verification system for third parties
