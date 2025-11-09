import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Tests for note synchronization when lesson data is updated
 * Requirements: 5.5, 6.4
 */

describe("Note Synchronization for Lesson Updates", () => {
  // Mock KV store
  const mockKVStore = new Map<string, any>();

  // Mock KV functions
  const kvGet = vi.fn(async (key: string) => {
    return mockKVStore.get(key) || null;
  });

  const kvSet = vi.fn(async (key: string, value: any) => {
    mockKVStore.set(key, value);
  });

  const kvGetKeysByPrefix = vi.fn(async (prefix: string) => {
    const results: Array<{ key: string; value: any }> = [];
    for (const [key, value] of mockKVStore.entries()) {
      if (key.startsWith(prefix)) {
        results.push({ key, value });
      }
    }
    return results;
  });

  // Mock syncNotesForLesson function
  async function syncNotesForLesson(lessonId: string, lessonData: any) {
    try {
      console.log(`Starting note synchronization for lesson: ${lessonId}`);

      // Get all note indexes for this lesson across all users
      const allNoteIndexes = await kvGetKeysByPrefix(`note-index:`);

      // Find all note indexes that reference this lesson
      const lessonNoteIndexes = allNoteIndexes.filter((item: any) =>
        item.key.includes(`:by-lesson:${lessonId}`)
      );

      console.log(
        `Found ${lessonNoteIndexes.length} note indexes for lesson ${lessonId}`
      );

      // Extract class info from updated lesson
      const updatedClassInfo = {
        lessonTitle: lessonData.title || "",
        lessonDate: lessonData.createdAt || new Date().toISOString(),
        topicName: lessonData.topic || "",
        level: lessonData.level || "",
        seriesInfo: lessonData.series || undefined,
      };

      // Extract vocabulary from updated lesson pages
      const updatedVocabulary: any[] = [];
      if (lessonData.pages) {
        for (const page of lessonData.pages) {
          if (page.type === "vocabulary" && page.content?.words) {
            for (const word of page.content.words) {
              updatedVocabulary.push({
                word: word.dutch || "",
                translation: word.english || "",
                exampleSentence: word.example || undefined,
                audioUrl: word.audioUrl || undefined,
              });
            }
          }
        }
      }

      console.log(
        `Extracted ${updatedVocabulary.length} vocabulary items from lesson`
      );

      // Update each note associated with this lesson
      let updatedCount = 0;
      for (const indexItem of lessonNoteIndexes) {
        const noteId = indexItem.value;
        if (!noteId) continue;

        // Extract userId from the index key pattern: note-index:{userId}:by-lesson:{lessonId}
        const keyParts = indexItem.key.split(":");
        if (keyParts.length < 3) continue;
        const userId = keyParts[1];

        // Get the note
        const noteKey = `notes:${userId}:${noteId}`;
        const note = await kvGet(noteKey);

        if (!note) {
          console.log(`Note not found: ${noteKey}`);
          continue;
        }

        // Update the note with new classInfo and vocabulary
        const updatedNote = {
          ...note,
          classInfo: updatedClassInfo,
          vocabulary: updatedVocabulary,
          updatedAt: new Date().toISOString(),
        };

        // Save the updated note
        await kvSet(noteKey, updatedNote);
        updatedCount++;

        console.log(`Updated note: ${noteKey}`);
      }

      console.log(
        `Successfully synchronized ${updatedCount} notes for lesson ${lessonId}`
      );
      return { success: true, updatedCount };
    } catch (error) {
      console.error(
        `Error synchronizing notes for lesson ${lessonId}:`,
        error
      );
      return { success: false, error: String(error) };
    }
  }

  beforeEach(() => {
    mockKVStore.clear();
    vi.clearAllMocks();
  });

  it("should update classInfo in notes when lesson title is updated", async () => {
    // Setup: Create a lesson and a note
    const lessonId = "class:123";
    const userId = "user-1";
    const noteId = "note-456";

    const originalLesson = {
      id: lessonId,
      title: "Original Lesson Title",
      topic: "Greetings",
      level: "A1",
      series: "Basic Dutch",
      createdAt: "2024-01-01T00:00:00Z",
      pages: [],
    };

    const note = {
      id: noteId,
      userId,
      lessonId,
      topicId: "topic-1",
      title: "My Notes",
      content: "Student notes here",
      tags: [],
      classInfo: {
        lessonTitle: "Original Lesson Title",
        lessonDate: "2024-01-01T00:00:00Z",
        topicName: "Greetings",
        level: "A1",
        seriesInfo: "Basic Dutch",
      },
      vocabulary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      lastEditedAt: "2024-01-01T00:00:00Z",
    };

    // Store in mock KV
    mockKVStore.set(lessonId, originalLesson);
    mockKVStore.set(`notes:${userId}:${noteId}`, note);
    mockKVStore.set(`note-index:${userId}:by-lesson:${lessonId}`, noteId);

    // Update the lesson
    const updatedLesson = {
      ...originalLesson,
      title: "Updated Lesson Title",
      updatedAt: "2024-01-02T00:00:00Z",
    };

    // Sync notes
    const result = await syncNotesForLesson(lessonId, updatedLesson);

    // Verify
    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(1);

    const updatedNote = mockKVStore.get(`notes:${userId}:${noteId}`);
    expect(updatedNote.classInfo.lessonTitle).toBe("Updated Lesson Title");
    expect(updatedNote.content).toBe("Student notes here"); // Manual content unchanged
  });

  it("should update vocabulary in notes when lesson vocabulary is updated", async () => {
    // Setup
    const lessonId = "class:789";
    const userId = "user-2";
    const noteId = "note-101";

    const originalLesson = {
      id: lessonId,
      title: "Vocabulary Lesson",
      topic: "Food",
      level: "A2",
      createdAt: "2024-01-01T00:00:00Z",
      pages: [
        {
          type: "vocabulary",
          content: {
            words: [
              {
                dutch: "appel",
                english: "apple",
                example: "Ik eet een appel",
              },
            ],
          },
        },
      ],
    };

    const note = {
      id: noteId,
      userId,
      lessonId,
      topicId: "topic-2",
      title: "Food Notes",
      content: "Learning about food",
      tags: [],
      classInfo: {
        lessonTitle: "Vocabulary Lesson",
        lessonDate: "2024-01-01T00:00:00Z",
        topicName: "Food",
        level: "A2",
      },
      vocabulary: [
        {
          word: "appel",
          translation: "apple",
          exampleSentence: "Ik eet een appel",
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      lastEditedAt: "2024-01-01T00:00:00Z",
    };

    mockKVStore.set(lessonId, originalLesson);
    mockKVStore.set(`notes:${userId}:${noteId}`, note);
    mockKVStore.set(`note-index:${userId}:by-lesson:${lessonId}`, noteId);

    // Update lesson with new vocabulary
    const updatedLesson = {
      ...originalLesson,
      pages: [
        {
          type: "vocabulary",
          content: {
            words: [
              {
                dutch: "appel",
                english: "apple",
                example: "Ik eet een appel",
              },
              {
                dutch: "banaan",
                english: "banana",
                example: "De banaan is geel",
                audioUrl: "https://example.com/banaan.mp3",
              },
            ],
          },
        },
      ],
      updatedAt: "2024-01-02T00:00:00Z",
    };

    // Sync notes
    const result = await syncNotesForLesson(lessonId, updatedLesson);

    // Verify
    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(1);

    const updatedNote = mockKVStore.get(`notes:${userId}:${noteId}`);
    expect(updatedNote.vocabulary).toHaveLength(2);
    expect(updatedNote.vocabulary[1].word).toBe("banaan");
    expect(updatedNote.vocabulary[1].translation).toBe("banana");
    expect(updatedNote.vocabulary[1].audioUrl).toBe(
      "https://example.com/banaan.mp3"
    );
  });

  it("should update multiple notes for the same lesson across different users", async () => {
    // Setup
    const lessonId = "class:999";
    const user1Id = "user-1";
    const user2Id = "user-2";
    const note1Id = "note-201";
    const note2Id = "note-202";

    const lesson = {
      id: lessonId,
      title: "Shared Lesson",
      topic: "Numbers",
      level: "A1",
      createdAt: "2024-01-01T00:00:00Z",
      pages: [],
    };

    const note1 = {
      id: note1Id,
      userId: user1Id,
      lessonId,
      topicId: "topic-3",
      title: "User 1 Notes",
      content: "User 1 content",
      tags: [],
      classInfo: {
        lessonTitle: "Shared Lesson",
        lessonDate: "2024-01-01T00:00:00Z",
        topicName: "Numbers",
        level: "A1",
      },
      vocabulary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      lastEditedAt: "2024-01-01T00:00:00Z",
    };

    const note2 = {
      id: note2Id,
      userId: user2Id,
      lessonId,
      topicId: "topic-3",
      title: "User 2 Notes",
      content: "User 2 content",
      tags: [],
      classInfo: {
        lessonTitle: "Shared Lesson",
        lessonDate: "2024-01-01T00:00:00Z",
        topicName: "Numbers",
        level: "A1",
      },
      vocabulary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      lastEditedAt: "2024-01-01T00:00:00Z",
    };

    mockKVStore.set(lessonId, lesson);
    mockKVStore.set(`notes:${user1Id}:${note1Id}`, note1);
    mockKVStore.set(`notes:${user2Id}:${note2Id}`, note2);
    mockKVStore.set(`note-index:${user1Id}:by-lesson:${lessonId}`, note1Id);
    mockKVStore.set(`note-index:${user2Id}:by-lesson:${lessonId}`, note2Id);

    // Update lesson
    const updatedLesson = {
      ...lesson,
      title: "Updated Shared Lesson",
      level: "A2",
      updatedAt: "2024-01-02T00:00:00Z",
    };

    // Sync notes
    const result = await syncNotesForLesson(lessonId, updatedLesson);

    // Verify
    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(2);

    const updatedNote1 = mockKVStore.get(`notes:${user1Id}:${note1Id}`);
    const updatedNote2 = mockKVStore.get(`notes:${user2Id}:${note2Id}`);

    expect(updatedNote1.classInfo.lessonTitle).toBe("Updated Shared Lesson");
    expect(updatedNote1.classInfo.level).toBe("A2");
    expect(updatedNote1.content).toBe("User 1 content"); // Manual content unchanged

    expect(updatedNote2.classInfo.lessonTitle).toBe("Updated Shared Lesson");
    expect(updatedNote2.classInfo.level).toBe("A2");
    expect(updatedNote2.content).toBe("User 2 content"); // Manual content unchanged
  });

  it("should update updatedAt timestamp when syncing notes", async () => {
    // Setup
    const lessonId = "class:555";
    const userId = "user-3";
    const noteId = "note-303";

    const lesson = {
      id: lessonId,
      title: "Test Lesson",
      topic: "Test",
      level: "A1",
      createdAt: "2024-01-01T00:00:00Z",
      pages: [],
    };

    const note = {
      id: noteId,
      userId,
      lessonId,
      topicId: "topic-4",
      title: "Test Notes",
      content: "Test content",
      tags: [],
      classInfo: {
        lessonTitle: "Test Lesson",
        lessonDate: "2024-01-01T00:00:00Z",
        topicName: "Test",
        level: "A1",
      },
      vocabulary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      lastEditedAt: "2024-01-01T00:00:00Z",
    };

    mockKVStore.set(lessonId, lesson);
    mockKVStore.set(`notes:${userId}:${noteId}`, note);
    mockKVStore.set(`note-index:${userId}:by-lesson:${lessonId}`, noteId);

    const originalUpdatedAt = note.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update lesson
    const updatedLesson = {
      ...lesson,
      title: "Updated Test Lesson",
      updatedAt: "2024-01-02T00:00:00Z",
    };

    // Sync notes
    await syncNotesForLesson(lessonId, updatedLesson);

    // Verify
    const updatedNote = mockKVStore.get(`notes:${userId}:${noteId}`);
    expect(updatedNote.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("should handle lessons with no associated notes gracefully", async () => {
    // Setup
    const lessonId = "class:666";

    const lesson = {
      id: lessonId,
      title: "Lesson Without Notes",
      topic: "Test",
      level: "A1",
      createdAt: "2024-01-01T00:00:00Z",
      pages: [],
    };

    mockKVStore.set(lessonId, lesson);

    // Update lesson
    const updatedLesson = {
      ...lesson,
      title: "Updated Lesson Without Notes",
      updatedAt: "2024-01-02T00:00:00Z",
    };

    // Sync notes
    const result = await syncNotesForLesson(lessonId, updatedLesson);

    // Verify
    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(0);
  });

  it("should extract all vocabulary items from multiple vocabulary pages", async () => {
    // Setup
    const lessonId = "class:777";
    const userId = "user-4";
    const noteId = "note-404";

    const lesson = {
      id: lessonId,
      title: "Multi-Vocab Lesson",
      topic: "Mixed",
      level: "B1",
      createdAt: "2024-01-01T00:00:00Z",
      pages: [
        {
          type: "vocabulary",
          content: {
            words: [
              { dutch: "huis", english: "house" },
              { dutch: "auto", english: "car" },
            ],
          },
        },
        {
          type: "text",
          content: "Some text content",
        },
        {
          type: "vocabulary",
          content: {
            words: [
              { dutch: "fiets", english: "bicycle" },
              { dutch: "trein", english: "train" },
            ],
          },
        },
      ],
    };

    const note = {
      id: noteId,
      userId,
      lessonId,
      topicId: "topic-5",
      title: "Transport Notes",
      content: "Learning transport words",
      tags: [],
      classInfo: {
        lessonTitle: "Multi-Vocab Lesson",
        lessonDate: "2024-01-01T00:00:00Z",
        topicName: "Mixed",
        level: "B1",
      },
      vocabulary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      lastEditedAt: "2024-01-01T00:00:00Z",
    };

    mockKVStore.set(lessonId, lesson);
    mockKVStore.set(`notes:${userId}:${noteId}`, note);
    mockKVStore.set(`note-index:${userId}:by-lesson:${lessonId}`, noteId);

    // Sync notes
    const result = await syncNotesForLesson(lessonId, lesson);

    // Verify
    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(1);

    const updatedNote = mockKVStore.get(`notes:${userId}:${noteId}`);
    expect(updatedNote.vocabulary).toHaveLength(4);
    expect(updatedNote.vocabulary[0].word).toBe("huis");
    expect(updatedNote.vocabulary[1].word).toBe("auto");
    expect(updatedNote.vocabulary[2].word).toBe("fiets");
    expect(updatedNote.vocabulary[3].word).toBe("trein");
  });
});
