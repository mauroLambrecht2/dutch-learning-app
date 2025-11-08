# End-to-End Tests

This directory contains end-to-end tests that verify complete user workflows and system integration.

## Fluency Level System E2E Tests

**File**: `fluency-system.e2e.test.tsx`

### Overview
Comprehensive end-to-end tests for the fluency level system covering:
- Complete admin upgrade workflows
- Student viewing and interaction
- Permission and access control
- Level transition boundaries
- Full user journey from A1 to C1

### Test Suites

#### 1. Complete Admin Upgrade Flow
Tests the full workflow of an admin upgrading a student's fluency level and verifying certificate generation.

#### 2. Student Viewing Fluency Level and Certificates
Validates that students can view their fluency level and earned certificates, including handling of new users with no certificates.

#### 3. Fluency History Display After Multiple Level Changes
Tests the history tracking system with complex scenarios including multiple upgrades and downgrades.

#### 4. Permission Checks - Non-Admin Cannot Modify Levels
Ensures proper access control where students cannot modify levels but admins can.

#### 5. Level Transition Boundaries
Validates boundary conditions:
- Cannot downgrade below A1
- Cannot upgrade beyond C1
- All valid transitions work correctly
- Invalid transitions are rejected

#### 6. Integration - Complete User Journey
Simulates a complete progression from A1 to C1, verifying all features work together correctly.

### Running the Tests

```bash
# Run all E2E tests
npm test -- src/test/e2e

# Run fluency system E2E tests specifically
npm test -- src/test/e2e/fluency-system.e2e.test.tsx

# Run with verbose output
npm test -- src/test/e2e/fluency-system.e2e.test.tsx --reporter=verbose
```

### Test Approach

These tests focus on API-level integration rather than UI rendering to:
- Avoid UI component dependency issues
- Test business logic and data flow
- Validate backend integration
- Ensure data consistency

### Coverage

All tests verify:
- ✅ API calls with correct parameters
- ✅ Response data structure and content
- ✅ Error handling and validation
- ✅ Permission and access control
- ✅ Data persistence and retrieval
- ✅ Business rule enforcement

### Requirements Mapping

Each test maps to specific requirements from the fluency level system specification:
- Requirement 1.1-1.5: Fluency Level Tracking
- Requirement 2.1-2.8: Admin-Controlled Progression
- Requirement 3.1-3.7: Certificate Generation
- Requirement 4.1-4.7: Profile Display Integration
- Requirement 5.1-5.5: Fluency Level History

See `TASK_20_IMPLEMENTATION_SUMMARY.md` for detailed requirement coverage.
