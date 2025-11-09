import { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";
import { Note, ClassInfo, VocabularyItem } from "../../types/notes";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Save, X, Loader2, BookOpen, Languages, Tag as TagIcon } from "lucide-react";
import { TagManager } from "./TagManager";

interface NoteEditorProps {
  accessToken: string;
  noteId?: string;
  lessonId: string;
  topicId: string;
  onSave: (note: Note) => void;
  onCancel: () => void;
  initialTitle?: string;
}

export function NoteEditor({
  accessToken,
  noteId,
  lessonId,
  topicId,
  onSave,
  onCancel,
  initialTitle,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Load existing note if noteId is provided
  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async (retryCount = 0) => {
    if (!noteId) return;

    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.getNote(accessToken, noteId);
      const note = response.note;

      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setClassInfo(note.classInfo);
      setVocabulary(note.vocabulary);
    } catch (error) {
      console.error("Failed to load note:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load note";
      setLoadError(errorMessage);
      
      toast.error("Failed to load note", {
        description: errorMessage,
        action: retryCount < 2 ? {
          label: "Retry",
          onClick: () => loadNote(retryCount + 1),
        } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-save with 1-second debounce
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      if (noteId && content) {
        handleAutoSave();
      }
    }, 1000);

    setAutoSaveTimeout(timeout);
  }, [noteId, content, autoSaveTimeout]);

  useEffect(() => {
    if (noteId && content) {
      triggerAutoSave();
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [content]);

  const handleAutoSave = async () => {
    if (!noteId) return;

    setAutoSaving(true);
    try {
      await api.updateNote(accessToken, noteId, {
        content,
        title,
        tags,
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Show subtle notification for auto-save failure
      toast.error("Auto-save failed", {
        description: "Your changes are not saved. Please save manually.",
        duration: 3000,
      });
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async (retryCount = 0) => {
    if (!title.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    setSaving(true);
    try {
      if (noteId) {
        // Update existing note
        const response = await api.updateNote(accessToken, noteId, {
          content,
          title,
          tags,
        });
        toast.success("Note updated successfully");
        onSave(response.note);
      } else {
        // Create new note
        const response = await api.createNote(accessToken, {
          lessonId,
          topicId,
          title,
          content,
          tags,
        });
        toast.success("Note created successfully");
        onSave(response.note);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save note";
      
      toast.error("Failed to save note", {
        description: errorMessage,
        action: retryCount < 2 ? {
          label: "Retry",
          onClick: () => handleSave(retryCount + 1),
        } : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading note...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-red-500 text-center">
          <p className="font-semibold">Failed to load note</p>
          <p className="text-sm mt-2">{loadError}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadNote()} variant="outline">
            Try Again
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manual Content Section */}
      <div className="space-y-6 bg-white rounded-lg p-4 border border-gray-200">
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="note-title" className="text-sm font-semibold">Title *</Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title for your note..."
            disabled={saving}
            className="text-base"
          />
        </div>

        {/* Manual Note Content */}
        <div className="space-y-2">
          <Label htmlFor="note-content" className="text-sm font-semibold">Content</Label>
          <Textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here... What did you learn? What questions do you have?"
            rows={12}
            disabled={saving}
            className="resize-y text-base leading-relaxed"
          />
          {noteId && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded px-3 py-2">
              {autoSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  <span className="font-medium">Saving changes...</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Auto-save enabled • Changes saved automatically</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tag Manager */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-blue-600" />
            Tags
          </Label>
          <TagManager
            accessToken={accessToken}
            selectedTags={tags}
            onTagsChange={handleTagsChange}
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auto-extracted Class Info */}
      {classInfo && (
        <div className="space-y-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <Label className="text-sm font-semibold text-gray-900">Class Information</Label>
          </div>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lesson:</span>
              <span className="font-medium text-gray-900">{classInfo.lessonTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Topic:</span>
              <span className="font-medium text-gray-900">{classInfo.topicName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Level:</span>
              <span className="font-medium text-gray-900">{classInfo.level}</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-extracted Vocabulary */}
      {vocabulary && vocabulary.length > 0 && (
        <div className="space-y-3 bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-green-600" />
            <Label className="text-sm font-semibold text-gray-900">
              Vocabulary ({vocabulary.length})
            </Label>
          </div>
          <div className="bg-white rounded-lg p-3 space-y-3 max-h-64 overflow-y-auto">
            {vocabulary.map((vocab, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">{vocab.word}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-gray-700">{vocab.translation}</span>
                </div>
                {vocab.exampleSentence && (
                  <p className="text-xs text-gray-600 italic pl-4">
                    {vocab.exampleSentence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
