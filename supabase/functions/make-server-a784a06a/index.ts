import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

// KV Store implementation
const KV_TABLE = "kv_store_a784a06a";

async function kvGet(key: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from(KV_TABLE)
    .select("value")
    .eq("key", key)
    .single();

  if (error) return null;
  return data?.value;
}

async function kvSet(key: string, value: any) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase
    .from(KV_TABLE)
    .upsert({ key, value });

  if (error) throw error;
}

async function kvDel(key: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  await supabase.from(KV_TABLE).delete().eq("key", key);
}

async function kvGetByPrefix(prefix: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from(KV_TABLE)
    .select("value")
    .like("key", `${prefix}%`);

  if (error) return [];
  return data?.map((row) => row.value) || [];
}

const app = new Hono().basePath("/make-server-a784a06a");

// Helper function to extract and validate access token
function getAccessToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7).trim() 
    : authHeader.trim();
  return token || null;
}

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Content-Type"],
    maxAge: 600,
    credentials: true,
  }),
);

// Health check endpoint (public, no auth required)
app.get("/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Dutch Learning App API is running"
  });
});

// Sign up endpoint
app.post("/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name, role },
        email_confirm: true,
      });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile with initial A1 fluency level
    const now = new Date().toISOString();
    await kvSet(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      fluencyLevel: 'A1',
      fluencyLevelUpdatedAt: now,
      fluencyLevelUpdatedBy: undefined,
    });

    // Record initial fluency level in history
    await kvSet(`fluency-history:${data.user.id}:${now}`, {
      userId: data.user.id,
      previousLevel: null,
      newLevel: 'A1',
      changedAt: now,
      changedBy: 'system',
      reason: 'Initial assignment',
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user profile
app.get("/profile", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let profile = await kvGet(`user:${user.id}`);
    
    // Migration: Add A1 fluency level to existing users without fluency data
    if (profile && !profile.fluencyLevel) {
      const now = new Date().toISOString();
      profile = {
        ...profile,
        fluencyLevel: 'A1',
        fluencyLevelUpdatedAt: now,
        fluencyLevelUpdatedBy: undefined,
      };
      
      // Update the profile in KV store
      await kvSet(`user:${user.id}`, profile);
      
      // Record initial fluency level in history
      await kvSet(`fluency-history:${user.id}:${now}`, {
        userId: user.id,
        previousLevel: null,
        newLevel: 'A1',
        changedAt: now,
        changedBy: 'system',
        reason: 'Migration - Initial assignment',
      });
      
      console.log(`Migrated user ${user.id} to A1 fluency level`);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all users (admin only)
app.get("/users", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user profile to check role
    const profile = await kvGet(`user:${user.id}`);
    if (!profile || profile.role !== 'teacher') {
      return c.json({ error: "Admin access required" }, 403);
    }

    // Get all user profiles from KV store
    const allUsers = await kvGetByPrefix('user:');
    
    // Filter out any non-user entries and format the response
    const users = allUsers
      .filter((u: any) => u && u.id && u.email)
      .map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        fluencyLevel: u.fluencyLevel || 'A1',
        fluencyLevelUpdatedAt: u.fluencyLevelUpdatedAt,
      }));

    return c.json({ users });
  } catch (error) {
    console.log(`Users fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Migrate all existing users to A1 fluency level (admin only)
app.post("/migrate-fluency-levels", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const adminProfile = await kvGet(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'teacher') {
      return c.json({ error: "Admin access required" }, 403);
    }

    // Get all user profiles
    const allUsers = await kvGetByPrefix("user:");
    const now = new Date().toISOString();
    let migratedCount = 0;
    let skippedCount = 0;

    for (const userProfile of allUsers) {
      if (!userProfile.fluencyLevel) {
        // Add A1 fluency level
        const updatedProfile = {
          ...userProfile,
          fluencyLevel: 'A1',
          fluencyLevelUpdatedAt: now,
          fluencyLevelUpdatedBy: undefined,
        };
        
        await kvSet(`user:${userProfile.id}`, updatedProfile);
        
        // Record initial fluency level in history
        await kvSet(`fluency-history:${userProfile.id}:${now}`, {
          userId: userProfile.id,
          previousLevel: null,
          newLevel: 'A1',
          changedAt: now,
          changedBy: user.id,
          reason: 'Bulk migration - Initial assignment',
        });
        
        migratedCount++;
        console.log(`Migrated user ${userProfile.id} to A1 fluency level`);
      } else {
        skippedCount++;
      }
    }

    return c.json({ 
      success: true, 
      migratedCount, 
      skippedCount,
      message: `Migrated ${migratedCount} users, skipped ${skippedCount} users with existing fluency levels`
    });
  } catch (error) {
    console.log(`Migration error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create or update a day/section
app.post("/days", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const dayData = await c.req.json();
    const dayId = dayData.id || `day:${Date.now()}`;

    await kvSet(dayId, {
      ...dayData,
      id: dayId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ id: dayId, success: true });
  } catch (error) {
    console.log(`Day creation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all days
app.get("/days", async (c) => {
  try {
    const days = await kvGetByPrefix("day:");
    return c.json({ days });
  } catch (error) {
    console.log(`Days fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create or update a class/chapter
app.post("/classes", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    
    if (!accessToken) {
      console.log('POST /classes - No access token provided');
      return c.json({ error: "No access token provided" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      console.log('POST /classes - Auth failed:', error?.message || 'No user');
      return c.json({ error: "Unauthorized", details: error?.message }, 401);
    }

    const classData = await c.req.json();
    const classId = classData.id || `class:${Date.now()}`;

    await kvSet(classId, {
      ...classData,
      id: classId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Auto-adopt vocabulary - check for duplicates first
    if (classData.pages) {
      // Get all existing vocabulary
      const allVocab = await kvGetByPrefix("vocab:");
      
      for (const page of classData.pages) {
        if (page.type === "vocabulary" && page.content?.words) {
          for (const word of page.content.words) {
            if (word.dutch && word.english) {
              // Check if this word already exists (case-insensitive)
              const existingWord = allVocab.find((v: any) => 
                v.dutch.toLowerCase() === word.dutch.toLowerCase() &&
                v.english.toLowerCase() === word.english.toLowerCase()
              );

              if (!existingWord) {
                // Only create if it doesn't exist
                const vocabId = `vocab:${word.dutch.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
                await kvSet(vocabId, {
                  id: vocabId,
                  dutch: word.dutch,
                  english: word.english,
                  example: word.example || "",
                  audioUrl: word.audioUrl || "",
                  lessonId: classId,
                  createdBy: user.id,
                  createdAt: new Date().toISOString(),
                });
              }
            }
          }
        }
      }
    }

    return c.json({ id: classId, success: true });
  } catch (error) {
    console.log(`Class creation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all classes
app.get("/classes", async (c) => {
  try {
    const classes = await kvGetByPrefix("class:");
    return c.json({ classes });
  } catch (error) {
    console.log(`Classes fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get a specific class
app.get("/classes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const classData = await kvGet(id);

    if (!classData) {
      return c.json({ error: "Class not found" }, 404);
    }

    return c.json({ class: classData });
  } catch (error) {
    console.log(`Class fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete a class
app.delete("/classes/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    await kvDel(id);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Class deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update class
app.patch("/classes/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const classId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kvGet(classId);

    if (!existing) {
      return c.json({ error: "Class not found" }, 404);
    }

    await kvSet(classId, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Class update error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Save student progress
app.post("/progress", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      console.log('POST /progress auth failed:', error?.message || 'No user');
      return c.json({ error: "Unauthorized", details: error?.message }, 401);
    }

    const { classId, completed, score } = await c.req.json();
    const progressKey = `progress:${user.id}:${classId}`;

    console.log('Saving progress:', { userId: user.id, classId, completed, score, progressKey });

    await kvSet(progressKey, {
      userId: user.id,
      classId,
      completed,
      score,
      completedAt: new Date().toISOString(),
    });

    // Update user progress and calculate streak
    if (completed) {
      const userProgressKey = `user-progress:${user.id}`;
      const currentProgress = (await kvGet(userProgressKey)) || {
        streak: 0,
        lastActivityDate: null,
        completedLessons: [],
        testsCompleted: 0,
        averageScore: 0,
        totalXP: 0,
        vocabulary: [],
      };

      // Get the class data to extract vocabulary
      const classData = await kvGet(classId);
      let newVocabulary = [...(currentProgress.vocabulary || [])];
      
      if (classData && classData.pages) {
        // Extract vocabulary from all vocabulary pages
        for (const page of classData.pages) {
          if (page.type === "vocabulary" && page.content?.words) {
            for (const word of page.content.words) {
              // Check if word not already in vocabulary
              const wordExists = newVocabulary.some(v => 
                v.dutch === word.dutch && v.english === word.english
              );
              if (!wordExists) {
                newVocabulary.push({
                  dutch: word.dutch,
                  english: word.english,
                  audioUrl: word.audioUrl || '',
                  learnedAt: new Date().toISOString(),
                  classId: classId
                });
              }
            }
          }
        }
      }

      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = currentProgress.lastActivityDate?.split('T')[0];
      
      let newStreak = currentProgress.streak || 0;
      
      if (!lastActivity) {
        // First activity ever
        newStreak = 1;
      } else if (lastActivity === today) {
        // Same day, keep streak
        newStreak = currentProgress.streak || 1;
      } else {
        // Check if it's consecutive days
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day, increment streak
          newStreak = (currentProgress.streak || 0) + 1;
        } else if (daysDiff > 1) {
          // Streak broken, restart
          newStreak = 1;
        }
      }

      // Update completed lessons list
      const completedLessons = currentProgress.completedLessons || [];
      if (!completedLessons.includes(classId)) {
        completedLessons.push(classId);
      }

      await kvSet(userProgressKey, {
        ...currentProgress,
        streak: newStreak,
        lastActivityDate: new Date().toISOString(),
        completedLessons,
        vocabulary: newVocabulary,
        updatedAt: new Date().toISOString(),
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Progress save error:', error);
    console.log('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// Get student progress
app.get("/progress", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    
    console.log('Progress request - Token present:', !!accessToken);
    if (accessToken) {
      console.log('Token length:', accessToken.length);
      console.log('Token starts with:', accessToken.substring(0, 20) + '...');
      console.log('Token segments:', accessToken.split('.').length);
    }
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    console.log('Auth result - User ID:', user?.id, 'Has error:', !!error);
    
    if (error) {
      console.log('Auth error details:', JSON.stringify(error));
    }
    
    if (!user || error) {
      return c.json({ error: "Unauthorized", details: error?.message || 'No user found' }, 401);
    }

    const progress = await kvGetByPrefix(`progress:${user.id}:`);
    const userProgress = (await kvGet(`user-progress:${user.id}`)) || {
      streak: 0,
      lastActivityDate: null,
      completedLessons: [],
      testsCompleted: 0,
      averageScore: 0,
      totalXP: 0,
      vocabulary: [],
    };

    return c.json({
      progress: progress,
      ...userProgress,
    });
  } catch (error) {
    console.log(`Progress fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update user progress
app.post("/progress/update", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      console.log('POST /progress/update auth failed:', error?.message || 'No user');
      return c.json({ error: "Unauthorized", details: error?.message }, 401);
    }

    const updates = await c.req.json();
    const currentProgress = (await kvGet(`user-progress:${user.id}`)) || {};

    await kvSet(`user-progress:${user.id}`, {
      ...currentProgress,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Progress update error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// VOCABULARY ENDPOINTS
app.get("/vocabulary", async (c) => {
  try {
    const vocabulary = await kvGetByPrefix("vocab:");
    return c.json(vocabulary);
  } catch (error) {
    console.log(`Vocabulary fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/vocabulary", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const vocabData = await c.req.json();
    const vocabId = vocabData.id || `vocab:${Date.now()}`;

    await kvSet(vocabId, {
      ...vocabData,
      id: vocabId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ id: vocabId, success: true });
  } catch (error) {
    console.log(`Vocabulary creation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.patch("/vocabulary/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const vocabId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kvGet(vocabId);

    if (!existing) {
      return c.json({ error: "Vocabulary not found" }, 404);
    }

    await kvSet(vocabId, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Vocabulary update error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete("/vocabulary/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const vocabId = c.req.param("id");
    await kvDel(vocabId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Vocabulary deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// TEST ENDPOINTS
app.get("/tests", async (c) => {
  try {
    const tests = await kvGetByPrefix("test:");
    return c.json(tests);
  } catch (error) {
    console.log(`Tests fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/tests", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const testData = await c.req.json();
    const testId = testData.id || `test:${Date.now()}`;

    await kvSet(testId, {
      ...testData,
      id: testId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ id: testId, success: true });
  } catch (error) {
    console.log(`Test creation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete("/tests/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const testId = c.req.param("id");
    await kvDel(testId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Test deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/tests/:id/submit", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const testId = c.req.param("id");
    const { answers, timeSpent } = await c.req.json();

    const test = await kvGet(testId);
    if (!test) {
      return c.json({ error: "Test not found" }, 404);
    }

    let score = 0;
    let totalPoints = 0;
    const mistakes: any[] = [];

    test.questions.forEach((question: any, index: number) => {
      totalPoints += question.points;
      const userAnswer = answers[index];

      if (userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
        score += question.points;
      } else {
        mistakes.push({
          question: question.question,
          userAnswer: userAnswer || "(no answer)",
          correctAnswer: question.correctAnswer,
        });

        const mistakeId = `mistake:${user.id}:${Date.now()}:${index}`;
        kvSet(mistakeId, {
          id: mistakeId,
          userId: user.id,
          word: question.question,
          userAnswer: userAnswer || "",
          correctAnswer: question.correctAnswer,
          category: "test",
          lessonTitle: test.title,
          timestamp: new Date().toISOString(),
          reviewedCount: 0,
          mastered: false,
        });
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= (test.passingScore || 70);

    const userProfile = await kvGet(`user:${user.id}`);

    const resultId = `test-result:${user.id}:${testId}:${Date.now()}`;
    const result = {
      id: resultId,
      testId,
      testTitle: test.title,
      userId: user.id,
      studentName: userProfile?.name || "Student",
      score,
      totalPoints,
      percentage,
      timeSpent,
      passed,
      completedAt: new Date().toISOString(),
      attempts: 1,
      mistakes,
    };

    await kvSet(resultId, result);

    const userProgress = (await kvGet(`user-progress:${user.id}`)) || {};
    const currentTests = userProgress.testsCompleted || 0;
    const currentAvg = userProgress.averageScore || 0;
    const newAvg = Math.round((currentAvg * currentTests + percentage) / (currentTests + 1));

    await kvSet(`user-progress:${user.id}`, {
      ...userProgress,
      testsCompleted: currentTests + 1,
      averageScore: newAvg,
      totalXP: (userProgress.totalXP || 0) + score * 10,
    });

    return c.json({ result, success: true });
  } catch (error) {
    console.log(`Test submission error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.get("/test-results", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kvGet(`user:${user.id}`);

    let results;
    if (profile?.role === "teacher") {
      results = await kvGetByPrefix("test-result:");
    } else {
      results = await kvGetByPrefix(`test-result:${user.id}:`);
    }

    return c.json(results);
  } catch (error) {
    console.log(`Test results fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// FLUENCY LEVEL ENDPOINTS

// Fluency level metadata constants
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

/**
 * Generate a unique certificate number in the format: DLA-YYYY-LEVEL-NNNNNN
 * @param level - The fluency level (A1, A2, B1, B2, C1)
 * @returns A unique certificate number
 */
async function generateCertificateNumber(level: string): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get the current certificate counter for this year and level
  const counterKey = `certificate-counter:${year}:${level}`;
  const currentCounter = await kvGet(counterKey) || 0;
  const nextCounter = currentCounter + 1;
  
  // Update the counter
  await kvSet(counterKey, nextCounter);
  
  // Format the counter as a 6-digit number with leading zeros
  const formattedCounter = String(nextCounter).padStart(6, '0');
  
  return `DLA-${year}-${level}-${formattedCounter}`;
}

/**
 * Generate a certificate for a user upon fluency level upgrade
 * @param userId - The user's ID
 * @param userName - The user's name
 * @param level - The fluency level achieved
 * @param issuedBy - The admin user ID who issued the certificate
 * @returns The generated certificate object
 */
async function generateCertificate(
  userId: string,
  userName: string,
  level: string,
  issuedBy: string
): Promise<any> {
  // Generate unique certificate ID
  const certificateId = crypto.randomUUID();
  
  // Generate certificate number
  const certificateNumber = await generateCertificateNumber(level);
  
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
  await kvSet(`certificate:${userId}:${certificateId}`, certificate);
  
  console.log(`Generated certificate ${certificateNumber} for user ${userId} at level ${level}`);
  
  return certificate;
}

// Get fluency level for a user
app.get("/fluency/:userId", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("userId");
    const userProfile = await kvGet(`user:${userId}`);

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const fluencyLevel = userProfile.fluencyLevel || 'A1';
    const metadata = FLUENCY_LEVELS[fluencyLevel as keyof typeof FLUENCY_LEVELS];

    return c.json({
      userId: userProfile.id,
      fluencyLevel: fluencyLevel,
      fluencyLevelUpdatedAt: userProfile.fluencyLevelUpdatedAt,
      fluencyLevelUpdatedBy: userProfile.fluencyLevelUpdatedBy,
      metadata: metadata
    });
  } catch (error) {
    console.log(`Fluency level fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update fluency level for a user (admin only)
app.patch("/fluency/:userId", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    // Authenticate the requesting user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Verify admin role (teacher)
    const adminProfile = await kvGet(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'teacher') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const userId = c.req.param("userId");
    const { newLevel } = await c.req.json();

    // Validate new level format
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    if (!newLevel || !validLevels.includes(newLevel)) {
      return c.json({ error: "Invalid fluency level" }, 400);
    }

    // Get target user profile
    const userProfile = await kvGet(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const currentLevel = userProfile.fluencyLevel || 'A1';

    // Validate level transition
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    const newIndex = levelOrder.indexOf(newLevel);

    // Check if trying to downgrade below A1
    if (newIndex < 0) {
      return c.json({ error: "Cannot downgrade below A1" }, 400);
    }

    // Check if trying to upgrade beyond C1
    if (newIndex > 4) {
      return c.json({ error: "Cannot upgrade beyond C1" }, 400);
    }

    // Check if transition is valid (only one level at a time)
    const levelDifference = Math.abs(newIndex - currentIndex);
    if (levelDifference !== 1) {
      return c.json({ error: "Invalid level transition. Can only move one level at a time" }, 400);
    }

    // Update user profile with new level
    const now = new Date().toISOString();
    const updatedProfile = {
      ...userProfile,
      fluencyLevel: newLevel,
      fluencyLevelUpdatedAt: now,
      fluencyLevelUpdatedBy: user.id,
    };

    await kvSet(`user:${userId}`, updatedProfile);

    // Record level change in history
    await kvSet(`fluency-history:${userId}:${now}`, {
      userId: userId,
      previousLevel: currentLevel,
      newLevel: newLevel,
      changedAt: now,
      changedBy: user.id,
      changedByName: adminProfile.name,
    });

    console.log(`Admin ${user.id} updated user ${userId} from ${currentLevel} to ${newLevel}`);

    // Generate certificate if this is an upgrade (not a downgrade)
    let certificate = null;
    if (newIndex > currentIndex) {
      try {
        certificate = await generateCertificate(
          userId,
          userProfile.name,
          newLevel,
          user.id
        );
        console.log(`Certificate generated: ${certificate.certificateNumber}`);
      } catch (certError) {
        console.error(`Failed to generate certificate: ${certError}`);
        // Don't fail the entire request if certificate generation fails
      }
    }

    const metadata = FLUENCY_LEVELS[newLevel as keyof typeof FLUENCY_LEVELS];

    return c.json({
      success: true,
      userId: userId,
      previousLevel: currentLevel,
      newLevel: newLevel,
      fluencyLevelUpdatedAt: now,
      fluencyLevelUpdatedBy: user.id,
      metadata: metadata,
      certificate: certificate
    });
  } catch (error) {
    console.log(`Fluency level update error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get fluency level history for a user
app.get("/fluency/history/:userId", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("userId");
    
    // Verify user exists
    const userProfile = await kvGet(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get all history entries for this user
    const historyEntries = await kvGetByPrefix(`fluency-history:${userId}:`);

    // Sort in reverse chronological order (most recent first)
    const sortedHistory = historyEntries.sort((a, b) => {
      const dateA = new Date(a.changedAt).getTime();
      const dateB = new Date(b.changedAt).getTime();
      return dateB - dateA; // Descending order
    });

    return c.json({
      userId: userId,
      history: sortedHistory
    });
  } catch (error) {
    console.log(`Fluency history fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// CERTIFICATE ENDPOINTS

// Get all certificates for a user
app.get("/certificates/:userId", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("userId");
    
    // Verify user exists
    const userProfile = await kvGet(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get all certificates for this user
    const certificates = await kvGetByPrefix(`certificate:${userId}:`);

    // Sort in chronological order (oldest first)
    const sortedCertificates = certificates.sort((a, b) => {
      const dateA = new Date(a.issuedAt).getTime();
      const dateB = new Date(b.issuedAt).getTime();
      return dateA - dateB; // Ascending order
    });

    return c.json({
      userId: userId,
      certificates: sortedCertificates
    });
  } catch (error) {
    console.log(`Certificates fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get a specific certificate
app.get("/certificates/:userId/:certificateId", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("userId");
    const certificateId = c.req.param("certificateId");
    
    // Get the specific certificate
    const certificate = await kvGet(`certificate:${userId}:${certificateId}`);

    if (!certificate) {
      return c.json({ error: "Certificate not found" }, 404);
    }

    return c.json({
      certificate: certificate
    });
  } catch (error) {
    console.log(`Certificate fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// MISTAKE BANK ENDPOINTS
app.get("/mistakes", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakes = await kvGetByPrefix(`mistake:${user.id}:`);
    return c.json(mistakes);
  } catch (error) {
    console.log(`Mistakes fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/mistakes", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakeData = await c.req.json();
    const mistakeId = mistakeData.id || `mistake:${user.id}:${Date.now()}`;

    await kvSet(mistakeId, {
      ...mistakeData,
      id: mistakeId,
      userId: user.id,
      timestamp: new Date().toISOString(),
      reviewedCount: mistakeData.reviewedCount || 0,
      mastered: mistakeData.mastered || false,
    });

    return c.json({ id: mistakeId, success: true });
  } catch (error) {
    console.log(`Mistake creation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.patch("/mistakes/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakeId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kvGet(mistakeId);

    if (!existing) {
      return c.json({ error: "Mistake not found" }, 404);
    }

    await kvSet(mistakeId, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Mistake update error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete("/mistakes/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakeId = c.req.param("id");
    await kvDel(mistakeId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Mistake deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// SPACED REPETITION ENDPOINTS
app.get("/spaced-repetition", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cards = await kvGetByPrefix(`srs-card:${user.id}:`);
    return c.json({ cards });
  } catch (error) {
    console.log(`SRS cards fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/spaced-repetition", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cardData = await c.req.json();
    const cardId = cardData.id || `srs-card:${user.id}:${Date.now()}`;

    await kvSet(cardId, {
      ...cardData,
      id: cardId,
      userId: user.id,
      nextReview: cardData.nextReview || new Date().toISOString(),
      interval: cardData.interval || 0,
      easeFactor: cardData.easeFactor || 2.5,
      reviewCount: cardData.reviewCount || 0,
      createdAt: new Date().toISOString(),
    });

    return c.json({ id: cardId, success: true });
  } catch (error) {
    console.log(`SRS card creation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.patch("/spaced-repetition/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cardId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kvGet(cardId);

    if (!existing) {
      return c.json({ error: "Card not found" }, 404);
    }

    await kvSet(cardId, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`SRS card update error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// GRAMMAR ENDPOINTS
app.get("/grammar", async (c) => {
  try {
    const rules = await kvGetByPrefix("grammar:");
    return c.json(rules);
  } catch (error) {
    console.log(`Grammar fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/grammar", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const ruleData = await c.req.json();
    const ruleId = ruleData.id || `grammar:${Date.now()}`;

    await kvSet(ruleId, {
      ...ruleData,
      id: ruleId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ id: ruleId, success: true });
  } catch (error) {
    console.log(`Grammar creation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete("/grammar/:id", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const ruleId = c.req.param("id");
    await kvDel(ruleId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Grammar deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Upload audio file endpoint
app.post("/upload-audio", async (c) => {
  try {
    const accessToken = getAccessToken(c.req.header("Authorization"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get the file from the request
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Generate unique filename
    const fileName = `audio-${Date.now()}.webm`;
    const filePath = `recordings/${fileName}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data, error: uploadError } = await supabase.storage
      .from("vocabulary-audio")
      .upload(filePath, fileBuffer, {
        contentType: "audio/webm",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return c.json({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("vocabulary-audio")
      .getPublicUrl(filePath);

    return c.json({ 
      success: true,
      audioUrl: publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);

