import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

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
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true,
      });

    if (error) {
      console.log(
        `Error creating user during signup: ${error.message}`,
      );
      return c.json({ error: error.message }, 400);
    }

    // Store user profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role, // 'teacher' or 'student'
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
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create or update a day/section
app.post("/days", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const dayData = await c.req.json();
    const dayId = dayData.id || `day:${Date.now()}`;

    await kv.set(dayId, {
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
    const days = await kv.getByPrefix("day:");
    return c.json({ days });
  } catch (error) {
    console.log(`Days fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create or update a class/chapter
app.post("/classes", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const classData = await c.req.json();
    const classId = classData.id || `class:${Date.now()}`;

    await kv.set(classId, {
      ...classData,
      id: classId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Auto-adopt vocabulary from class pages to vocabulary library
    if (classData.pages) {
      for (const page of classData.pages) {
        if (page.type === "vocabulary" && page.content?.words) {
          for (const word of page.content.words) {
            if (word.dutch && word.english) {
              const vocabId = `vocab:${word.dutch.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
              const existingVocab = await kv.get(vocabId);

              if (!existingVocab) {
                await kv.set(vocabId, {
                  id: vocabId,
                  dutch: word.dutch,
                  english: word.english,
                  example: word.example || "",
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
    const classes = await kv.getByPrefix("class:");
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
    const classData = await kv.get(id);

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
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    await kv.del(id);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Class deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Save student progress
app.post("/progress", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { classId, completed, score } = await c.req.json();
    const progressKey = `progress:${user.id}:${classId}`;

    await kv.set(progressKey, {
      userId: user.id,
      classId,
      completed,
      score,
      completedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Progress save error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get student progress
app.get("/progress", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const progress = await kv.getByPrefix(
      `progress:${user.id}:`,
    );

    // Get additional progress data
    const userProgress = (await kv.get(
      `user-progress:${user.id}`,
    )) || {
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

// Update user progress (XP, streaks, etc.)
app.post("/progress/update", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const currentProgress =
      (await kv.get(`user-progress:${user.id}`)) || {};

    await kv.set(`user-progress:${user.id}`, {
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

// Get all vocabulary
app.get("/vocabulary", async (c) => {
  try {
    const vocabulary = await kv.getByPrefix("vocab:");
    return c.json(vocabulary);
  } catch (error) {
    console.log(`Vocabulary fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create vocabulary word
app.post("/vocabulary", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const vocabData = await c.req.json();
    const vocabId = vocabData.id || `vocab:${Date.now()}`;

    await kv.set(vocabId, {
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

// Update vocabulary word
app.patch("/vocabulary/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const vocabId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(vocabId);

    if (!existing) {
      return c.json({ error: "Vocabulary not found" }, 404);
    }

    await kv.set(vocabId, {
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

// Delete vocabulary word
app.delete("/vocabulary/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const vocabId = c.req.param("id");
    await kv.del(vocabId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Vocabulary deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// TEST ENDPOINTS

// Get all tests
app.get("/tests", async (c) => {
  try {
    const tests = await kv.getByPrefix("test:");
    return c.json(tests);
  } catch (error) {
    console.log(`Tests fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create test
app.post("/tests", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const testData = await c.req.json();
    const testId = testData.id || `test:${Date.now()}`;

    await kv.set(testId, {
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

// Delete test
app.delete("/tests/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const testId = c.req.param("id");
    await kv.del(testId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Test deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Submit test
app.post("/tests/:id/submit", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const testId = c.req.param("id");
    const { answers, timeSpent } = await c.req.json();

    // Get the test to check answers
    const test = await kv.get(testId);
    if (!test) {
      return c.json({ error: "Test not found" }, 404);
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    const mistakes: any[] = [];

    test.questions.forEach((question: any, index: number) => {
      totalPoints += question.points;
      const userAnswer = answers[index];

      if (
        userAnswer?.toLowerCase().trim() ===
        question.correctAnswer?.toLowerCase().trim()
      ) {
        score += question.points;
      } else {
        mistakes.push({
          question: question.question,
          userAnswer: userAnswer || "(no answer)",
          correctAnswer: question.correctAnswer,
        });

        // Save to mistake bank
        const mistakeId = `mistake:${user.id}:${Date.now()}:${index}`;
        kv.set(mistakeId, {
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

    // Get user profile for name
    const userProfile = await kv.get(`user:${user.id}`);

    // Save test result
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

    await kv.set(resultId, result);

    // Update user progress
    const userProgress =
      (await kv.get(`user-progress:${user.id}`)) || {};
    const currentTests = userProgress.testsCompleted || 0;
    const currentAvg = userProgress.averageScore || 0;
    const newAvg = Math.round(
      (currentAvg * currentTests + percentage) /
        (currentTests + 1),
    );

    await kv.set(`user-progress:${user.id}`, {
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

// Get test results
app.get("/test-results", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user profile to check role
    const profile = await kv.get(`user:${user.id}`);

    // Teachers see all results, students see only their own
    let results;
    if (profile?.role === "teacher") {
      results = await kv.getByPrefix("test-result:");
    } else {
      results = await kv.getByPrefix(`test-result:${user.id}:`);
    }

    return c.json(results);
  } catch (error) {
    console.log(`Test results fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// MISTAKE BANK ENDPOINTS

// Get mistakes
app.get("/mistakes", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakes = await kv.getByPrefix(
      `mistake:${user.id}:`,
    );
    return c.json(mistakes);
  } catch (error) {
    console.log(`Mistakes fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create/record mistake
app.post("/mistakes", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakeData = await c.req.json();
    const mistakeId =
      mistakeData.id || `mistake:${user.id}:${Date.now()}`;

    await kv.set(mistakeId, {
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

// Update mistake
app.patch("/mistakes/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakeId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(mistakeId);

    if (!existing) {
      return c.json({ error: "Mistake not found" }, 404);
    }

    await kv.set(mistakeId, {
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

// Delete mistake
app.delete("/mistakes/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const mistakeId = c.req.param("id");
    await kv.del(mistakeId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Mistake deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// SPACED REPETITION ENDPOINTS

// Get spaced repetition cards
app.get("/spaced-repetition", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cards = await kv.getByPrefix(`srs-card:${user.id}:`);
    return c.json({ cards });
  } catch (error) {
    console.log(`SRS cards fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update spaced repetition card
app.patch("/spaced-repetition/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cardId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(cardId);

    if (!existing) {
      return c.json({ error: "Card not found" }, 404);
    }

    await kv.set(cardId, {
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

// Create spaced repetition card (for auto-adopting vocabulary)
app.post("/spaced-repetition", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cardData = await c.req.json();
    const cardId =
      cardData.id || `srs-card:${user.id}:${Date.now()}`;

    await kv.set(cardId, {
      ...cardData,
      id: cardId,
      userId: user.id,
      nextReview:
        cardData.nextReview || new Date().toISOString(),
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

// GRAMMAR ENDPOINTS

// Get grammar rules
app.get("/grammar", async (c) => {
  try {
    const rules = await kv.getByPrefix("grammar:");
    return c.json(rules);
  } catch (error) {
    console.log(`Grammar fetch error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create grammar rule
app.post("/grammar", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const ruleData = await c.req.json();
    const ruleId = ruleData.id || `grammar:${Date.now()}`;

    await kv.set(ruleId, {
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

// Delete grammar rule
app.delete("/grammar/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const ruleId = c.req.param("id");
    await kv.del(ruleId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Grammar deletion error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update class (for editing existing classes)
app.patch("/classes/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const classId = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(classId);

    if (!existing) {
      return c.json({ error: "Class not found" }, 404);
    }

    await kv.set(classId, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // Auto-adopt vocabulary from class pages to vocabulary library
    if (updates.pages) {
      for (const page of updates.pages) {
        if (page.type === "vocabulary" && page.content?.words) {
          for (const word of page.content.words) {
            if (word.dutch && word.english) {
              const vocabId = `vocab:${word.dutch.toLowerCase().replace(/\s+/g, "-")}`;
              const existingVocab = await kv.get(vocabId);

              if (!existingVocab) {
                await kv.set(vocabId, {
                  id: vocabId,
                  dutch: word.dutch,
                  english: word.english,
                  example: word.example || "",
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

    return c.json({ success: true });
  } catch (error) {
    console.log(`Class update error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);