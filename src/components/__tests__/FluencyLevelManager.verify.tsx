/**
 * FluencyLevelManager Verification Test
 * 
 * Integration test to verify the component works correctly with the backend API.
 * This test uses the actual API (not mocked) to ensure end-to-end functionality.
 * 
 * Note: This test requires a running backend and valid test credentials.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluencyLevelManager } from '../FluencyLevelManager';
import { FluencyLevelCode } from '../../types/fluency';

describe('FluencyLevelManager Integration', () => {
  // These would be set up in a real integration test environment
  const TEST_CONFIG = {
    accessToken: process.env.TEST_TEACHER_TOKEN || 'test-token',
    userId: process.env.TEST_STUDENT_ID || 'test-user-id',
    skipIntegrationTests: !process.env.RUN_INTEGRATION_TESTS
  };

  it('should render correctly for teacher role', () => {
    render(
      <FluencyLevelManager
        userId={TEST_CONFIG.userId}
        currentLevel="B1"
        accessToken={TEST_CONFIG.accessToken}
        userRole="teacher"
      />
    );

    expect(screen.getByText('Fluency Level Management')).toBeInTheDocument();
    expect(screen.getByText('Current Level')).toBeInTheDocument();
    expect(screen.getByText('Available Actions')).toBeInTheDocument();
    expect(screen.getByText('Level Progression')).toBeInTheDocument();
  });

  it('should not render for student role', () => {
    const { container } = render(
      <FluencyLevelManager
        userId={TEST_CONFIG.userId}
        currentLevel="B1"
        accessToken={TEST_CONFIG.accessToken}
        userRole="student"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show correct button states for each level', () => {
    const testCases: Array<{
      level: FluencyLevelCode;
      canUpgrade: boolean;
      canDowngrade: boolean;
    }> = [
      { level: 'A1', canUpgrade: true, canDowngrade: false },
      { level: 'A2', canUpgrade: true, canDowngrade: true },
      { level: 'B1', canUpgrade: true, canDowngrade: true },
      { level: 'B2', canUpgrade: true, canDowngrade: true },
      { level: 'C1', canUpgrade: false, canDowngrade: true }
    ];

    testCases.forEach(({ level, canUpgrade, canDowngrade }) => {
      const { unmount } = render(
        <FluencyLevelManager
          userId={TEST_CONFIG.userId}
          currentLevel={level}
          accessToken={TEST_CONFIG.accessToken}
          userRole="teacher"
        />
      );

      const upgradeButton = screen.getByText(/↑/);
      const downgradeButton = screen.getByText(/↓/);

      if (canUpgrade) {
        expect(upgradeButton).not.toBeDisabled();
      } else {
        expect(upgradeButton).toBeDisabled();
      }

      if (canDowngrade) {
        expect(downgradeButton).not.toBeDisabled();
      } else {
        expect(downgradeButton).toBeDisabled();
      }

      unmount();
    });
  });

  it('should display confirmation dialog with correct information', () => {
    render(
      <FluencyLevelManager
        userId={TEST_CONFIG.userId}
        currentLevel="A2"
        accessToken={TEST_CONFIG.accessToken}
        userRole="teacher"
      />
    );

    // Click upgrade button
    const upgradeButton = screen.getByText('↑ B1');
    fireEvent.click(upgradeButton);

    // Verify dialog appears
    expect(screen.getByText('Confirm Level Change')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to change the fluency level?')).toBeInTheDocument();
    
    // Verify current and new level indicators
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    
    // Verify certificate notice for upgrade
    expect(screen.getByText(/certificate will be automatically generated/i)).toBeInTheDocument();
    
    // Verify action buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should close dialog when cancel is clicked', () => {
    render(
      <FluencyLevelManager
        userId={TEST_CONFIG.userId}
        currentLevel="B1"
        accessToken={TEST_CONFIG.accessToken}
        userRole="teacher"
      />
    );

    // Open dialog
    fireEvent.click(screen.getByText('↑ B2'));
    expect(screen.getByText('Confirm Level Change')).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));

    // Dialog should be closed
    expect(screen.queryByText('Confirm Level Change')).not.toBeInTheDocument();
  });

  it('should show certificate notice only for upgrades', () => {
    // Test upgrade
    const { unmount } = render(
      <FluencyLevelManager
        userId={TEST_CONFIG.userId}
        currentLevel="A1"
        accessToken={TEST_CONFIG.accessToken}
        userRole="teacher"
      />
    );

    fireEvent.click(screen.getByText('↑ A2'));
    expect(screen.getByText(/certificate will be automatically generated/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    unmount();

    // Test downgrade
    render(
      <FluencyLevelManager
        userId={TEST_CONFIG.userId}
        currentLevel="B2"
        accessToken={TEST_CONFIG.accessToken}
        userRole="teacher"
      />
    );

    fireEvent.click(screen.getByText('↓ B1'));
    expect(screen.queryByText(/certificate will be automatically generated/i)).not.toBeInTheDocument();
  });

  it('should display level progression indicator correctly', () => {
    render(
      <FluencyLevelManager
        userId={TEST_CONFIG.userId}
        currentLevel="B1"
        accessToken={TEST_CONFIG.accessToken}
        userRole="teacher"
      />
    );

    expect(screen.getByText('Level Progression')).toBeInTheDocument();
    
    // Should show A1 and C1 labels
    const labels = screen.getAllByText(/^(A1|C1)$/);
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  // Integration test with actual API (skipped by default)
  it.skipIf(TEST_CONFIG.skipIntegrationTests)(
    'should successfully update level via API',
    async () => {
      const onLevelChange = vi.fn();

      render(
        <FluencyLevelManager
          userId={TEST_CONFIG.userId}
          currentLevel="A1"
          accessToken={TEST_CONFIG.accessToken}
          userRole="teacher"
          onLevelChange={onLevelChange}
        />
      );

      // Click upgrade
      fireEvent.click(screen.getByText('↑ A2'));
      
      // Confirm
      fireEvent.click(screen.getByText('Confirm'));

      // Wait for API call to complete
      await waitFor(
        () => {
          expect(onLevelChange).toHaveBeenCalledWith('A2');
        },
        { timeout: 5000 }
      );

      // Verify success toast would be shown
      // (In a real test, you'd check the toast library's calls)
    }
  );
});

/**
 * Manual Verification Checklist
 * 
 * To manually verify the component:
 * 
 * 1. Role-Based Visibility
 *    - [ ] Component renders for teacher role
 *    - [ ] Component does not render for student role
 * 
 * 2. Current Level Display
 *    - [ ] Shows current fluency level with badge
 *    - [ ] Badge displays correct icon and color
 * 
 * 3. Upgrade Controls
 *    - [ ] Upgrade button enabled when not at C1
 *    - [ ] Upgrade button disabled at C1
 *    - [ ] Upgrade button shows next level (e.g., "↑ B1")
 *    - [ ] Clicking upgrade opens confirmation dialog
 * 
 * 4. Downgrade Controls
 *    - [ ] Downgrade button enabled when not at A1
 *    - [ ] Downgrade button disabled at A1
 *    - [ ] Downgrade button shows previous level (e.g., "↓ A2")
 *    - [ ] Clicking downgrade opens confirmation dialog
 * 
 * 5. Confirmation Dialog
 *    - [ ] Shows current and new level badges
 *    - [ ] Shows certificate notice for upgrades
 *    - [ ] Does not show certificate notice for downgrades
 *    - [ ] Cancel button closes dialog without changes
 *    - [ ] Confirm button triggers API call
 * 
 * 6. API Integration
 *    - [ ] Successful upgrade shows success toast
 *    - [ ] Successful downgrade shows success toast
 *    - [ ] Failed update shows error toast with message
 *    - [ ] Buttons disabled during API call
 *    - [ ] onLevelChange callback invoked on success
 * 
 * 7. Level Progression Indicator
 *    - [ ] Shows all 5 levels (A1-C1)
 *    - [ ] Current level highlighted differently
 *    - [ ] Completed levels shown in green
 *    - [ ] Future levels shown in gray
 * 
 * 8. Edge Cases
 *    - [ ] Works without onLevelChange callback
 *    - [ ] Handles API errors gracefully
 *    - [ ] Prevents multiple simultaneous updates
 *    - [ ] All level transitions work correctly (A1→A2, A2→B1, etc.)
 */
