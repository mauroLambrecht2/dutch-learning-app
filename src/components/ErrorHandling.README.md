# Error Handling and Loading States

This document describes the comprehensive error handling and loading state implementation for the fluency level system.

## Overview

The error handling system provides:
- **Error Boundaries**: Catch and handle React component errors
- **Retry Logic**: Automatic retry for failed API calls with exponential backoff
- **Loading States**: Consistent loading UI across all components
- **Error Display**: User-friendly error messages with retry functionality
- **Graceful Degradation**: Fallback UI when fluency data is unavailable

## Components

### ErrorBoundary

React error boundary component that catches errors in child components.

**Usage:**
```tsx
<ErrorBoundary
  onError={(error, errorInfo) => console.error(error)}
  fallback={<div>Custom error UI</div>}
>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches rendering errors in child components
- Displays user-friendly error message
- Provides "Try Again" button to reset error state
- Optional custom fallback UI
- Optional error callback for logging

### FluencyComponentWrapper

Specialized wrapper for fluency components with error boundary and toast notifications.

**Usage:**
```tsx
<FluencyComponentWrapper fallbackMessage="Unable to load certificates">
  <CertificateGallery userId={userId} accessToken={token} />
</FluencyComponentWrapper>
```

**Features:**
- Wraps fluency components with error boundary
- Shows toast notification on error
- Displays graceful degradation UI
- Logs errors to console

### LoadingSpinner

Reusable loading spinner component with size variants.

**Usage:**
```tsx
<LoadingSpinner size="large" message="Loading certificates..." />
```

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `message`: Optional loading message
- `className`: Additional CSS classes

### ErrorDisplay

Reusable error display component with retry functionality.

**Usage:**
```tsx
<ErrorDisplay
  title="Failed to load data"
  message={error.message}
  onRetry={handleRetry}
/>
```

**Props:**
- `title`: Error title (default: 'Error')
- `message`: Error message to display
- `onRetry`: Optional retry callback
- `className`: Additional CSS classes

## Utilities

### apiWithRetry

Provides retry logic for API calls with exponential backoff.

**Functions:**

#### fetchWithRetry

Wraps fetch calls with retry logic.

```typescript
const response = await fetchWithRetry(
  'https://api.example.com/data',
  { method: 'GET' },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  }
);
```

#### withRetry

Wraps any async function with retry logic.

```typescript
const getCertificatesWithRetry = withRetry(api.getCertificates, {
  maxRetries: 3,
  initialDelay: 1000
});

const data = await getCertificatesWithRetry(accessToken, userId);
```

**Options:**
- `maxRetries`: Maximum number of retry attempts (default: 3)
- `initialDelay`: Initial delay in ms (default: 1000)
- `maxDelay`: Maximum delay in ms (default: 10000)
- `backoffMultiplier`: Backoff multiplier (default: 2)
- `retryableStatuses`: HTTP status codes to retry (default: [408, 429, 500, 502, 503, 504])

**Retry Behavior:**
- Retries on network errors (TypeError)
- Retries on specified HTTP status codes
- Uses exponential backoff: delay = initialDelay * (backoffMultiplier ^ attempt)
- Caps delay at maxDelay
- Does not retry on client errors (4xx except 408, 429)

## Implementation in Fluency Components

### CertificateGallery

**Error Handling:**
- Loading spinner while fetching certificates
- Error display with retry button on failure
- Graceful handling of empty/null/undefined data
- Retry logic with exponential backoff

**States:**
- Loading: Shows LoadingSpinner
- Error: Shows ErrorDisplay with retry
- Empty: Shows encouraging message
- Success: Shows certificate grid

### FluencyHistory

**Error Handling:**
- Loading spinner while fetching history
- Error display with retry button on failure
- Graceful handling of empty/null/undefined data
- Retry logic with exponential backoff

**States:**
- Loading: Shows LoadingSpinner
- Error: Shows ErrorDisplay with retry
- Empty: Shows initial A1 assignment
- Success: Shows collapsible timeline

### FluencyLevelManager

**Error Handling:**
- Toast notifications for update errors
- Retry logic for level updates (fewer retries for mutations)
- Maintains UI state after errors
- Specific error messages for different failure types

**Error Types:**
- 401 Unauthorized: Invalid/expired token
- 403 Forbidden: Non-admin user
- 400 Bad Request: Invalid level transition
- 500 Server Error: Backend failure
- Network Error: Connection issues

## Error Types and Messages

### Network Errors
- **Message**: "Failed to fetch" or "Network error"
- **Retry**: Yes (automatic with exponential backoff)
- **User Action**: Wait for retry or click "Try Again"

### Authentication Errors (401)
- **Message**: "Unauthorized"
- **Retry**: No
- **User Action**: Re-login required

### Permission Errors (403)
- **Message**: "Admin access required" or "Forbidden"
- **Retry**: No
- **User Action**: Contact administrator

### Not Found Errors (404)
- **Message**: "User not found" or "Resource not found"
- **Retry**: No
- **User Action**: Check URL/parameters

### Validation Errors (400)
- **Message**: "Invalid level transition" or specific validation message
- **Retry**: No
- **User Action**: Fix input and retry

### Server Errors (500, 502, 503, 504)
- **Message**: "Internal server error" or "Service unavailable"
- **Retry**: Yes (automatic with exponential backoff)
- **User Action**: Wait for retry or contact support

### Timeout Errors (408)
- **Message**: "Request timeout"
- **Retry**: Yes (automatic with exponential backoff)
- **User Action**: Wait for retry or check connection

### Rate Limit Errors (429)
- **Message**: "Too many requests"
- **Retry**: Yes (automatic with exponential backoff)
- **User Action**: Wait for retry

## Testing

### Unit Tests
- `apiWithRetry.test.ts`: Tests for retry logic
- `ErrorBoundary.test.tsx`: Tests for error boundary
- `LoadingSpinner.test.tsx`: Tests for loading spinner
- `ErrorDisplay.test.tsx`: Tests for error display
- `FluencyComponentWrapper.test.tsx`: Tests for wrapper component

### Integration Tests
- `CertificateGallery.error.test.tsx`: Error scenarios for certificate gallery
- `FluencyHistory.error.test.tsx`: Error scenarios for history
- `FluencyLevelManager.error.test.tsx`: Error scenarios for level manager

### Test Coverage
- Loading states
- Error states
- Retry functionality
- Empty/null/undefined data handling
- Different error types (401, 403, 404, 500, etc.)
- Network errors
- Timeout errors
- Rate limiting

## Best Practices

### When to Use Error Boundaries
- Wrap top-level feature components
- Wrap components that fetch data
- Wrap components with complex rendering logic
- Don't wrap every small component (performance overhead)

### When to Use Retry Logic
- GET requests (safe to retry)
- Idempotent operations
- Network errors
- Server errors (500+)
- Timeout errors

### When NOT to Use Retry Logic
- POST/PUT/DELETE without idempotency
- Authentication errors (401)
- Permission errors (403)
- Validation errors (400)
- Not found errors (404)

### Error Message Guidelines
- Be specific about what failed
- Provide actionable guidance
- Use friendly, non-technical language
- Include retry option when appropriate
- Log technical details to console

### Loading State Guidelines
- Show loading immediately on data fetch
- Include descriptive message
- Use appropriate spinner size
- Maintain layout stability (avoid layout shift)
- Show skeleton UI for complex layouts

## Future Enhancements

1. **Offline Support**
   - Detect offline state
   - Queue mutations for later
   - Show offline indicator

2. **Error Reporting**
   - Send errors to monitoring service
   - Include user context
   - Track error frequency

3. **Advanced Retry Strategies**
   - Jitter for retry delays
   - Circuit breaker pattern
   - Retry budget

4. **Optimistic Updates**
   - Update UI immediately
   - Rollback on error
   - Show pending state

5. **Skeleton Screens**
   - Replace spinners with content placeholders
   - Improve perceived performance
   - Reduce layout shift
