/**
 * Demo: StudentDashboard Fluency Level Integration
 * 
 * This demo shows how the fluency level is integrated into the StudentDashboard.
 * 
 * Key Features:
 * 1. Fluency level badge displayed prominently in header
 * 2. Badge positioned next to user name and role
 * 3. Separate from XP-based stats (streak, lessons completed)
 * 4. Fetched from user profile on component mount
 * 5. Defaults to A1 if not available
 */

import { StudentDashboard } from '../StudentDashboard';

// Example usage in the app:
// <StudentDashboard accessToken={accessToken} onLogout={handleLogout} />

/**
 * Visual Layout:
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Header                                                          │
 * │ ┌─────────────────────────────────────────────────────────────┐ │
 * │ │ Dutch Learning  [XINDY]  [🌿 A2 - Elementary]              │ │
 * │ │ Your personalized learning path                            │ │
 * │ │                                                             │ │
 * │ │                    [🔥 5 Day Streak]  [🎯 12 Lessons Done] │ │
 * │ └─────────────────────────────────────────────────────────────┘ │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * Note: Fluency badge (🌿 A2) is in the header with user identity,
 *       while activity stats (streak, lessons) are in the stats section.
 */

/**
 * Data Flow:
 * 
 * 1. Component Mount
 *    └─> loadUserProfile()
 *        └─> api.getProfile(accessToken)
 *            └─> Returns: { id, name, email, role, fluencyLevel: 'A2' }
 *                └─> setFluencyLevel('A2')
 *                    └─> FluencyLevelBadge renders with level='A2'
 * 
 * 2. Badge Display
 *    └─> <FluencyLevelBadge 
 *          level={fluencyLevel}      // 'A2'
 *          size="medium"             // Appropriate for header
 *          showLabel={true}          // Shows "A2 - Elementary"
 *        />
 */

/**
 * Example Profile Data:
 */
const exampleProfile = {
  id: 'user-123',
  name: 'Xindy',
  email: 'learner@dutch.app',
  role: 'student',
  fluencyLevel: 'A2',  // ← This is displayed in the header
  fluencyLevelUpdatedAt: '2025-01-15T10:30:00Z',
  fluencyLevelUpdatedBy: 'teacher-456',
};

/**
 * Fluency Levels Supported:
 * - A1: Beginner (🌱)
 * - A2: Elementary (🌿)
 * - B1: Intermediate (🌳)
 * - B2: Upper Intermediate (🏆)
 * - C1: Advanced (👑)
 */

/**
 * Error Handling:
 * 
 * If profile fetch fails:
 * - Error is logged to console
 * - Component continues to function
 * - Fluency level defaults to 'A1'
 * - No UI disruption
 */

/**
 * Testing:
 * 
 * Run integration tests:
 * npm test -- src/components/__tests__/StudentDashboard.fluency.test.tsx --run
 * 
 * Tests verify:
 * ✓ Profile fetching on mount
 * ✓ Badge display with correct level
 * ✓ Badge props (size, showLabel)
 * ✓ Header positioning
 * ✓ Default to A1 behavior
 * ✓ All fluency levels (A1-C1)
 * ✓ Error handling
 * ✓ Separation from XP stats
 */

export default StudentDashboard;
