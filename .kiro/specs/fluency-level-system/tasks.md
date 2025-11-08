# Implementation Plan

- [x] 1. Set up fluency level data models and constants

  - Create TypeScript interfaces for FluencyLevel, Certificate, and FluencyHistoryEntry
  - Define fluency level metadata constants (A1-C1 with names, descriptions, colors, icons)
  - Create utility functions for level validation and transitions
  - _Requirements: 1.1, 1.5_

- [x] 2. Extend user profile data model with fluency fields

  - Update user profile KV store structure to include fluencyLevel, fluencyLevelUpdatedAt, and fluencyLevelUpdatedBy
  - Modify signup endpoint to initialize new users with A1 level
  - Create migration logic to add A1 level to existing users without fluency data

  - Write unit tests for profile extension
  - _Requirements: 1.1, 1.4_

- [x] 3. Implement backend fluency level retrieval endpoint

  - Create GET /fluency/:userId endpoint in edge function
  - Implement authentication check using existing getAccessToken helper
  - Retrieve user's current fluency level from profile
  - Return fluency level with metadata (name, description, color, icon)
  - Write unit tests for retrieval endpoint
  - _Requirements: 1.2, 1.4_

- [x] 4. Implement backend fluency level update endpoint

  - Create PATCH /fluency/:userId endpoint in edge function
  - Implement admin role verification (check user.role === 'teacher')
  - Validate level transition (prevent downgrade below A1, upgrade beyond C1)
  - Update user profile with new level, timestamp, and admin ID
  - Write unit tests for update endpoint with various scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_

- [x] 5. Implement fluency history logging

  - Create function to record level changes in KV store at fluency-history:{userId}:{timestamp}
  - Call history logging function whenever fluency level is updated
  - Create GET /fluency/history/:userId endpoint to retrieve history
  - Implement reverse chronological sorting of history entries
  - Write unit tests for history logging and retrieval
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Implement certificate generation logic

  - Create function to generate certificate object with unique ID and certificate number
  - Implement certificate number generation (format: DLA-YYYY-LEVEL-NNNNNN)
  - Store certificate in KV store at certificate:{userId}:{certificateId}
  - Trigger certificate generation automatically on level upgrade
  - Write unit tests for certificate generation
  - _Requirements: 3.1, 3.2, 3.3, 3.7_

- [x] 7. Implement certificate retrieval endpoints

  - Create GET /certificates/:userId endpoint to retrieve all user certificates
  - Create GET /certificates/:userId/:certificateId endpoint for specific certificate
  - Implement chronological sorting of certificates
  - Add authentication checks to certificate endpoints
  - Write unit tests for certificate retrieval
  - _Requirements: 3.4, 3.5_

- [x] 8. Create frontend API methods for fluency system

- [ ] 8. Create frontend API methods for fluency system

  - Add getFluencyLevel(accessToken, userId) method to api.ts
  - Add updateFluencyLevel(accessToken, userId, newLevel) method to api.ts
  - Add getFluencyHistory(accessToken, userId) method to api.ts
  - Add getCertificates(accessToken, userId) method to api.ts
  - Add getCertificate(accessToken, userId, certificateId) method to api.ts
  - _Requirements: 1.2, 2.1, 4.1, 5.1_

- [x] 9. Create FluencyLevelBadge component

  - Create React component to display fluency level with icon and color
  - Implement size variants (small, medium, large)
  - Add optional label display (e.g., "A2 - Elementary")

  - Style component with Tailwind CSS matching app design
  - Write component tests for different levels and sizes
  - _Requirements: 1.2, 1.5, 4.6_

- [x] 10. Create FluencyLevelManager component for admins

  - Create React component with upgrade/downgrade controls
  - Implement role-based visibility (only show for teacher role)
  - Add confirmation dialog before level changes
  - Display current level and available transitions
  - Handle API calls to update fluency level
  - Show success/error notifications using s
    onner
  - Write component tests for admin controls
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 11. Create CertificateDisplay component

  - Create React component to render certificate in thumbnail and full modes

  - Create React component to render certificate in thumbnail and full modes
  - Design certificate layout with user name, level, date, and certificate number
  - Implement visual branding consistent with app design
  - Add click handler for thumbnail mode to view full certificate
  - Style component with Tailwind CSS
  - Write component tests for both display modes
  - _Requirements: 3.2, 3.5, 3.7_

- [x] 12. Create CertificateGallery component

  - Create React component to display grid of earned certificates
  - Fetch certificates on component mount using API
  - Display certificate thumbnails in responsive grid layout
  - Show encouraging message when no certificates exist
  - Implement modal or expanded view for certificate details
  - Handle loading and error states
  - Write component tests for gallery display
  - _Requirements: 3.4, 4.2, 4.3, 4.4, 4.5_

- [x] 13. Create FluencyHistory component

  - Create React component to display timeline of level changes
  - Fetch fluency history on component mount using API

  - Display history entries with date, previous/new level, and admin name
  - Implement reverse chronological ordering
  - Show initial A1 assignment if no changes exist
  - Style as collapsible timeline with visual indicators
  - Write component tests for history display
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 14. Integrate fluency level display into user profile

  - Update profile page to fetch and display fluency level

  - Add FluencyLevelBadge component prominently near user name
  - Position fluency level separate from XP level display
  - Ensure fluency level is visible on both own and other users' profiles
  - Write integration tests for profile display
  - _Requirements: 1.2, 4.1, 4.6, 4.7_

- [x] 15. Integrate certificate gallery into user profile

  - Position gallery below stats section
    rofile page
  - Position gallery below stats section
  - Implement responsive layout for certificate thumbnails
  - Add section heading "Earned Certificates"
  - Write integration tests for certificate gallery on profile
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 16. Integrate fluency history into user profile

  - Add FluencyHistory component to profile page as collapsible section
  - Position history below certificate gallery

  - Add section heading "Fluency Level History"
  - Implement expand/collapse functionality
  - Write integration tests for history display on profile
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 17. Integrate admin controls into student profile views

  - Add FluencyLevelManager component to student profi
    le pages (teacher view only)
  - Position admin controls near fluency level display
  - Ensure controls only appear for users with teacher role
  - Refresh profile data after level changes
  - Write integration tests for admin controls visibility and functionality
  - _Requirements: 2.1, 2.6, 2.7, 2.8_

- [x] 18. Update ProgressTracker component to show fluency level

  - Add fluency level display to ProgressTracker stats overview

  - Position fluency level alongside XP level with clear distinction
  - Add explanatory text to clarify difference between XP and fluency
  - Ensure visual consistency with other stat cards
  - Write tests for ProgressTracker fluency display
  - _Requirements: 1.2, 1.3, 4.1_

- [x] 19. Add error handling and loading states


  - Implement error boundaries for fluency components
  - Add loading spinners for async operations
  - Display user-friendly error messages using toast notifications

  - Implement retry logic for failed API calls
  - Add graceful degradation for missing fluency data
  - Write tests for error scenarios
  - _Requirements: 1.2, 2.1, 3.4, 4.1_


- [x] 20. Write end-to-end tests for fluency level system




  - Create test for complete admin upgrade flow (login as admin → upgrade student → verify certificate)
  - Create test for student viewing their fluency level and certificates
  - Create test for fluency history display after multiple level changes
  - Create test for permission checks (non-admin cannot modify levels)
  - Create test for level transition boundaries (A1 minimum, C1 maximum)
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.4, 4.1, 5.1_
