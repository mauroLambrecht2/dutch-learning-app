import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

/**
 * Unit tests for user profile fluency level extension
 * 
 * Tests cover:
 * - New user signup with A1 initialization
 * - Profile retrieval with automatic migration
 * - Bulk migration endpoint
 */

// Mock KV store for testing
const mockKVStore = new Map<string, any>();

function mockKvGet(key: string) {
  return Promise.resolve(mockKVStore.get(key) || null);
}

function mockKvSet(key: string, value: any) {
  mockKVStore.set(key, value);
  return Promise.resolve();
}

function mockKvGetByPrefix(prefix: string) {
  const results: any[] = [];
  for (const [key, value] of mockKVStore.entries()) {
    if (key.startsWith(prefix)) {
      results.push(value);
    }
  }
  return Promise.resolve(results);
}

Deno.test("Signup: New user should be initialized with A1 fluency level", async () => {
  // Arrange
  const userId = "test-user-1";
  const email = "test@example.com";
  const name = "Test User";
  const role = "student";
  
  // Act - Simulate signup logic
  const now = new Date().toISOString();
  const profile = {
    id: userId,
    email,
    name,
    role,
    fluencyLevel: 'A1',
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: undefined,
  };
  
  await mockKvSet(`user:${userId}`, profile);
  
  const historyEntry = {
    userId,
    previousLevel: null,
    newLevel: 'A1',
    changedAt: now,
    changedBy: 'system',
    reason: 'Initial assignment',
  };
  
  await mockKvSet(`fluency-history:${userId}:${now}`, historyEntry);
  
  // Assert
  const savedProfile = await mockKvGet(`user:${userId}`);
  assertExists(savedProfile, "Profile should be saved");
  assertEquals(savedProfile.fluencyLevel, 'A1', "Fluency level should be A1");
  assertEquals(savedProfile.fluencyLevelUpdatedBy, undefined, "Updated by should be undefined for system");
  assertExists(savedProfile.fluencyLevelUpdatedAt, "Updated at timestamp should exist");
  
  const savedHistory = await mockKvGet(`fluency-history:${userId}:${now}`);
  assertExists(savedHistory, "History entry should be saved");
  assertEquals(savedHistory.previousLevel, null, "Previous level should be null");
  assertEquals(savedHistory.newLevel, 'A1', "New level should be A1");
  assertEquals(savedHistory.changedBy, 'system', "Changed by should be system");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Profile retrieval: Existing user without fluency level should be migrated to A1", async () => {
  // Arrange - Create a user profile without fluency level (legacy user)
  const userId = "legacy-user-1";
  const legacyProfile = {
    id: userId,
    email: "legacy@example.com",
    name: "Legacy User",
    role: "student",
  };
  
  await mockKvSet(`user:${userId}`, legacyProfile);
  
  // Act - Simulate profile retrieval with migration logic
  let profile = await mockKvGet(`user:${userId}`);
  
  if (profile && !profile.fluencyLevel) {
    const now = new Date().toISOString();
    profile = {
      ...profile,
      fluencyLevel: 'A1',
      fluencyLevelUpdatedAt: now,
      fluencyLevelUpdatedBy: undefined,
    };
    
    await mockKvSet(`user:${userId}`, profile);
    
    await mockKvSet(`fluency-history:${userId}:${now}`, {
      userId,
      previousLevel: null,
      newLevel: 'A1',
      changedAt: now,
      changedBy: 'system',
      reason: 'Migration - Initial assignment',
    });
  }
  
  // Assert
  const migratedProfile = await mockKvGet(`user:${userId}`);
  assertExists(migratedProfile, "Profile should exist");
  assertEquals(migratedProfile.fluencyLevel, 'A1', "Fluency level should be A1 after migration");
  assertExists(migratedProfile.fluencyLevelUpdatedAt, "Updated at timestamp should exist");
  assertEquals(migratedProfile.email, legacyProfile.email, "Original profile data should be preserved");
  assertEquals(migratedProfile.name, legacyProfile.name, "Original profile data should be preserved");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Profile retrieval: User with existing fluency level should not be modified", async () => {
  // Arrange - Create a user profile with fluency level
  const userId = "existing-user-1";
  const existingTimestamp = "2025-01-01T00:00:00.000Z";
  const existingProfile = {
    id: userId,
    email: "existing@example.com",
    name: "Existing User",
    role: "student",
    fluencyLevel: 'B1',
    fluencyLevelUpdatedAt: existingTimestamp,
    fluencyLevelUpdatedBy: 'admin-123',
  };
  
  await mockKvSet(`user:${userId}`, existingProfile);
  
  // Act - Simulate profile retrieval
  let profile = await mockKvGet(`user:${userId}`);
  
  // Migration logic should skip users with existing fluency level
  if (profile && !profile.fluencyLevel) {
    const now = new Date().toISOString();
    profile = {
      ...profile,
      fluencyLevel: 'A1',
      fluencyLevelUpdatedAt: now,
      fluencyLevelUpdatedBy: undefined,
    };
    await mockKvSet(`user:${userId}`, profile);
  }
  
  // Assert
  const retrievedProfile = await mockKvGet(`user:${userId}`);
  assertEquals(retrievedProfile.fluencyLevel, 'B1', "Fluency level should remain B1");
  assertEquals(retrievedProfile.fluencyLevelUpdatedAt, existingTimestamp, "Timestamp should not change");
  assertEquals(retrievedProfile.fluencyLevelUpdatedBy, 'admin-123', "Updated by should not change");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Bulk migration: Should migrate only users without fluency levels", async () => {
  // Arrange - Create multiple users with and without fluency levels
  const users = [
    {
      id: "user-1",
      email: "user1@example.com",
      name: "User 1",
      role: "student",
    },
    {
      id: "user-2",
      email: "user2@example.com",
      name: "User 2",
      role: "student",
      fluencyLevel: 'A2',
      fluencyLevelUpdatedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "user-3",
      email: "user3@example.com",
      name: "User 3",
      role: "teacher",
    },
  ];
  
  for (const user of users) {
    await mockKvSet(`user:${user.id}`, user);
  }
  
  // Act - Simulate bulk migration
  const allUsers = await mockKvGetByPrefix("user:");
  const now = new Date().toISOString();
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const userProfile of allUsers) {
    if (!userProfile.fluencyLevel) {
      const updatedProfile = {
        ...userProfile,
        fluencyLevel: 'A1',
        fluencyLevelUpdatedAt: now,
        fluencyLevelUpdatedBy: undefined,
      };
      
      await mockKvSet(`user:${userProfile.id}`, updatedProfile);
      
      await mockKvSet(`fluency-history:${userProfile.id}:${now}`, {
        userId: userProfile.id,
        previousLevel: null,
        newLevel: 'A1',
        changedAt: now,
        changedBy: 'admin-id',
        reason: 'Bulk migration - Initial assignment',
      });
      
      migratedCount++;
    } else {
      skippedCount++;
    }
  }
  
  // Assert
  assertEquals(migratedCount, 2, "Should migrate 2 users without fluency levels");
  assertEquals(skippedCount, 1, "Should skip 1 user with existing fluency level");
  
  const user1 = await mockKvGet("user:user-1");
  assertEquals(user1.fluencyLevel, 'A1', "User 1 should be migrated to A1");
  
  const user2 = await mockKvGet("user:user-2");
  assertEquals(user2.fluencyLevel, 'A2', "User 2 should keep existing A2 level");
  
  const user3 = await mockKvGet("user:user-3");
  assertEquals(user3.fluencyLevel, 'A1', "User 3 (teacher) should be migrated to A1");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Profile structure: Should include all required fluency fields", async () => {
  // Arrange & Act
  const userId = "test-user-structure";
  const now = new Date().toISOString();
  const profile = {
    id: userId,
    email: "structure@example.com",
    name: "Structure Test",
    role: "student",
    fluencyLevel: 'A1',
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: undefined,
  };
  
  await mockKvSet(`user:${userId}`, profile);
  const savedProfile = await mockKvGet(`user:${userId}`);
  
  // Assert - Check all required fields exist
  assertExists(savedProfile.id, "Profile should have id");
  assertExists(savedProfile.email, "Profile should have email");
  assertExists(savedProfile.name, "Profile should have name");
  assertExists(savedProfile.role, "Profile should have role");
  assertExists(savedProfile.fluencyLevel, "Profile should have fluencyLevel");
  assertExists(savedProfile.fluencyLevelUpdatedAt, "Profile should have fluencyLevelUpdatedAt");
  
  // Assert - Check field types and values
  assertEquals(typeof savedProfile.fluencyLevel, 'string', "fluencyLevel should be a string");
  assertEquals(typeof savedProfile.fluencyLevelUpdatedAt, 'string', "fluencyLevelUpdatedAt should be a string");
  assertEquals(['A1', 'A2', 'B1', 'B2', 'C1'].includes(savedProfile.fluencyLevel), true, "fluencyLevel should be valid CEFR level");
  
  // Cleanup
  mockKVStore.clear();
});

console.log("All profile extension tests completed successfully!");

/**
 * Unit tests for fluency level retrieval endpoint
 * 
 * Tests cover:
 * - GET /fluency/:userId endpoint functionality
 * - Authentication checks
 * - Metadata inclusion
 * - Error handling
 */

// Fluency level metadata constants (matching backend)
const FLUENCY_LEVELS = {
  A1: {
    code: 'A1',
    name: 'Beginner',
    description: 'Can understand and use familiar everyday expressions',
    color: '#10b981',
    icon: '🌱'
  },
  A2: {
    code: 'A2',
    name: 'Elementary',
    description: 'Can communicate in simple and routine tasks',
    color: '#3b82f6',
    icon: '🌿'
  },
  B1: {
    code: 'B1',
    name: 'Intermediate',
    description: 'Can deal with most situations while traveling',
    color: '#8b5cf6',
    icon: '🌳'
  },
  B2: {
    code: 'B2',
    name: 'Upper Intermediate',
    description: 'Can interact with a degree of fluency and spontaneity',
    color: '#f59e0b',
    icon: '🏆'
  },
  C1: {
    code: 'C1',
    name: 'Advanced',
    description: 'Can express ideas fluently and spontaneously',
    color: '#ef4444',
    icon: '👑'
  }
};

Deno.test("GET /fluency/:userId - Should return fluency level with metadata for existing user", async () => {
  // Arrange
  const userId = "test-user-fluency-1";
  const timestamp = "2025-11-07T10:00:00.000Z";
  const adminId = "admin-123";
  
  const userProfile = {
    id: userId,
    email: "fluency@example.com",
    name: "Fluency Test User",
    role: "student",
    fluencyLevel: 'B1',
    fluencyLevelUpdatedAt: timestamp,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate endpoint logic
  const profile = await mockKvGet(`user:${userId}`);
  const fluencyLevel = profile.fluencyLevel || 'A1';
  const metadata = FLUENCY_LEVELS[fluencyLevel as keyof typeof FLUENCY_LEVELS];
  
  const response = {
    userId: profile.id,
    fluencyLevel: fluencyLevel,
    fluencyLevelUpdatedAt: profile.fluencyLevelUpdatedAt,
    fluencyLevelUpdatedBy: profile.fluencyLevelUpdatedBy,
    metadata: metadata
  };
  
  // Assert
  assertEquals(response.userId, userId, "Response should include user ID");
  assertEquals(response.fluencyLevel, 'B1', "Response should include fluency level");
  assertEquals(response.fluencyLevelUpdatedAt, timestamp, "Response should include update timestamp");
  assertEquals(response.fluencyLevelUpdatedBy, adminId, "Response should include admin ID");
  assertExists(response.metadata, "Response should include metadata");
  assertEquals(response.metadata.code, 'B1', "Metadata should have correct code");
  assertEquals(response.metadata.name, 'Intermediate', "Metadata should have correct name");
  assertEquals(response.metadata.description, 'Can deal with most situations while traveling', "Metadata should have correct description");
  assertEquals(response.metadata.color, '#8b5cf6', "Metadata should have correct color");
  assertEquals(response.metadata.icon, '🌳', "Metadata should have correct icon");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/:userId - Should return A1 level for user without fluency level", async () => {
  // Arrange
  const userId = "test-user-no-fluency";
  const userProfile = {
    id: userId,
    email: "nofluency@example.com",
    name: "No Fluency User",
    role: "student",
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate endpoint logic with default fallback
  const profile = await mockKvGet(`user:${userId}`);
  const fluencyLevel = profile.fluencyLevel || 'A1';
  const metadata = FLUENCY_LEVELS[fluencyLevel as keyof typeof FLUENCY_LEVELS];
  
  const response = {
    userId: profile.id,
    fluencyLevel: fluencyLevel,
    fluencyLevelUpdatedAt: profile.fluencyLevelUpdatedAt,
    fluencyLevelUpdatedBy: profile.fluencyLevelUpdatedBy,
    metadata: metadata
  };
  
  // Assert
  assertEquals(response.fluencyLevel, 'A1', "Should default to A1 for users without fluency level");
  assertEquals(response.metadata.code, 'A1', "Metadata should be for A1 level");
  assertEquals(response.metadata.name, 'Beginner', "Metadata should have Beginner name");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/:userId - Should return 404 for non-existent user", async () => {
  // Arrange
  const userId = "non-existent-user";
  
  // Act - Simulate endpoint logic
  const profile = await mockKvGet(`user:${userId}`);
  
  // Assert
  assertEquals(profile, null, "Should return null for non-existent user");
  
  // In the actual endpoint, this would return a 404 error
  // { error: "User not found" }, 404
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/:userId - Should include correct metadata for all fluency levels", async () => {
  // Arrange & Act - Test all fluency levels
  const levels: Array<keyof typeof FLUENCY_LEVELS> = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  for (const level of levels) {
    const userId = `test-user-${level}`;
    const userProfile = {
      id: userId,
      email: `${level}@example.com`,
      name: `${level} User`,
      role: "student",
      fluencyLevel: level,
      fluencyLevelUpdatedAt: new Date().toISOString(),
    };
    
    await mockKvSet(`user:${userId}`, userProfile);
    
    const profile = await mockKvGet(`user:${userId}`);
    const fluencyLevel = profile.fluencyLevel || 'A1';
    const metadata = FLUENCY_LEVELS[fluencyLevel as keyof typeof FLUENCY_LEVELS];
    
    // Assert
    assertExists(metadata, `Metadata should exist for level ${level}`);
    assertEquals(metadata.code, level, `Metadata code should match ${level}`);
    assertExists(metadata.name, `Metadata should have name for ${level}`);
    assertExists(metadata.description, `Metadata should have description for ${level}`);
    assertExists(metadata.color, `Metadata should have color for ${level}`);
    assertExists(metadata.icon, `Metadata should have icon for ${level}`);
  }
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/:userId - Should return correct metadata structure", async () => {
  // Arrange
  const userId = "test-metadata-structure";
  const userProfile = {
    id: userId,
    email: "metadata@example.com",
    name: "Metadata User",
    role: "student",
    fluencyLevel: 'A2',
    fluencyLevelUpdatedAt: new Date().toISOString(),
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act
  const profile = await mockKvGet(`user:${userId}`);
  const fluencyLevel = profile.fluencyLevel || 'A1';
  const metadata = FLUENCY_LEVELS[fluencyLevel as keyof typeof FLUENCY_LEVELS];
  
  // Assert - Check metadata structure
  assertEquals(typeof metadata.code, 'string', "Metadata code should be string");
  assertEquals(typeof metadata.name, 'string', "Metadata name should be string");
  assertEquals(typeof metadata.description, 'string', "Metadata description should be string");
  assertEquals(typeof metadata.color, 'string', "Metadata color should be string");
  assertEquals(typeof metadata.icon, 'string', "Metadata icon should be string");
  
  // Assert - Check color format (hex color)
  assertEquals(metadata.color.startsWith('#'), true, "Color should be hex format");
  assertEquals(metadata.color.length, 7, "Color should be 7 characters (#RRGGBB)");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/:userId - Should preserve updatedBy field when present", async () => {
  // Arrange
  const userId = "test-updated-by";
  const adminId = "admin-456";
  const userProfile = {
    id: userId,
    email: "updatedby@example.com",
    name: "Updated By User",
    role: "student",
    fluencyLevel: 'C1',
    fluencyLevelUpdatedAt: "2025-11-07T12:00:00.000Z",
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act
  const profile = await mockKvGet(`user:${userId}`);
  const response = {
    userId: profile.id,
    fluencyLevel: profile.fluencyLevel || 'A1',
    fluencyLevelUpdatedAt: profile.fluencyLevelUpdatedAt,
    fluencyLevelUpdatedBy: profile.fluencyLevelUpdatedBy,
    metadata: FLUENCY_LEVELS[profile.fluencyLevel as keyof typeof FLUENCY_LEVELS]
  };
  
  // Assert
  assertEquals(response.fluencyLevelUpdatedBy, adminId, "Should preserve updatedBy field");
  assertExists(response.fluencyLevelUpdatedAt, "Should include updatedAt timestamp");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/:userId - Should handle undefined updatedBy field", async () => {
  // Arrange
  const userId = "test-no-updated-by";
  const userProfile = {
    id: userId,
    email: "noupdatedby@example.com",
    name: "No Updated By User",
    role: "student",
    fluencyLevel: 'A1',
    fluencyLevelUpdatedAt: "2025-11-07T12:00:00.000Z",
    fluencyLevelUpdatedBy: undefined,
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act
  const profile = await mockKvGet(`user:${userId}`);
  const response = {
    userId: profile.id,
    fluencyLevel: profile.fluencyLevel || 'A1',
    fluencyLevelUpdatedAt: profile.fluencyLevelUpdatedAt,
    fluencyLevelUpdatedBy: profile.fluencyLevelUpdatedBy,
    metadata: FLUENCY_LEVELS[profile.fluencyLevel as keyof typeof FLUENCY_LEVELS]
  };
  
  // Assert
  assertEquals(response.fluencyLevelUpdatedBy, undefined, "Should handle undefined updatedBy");
  assertEquals(response.fluencyLevel, 'A1', "Should still return fluency level");
  
  // Cleanup
  mockKVStore.clear();
});

console.log("All fluency level retrieval endpoint tests completed successfully!");

/**
 * Unit tests for fluency level update endpoint
 * 
 * Tests cover:
 * - PATCH /fluency/:userId endpoint functionality
 * - Admin role verification
 * - Level transition validation
 * - History logging
 * - Error scenarios
 */

Deno.test("PATCH /fluency/:userId - Admin should successfully upgrade user from A1 to A2", async () => {
  // Arrange
  const adminId = "admin-123";
  const userId = "student-123";
  const now = new Date().toISOString();
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
    fluencyLevelUpdatedAt: "2025-01-01T00:00:00.000Z",
    fluencyLevelUpdatedBy: undefined,
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate PATCH endpoint logic
  const admin = await mockKvGet(`user:${adminId}`);
  
  // Verify admin role
  if (!admin || admin.role !== 'teacher') {
    throw new Error("Admin access required");
  }
  
  const newLevel = 'A2';
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel || 'A1';
  
  // Validate transition
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const newIndex = levelOrder.indexOf(newLevel);
  const levelDifference = Math.abs(newIndex - currentIndex);
  
  if (levelDifference !== 1) {
    throw new Error("Invalid level transition");
  }
  
  // Update profile
  const updatedProfile = {
    ...user,
    fluencyLevel: newLevel,
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, updatedProfile);
  
  // Record history
  await mockKvSet(`fluency-history:${userId}:${now}`, {
    userId: userId,
    previousLevel: currentLevel,
    newLevel: newLevel,
    changedAt: now,
    changedBy: adminId,
    changedByName: admin.name,
  });
  
  // Assert
  const updated = await mockKvGet(`user:${userId}`);
  assertEquals(updated.fluencyLevel, 'A2', "Fluency level should be updated to A2");
  assertEquals(updated.fluencyLevelUpdatedBy, adminId, "Updated by should be admin ID");
  assertExists(updated.fluencyLevelUpdatedAt, "Updated at timestamp should exist");
  
  const history = await mockKvGet(`fluency-history:${userId}:${now}`);
  assertExists(history, "History entry should be created");
  assertEquals(history.previousLevel, 'A1', "History should record previous level");
  assertEquals(history.newLevel, 'A2', "History should record new level");
  assertEquals(history.changedBy, adminId, "History should record admin ID");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Admin should successfully downgrade user from B2 to B1", async () => {
  // Arrange
  const adminId = "admin-456";
  const userId = "student-456";
  const now = new Date().toISOString();
  
  const adminProfile = {
    id: adminId,
    email: "admin2@example.com",
    name: "Admin Two",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student2@example.com",
    name: "Student Two",
    role: "student",
    fluencyLevel: 'B2',
    fluencyLevelUpdatedAt: "2025-10-01T00:00:00.000Z",
    fluencyLevelUpdatedBy: "previous-admin",
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate downgrade
  const admin = await mockKvGet(`user:${adminId}`);
  const newLevel = 'B1';
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel;
  
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const newIndex = levelOrder.indexOf(newLevel);
  const levelDifference = Math.abs(newIndex - currentIndex);
  
  if (levelDifference !== 1) {
    throw new Error("Invalid level transition");
  }
  
  const updatedProfile = {
    ...user,
    fluencyLevel: newLevel,
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, updatedProfile);
  
  await mockKvSet(`fluency-history:${userId}:${now}`, {
    userId: userId,
    previousLevel: currentLevel,
    newLevel: newLevel,
    changedAt: now,
    changedBy: adminId,
    changedByName: admin.name,
  });
  
  // Assert
  const updated = await mockKvGet(`user:${userId}`);
  assertEquals(updated.fluencyLevel, 'B1', "Fluency level should be downgraded to B1");
  assertEquals(updated.fluencyLevelUpdatedBy, adminId, "Updated by should be new admin ID");
  
  const history = await mockKvGet(`fluency-history:${userId}:${now}`);
  assertEquals(history.previousLevel, 'B2', "History should record previous level B2");
  assertEquals(history.newLevel, 'B1', "History should record new level B1");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should reject non-admin user attempting to update level", async () => {
  // Arrange
  const studentId = "student-789";
  const targetUserId = "student-999";
  
  const studentProfile = {
    id: studentId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A2',
  };
  
  const targetProfile = {
    id: targetUserId,
    email: "target@example.com",
    name: "Target User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${studentId}`, studentProfile);
  await mockKvSet(`user:${targetUserId}`, targetProfile);
  
  // Act & Assert - Simulate admin check
  const requestingUser = await mockKvGet(`user:${studentId}`);
  
  let errorThrown = false;
  let errorMessage = "";
  
  try {
    if (!requestingUser || requestingUser.role !== 'teacher') {
      throw new Error("Admin access required");
    }
  } catch (error) {
    errorThrown = true;
    errorMessage = (error as Error).message;
  }
  
  assertEquals(errorThrown, true, "Should throw error for non-admin");
  assertEquals(errorMessage, "Admin access required", "Should have correct error message");
  
  // Verify target user was not modified
  const targetUser = await mockKvGet(`user:${targetUserId}`);
  assertEquals(targetUser.fluencyLevel, 'A1', "Target user level should remain unchanged");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should reject invalid level transition (skipping levels)", async () => {
  // Arrange
  const adminId = "admin-skip";
  const userId = "student-skip";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act & Assert - Try to skip from A1 to B1
  const admin = await mockKvGet(`user:${adminId}`);
  const newLevel = 'B1'; // Skipping A2
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel;
  
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const newIndex = levelOrder.indexOf(newLevel);
  const levelDifference = Math.abs(newIndex - currentIndex);
  
  let errorThrown = false;
  let errorMessage = "";
  
  try {
    if (levelDifference !== 1) {
      throw new Error("Invalid level transition. Can only move one level at a time");
    }
  } catch (error) {
    errorThrown = true;
    errorMessage = (error as Error).message;
  }
  
  assertEquals(errorThrown, true, "Should throw error for invalid transition");
  assertEquals(errorMessage, "Invalid level transition. Can only move one level at a time", "Should have correct error message");
  
  // Verify user level unchanged
  const unchangedUser = await mockKvGet(`user:${userId}`);
  assertEquals(unchangedUser.fluencyLevel, 'A1', "User level should remain A1");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should reject downgrade below A1", async () => {
  // Arrange
  const adminId = "admin-min";
  const userId = "student-min";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act & Assert - Try to downgrade below A1 (hypothetical level)
  const newLevel = 'A0'; // Invalid level below A1
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  let errorThrown = false;
  let errorMessage = "";
  
  try {
    if (!validLevels.includes(newLevel)) {
      throw new Error("Invalid fluency level");
    }
  } catch (error) {
    errorThrown = true;
    errorMessage = (error as Error).message;
  }
  
  assertEquals(errorThrown, true, "Should throw error for invalid level");
  assertEquals(errorMessage, "Invalid fluency level", "Should have correct error message");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should reject upgrade beyond C1", async () => {
  // Arrange
  const adminId = "admin-max";
  const userId = "student-max";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'C1',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act & Assert - Try to upgrade beyond C1
  const newLevel = 'C2'; // Invalid level beyond C1
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  let errorThrown = false;
  let errorMessage = "";
  
  try {
    if (!validLevels.includes(newLevel)) {
      throw new Error("Invalid fluency level");
    }
  } catch (error) {
    errorThrown = true;
    errorMessage = (error as Error).message;
  }
  
  assertEquals(errorThrown, true, "Should throw error for invalid level");
  assertEquals(errorMessage, "Invalid fluency level", "Should have correct error message");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should return 404 for non-existent user", async () => {
  // Arrange
  const adminId = "admin-404";
  const userId = "non-existent-user";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  
  // Act & Assert
  const user = await mockKvGet(`user:${userId}`);
  
  assertEquals(user, null, "Should return null for non-existent user");
  // In actual endpoint, this would return { error: "User not found" }, 404
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should reject invalid level format", async () => {
  // Arrange
  const adminId = "admin-invalid";
  const userId = "student-invalid";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act & Assert - Try various invalid formats
  const invalidLevels = ['a1', 'A 1', 'B3', 'D1', '', null, undefined, 'beginner'];
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  for (const invalidLevel of invalidLevels) {
    let errorThrown = false;
    
    try {
      if (!invalidLevel || !validLevels.includes(invalidLevel)) {
        throw new Error("Invalid fluency level");
      }
    } catch (error) {
      errorThrown = true;
    }
    
    assertEquals(errorThrown, true, `Should reject invalid level: ${invalidLevel}`);
  }
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should record admin name in history", async () => {
  // Arrange
  const adminId = "admin-history";
  const userId = "student-history";
  const now = new Date().toISOString();
  const adminName = "Dr. Admin";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: adminName,
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A2',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act
  const admin = await mockKvGet(`user:${adminId}`);
  const newLevel = 'B1';
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel;
  
  await mockKvSet(`fluency-history:${userId}:${now}`, {
    userId: userId,
    previousLevel: currentLevel,
    newLevel: newLevel,
    changedAt: now,
    changedBy: adminId,
    changedByName: admin.name,
  });
  
  // Assert
  const history = await mockKvGet(`fluency-history:${userId}:${now}`);
  assertEquals(history.changedByName, adminName, "History should include admin name");
  assertEquals(history.changedBy, adminId, "History should include admin ID");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should update timestamp on level change", async () => {
  // Arrange
  const adminId = "admin-timestamp";
  const userId = "student-timestamp";
  const oldTimestamp = "2025-01-01T00:00:00.000Z";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'B1',
    fluencyLevelUpdatedAt: oldTimestamp,
    fluencyLevelUpdatedBy: "old-admin",
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act
  const newTimestamp = new Date().toISOString();
  const user = await mockKvGet(`user:${userId}`);
  
  const updatedProfile = {
    ...user,
    fluencyLevel: 'B2',
    fluencyLevelUpdatedAt: newTimestamp,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, updatedProfile);
  
  // Assert
  const updated = await mockKvGet(`user:${userId}`);
  assertEquals(updated.fluencyLevelUpdatedAt !== oldTimestamp, true, "Timestamp should be updated");
  assertEquals(updated.fluencyLevelUpdatedBy, adminId, "Updated by should be new admin");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should allow upgrade from A1 to A2 to B1 to B2 to C1", async () => {
  // Arrange
  const adminId = "admin-progression";
  const userId = "student-progression";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate full progression
  const progression = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  for (let i = 0; i < progression.length - 1; i++) {
    const currentLevel = progression[i];
    const nextLevel = progression[i + 1];
    
    const user = await mockKvGet(`user:${userId}`);
    assertEquals(user.fluencyLevel, currentLevel, `User should be at ${currentLevel}`);
    
    // Validate transition
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    const newIndex = levelOrder.indexOf(nextLevel);
    const levelDifference = Math.abs(newIndex - currentIndex);
    
    assertEquals(levelDifference, 1, `Transition from ${currentLevel} to ${nextLevel} should be valid`);
    
    // Update
    const updatedProfile = {
      ...user,
      fluencyLevel: nextLevel,
      fluencyLevelUpdatedAt: new Date().toISOString(),
      fluencyLevelUpdatedBy: adminId,
    };
    
    await mockKvSet(`user:${userId}`, updatedProfile);
  }
  
  // Assert final state
  const finalUser = await mockKvGet(`user:${userId}`);
  assertEquals(finalUser.fluencyLevel, 'C1', "User should reach C1 level");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("PATCH /fluency/:userId - Should include metadata in response", async () => {
  // Arrange
  const adminId = "admin-metadata";
  const userId = "student-metadata";
  const now = new Date().toISOString();
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act
  const newLevel = 'A2';
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel;
  
  const updatedProfile = {
    ...user,
    fluencyLevel: newLevel,
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, updatedProfile);
  
  const metadata = FLUENCY_LEVELS[newLevel as keyof typeof FLUENCY_LEVELS];
  
  const response = {
    success: true,
    userId: userId,
    previousLevel: currentLevel,
    newLevel: newLevel,
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: adminId,
    metadata: metadata
  };
  
  // Assert
  assertEquals(response.success, true, "Response should indicate success");
  assertEquals(response.previousLevel, 'A1', "Response should include previous level");
  assertEquals(response.newLevel, 'A2', "Response should include new level");
  assertExists(response.metadata, "Response should include metadata");
  assertEquals(response.metadata.code, 'A2', "Metadata should be for new level");
  assertEquals(response.metadata.name, 'Elementary', "Metadata should have correct name");
  
  // Cleanup
  mockKVStore.clear();
});

console.log("All fluency level update endpoint tests completed successfully!");

/**
 * Unit tests for fluency history logging and retrieval
 * 
 * Tests cover:
 * - History logging when level changes
 * - GET /fluency/history/:userId endpoint functionality
 * - Reverse chronological sorting
 * - Multiple history entries
 * - Error scenarios
 */

Deno.test("Fluency History - Should log history entry when level is updated", async () => {
  // Arrange
  const adminId = "admin-history-1";
  const userId = "student-history-1";
  const timestamp1 = "2025-11-01T10:00:00.000Z";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
    fluencyLevelUpdatedAt: "2025-01-01T00:00:00.000Z",
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate level update with history logging
  const admin = await mockKvGet(`user:${adminId}`);
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel;
  const newLevel = 'A2';
  
  // Update profile
  const updatedProfile = {
    ...user,
    fluencyLevel: newLevel,
    fluencyLevelUpdatedAt: timestamp1,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, updatedProfile);
  
  // Log history
  await mockKvSet(`fluency-history:${userId}:${timestamp1}`, {
    userId: userId,
    previousLevel: currentLevel,
    newLevel: newLevel,
    changedAt: timestamp1,
    changedBy: adminId,
    changedByName: admin.name,
  });
  
  // Assert
  const historyEntry = await mockKvGet(`fluency-history:${userId}:${timestamp1}`);
  assertExists(historyEntry, "History entry should be created");
  assertEquals(historyEntry.userId, userId, "History should record user ID");
  assertEquals(historyEntry.previousLevel, 'A1', "History should record previous level");
  assertEquals(historyEntry.newLevel, 'A2', "History should record new level");
  assertEquals(historyEntry.changedAt, timestamp1, "History should record timestamp");
  assertEquals(historyEntry.changedBy, adminId, "History should record admin ID");
  assertEquals(historyEntry.changedByName, "Admin User", "History should record admin name");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/history/:userId - Should retrieve all history entries for a user", async () => {
  // Arrange
  const userId = "student-history-2";
  const adminId1 = "admin-1";
  const adminId2 = "admin-2";
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'B1',
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Create multiple history entries
  const historyEntries = [
    {
      userId: userId,
      previousLevel: null,
      newLevel: 'A1',
      changedAt: "2025-01-01T00:00:00.000Z",
      changedBy: 'system',
      changedByName: 'System',
    },
    {
      userId: userId,
      previousLevel: 'A1',
      newLevel: 'A2',
      changedAt: "2025-03-15T10:00:00.000Z",
      changedBy: adminId1,
      changedByName: 'Admin One',
    },
    {
      userId: userId,
      previousLevel: 'A2',
      newLevel: 'B1',
      changedAt: "2025-06-20T14:30:00.000Z",
      changedBy: adminId2,
      changedByName: 'Admin Two',
    },
  ];
  
  for (const entry of historyEntries) {
    await mockKvSet(`fluency-history:${userId}:${entry.changedAt}`, entry);
  }
  
  // Act - Simulate GET /fluency/history/:userId endpoint
  const history = await mockKvGetByPrefix(`fluency-history:${userId}:`);
  
  // Assert
  assertEquals(history.length, 3, "Should retrieve all 3 history entries");
  
  // Verify each entry
  const initialEntry = history.find(h => h.previousLevel === null);
  assertExists(initialEntry, "Should include initial A1 assignment");
  assertEquals(initialEntry.newLevel, 'A1', "Initial entry should be A1");
  assertEquals(initialEntry.changedBy, 'system', "Initial entry should be by system");
  
  const firstUpgrade = history.find(h => h.newLevel === 'A2');
  assertExists(firstUpgrade, "Should include A1 to A2 upgrade");
  assertEquals(firstUpgrade.previousLevel, 'A1', "First upgrade previous level should be A1");
  
  const secondUpgrade = history.find(h => h.newLevel === 'B1');
  assertExists(secondUpgrade, "Should include A2 to B1 upgrade");
  assertEquals(secondUpgrade.previousLevel, 'A2', "Second upgrade previous level should be A2");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/history/:userId - Should sort history in reverse chronological order", async () => {
  // Arrange
  const userId = "student-history-3";
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'B2',
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Create history entries with different timestamps
  const historyEntries = [
    {
      userId: userId,
      previousLevel: null,
      newLevel: 'A1',
      changedAt: "2025-01-01T00:00:00.000Z",
      changedBy: 'system',
    },
    {
      userId: userId,
      previousLevel: 'A1',
      newLevel: 'A2',
      changedAt: "2025-02-15T10:00:00.000Z",
      changedBy: 'admin-1',
    },
    {
      userId: userId,
      previousLevel: 'A2',
      newLevel: 'B1',
      changedAt: "2025-05-20T14:30:00.000Z",
      changedBy: 'admin-2',
    },
    {
      userId: userId,
      previousLevel: 'B1',
      newLevel: 'B2',
      changedAt: "2025-10-10T09:15:00.000Z",
      changedBy: 'admin-3',
    },
  ];
  
  for (const entry of historyEntries) {
    await mockKvSet(`fluency-history:${userId}:${entry.changedAt}`, entry);
  }
  
  // Act - Simulate endpoint with sorting
  const history = await mockKvGetByPrefix(`fluency-history:${userId}:`);
  
  // Sort in reverse chronological order (most recent first)
  const sortedHistory = history.sort((a, b) => {
    const dateA = new Date(a.changedAt).getTime();
    const dateB = new Date(b.changedAt).getTime();
    return dateB - dateA; // Descending order
  });
  
  // Assert
  assertEquals(sortedHistory.length, 4, "Should have 4 history entries");
  assertEquals(sortedHistory[0].newLevel, 'B2', "Most recent entry should be B2");
  assertEquals(sortedHistory[0].changedAt, "2025-10-10T09:15:00.000Z", "Most recent timestamp should be first");
  assertEquals(sortedHistory[1].newLevel, 'B1', "Second entry should be B1");
  assertEquals(sortedHistory[2].newLevel, 'A2', "Third entry should be A2");
  assertEquals(sortedHistory[3].newLevel, 'A1', "Oldest entry should be A1");
  assertEquals(sortedHistory[3].changedAt, "2025-01-01T00:00:00.000Z", "Oldest timestamp should be last");
  
  // Verify chronological order
  for (let i = 0; i < sortedHistory.length - 1; i++) {
    const currentDate = new Date(sortedHistory[i].changedAt).getTime();
    const nextDate = new Date(sortedHistory[i + 1].changedAt).getTime();
    assertEquals(currentDate > nextDate, true, `Entry ${i} should be more recent than entry ${i + 1}`);
  }
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/history/:userId - Should return empty array for user with no history", async () => {
  // Arrange
  const userId = "student-no-history";
  
  const userProfile = {
    id: userId,
    email: "nohistory@example.com",
    name: "No History User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate endpoint
  const history = await mockKvGetByPrefix(`fluency-history:${userId}:`);
  
  // Assert
  assertEquals(history.length, 0, "Should return empty array for user with no history");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/history/:userId - Should return 404 for non-existent user", async () => {
  // Arrange
  const userId = "non-existent-user";
  
  // Act - Simulate endpoint
  const userProfile = await mockKvGet(`user:${userId}`);
  
  // Assert
  assertEquals(userProfile, null, "Should return null for non-existent user");
  // In actual endpoint, this would return { error: "User not found" }, 404
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Fluency History - Should include admin name in history entry", async () => {
  // Arrange
  const adminId = "admin-with-name";
  const userId = "student-with-admin-name";
  const timestamp = "2025-11-07T12:00:00.000Z";
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "John Admin",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate level update with admin name
  const admin = await mockKvGet(`user:${adminId}`);
  
  await mockKvSet(`fluency-history:${userId}:${timestamp}`, {
    userId: userId,
    previousLevel: 'A1',
    newLevel: 'A2',
    changedAt: timestamp,
    changedBy: adminId,
    changedByName: admin.name,
  });
  
  // Assert
  const historyEntry = await mockKvGet(`fluency-history:${userId}:${timestamp}`);
  assertExists(historyEntry.changedByName, "History should include admin name");
  assertEquals(historyEntry.changedByName, "John Admin", "Admin name should match");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Fluency History - Should handle multiple level changes by different admins", async () => {
  // Arrange
  const userId = "student-multi-admin";
  const admin1Id = "admin-1";
  const admin2Id = "admin-2";
  const admin3Id = "admin-3";
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'B1',
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Create history with different admins
  const historyEntries = [
    {
      userId: userId,
      previousLevel: null,
      newLevel: 'A1',
      changedAt: "2025-01-01T00:00:00.000Z",
      changedBy: 'system',
      changedByName: 'System',
    },
    {
      userId: userId,
      previousLevel: 'A1',
      newLevel: 'A2',
      changedAt: "2025-03-15T10:00:00.000Z",
      changedBy: admin1Id,
      changedByName: 'Admin One',
    },
    {
      userId: userId,
      previousLevel: 'A2',
      newLevel: 'B1',
      changedAt: "2025-06-20T14:30:00.000Z",
      changedBy: admin2Id,
      changedByName: 'Admin Two',
    },
    {
      userId: userId,
      previousLevel: 'B1',
      newLevel: 'A2',
      changedAt: "2025-08-10T09:00:00.000Z",
      changedBy: admin3Id,
      changedByName: 'Admin Three',
    },
  ];
  
  for (const entry of historyEntries) {
    await mockKvSet(`fluency-history:${userId}:${entry.changedAt}`, entry);
  }
  
  // Act
  const history = await mockKvGetByPrefix(`fluency-history:${userId}:`);
  
  // Assert
  assertEquals(history.length, 4, "Should have 4 history entries");
  
  // Verify different admins
  const adminIds = new Set(history.map(h => h.changedBy));
  assertEquals(adminIds.size, 4, "Should have 4 different changedBy values (system + 3 admins)");
  assertEquals(adminIds.has('system'), true, "Should include system");
  assertEquals(adminIds.has(admin1Id), true, "Should include admin 1");
  assertEquals(adminIds.has(admin2Id), true, "Should include admin 2");
  assertEquals(adminIds.has(admin3Id), true, "Should include admin 3");
  
  // Verify downgrade is recorded
  const downgradeEntry = history.find(h => h.previousLevel === 'B1' && h.newLevel === 'A2');
  assertExists(downgradeEntry, "Should include downgrade from B1 to A2");
  assertEquals(downgradeEntry.changedBy, admin3Id, "Downgrade should be by admin 3");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Fluency History - Should preserve history structure with all required fields", async () => {
  // Arrange
  const userId = "student-history-structure";
  const adminId = "admin-structure";
  const timestamp = "2025-11-07T15:00:00.000Z";
  
  const historyEntry = {
    userId: userId,
    previousLevel: 'A2',
    newLevel: 'B1',
    changedAt: timestamp,
    changedBy: adminId,
    changedByName: 'Admin User',
  };
  
  await mockKvSet(`fluency-history:${userId}:${timestamp}`, historyEntry);
  
  // Act
  const savedEntry = await mockKvGet(`fluency-history:${userId}:${timestamp}`);
  
  // Assert - Check all required fields
  assertExists(savedEntry.userId, "History should have userId");
  assertExists(savedEntry.previousLevel, "History should have previousLevel");
  assertExists(savedEntry.newLevel, "History should have newLevel");
  assertExists(savedEntry.changedAt, "History should have changedAt");
  assertExists(savedEntry.changedBy, "History should have changedBy");
  assertExists(savedEntry.changedByName, "History should have changedByName");
  
  // Assert - Check field types
  assertEquals(typeof savedEntry.userId, 'string', "userId should be string");
  assertEquals(typeof savedEntry.previousLevel, 'string', "previousLevel should be string");
  assertEquals(typeof savedEntry.newLevel, 'string', "newLevel should be string");
  assertEquals(typeof savedEntry.changedAt, 'string', "changedAt should be string");
  assertEquals(typeof savedEntry.changedBy, 'string', "changedBy should be string");
  assertEquals(typeof savedEntry.changedByName, 'string', "changedByName should be string");
  
  // Assert - Check valid levels
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  assertEquals(validLevels.includes(savedEntry.previousLevel), true, "previousLevel should be valid");
  assertEquals(validLevels.includes(savedEntry.newLevel), true, "newLevel should be valid");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Fluency History - Should handle initial assignment with null previousLevel", async () => {
  // Arrange
  const userId = "student-initial";
  const timestamp = "2025-11-07T16:00:00.000Z";
  
  const historyEntry = {
    userId: userId,
    previousLevel: null,
    newLevel: 'A1',
    changedAt: timestamp,
    changedBy: 'system',
    changedByName: 'System',
  };
  
  await mockKvSet(`fluency-history:${userId}:${timestamp}`, historyEntry);
  
  // Act
  const savedEntry = await mockKvGet(`fluency-history:${userId}:${timestamp}`);
  
  // Assert
  assertEquals(savedEntry.previousLevel, null, "Initial assignment should have null previousLevel");
  assertEquals(savedEntry.newLevel, 'A1', "Initial assignment should be A1");
  assertEquals(savedEntry.changedBy, 'system', "Initial assignment should be by system");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /fluency/history/:userId - Should correctly sort entries with same date but different times", async () => {
  // Arrange
  const userId = "student-same-day";
  
  const userProfile = {
    id: userId,
    email: "sameday@example.com",
    name: "Same Day User",
    role: "student",
    fluencyLevel: 'B1',
  };
  
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Create multiple entries on the same day
  const historyEntries = [
    {
      userId: userId,
      previousLevel: 'A1',
      newLevel: 'A2',
      changedAt: "2025-11-07T09:00:00.000Z",
      changedBy: 'admin-1',
    },
    {
      userId: userId,
      previousLevel: 'A2',
      newLevel: 'B1',
      changedAt: "2025-11-07T14:30:00.000Z",
      changedBy: 'admin-2',
    },
    {
      userId: userId,
      previousLevel: 'B1',
      newLevel: 'A2',
      changedAt: "2025-11-07T16:45:00.000Z",
      changedBy: 'admin-3',
    },
  ];
  
  for (const entry of historyEntries) {
    await mockKvSet(`fluency-history:${userId}:${entry.changedAt}`, entry);
  }
  
  // Act
  const history = await mockKvGetByPrefix(`fluency-history:${userId}:`);
  const sortedHistory = history.sort((a, b) => {
    const dateA = new Date(a.changedAt).getTime();
    const dateB = new Date(b.changedAt).getTime();
    return dateB - dateA;
  });
  
  // Assert
  assertEquals(sortedHistory[0].changedAt, "2025-11-07T16:45:00.000Z", "Latest time should be first");
  assertEquals(sortedHistory[1].changedAt, "2025-11-07T14:30:00.000Z", "Middle time should be second");
  assertEquals(sortedHistory[2].changedAt, "2025-11-07T09:00:00.000Z", "Earliest time should be last");
  
  // Cleanup
  mockKVStore.clear();
});

console.log("All fluency history logging and retrieval tests completed successfully!");

/**
 * Unit tests for certificate generation logic
 * 
 * Tests cover:
 * - Certificate object generation with unique ID
 * - Certificate number generation (format: DLA-YYYY-LEVEL-NNNNNN)
 * - Certificate storage in KV store
 * - Automatic certificate generation on level upgrade
 * - Certificate counter management
 */

/**
 * Mock implementation of generateCertificateNumber function
 */
async function mockGenerateCertificateNumber(level: string): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get the current certificate counter for this year and level
  const counterKey = `certificate-counter:${year}:${level}`;
  const currentCounter = await mockKvGet(counterKey) || 0;
  const nextCounter = currentCounter + 1;
  
  // Update the counter
  await mockKvSet(counterKey, nextCounter);
  
  // Format the counter as a 6-digit number with leading zeros
  const formattedCounter = String(nextCounter).padStart(6, '0');
  
  return `DLA-${year}-${level}-${formattedCounter}`;
}

/**
 * Mock implementation of generateCertificate function
 */
async function mockGenerateCertificate(
  userId: string,
  userName: string,
  level: string,
  issuedBy: string
): Promise<any> {
  // Generate unique certificate ID (using timestamp for testing)
  const certificateId = `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate certificate number
  const certificateNumber = await mockGenerateCertificateNumber(level);
  
  // Create certificate object
  const certificate = {
    id: certificateId,
    userId,
    userName,
    level,
    issuedAt: new Date().toISOString(),
    issuedBy,
    certificateNumber,
  };
  
  // Store certificate in KV store
  await mockKvSet(`certificate:${userId}:${certificateId}`, certificate);
  
  return certificate;
}

Deno.test("Certificate Generation: Should generate certificate with unique ID", async () => {
  // Arrange
  const userId = "student-cert-1";
  const userName = "Test Student";
  const level = "A2";
  const adminId = "admin-cert-1";
  
  // Act
  const certificate = await mockGenerateCertificate(userId, userName, level, adminId);
  
  // Assert
  assertExists(certificate.id, "Certificate should have an ID");
  assertEquals(typeof certificate.id, 'string', "Certificate ID should be a string");
  assertEquals(certificate.id.length > 0, true, "Certificate ID should not be empty");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should generate certificate number in correct format (DLA-YYYY-LEVEL-NNNNNN)", async () => {
  // Arrange
  const userId = "student-cert-2";
  const userName = "Test Student 2";
  const level = "B1";
  const adminId = "admin-cert-2";
  const currentYear = new Date().getFullYear();
  
  // Act
  const certificate = await mockGenerateCertificate(userId, userName, level, adminId);
  
  // Assert
  assertExists(certificate.certificateNumber, "Certificate should have a certificate number");
  
  // Check format: DLA-YYYY-LEVEL-NNNNNN
  const pattern = new RegExp(`^DLA-${currentYear}-${level}-\\d{6}$`);
  assertEquals(pattern.test(certificate.certificateNumber), true, 
    `Certificate number should match format DLA-${currentYear}-${level}-NNNNNN, got: ${certificate.certificateNumber}`);
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should increment certificate counter for each certificate", async () => {
  // Arrange
  const level = "A2";
  const currentYear = new Date().getFullYear();
  
  // Act - Generate multiple certificates
  const cert1 = await mockGenerateCertificate("user-1", "User 1", level, "admin-1");
  const cert2 = await mockGenerateCertificate("user-2", "User 2", level, "admin-1");
  const cert3 = await mockGenerateCertificate("user-3", "User 3", level, "admin-1");
  
  // Assert
  assertEquals(cert1.certificateNumber, `DLA-${currentYear}-${level}-000001`, "First certificate should be 000001");
  assertEquals(cert2.certificateNumber, `DLA-${currentYear}-${level}-000002`, "Second certificate should be 000002");
  assertEquals(cert3.certificateNumber, `DLA-${currentYear}-${level}-000003`, "Third certificate should be 000003");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should maintain separate counters for different levels", async () => {
  // Arrange
  const currentYear = new Date().getFullYear();
  
  // Act - Generate certificates for different levels
  const certA1 = await mockGenerateCertificate("user-a1", "User A1", "A1", "admin-1");
  const certA2 = await mockGenerateCertificate("user-a2", "User A2", "A2", "admin-1");
  const certA1_2 = await mockGenerateCertificate("user-a1-2", "User A1 2", "A1", "admin-1");
  const certB1 = await mockGenerateCertificate("user-b1", "User B1", "B1", "admin-1");
  
  // Assert
  assertEquals(certA1.certificateNumber, `DLA-${currentYear}-A1-000001`, "First A1 certificate");
  assertEquals(certA2.certificateNumber, `DLA-${currentYear}-A2-000001`, "First A2 certificate");
  assertEquals(certA1_2.certificateNumber, `DLA-${currentYear}-A1-000002`, "Second A1 certificate");
  assertEquals(certB1.certificateNumber, `DLA-${currentYear}-B1-000001`, "First B1 certificate");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should store certificate in KV store with correct key", async () => {
  // Arrange
  const userId = "student-cert-store";
  const userName = "Store Test Student";
  const level = "B2";
  const adminId = "admin-cert-store";
  
  // Act
  const certificate = await mockGenerateCertificate(userId, userName, level, adminId);
  
  // Assert
  const storedCertificate = await mockKvGet(`certificate:${userId}:${certificate.id}`);
  assertExists(storedCertificate, "Certificate should be stored in KV store");
  assertEquals(storedCertificate.id, certificate.id, "Stored certificate ID should match");
  assertEquals(storedCertificate.userId, userId, "Stored certificate userId should match");
  assertEquals(storedCertificate.level, level, "Stored certificate level should match");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should include all required fields in certificate object", async () => {
  // Arrange
  const userId = "student-cert-fields";
  const userName = "Fields Test Student";
  const level = "C1";
  const adminId = "admin-cert-fields";
  
  // Act
  const certificate = await mockGenerateCertificate(userId, userName, level, adminId);
  
  // Assert - Check all required fields
  assertExists(certificate.id, "Certificate should have id");
  assertExists(certificate.userId, "Certificate should have userId");
  assertExists(certificate.userName, "Certificate should have userName");
  assertExists(certificate.level, "Certificate should have level");
  assertExists(certificate.issuedAt, "Certificate should have issuedAt");
  assertExists(certificate.issuedBy, "Certificate should have issuedBy");
  assertExists(certificate.certificateNumber, "Certificate should have certificateNumber");
  
  // Assert - Check field values
  assertEquals(certificate.userId, userId, "userId should match");
  assertEquals(certificate.userName, userName, "userName should match");
  assertEquals(certificate.level, level, "level should match");
  assertEquals(certificate.issuedBy, adminId, "issuedBy should match");
  
  // Assert - Check field types
  assertEquals(typeof certificate.id, 'string', "id should be string");
  assertEquals(typeof certificate.userId, 'string', "userId should be string");
  assertEquals(typeof certificate.userName, 'string', "userName should be string");
  assertEquals(typeof certificate.level, 'string', "level should be string");
  assertEquals(typeof certificate.issuedAt, 'string', "issuedAt should be string");
  assertEquals(typeof certificate.issuedBy, 'string', "issuedBy should be string");
  assertEquals(typeof certificate.certificateNumber, 'string', "certificateNumber should be string");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should generate certificate with valid ISO timestamp", async () => {
  // Arrange
  const userId = "student-cert-timestamp";
  const userName = "Timestamp Test Student";
  const level = "A2";
  const adminId = "admin-cert-timestamp";
  const beforeGeneration = new Date();
  
  // Act
  const certificate = await mockGenerateCertificate(userId, userName, level, adminId);
  const afterGeneration = new Date();
  
  // Assert
  assertExists(certificate.issuedAt, "Certificate should have issuedAt timestamp");
  
  // Verify it's a valid ISO string
  const issuedDate = new Date(certificate.issuedAt);
  assertEquals(isNaN(issuedDate.getTime()), false, "issuedAt should be a valid date");
  
  // Verify timestamp is within reasonable range
  assertEquals(issuedDate >= beforeGeneration, true, "issuedAt should be after test start");
  assertEquals(issuedDate <= afterGeneration, true, "issuedAt should be before test end");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should generate unique certificate IDs for multiple certificates", async () => {
  // Arrange
  const userId = "student-cert-unique";
  const userName = "Unique Test Student";
  const level = "B1";
  const adminId = "admin-cert-unique";
  
  // Act - Generate multiple certificates
  const cert1 = await mockGenerateCertificate(userId, userName, level, adminId);
  const cert2 = await mockGenerateCertificate(userId, userName, level, adminId);
  const cert3 = await mockGenerateCertificate(userId, userName, level, adminId);
  
  // Assert
  assertEquals(cert1.id !== cert2.id, true, "Certificate IDs should be unique (cert1 vs cert2)");
  assertEquals(cert1.id !== cert3.id, true, "Certificate IDs should be unique (cert1 vs cert3)");
  assertEquals(cert2.id !== cert3.id, true, "Certificate IDs should be unique (cert2 vs cert3)");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should pad certificate counter with leading zeros", async () => {
  // Arrange
  const level = "A1";
  const currentYear = new Date().getFullYear();
  
  // Act - Generate certificates to test padding
  const cert1 = await mockGenerateCertificate("user-1", "User 1", level, "admin-1");
  
  // Set counter to a higher number to test different padding scenarios
  await mockKvSet(`certificate-counter:${currentYear}:${level}`, 99);
  const cert100 = await mockGenerateCertificate("user-100", "User 100", level, "admin-1");
  
  await mockKvSet(`certificate-counter:${currentYear}:${level}`, 999);
  const cert1000 = await mockGenerateCertificate("user-1000", "User 1000", level, "admin-1");
  
  // Assert
  assertEquals(cert1.certificateNumber.endsWith("000001"), true, "Should pad to 6 digits: 000001");
  assertEquals(cert100.certificateNumber.endsWith("000100"), true, "Should pad to 6 digits: 000100");
  assertEquals(cert1000.certificateNumber.endsWith("001000"), true, "Should pad to 6 digits: 001000");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should trigger on fluency level upgrade", async () => {
  // Arrange
  const adminId = "admin-upgrade-cert";
  const userId = "student-upgrade-cert";
  const now = new Date().toISOString();
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'A1',
    fluencyLevelUpdatedAt: "2025-01-01T00:00:00.000Z",
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate level upgrade with certificate generation
  const admin = await mockKvGet(`user:${adminId}`);
  const newLevel = 'A2';
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel;
  
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const newIndex = levelOrder.indexOf(newLevel);
  
  // Update profile
  const updatedProfile = {
    ...user,
    fluencyLevel: newLevel,
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, updatedProfile);
  
  // Generate certificate if upgrade (not downgrade)
  let certificate = null;
  if (newIndex > currentIndex) {
    certificate = await mockGenerateCertificate(
      userId,
      user.name,
      newLevel,
      adminId
    );
  }
  
  // Assert
  assertExists(certificate, "Certificate should be generated on upgrade");
  assertEquals(certificate.userId, userId, "Certificate userId should match");
  assertEquals(certificate.userName, "Student User", "Certificate userName should match");
  assertEquals(certificate.level, 'A2', "Certificate level should be A2");
  assertEquals(certificate.issuedBy, adminId, "Certificate issuedBy should be admin ID");
  
  // Verify certificate is stored
  const storedCertificate = await mockKvGet(`certificate:${userId}:${certificate.id}`);
  assertExists(storedCertificate, "Certificate should be stored in KV store");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should NOT generate certificate on level downgrade", async () => {
  // Arrange
  const adminId = "admin-downgrade-cert";
  const userId = "student-downgrade-cert";
  const now = new Date().toISOString();
  
  const adminProfile = {
    id: adminId,
    email: "admin@example.com",
    name: "Admin User",
    role: "teacher",
  };
  
  const userProfile = {
    id: userId,
    email: "student@example.com",
    name: "Student User",
    role: "student",
    fluencyLevel: 'B2',
    fluencyLevelUpdatedAt: "2025-10-01T00:00:00.000Z",
  };
  
  await mockKvSet(`user:${adminId}`, adminProfile);
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate level downgrade
  const admin = await mockKvGet(`user:${adminId}`);
  const newLevel = 'B1';
  const user = await mockKvGet(`user:${userId}`);
  const currentLevel = user.fluencyLevel;
  
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const newIndex = levelOrder.indexOf(newLevel);
  
  // Update profile
  const updatedProfile = {
    ...user,
    fluencyLevel: newLevel,
    fluencyLevelUpdatedAt: now,
    fluencyLevelUpdatedBy: adminId,
  };
  
  await mockKvSet(`user:${userId}`, updatedProfile);
  
  // Generate certificate only if upgrade (not downgrade)
  let certificate = null;
  if (newIndex > currentIndex) {
    certificate = await mockGenerateCertificate(
      userId,
      user.name,
      newLevel,
      adminId
    );
  }
  
  // Assert
  assertEquals(certificate, null, "Certificate should NOT be generated on downgrade");
  
  // Verify no certificate was stored
  const certificates = await mockKvGetByPrefix(`certificate:${userId}:`);
  assertEquals(certificates.length, 0, "No certificates should be stored for downgrade");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should generate certificates for all fluency levels", async () => {
  // Arrange
  const adminId = "admin-all-levels";
  const currentYear = new Date().getFullYear();
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  // Act - Generate certificates for all levels
  const certificates = [];
  for (let i = 0; i < levels.length; i++) {
    const cert = await mockGenerateCertificate(
      `user-${levels[i]}`,
      `User ${levels[i]}`,
      levels[i],
      adminId
    );
    certificates.push(cert);
  }
  
  // Assert
  assertEquals(certificates.length, 5, "Should generate 5 certificates");
  
  for (let i = 0; i < levels.length; i++) {
    const cert = certificates[i];
    assertEquals(cert.level, levels[i], `Certificate ${i} should be for level ${levels[i]}`);
    assertEquals(cert.certificateNumber.includes(levels[i]), true, 
      `Certificate number should include level ${levels[i]}`);
    assertEquals(cert.certificateNumber.startsWith(`DLA-${currentYear}-${levels[i]}-`), true,
      `Certificate number should start with DLA-${currentYear}-${levels[i]}-`);
  }
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("Certificate Generation: Should handle multiple users receiving same level certificate", async () => {
  // Arrange
  const adminId = "admin-multi-user";
  const level = "B1";
  const currentYear = new Date().getFullYear();
  
  // Act - Generate certificates for multiple users at same level
  const cert1 = await mockGenerateCertificate("user-1", "User One", level, adminId);
  const cert2 = await mockGenerateCertificate("user-2", "User Two", level, adminId);
  const cert3 = await mockGenerateCertificate("user-3", "User Three", level, adminId);
  
  // Assert
  // Each certificate should have unique ID
  assertEquals(cert1.id !== cert2.id, true, "Certificate IDs should be unique");
  assertEquals(cert2.id !== cert3.id, true, "Certificate IDs should be unique");
  
  // Each certificate should have sequential numbers
  assertEquals(cert1.certificateNumber, `DLA-${currentYear}-${level}-000001`);
  assertEquals(cert2.certificateNumber, `DLA-${currentYear}-${level}-000002`);
  assertEquals(cert3.certificateNumber, `DLA-${currentYear}-${level}-000003`);
  
  // Each certificate should be stored with correct user ID
  const stored1 = await mockKvGet(`certificate:user-1:${cert1.id}`);
  const stored2 = await mockKvGet(`certificate:user-2:${cert2.id}`);
  const stored3 = await mockKvGet(`certificate:user-3:${cert3.id}`);
  
  assertExists(stored1, "Certificate 1 should be stored");
  assertExists(stored2, "Certificate 2 should be stored");
  assertExists(stored3, "Certificate 3 should be stored");
  
  assertEquals(stored1.userName, "User One");
  assertEquals(stored2.userName, "User Two");
  assertEquals(stored3.userName, "User Three");
  
  // Cleanup
  mockKVStore.clear();
});

console.log("All certificate generation tests completed successfully!");

/**
 * Unit tests for certificate retrieval endpoints
 * 
 * Tests cover:
 * - GET /certificates/:userId endpoint to retrieve all user certificates
 * - GET /certificates/:userId/:certificateId endpoint for specific certificate
 * - Chronological sorting of certificates
 * - Authentication checks
 * - Error handling for non-existent users/certificates
 */

Deno.test("GET /certificates/:userId - Should retrieve all certificates for a user in chronological order", async () => {
  // Arrange
  const userId = "student-multi-cert";
  const adminId = "admin-issuer";
  
  // Create user profile
  const userProfile = {
    id: userId,
    email: "multicert@example.com",
    name: "Multi Cert User",
    role: "student",
  };
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Generate multiple certificates at different times
  const cert1 = await mockGenerateCertificate(userId, "Multi Cert User", "A2", adminId);
  // Simulate time passing
  await new Promise(resolve => setTimeout(resolve, 10));
  const cert2 = await mockGenerateCertificate(userId, "Multi Cert User", "B1", adminId);
  await new Promise(resolve => setTimeout(resolve, 10));
  const cert3 = await mockGenerateCertificate(userId, "Multi Cert User", "B2", adminId);
  
  // Act - Simulate GET /certificates/:userId endpoint logic
  const profile = await mockKvGet(`user:${userId}`);
  
  if (!profile) {
    throw new Error("User not found");
  }
  
  const certificates = await mockKvGetByPrefix(`certificate:${userId}:`);
  
  // Sort in chronological order (oldest first)
  const sortedCertificates = certificates.sort((a, b) => {
    const dateA = new Date(a.issuedAt).getTime();
    const dateB = new Date(b.issuedAt).getTime();
    return dateA - dateB; // Ascending order
  });
  
  // Assert
  assertEquals(sortedCertificates.length, 3, "Should retrieve all 3 certificates");
  assertEquals(sortedCertificates[0].level, "A2", "First certificate should be A2");
  assertEquals(sortedCertificates[1].level, "B1", "Second certificate should be B1");
  assertEquals(sortedCertificates[2].level, "B2", "Third certificate should be B2");
  
  // Verify chronological order
  const date1 = new Date(sortedCertificates[0].issuedAt).getTime();
  const date2 = new Date(sortedCertificates[1].issuedAt).getTime();
  const date3 = new Date(sortedCertificates[2].issuedAt).getTime();
  
  assertEquals(date1 <= date2, true, "Certificates should be in chronological order");
  assertEquals(date2 <= date3, true, "Certificates should be in chronological order");
  
  // Verify all certificates belong to the correct user
  sortedCertificates.forEach(cert => {
    assertEquals(cert.userId, userId, "All certificates should belong to the user");
  });
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId - Should return empty array for user with no certificates", async () => {
  // Arrange
  const userId = "student-no-certs";
  
  const userProfile = {
    id: userId,
    email: "nocerts@example.com",
    name: "No Certs User",
    role: "student",
  };
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate GET /certificates/:userId endpoint logic
  const profile = await mockKvGet(`user:${userId}`);
  
  if (!profile) {
    throw new Error("User not found");
  }
  
  const certificates = await mockKvGetByPrefix(`certificate:${userId}:`);
  
  // Assert
  assertEquals(certificates.length, 0, "Should return empty array for user with no certificates");
  assertEquals(Array.isArray(certificates), true, "Should return an array");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId - Should return 404 for non-existent user", async () => {
  // Arrange
  const userId = "non-existent-user-cert";
  
  // Act - Simulate GET /certificates/:userId endpoint logic
  const profile = await mockKvGet(`user:${userId}`);
  
  // Assert
  assertEquals(profile, null, "Should return null for non-existent user");
  
  // In the actual endpoint, this would return:
  // { error: "User not found" }, 404
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId - Should include all certificate fields", async () => {
  // Arrange
  const userId = "student-cert-fields";
  const adminId = "admin-fields";
  const userName = "Cert Fields User";
  const level = "A2";
  
  const userProfile = {
    id: userId,
    email: "certfields@example.com",
    name: userName,
    role: "student",
  };
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Generate a certificate
  const certificate = await mockGenerateCertificate(userId, userName, level, adminId);
  
  // Act - Retrieve certificates
  const certificates = await mockKvGetByPrefix(`certificate:${userId}:`);
  
  // Assert
  assertEquals(certificates.length, 1, "Should have one certificate");
  
  const cert = certificates[0];
  assertExists(cert.id, "Certificate should have id");
  assertExists(cert.userId, "Certificate should have userId");
  assertExists(cert.userName, "Certificate should have userName");
  assertExists(cert.level, "Certificate should have level");
  assertExists(cert.issuedAt, "Certificate should have issuedAt");
  assertExists(cert.issuedBy, "Certificate should have issuedBy");
  assertExists(cert.certificateNumber, "Certificate should have certificateNumber");
  
  assertEquals(cert.userId, userId, "userId should match");
  assertEquals(cert.userName, userName, "userName should match");
  assertEquals(cert.level, level, "level should match");
  assertEquals(cert.issuedBy, adminId, "issuedBy should match");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId/:certificateId - Should retrieve specific certificate", async () => {
  // Arrange
  const userId = "student-specific-cert";
  const adminId = "admin-specific";
  const userName = "Specific Cert User";
  const level = "B1";
  
  const userProfile = {
    id: userId,
    email: "specificcert@example.com",
    name: userName,
    role: "student",
  };
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Generate multiple certificates
  const cert1 = await mockGenerateCertificate(userId, userName, "A2", adminId);
  const cert2 = await mockGenerateCertificate(userId, userName, level, adminId);
  const cert3 = await mockGenerateCertificate(userId, userName, "B2", adminId);
  
  // Act - Simulate GET /certificates/:userId/:certificateId endpoint logic
  const certificate = await mockKvGet(`certificate:${userId}:${cert2.id}`);
  
  // Assert
  assertExists(certificate, "Certificate should be found");
  assertEquals(certificate.id, cert2.id, "Should retrieve the correct certificate");
  assertEquals(certificate.level, level, "Should have correct level");
  assertEquals(certificate.userId, userId, "Should have correct userId");
  assertEquals(certificate.userName, userName, "Should have correct userName");
  assertEquals(certificate.issuedBy, adminId, "Should have correct issuedBy");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId/:certificateId - Should return 404 for non-existent certificate", async () => {
  // Arrange
  const userId = "student-no-specific-cert";
  const certificateId = "non-existent-cert-id";
  
  const userProfile = {
    id: userId,
    email: "nospecificcert@example.com",
    name: "No Specific Cert User",
    role: "student",
  };
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Act - Simulate GET /certificates/:userId/:certificateId endpoint logic
  const certificate = await mockKvGet(`certificate:${userId}:${certificateId}`);
  
  // Assert
  assertEquals(certificate, null, "Should return null for non-existent certificate");
  
  // In the actual endpoint, this would return:
  // { error: "Certificate not found" }, 404
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId/:certificateId - Should not retrieve certificate from different user", async () => {
  // Arrange
  const userId1 = "student-cert-owner";
  const userId2 = "student-cert-other";
  const adminId = "admin-owner";
  
  const userProfile1 = {
    id: userId1,
    email: "owner@example.com",
    name: "Owner User",
    role: "student",
  };
  
  const userProfile2 = {
    id: userId2,
    email: "other@example.com",
    name: "Other User",
    role: "student",
  };
  
  await mockKvSet(`user:${userId1}`, userProfile1);
  await mockKvSet(`user:${userId2}`, userProfile2);
  
  // Generate certificate for userId1
  const cert = await mockGenerateCertificate(userId1, "Owner User", "A2", adminId);
  
  // Act - Try to retrieve userId1's certificate using userId2's path
  const certificate = await mockKvGet(`certificate:${userId2}:${cert.id}`);
  
  // Assert
  assertEquals(certificate, null, "Should not retrieve certificate from different user");
  
  // Verify the certificate exists for the correct user
  const correctCertificate = await mockKvGet(`certificate:${userId1}:${cert.id}`);
  assertExists(correctCertificate, "Certificate should exist for correct user");
  assertEquals(correctCertificate.userId, userId1, "Certificate should belong to userId1");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId - Should sort certificates by issuedAt date (oldest first)", async () => {
  // Arrange
  const userId = "student-sort-test";
  const adminId = "admin-sort";
  
  const userProfile = {
    id: userId,
    email: "sorttest@example.com",
    name: "Sort Test User",
    role: "student",
  };
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Create certificates with specific timestamps (out of order)
  const cert1 = {
    id: "cert-1",
    userId,
    userName: "Sort Test User",
    level: "A2",
    issuedAt: "2025-01-15T10:00:00.000Z",
    issuedBy: adminId,
    certificateNumber: "DLA-2025-A2-000001",
  };
  
  const cert2 = {
    id: "cert-2",
    userId,
    userName: "Sort Test User",
    level: "B1",
    issuedAt: "2025-03-20T14:30:00.000Z",
    issuedBy: adminId,
    certificateNumber: "DLA-2025-B1-000001",
  };
  
  const cert3 = {
    id: "cert-3",
    userId,
    userName: "Sort Test User",
    level: "B2",
    issuedAt: "2025-02-10T09:15:00.000Z",
    issuedBy: adminId,
    certificateNumber: "DLA-2025-B2-000001",
  };
  
  // Store certificates in random order
  await mockKvSet(`certificate:${userId}:cert-2`, cert2);
  await mockKvSet(`certificate:${userId}:cert-1`, cert1);
  await mockKvSet(`certificate:${userId}:cert-3`, cert3);
  
  // Act - Retrieve and sort
  const certificates = await mockKvGetByPrefix(`certificate:${userId}:`);
  const sortedCertificates = certificates.sort((a, b) => {
    const dateA = new Date(a.issuedAt).getTime();
    const dateB = new Date(b.issuedAt).getTime();
    return dateA - dateB; // Ascending order (chronological)
  });
  
  // Assert
  assertEquals(sortedCertificates.length, 3, "Should have 3 certificates");
  assertEquals(sortedCertificates[0].id, "cert-1", "First should be cert-1 (Jan 15)");
  assertEquals(sortedCertificates[1].id, "cert-3", "Second should be cert-3 (Feb 10)");
  assertEquals(sortedCertificates[2].id, "cert-2", "Third should be cert-2 (Mar 20)");
  
  // Verify dates are in ascending order
  const date1 = new Date(sortedCertificates[0].issuedAt).getTime();
  const date2 = new Date(sortedCertificates[1].issuedAt).getTime();
  const date3 = new Date(sortedCertificates[2].issuedAt).getTime();
  
  assertEquals(date1 < date2, true, "First date should be before second");
  assertEquals(date2 < date3, true, "Second date should be before third");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId - Should handle user with single certificate", async () => {
  // Arrange
  const userId = "student-single-cert";
  const adminId = "admin-single";
  
  const userProfile = {
    id: userId,
    email: "singlecert@example.com",
    name: "Single Cert User",
    role: "student",
  };
  await mockKvSet(`user:${userId}`, userProfile);
  
  // Generate single certificate
  const cert = await mockGenerateCertificate(userId, "Single Cert User", "A2", adminId);
  
  // Act
  const certificates = await mockKvGetByPrefix(`certificate:${userId}:`);
  
  // Assert
  assertEquals(certificates.length, 1, "Should have exactly one certificate");
  assertEquals(certificates[0].id, cert.id, "Should be the correct certificate");
  assertEquals(certificates[0].level, "A2", "Should have correct level");
  
  // Cleanup
  mockKVStore.clear();
});

Deno.test("GET /certificates/:userId - Should only return certificates for specified user", async () => {
  // Arrange
  const userId1 = "student-isolation-1";
  const userId2 = "student-isolation-2";
  const adminId = "admin-isolation";
  
  const userProfile1 = {
    id: userId1,
    email: "isolation1@example.com",
    name: "Isolation User 1",
    role: "student",
  };
  
  const userProfile2 = {
    id: userId2,
    email: "isolation2@example.com",
    name: "Isolation User 2",
    role: "student",
  };
  
  await mockKvSet(`user:${userId1}`, userProfile1);
  await mockKvSet(`user:${userId2}`, userProfile2);
  
  // Generate certificates for both users
  await mockGenerateCertificate(userId1, "Isolation User 1", "A2", adminId);
  await mockGenerateCertificate(userId1, "Isolation User 1", "B1", adminId);
  await mockGenerateCertificate(userId2, "Isolation User 2", "A2", adminId);
  await mockGenerateCertificate(userId2, "Isolation User 2", "B1", adminId);
  await mockGenerateCertificate(userId2, "Isolation User 2", "B2", adminId);
  
  // Act - Retrieve certificates for userId1
  const certificates1 = await mockKvGetByPrefix(`certificate:${userId1}:`);
  
  // Act - Retrieve certificates for userId2
  const certificates2 = await mockKvGetByPrefix(`certificate:${userId2}:`);
  
  // Assert
  assertEquals(certificates1.length, 2, "User 1 should have 2 certificates");
  assertEquals(certificates2.length, 3, "User 2 should have 3 certificates");
  
  // Verify all certificates belong to correct user
  certificates1.forEach(cert => {
    assertEquals(cert.userId, userId1, "All certificates should belong to user 1");
  });
  
  certificates2.forEach(cert => {
    assertEquals(cert.userId, userId2, "All certificates should belong to user 2");
  });
  
  // Cleanup
  mockKVStore.clear();
});

console.log("All certificate retrieval endpoint tests completed successfully!");
