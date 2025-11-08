/**
 * Demo: StudentProfile with Admin Controls Integration
 * 
 * This demo shows how the FluencyLevelManager component is integrated
 * into the StudentProfile view for teachers.
 * 
 * Requirements tested:
 * - 2.1: Admin controls display on student profile
 * - 2.6: Controls only visible to teachers
 * - 2.7: Controls positioned near fluency level display
 * - 2.8: Profile refreshes after level changes
 */

import { StudentProfile } from '../StudentProfile';

// Demo 1: Teacher viewing student profile (admin controls visible)
export function Demo1_TeacherView() {
  return (
    <div className="p-8 bg-zinc-50">
      <h2 className="text-xl font-bold mb-4">Demo 1: Teacher View (Admin Controls Visible)</h2>
      <StudentProfile
        userId="demo-student-123"
        accessToken="demo-token"
        currentUserRole="teacher"
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

// Demo 2: Student viewing their own profile (admin controls hidden)
export function Demo2_StudentView() {
  return (
    <div className="p-8 bg-zinc-50">
      <h2 className="text-xl font-bold mb-4">Demo 2: Student View (Admin Controls Hidden)</h2>
      <StudentProfile
        userId="demo-student-123"
        accessToken="demo-token"
        currentUserRole="student"
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

// Demo 3: Admin controls positioned near fluency badge
export function Demo3_ControlsPositioning() {
  return (
    <div className="p-8 bg-zinc-50">
      <h2 className="text-xl font-bold mb-4">Demo 3: Admin Controls Positioning</h2>
      <p className="text-sm text-zinc-600 mb-4">
        The FluencyLevelManager appears in a dedicated section at the top of the profile,
        immediately after the header with the fluency badge, and before the statistics cards.
      </p>
      <StudentProfile
        userId="demo-student-123"
        accessToken="demo-token"
        currentUserRole="teacher"
      />
    </div>
  );
}

/**
 * Integration Points:
 * 
 * 1. TeacherDashboard → Students Tab → StudentList → StudentProfile
 *    - Teachers can access student profiles from the Students tab
 *    - Clicking a student in the list navigates to their profile
 *    - Admin controls are automatically shown for teacher role
 * 
 * 2. StudentProfile Component Structure:
 *    - Header: Student name, email, fluency badge
 *    - Admin Controls Section (teacher only): FluencyLevelManager
 *    - Stats Overview: Streak, XP, Lessons, Words
 *    - Detailed Statistics
 *    - Certificate Gallery
 *    - Fluency History
 * 
 * 3. Data Flow on Level Change:
 *    - Teacher changes level via FluencyLevelManager
 *    - onLevelChange callback triggers
 *    - StudentProfile reloads profile and progress data
 *    - Updated fluency level appears in badge and history
 *    - New certificate appears in gallery (if upgrade)
 */
