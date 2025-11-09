import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { Note, NoteTag } from "../../types/notes";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Plus, Loader2, Tag as TagIcon, BookOpen } from "lucide-react";
import { NotesGrid } from "./NotesGrid";

/**
 * NotesViewer Component
 * 
 * Main component for viewing and organizing notes with the following features:
 * - Display notes in a grid layout using NotesGrid component
 * - Filter by topic or tag
 * - Navigate to full-page editor for creating and editing notes
 * 
 * Requirements: 5.1, 5.5, 5.6
 */
interface NotesViewerProps {
  accessToken: string;
  userId: string;
}

export function NotesViewer({ accessToken, userId }: NotesViewerProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [availableTags, setAvailableTags] = useState<NoteTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("all");
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (retryCount = 0) => {
    setLoading(true);
    setLoadError(null);
    try {
      await Promise.all([loadNotes(), loadTags()]);
    } catch (error) {
      console.error("Failed to load data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load notes";
      setLoadError(errorMessage);
      
      toast.error("Failed to load notes", {
        description: errorMessage,
        action: retryCount < 2 ? {
          label: "Retry",
          onClick: () => loadData(retryCount + 1),
        } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await api.getNotes(accessToken, {});
      setNotes(response.notes || []);
    } catch (error) {
      console.error("Failed to load notes:", error);
      throw error;
    }
  };

  const loadTags = async () => {
    try {
      const response = await api.getNoteTags(accessToken);
      setAvailableTags(response.tags || []);
    } catch (error) {
      console.error("Failed to load tags:", error);
      // Don't throw - tags are optional
    }
  };

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...notes];

    // Filter by topic
    if (selectedTopicFilter !== "all") {
      filtered = filtered.filter((note) => note.topicId === selectedTopicFilter);
    }

    // Filter by tags
    if (selectedTagFilters.length > 0) {
      filtered = filtered.filter((note) =>
        selectedTagFilters.some((tagId) => note.tags.includes(tagId))
      );
    }

    setFilteredNotes(filtered);
  }, [notes, selectedTopicFilter, selectedTagFilters]);

  // Get unique topics for filter dropdown
  const uniqueTopics = Array.from(
    new Set(notes.map((note) => ({ id: note.topicId, name: note.classInfo?.topicName || "Unknown Topic" })))
  ).reduce((acc, topic) => {
    if (!acc.find((t) => t.id === topic.id)) {
      acc.push(topic);
    }
    return acc;
  }, [] as { id: string; name: string }[]);

  const handleNewNote = () => {
    // Navigate to new note route
    navigate('/notes/new');
  };

  const handleNoteClick = (noteId: string) => {
    // Navigate to edit note route
    navigate(`/notes/${noteId}/edit`);
  };

  const toggleTagFilter = (tagId: string) => {
    if (selectedTagFilters.includes(tagId)) {
      setSelectedTagFilters(selectedTagFilters.filter((id) => id !== tagId));
    } else {
      setSelectedTagFilters([...selectedTagFilters, tagId]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading your notes...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="text-red-500 text-center">
          <p className="font-semibold text-lg">Failed to load notes</p>
          <p className="text-sm mt-2">{loadError}</p>
        </div>
        <Button onClick={() => loadData()} variant="outline">
          <Loader2 className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Notes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
            {(selectedTopicFilter !== "all" || selectedTagFilters.length > 0) && 
              ` (filtered from ${notes.length})`}
          </p>
        </div>
        <Button onClick={handleNewNote} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Topic Filter */}
            <div className="flex-1">
              <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Filter by Topic
              </label>
              <Select value={selectedTopicFilter} onValueChange={setSelectedTopicFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {uniqueTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div className="flex-1">
              <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-blue-600" />
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2 border border-blue-200 bg-white rounded-md p-3 min-h-[2.75rem]">
                {availableTags.length === 0 ? (
                  <span className="text-sm text-gray-500 italic">No tags available</span>
                ) : (
                  availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{
                        backgroundColor: selectedTagFilters.includes(tag.id) ? tag.color : "transparent",
                        color: selectedTagFilters.includes(tag.id) ? "white" : tag.color,
                        borderColor: tag.color,
                      }}
                      className="cursor-pointer border-2 transition-all hover:scale-105 active:scale-95"
                      onClick={() => toggleTagFilter(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <NotesGrid 
        notes={filteredNotes} 
        onNoteClick={handleNoteClick} 
        loading={loading}
      />
    </div>
  );
}
