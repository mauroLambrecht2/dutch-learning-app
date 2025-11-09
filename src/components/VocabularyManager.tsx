import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mic, Play, Trash2, Plus, Upload } from "lucide-react";
import { AudioRecorder } from "./AudioRecorder";
import { VocabularyCleanupTool } from "./VocabularyCleanupTool";

interface VocabularyWord {
  id: string;
  dutch: string;
  english: string;
  example?: string;
  audioUrl?: string;
  category?: string;
  lessonId?: string;
}

interface VocabularyManagerProps {
  accessToken: string;
}

export function VocabularyManager({ accessToken }: VocabularyManagerProps) {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [newWord, setNewWord] = useState({
    dutch: "",
    english: "",
    example: "",
    category: "",
  });
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    withAudio: number;
    withoutAudio: number;
  } | null>(null);
  const [removingAllAudio, setRemovingAllAudio] = useState(false);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      const data = await api.getVocabulary(accessToken);
      setWords(data || []);
    } catch (error) {
      console.error("Failed to load vocabulary:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWord = async () => {
    if (!newWord.dutch || !newWord.english) {
      alert("Please enter both Dutch and English words");
      return;
    }

    try {
      await api.createVocabulary(accessToken, {
        ...newWord,
        id: `vocab-${Date.now()}`,
      });
      setNewWord({ dutch: "", english: "", example: "", category: "" });
      loadVocabulary();
    } catch (error) {
      alert("Failed to add word");
    }
  };

  const deleteWord = async (id: string) => {
    if (!confirm("Delete this word?")) return;

    try {
      await api.deleteVocabulary(accessToken, id);
      loadVocabulary();
    } catch (error) {
      alert("Failed to delete word");
    }
  };

  const handleAudioSaved = async (wordId: string, audioUrl: string) => {
    try {
      await api.updateVocabulary(accessToken, wordId, { audioUrl });
      loadVocabulary();
      setRecordingId(null);
    } catch (error) {
      alert("Failed to save audio");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-500">Loading vocabulary...</div>
    );
  }

  // Count words without audio
  const wordsWithoutAudio = words.filter(
    (w) => !w.audioUrl || w.audioUrl.trim() === ""
  );
  const wordsWithAudio = words.filter(
    (w) => w.audioUrl && w.audioUrl.trim() !== ""
  );

  const scanForMissingAudio = async () => {
    setScanning(true);
    try {
      // Reload vocabulary to get fresh data
      await loadVocabulary();

      // Import supabase client to check bucket
      const { supabase } = await import("../utils/supabase-client");

      // Check each word's audio file in the bucket
      let withAudio = 0;
      let withoutAudio = 0;
      const wordsToUpdate: string[] = [];

      for (const word of words) {
        if (!word.audioUrl || word.audioUrl.trim() === "") {
          withoutAudio++;
          continue;
        }

        // Extract the file path from the URL
        // URL format: https://tnlceozwrkspncxwcaqe.supabase.co/storage/v1/object/public/vocabulary-audio/recordings/audio-123.webm
        const urlParts = word.audioUrl.split("/vocabulary-audio/");
        if (urlParts.length < 2) {
          withoutAudio++;
          wordsToUpdate.push(word.id);
          continue;
        }

        const filePath = urlParts[1];
        const pathParts = filePath.split("/");
        const folder = pathParts[0];
        const filename = pathParts[1];

        // Check if file exists in bucket
        const { data, error } = await supabase.storage
          .from("vocabulary-audio")
          .list(folder, {
            search: filename,
          });

        if (error || !data || data.length === 0) {
          withoutAudio++;
          wordsToUpdate.push(word.id);
        } else {
          withAudio++;
        }
      }

      // Update words with invalid audio URLs
      if (wordsToUpdate.length > 0) {
        for (const wordId of wordsToUpdate) {
          await api.updateVocabulary(accessToken, wordId, { audioUrl: "" });
        }
      }

      setScanResults({ withAudio, withoutAudio });

      alert(
        `Scan complete!\n\n✅ ${withAudio} words with valid audio files in bucket\n❌ ${withoutAudio} words with missing/invalid audio\n\n${wordsToUpdate.length} corrupted URLs cleaned up.\n\nWords without audio will not show play/record buttons.`
      );

      // Reload to update the UI
      await loadVocabulary();
    } catch (error) {
      console.error("Scan error:", error);
      alert(
        "Failed to scan vocabulary: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setScanning(false);
    }
  };

  const removeAllAudioUrls = async () => {
    if (
      !confirm(
        "Are you sure you want to remove ALL audio URLs from ALL vocabulary words? This action cannot be undone."
      )
    ) {
      return;
    }

    setRemovingAllAudio(true);
    try {
      let removedCount = 0;

      for (const word of words) {
        if (word.audioUrl && word.audioUrl.trim() !== "") {
          await api.updateVocabulary(accessToken, word.id, { audioUrl: "" });
          removedCount++;
        }
      }

      alert(
        `Successfully removed audio URLs from ${removedCount} vocabulary words.`
      );
      await loadVocabulary();
    } catch (error) {
      console.error("Remove all audio error:", error);
      alert(
        "Failed to remove audio URLs: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setRemovingAllAudio(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Audio Detection Tool */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          🎤 Detect Missing Audio
        </h3>
        <p className="text-xs text-blue-800 mb-3">
          Scan all vocabulary to detect which words are missing audio. Words
          without audio will have play/record buttons hidden.
        </p>
        <Button
          onClick={scanForMissingAudio}
          disabled={scanning}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {scanning ? "Scanning..." : "Scan for Missing Audio"}
        </Button>
        {scanResults && (
          <div className="mt-3 p-3 bg-white border border-blue-200 rounded text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-700">✅ With Audio:</span>
              <span className="font-semibold text-blue-900">
                {scanResults.withAudio} words
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">❌ Without Audio:</span>
              <span className="font-semibold text-blue-900">
                {scanResults.withoutAudio} words
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cleanup Tool */}
      <div className="bg-orange-50 border border-orange-200 p-4 rounded">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">
          🧹 Remove Duplicates
        </h3>
        <p className="text-xs text-orange-800 mb-3">
          If you have duplicate vocabulary words, use this tool to clean them up
          automatically.
        </p>
        <VocabularyCleanupTool
          accessToken={accessToken}
          onComplete={loadVocabulary}
        />
      </div>

      {/* Remove All Audio Tool */}
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <h3 className="text-sm font-semibold text-red-900 mb-2">
          🗑️ Remove All Audio
        </h3>
        <p className="text-xs text-red-800 mb-3">
          Remove all audio URLs from all vocabulary words. This will not delete
          the audio files from storage, only the references.
        </p>
        <Button
          onClick={removeAllAudioUrls}
          disabled={removingAllAudio}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {removingAllAudio ? "Removing..." : "Remove All Audio URLs"}
        </Button>
      </div>

      <div className="bg-white border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
            Vocabulary Library
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Manage all vocabulary words. Add audio pronunciations for each word.
          </p>
        </div>

        {/* Add New Word */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50">
          <h3
            className="text-sm text-zinc-700 mb-4"
            style={{ fontWeight: 600 }}
          >
            Add New Word
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1.5 block">
                Dutch Word *
              </Label>
              <Input
                value={newWord.dutch}
                onChange={(e) =>
                  setNewWord({ ...newWord, dutch: e.target.value })
                }
                placeholder="hallo"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1.5 block">
                English Translation *
              </Label>
              <Input
                value={newWord.english}
                onChange={(e) =>
                  setNewWord({ ...newWord, english: e.target.value })
                }
                placeholder="hello"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1.5 block">
                Example Sentence
              </Label>
              <Input
                value={newWord.example}
                onChange={(e) =>
                  setNewWord({ ...newWord, example: e.target.value })
                }
                placeholder="Hallo, hoe gaat het?"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1.5 block">
                Category
              </Label>
              <Input
                value={newWord.category}
                onChange={(e) =>
                  setNewWord({ ...newWord, category: e.target.value })
                }
                placeholder="Greetings"
                className="text-sm"
              />
            </div>
          </div>
          <Button
            onClick={addWord}
            size="sm"
            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Word
          </Button>
        </div>

        {/* Word List */}
        <div className="divide-y divide-zinc-200">
          {words.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-400 mb-2">No vocabulary words yet</p>
              <p className="text-sm text-zinc-500">
                Add words above to build your vocabulary library
              </p>
            </div>
          ) : (
            words.map((word) => (
              <div key={word.id} className="p-4 hover:bg-zinc-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Dutch</div>
                      <div
                        className="text-sm text-zinc-900"
                        style={{ fontWeight: 600 }}
                      >
                        {word.dutch}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">English</div>
                      <div className="text-sm text-zinc-700">
                        {word.english}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Example</div>
                      <div className="text-sm text-zinc-600">
                        {word.example || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Category</div>
                      <div className="text-sm text-zinc-600">
                        {word.category || "Uncategorized"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Show Play button if word has audio */}
                    {word.audioUrl && word.audioUrl.trim() !== "" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => new Audio(word.audioUrl).play()}
                        className="border-zinc-200"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    )}
                    {/* Always show Record button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRecordingId(word.id)}
                      className="border-zinc-200"
                    >
                      <Mic className="w-3 h-3 mr-1" />
                      {word.audioUrl && word.audioUrl.trim() !== ""
                        ? "Re-record"
                        : "Record"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteWord(word.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {recordingId === word.id && (
                  <div className="mt-4 p-4 bg-zinc-100 border border-zinc-200">
                    <AudioRecorder
                      onSave={(audioUrl) => handleAudioSaved(word.id, audioUrl)}
                      onCancel={() => setRecordingId(null)}
                      accessToken={accessToken}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
