import { useState } from "react";
import { api } from "../utils/api";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface AudioMigrationToolProps {
  accessToken: string;
}

export function AudioMigrationTool({ accessToken }: AudioMigrationToolProps) {
  const [status, setStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<string[]>([]);

  const migrateAudio = async () => {
    setStatus("running");
    setMessage("Loading vocabulary and lessons...");
    setDetails([]);

    try {
      // Load vocabulary - only include words with valid audio URLs
      const vocabulary = await api.getVocabulary(accessToken);
      const validVocab = vocabulary.filter(
        (v: any) => v.audioUrl && v.audioUrl.trim() !== ""
      );
      const vocabMap = new Map(
        validVocab.map((v: any) => [v.dutch.toLowerCase(), v])
      );

      setDetails((prev) => [
        ...prev,
        `✓ Loaded ${validVocab.length} vocabulary words with valid audio (${
          vocabulary.length - validVocab.length
        } skipped)`,
      ]);

      if (validVocab.length === 0) {
        setStatus("error");
        setMessage(
          "No vocabulary words with valid audio URLs found. Please add audio to your vocabulary first."
        );
        return;
      }

      // Load all classes
      const { classes } = await api.getClasses();
      setDetails((prev) => [...prev, `✓ Found ${classes.length} lessons`]);

      let updatedCount = 0;
      let pageCount = 0;

      // Update each class
      for (const classData of classes) {
        let classUpdated = false;

        if (classData.pages) {
          for (const page of classData.pages) {
            let pageUpdated = false;

            // Update flashcards
            if (page.type === "flashcards" && page.content?.cards) {
              for (const card of page.content.cards) {
                const vocab = vocabMap.get(card.front?.toLowerCase());
                if (vocab?.audioUrl && !card.audioUrl) {
                  card.audioUrl = vocab.audioUrl;
                  pageUpdated = true;
                }
              }
            }

            // Update vocabulary pages - check both 'words' and 'items' fields
            if (page.type === "vocabulary") {
              const items = page.content?.items || page.content?.words || [];
              for (const item of items) {
                const dutchWord = item.dutch || item.word;
                if (dutchWord) {
                  const vocab = vocabMap.get(dutchWord.toLowerCase());
                  if (vocab?.audioUrl && !item.audioUrl) {
                    item.audioUrl = vocab.audioUrl;
                    pageUpdated = true;
                  }
                }
              }
            }

            // Update matching exercises
            if (page.type === "matching" && page.content?.pairs) {
              for (const pair of page.content.pairs) {
                const vocab = vocabMap.get(pair.left?.toLowerCase());
                if (vocab?.audioUrl && !pair.audioUrl) {
                  pair.audioUrl = vocab.audioUrl;
                  pageUpdated = true;
                }
              }
            }

            // Update multiple choice
            if (page.type === "multipleChoice" && page.content?.questions) {
              for (const question of page.content.questions) {
                // Try to extract Dutch word from question
                const match = question.question?.match(/"([^"]+)"/);
                if (match) {
                  const vocab = vocabMap.get(match[1].toLowerCase());
                  if (vocab?.audioUrl && !question.audioUrl) {
                    question.audioUrl = vocab.audioUrl;
                    pageUpdated = true;
                  }
                }
              }
            }

            // Update fill in blank
            if (page.type === "fillInBlank" && page.content?.exercises) {
              for (const exercise of page.content.exercises) {
                const vocab = vocabMap.get(exercise.answer?.toLowerCase());
                if (vocab?.audioUrl && !exercise.audioUrl) {
                  exercise.audioUrl = vocab.audioUrl;
                  pageUpdated = true;
                }
              }
            }

            if (pageUpdated) {
              pageCount++;
              classUpdated = true;
            }
          }
        }

        // Save updated class
        if (classUpdated) {
          await api.updateClass(accessToken, classData.id, classData);
          updatedCount++;
          setDetails((prev) => [...prev, `✓ Updated: ${classData.title}`]);
        }
      }

      setStatus("success");
      setMessage(
        `Migration complete! Updated ${updatedCount} lessons (${pageCount} pages with audio added)`
      );

      if (updatedCount === 0) {
        setDetails((prev) => [
          ...prev,
          "⚠️ No lessons needed updating. Either they already have audio or no matching vocabulary was found.",
        ]);
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Migration failed: ${error}`);
      console.error("Migration error:", error);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">
          Audio Migration Tool
        </h2>
        <p className="text-sm text-zinc-600">
          This tool will automatically add audio URLs to all existing lessons by
          matching words with your vocabulary database.
        </p>
      </div>

      {status === "idle" && (
        <Button
          onClick={migrateAudio}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Start Migration
        </Button>
      )}

      {status === "running" && (
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{message}</span>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{message}</span>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {details.length > 0 && (
        <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded max-h-64 overflow-y-auto">
          <div className="text-xs font-mono space-y-1">
            {details.map((detail, i) => (
              <div key={i}>{detail}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
