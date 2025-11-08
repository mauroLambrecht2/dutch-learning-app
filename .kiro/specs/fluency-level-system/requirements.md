# Requirements Document

## Introduction

This feature introduces a comprehensive fluency level tracking system for the Dutch learning application. The system implements the Common European Framework of Reference for Languages (CEFR) levels from A1 (beginner) to C1 (advanced), tracking learner progress independently from the existing XP system. The fluency level progression is manually controlled by administrators to ensure accurate assessment of language proficiency, and learners receive certificates upon achieving fluency level upgrades. The system integrates with the user profile to display current fluency status and earned certificates.

## Requirements

### Requirement 1: Fluency Level Tracking

**User Story:** As a learner, I want my fluency level to be tracked separately from my XP, so that I have a clear understanding of my actual language proficiency independent of activity points.

#### Acceptance Criteria

1. WHEN the system initializes a new user THEN the system SHALL assign a default fluency level of A1
2. WHEN a user views their profile THEN the system SHALL display their current fluency level (A1, A2, B1, B2, C1)
3. WHEN a user earns XP THEN the system SHALL NOT automatically change their fluency level
4. IF a user has a fluency level THEN the system SHALL store it persistently in the database
5. WHEN displaying fluency level THEN the system SHALL show the level code and a descriptive label (e.g., "A1 - Beginner", "B2 - Upper Intermediate")

### Requirement 2: Admin-Controlled Fluency Progression

**User Story:** As an administrator, I want to manually control when learners advance to the next fluency level, so that I can ensure accurate assessment of their language proficiency before upgrading them.

#### Acceptance Criteria

1. WHEN an admin views a user's profile THEN the system SHALL display controls to upgrade or downgrade the user's fluency level
2. WHEN an admin upgrades a user's fluency level THEN the system SHALL update the user's fluency level to the next level in the sequence (A1→A2→B1→B2→C1)
3. WHEN an admin downgrades a user's fluency level THEN the system SHALL update the user's fluency level to the previous level in the sequence
4. IF a user is at A1 level THEN the system SHALL NOT allow downgrading below A1
5. IF a user is at C1 level THEN the system SHALL NOT allow upgrading beyond C1
6. WHEN an admin changes a user's fluency level THEN the system SHALL record the change with timestamp and admin identifier
7. WHEN an admin upgrades a user's fluency level THEN the system SHALL trigger certificate generation for that level
8. IF a user is not an admin THEN the system SHALL NOT display fluency level modification controls

### Requirement 3: Certificate Generation

**User Story:** As a learner, I want to receive a certificate when I achieve a fluency level upgrade, so that I have tangible recognition of my language learning achievement.

#### Acceptance Criteria

1. WHEN an admin upgrades a user's fluency level THEN the system SHALL automatically generate a certificate for the new level
2. WHEN a certificate is generated THEN the system SHALL include the user's name, fluency level achieved, date of achievement, and a unique certificate identifier
3. WHEN a certificate is generated THEN the system SHALL store the certificate record in the database
4. WHEN a user views their certificates THEN the system SHALL display all certificates they have earned in chronological order
5. WHEN a user views a certificate THEN the system SHALL display it in a printable or downloadable format
6. IF a user is downgraded THEN the system SHALL NOT revoke previously earned certificates
7. WHEN a certificate is generated THEN the system SHALL include visual branding consistent with the application design

### Requirement 4: Profile Display Integration

**User Story:** As a learner, I want to see my fluency level and earned certificates on my profile, so that I can track my progress and showcase my achievements.

#### Acceptance Criteria

1. WHEN a user views their profile THEN the system SHALL prominently display their current fluency level
2. WHEN a user views their profile THEN the system SHALL display a section showing all earned certificates
3. WHEN displaying certificates on profile THEN the system SHALL show certificate thumbnails or badges for each earned level
4. WHEN a user clicks on a certificate thumbnail THEN the system SHALL display the full certificate details
5. IF a user has no certificates THEN the system SHALL display an encouraging message about earning their first certificate
6. WHEN displaying fluency level on profile THEN the system SHALL show visual indicators (badges, colors, or icons) representing the level
7. WHEN a user views another user's profile THEN the system SHALL display that user's fluency level and certificates (if profile is public)

### Requirement 5: Fluency Level History

**User Story:** As a learner, I want to see my fluency level progression history, so that I can understand my learning journey and see when I achieved each level.

#### Acceptance Criteria

1. WHEN a user's fluency level changes THEN the system SHALL record the change in a fluency history log
2. WHEN a user views their fluency history THEN the system SHALL display all level changes with dates
3. WHEN displaying fluency history THEN the system SHALL show which admin made each level change
4. WHEN a user views their fluency history THEN the system SHALL display the history in reverse chronological order (most recent first)
5. IF a user has never had a level change THEN the system SHALL display their initial A1 assignment date
