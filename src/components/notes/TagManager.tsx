import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { NoteTag } from "../../types/notes";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Plus, Loader2, Tag, X } from "lucide-react";

/**
 * TagManager Component
 * 
 * Manages note tags with the following features:
 * - Displays available tags as color-coded badges
 * - Allows tag selection/deselection via checkboxes
 * - Provides an inline form to create new tags with custom colors
 * - Updates parent component via onTagsChange callback
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */
interface TagManagerProps {
  accessToken: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

export function TagManager({
  accessToken,
  selectedTags = [],
  onTagsChange,
}: TagManagerProps) {
  const [availableTags, setAvailableTags] = useState<NoteTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);
  
  // Ensure selectedTags is always an array
  const safeTags = selectedTags || [];

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async (retryCount = 0) => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.getNoteTags(accessToken);
      setAvailableTags(response.tags || []);
    } catch (error) {
      console.error("Failed to load tags:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load tags";
      setLoadError(errorMessage);
      
      toast.error("Failed to load tags", {
        description: errorMessage,
        action: retryCount < 2 ? {
          label: "Retry",
          onClick: () => loadTags(retryCount + 1),
        } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (safeTags.includes(tagId)) {
      onTagsChange(safeTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...safeTags, tagId]);
    }
  };

  const handleCreateTag = async (retryCount = 0) => {
    if (!newTagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    setCreating(true);
    try {
      const response = await api.createNoteTag(accessToken, {
        name: newTagName.trim(),
        color: newTagColor,
      });

      setAvailableTags([...availableTags, response.tag]);
      onTagsChange([...safeTags, response.tag.id]);
      
      toast.success("Tag created successfully");
      setShowCreateForm(false);
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error("Failed to create tag:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create tag";
      
      toast.error("Failed to create tag", {
        description: errorMessage,
        action: retryCount < 2 ? {
          label: "Retry",
          onClick: () => handleCreateTag(retryCount + 1),
        } : undefined,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewTagName("");
    setNewTagColor(PRESET_COLORS[0]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-2">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        <p className="text-xs text-gray-600">Loading tags...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-3 border rounded-lg bg-red-50">
        <div className="text-red-600 text-center">
          <p className="text-sm font-semibold">Failed to load tags</p>
          <p className="text-xs mt-1">{loadError}</p>
        </div>
        <Button onClick={() => loadTags()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Tags Display */}
      {safeTags.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Selected Tags</p>
          <div className="flex flex-wrap gap-2">
            {safeTags.map((tagId) => {
              const tag = availableTags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color }}
                  className="text-white shadow-sm text-sm py-1 px-3"
                >
                  {tag.name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Tag Selection List */}
      <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3 max-h-72 overflow-y-auto bg-white">
        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
          <Tag className="h-3.5 w-3.5" />
          Available Tags
        </p>
        {availableTags.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Tag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">
              No tags available
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Create your first tag below!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableTags.map((tag) => (
              <div 
                key={tag.id} 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={safeTags.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <label
                  htmlFor={`tag-${tag.id}`}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Badge
                    style={{ backgroundColor: tag.color }}
                    className="text-white shadow-sm"
                  >
                    {tag.name}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Tag - Inline Form */}
      {!showCreateForm ? (
        <Button 
          variant="outline" 
          className="w-full border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Tag
        </Button>
      ) : (
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-lg p-1.5">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Create New Tag</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelCreate}
              disabled={creating}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tag Name Input */}
          <div className="space-y-2">
            <Label htmlFor="tag-name" className="text-xs font-semibold text-gray-700">Tag Name *</Label>
            <Input
              id="tag-name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g., Grammar, Vocabulary..."
              disabled={creating}
              className="text-sm bg-white"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Tag Color</Label>
            <div className="space-y-2 p-2 bg-white rounded-lg border border-gray-200">
              {/* First row - 8 colors */}
              <div className="flex gap-2">
                {PRESET_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all flex-shrink-0 border-2 ${
                      newTagColor === color
                        ? "ring-2 ring-offset-2 ring-blue-500 scale-110 border-white"
                        : "hover:scale-105 border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={creating}
                    title={color}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              {/* Second row - 8 colors */}
              <div className="flex gap-2">
                {PRESET_COLORS.slice(8, 16).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all flex-shrink-0 border-2 ${
                      newTagColor === color
                        ? "ring-2 ring-offset-2 ring-blue-500 scale-110 border-white"
                        : "hover:scale-105 border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={creating}
                    title={color}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Preview</Label>
            <div className="bg-white rounded-lg p-3 border-2 border-gray-200 flex items-center justify-center">
              <Badge
                style={{ backgroundColor: newTagColor }}
                className="text-white shadow-sm text-sm py-1 px-3"
              >
                {newTagName || "Tag Name"}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancelCreate}
              disabled={creating}
              className="flex-1 text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTag} 
              disabled={creating || !newTagName.trim()} 
              className="flex-1 text-sm"
            >
              {creating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Create Tag
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
