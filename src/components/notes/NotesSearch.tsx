import { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";
import { NoteSearchResult, NoteTag } from "../../types/notes";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { toast } from "sonner";
import { Search, X, Loader2, FileText, Calendar, Tag as TagIcon, BookOpen } from "lucide-react";

/**
 * NotesSearch Component
 * 
 * Advanced search interface for notes with the following features:
 * - Full-text search with debounced input (500ms)
 * - Filter by topic
 * - Filter by tags (multi-select)
 * - Display search results with highlighted snippets
 * - Click handler for result selection
 * - Clear search functionality
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
interface NotesSearchProps {
  accessToken: string;
  userId: string;
  onResultSelect: (noteId: string) => void;
}

export function NotesSearch({ accessToken, userId, onResultSelect }: NotesSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NoteSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("");
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<NoteTag[]>([]);
  const [availableTopics, setAvailableTopics] = useState<{ id: string; name: string }[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load tags and topics on mount
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      // Load tags
      const tagsResponse = await api.getNoteTags(accessToken);
      setAvailableTags(tagsResponse.tags || []);

      // Load all notes to extract unique topics
      const notesResponse = await api.getNotes(accessToken);
      const notes = notesResponse.notes || [];
      
      // Extract unique topics
      const topicsMap = new Map<string, string>();
      notes.forEach((note) => {
        if (note.topicId && note.classInfo?.topicName) {
          topicsMap.set(note.topicId, note.classInfo.topicName);
        }
      });
      
      const topics = Array.from(topicsMap.entries()).map(([id, name]) => ({ id, name }));
      setAvailableTopics(topics);
    } catch (error) {
      console.error("Failed to load filters:", error);
      // Don't show error toast - filters are optional
    }
  };

  // Debounced search function
  const performSearch = useCallback(
    async (query: string, topicId?: string, tags?: string[], retryCount = 0) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        setSearchError(null);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      setSearchError(null);

      try {
        const filters: any = {};
        if (topicId) {
          filters.topicId = topicId;
        }
        if (tags && tags.length > 0) {
          filters.tags = tags;
        }

        const response = await api.searchNotes(accessToken, query, filters);
        setSearchResults(response.results || []);
      } catch (error) {
        console.error("Failed to search notes:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to search notes";
        setSearchError(errorMessage);
        setSearchResults([]);
        
        toast.error("Failed to search notes", {
          description: errorMessage,
          action: retryCount < 2 ? {
            label: "Retry",
            onClick: () => performSearch(query, topicId, tags, retryCount + 1),
          } : undefined,
        });
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, selectedTopicFilter, selectedTagFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTopicFilter, selectedTagFilters, performSearch]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedTopicFilter("");
    setSelectedTagFilters([]);
    setSearchResults([]);
    setHasSearched(false);
  };

  const toggleTagFilter = (tagId: string) => {
    if (selectedTagFilters.includes(tagId)) {
      setSelectedTagFilters(selectedTagFilters.filter((id) => id !== tagId));
    } else {
      setSelectedTagFilters([...selectedTagFilters, tagId]);
    }
  };

  const handleResultClick = (noteId: string) => {
    onResultSelect(noteId);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getTagById = (tagId: string) => {
    return availableTags.find((tag) => tag.id === tagId);
  };

  // Render highlighted snippet with HTML
  const renderHighlightedSnippet = (snippet: string) => {
    return <span dangerouslySetInnerHTML={{ __html: snippet }} />;
  };

  return (
    <div className="space-y-5">
      {/* Search Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
              <Input
                type="text"
                placeholder="Search your notes by content, title, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 text-base bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {(searchQuery || selectedTopicFilter || selectedTagFilters.length > 0) && (
              <Button variant="outline" onClick={handleClearSearch} className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-purple-200">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Topic Filter */}
            <div className="flex-1">
              <label className="text-sm font-semibold mb-2 block text-gray-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600" />
                Filter by Topic
              </label>
              <Select value={selectedTopicFilter} onValueChange={setSelectedTopicFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Topics</SelectItem>
                  {availableTopics.map((topic) => (
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
                <TagIcon className="h-4 w-4 text-purple-600" />
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2 border border-purple-200 bg-white rounded-md p-3 min-h-[2.75rem]">
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

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Searching notes...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && searchError && (
        <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600">
            <p className="font-semibold">Search failed</p>
            <p className="text-sm mt-2">{searchError}</p>
          </div>
          <Button 
            onClick={() => performSearch(searchQuery, selectedTopicFilter, selectedTagFilters)} 
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Search Results */}
      {!loading && !searchError && hasSearched && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Try adjusting your search query or filters to find what you're looking for
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                  Found <span className="font-bold text-purple-700">{searchResults.length}</span> {searchResults.length === 1 ? "result" : "results"}
                </div>
              </div>
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Card
                    key={result.note.id}
                    className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer border-l-4 border-l-purple-400"
                    onClick={() => handleResultClick(result.note.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg">{result.note.title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(result.note.createdAt)}
                        </span>
                        {result.note.classInfo && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {result.note.classInfo.topicName}
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Highlighted Snippet */}
                      <div className="text-sm text-gray-800 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                        <div className="flex items-start gap-2">
                          <Search className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            {renderHighlightedSnippet(result.highlightedSnippet)}
                          </div>
                        </div>
                      </div>

                      {/* Class Info */}
                      {result.note.classInfo && (
                        <div className="text-xs text-gray-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                          <span className="font-semibold">{result.note.classInfo.lessonTitle}</span>
                          <span className="text-gray-500 mx-2">•</span>
                          <span className="text-blue-700">{result.note.classInfo.level}</span>
                        </div>
                      )}

                      {/* Tags */}
                      {result.note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {result.note.tags.map((tagId) => {
                            const tag = getTagById(tagId);
                            if (!tag) return null;
                            return (
                              <Badge
                                key={tagId}
                                style={{ backgroundColor: tag.color }}
                                className="text-white text-xs shadow-sm"
                              >
                                {tag.name}
                              </Badge>
                            );
                          })}
                        </div>
                      )}

                      {/* Vocabulary Count */}
                      {result.note.vocabulary && result.note.vocabulary.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md px-2 py-1 w-fit">
                          <TagIcon className="h-3 w-3" />
                          <span>{result.note.vocabulary.length} vocabulary {result.note.vocabulary.length === 1 ? "item" : "items"}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Initial State - No Search Yet */}
      {!loading && !hasSearched && (
        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="text-center py-16">
            <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search your notes</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Enter a search query above to find notes by content, title, or keywords
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
