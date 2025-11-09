import React, { useState, useEffect, useCallback } from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import { generateNoteTemplate, NoteTemplateData } from './NoteTemplate';
import { api } from '../../utils/api';
import { Note, VocabularyItem } from '../../types/notes';

export interface SimpleNoteEditorProps {
  accessToken: string;
  lessonId: string;
  topicId: string;
  noteId?: string;
  onClose: () => void;
  lessonData?: {
    title: string;
    date: string;
    topicName: string;
    level: string;
    vocabulary: VocabularyItem[];
  };
}

export const SimpleNoteEditor: React.FC<SimpleNoteEditorProps> = ({
  accessToken,
  lessonId,
  topicId,
  noteId,
  onClose,
  lessonData,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load existing note or generate template
  useEffect(() => {
    const loadNote = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (noteId) {
          // Load existing note
          const note: Note = await api.getNote(accessToken, noteId);
          setTitle(note.title);
          setContent(note.content);
          setLastSaved(new Date(note.updatedAt));
        } else {
          // Generate template for new note
          const templateData: NoteTemplateData = lessonData
            ? {
                lessonTitle: lessonData.title,
                lessonDate: lessonData.date,
                topicName: lessonData.topicName,
                level: lessonData.level,
                vocabulary: lessonData.vocabulary,
              }
            : {};

          const template = generateNoteTemplate(templateData);
          setTitle(lessonData?.title || 'New Note');
          setContent(template);
        }
      } catch (err) {
        console.error('Failed to load note:', err);
        setError(err instanceof Error ? err.message : 'Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [accessToken, noteId, lessonId, lessonData]);

  // Auto-save function
  const saveNote = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      if (noteId) {
        // Update existing note
        await api.updateNote(accessToken, noteId, {
          title,
          content,
        });
      } else {
        // Create new note
        await api.createNote(accessToken, {
          lessonId,
          topicId,
          title,
          content,
          tags: [],
        });
        // Note: For future saves, we would need to update noteId
        // This would require passing the new ID up to the parent component
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save note:', err);
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [accessToken, noteId, lessonId, topicId, title, content, hasUnsavedChanges, isSaving]);

  // Auto-save with 2-second debounce
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [hasUnsavedChanges, saveNote]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  // Handle title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  // Handle close with auto-save
  const handleClose = async () => {
    if (hasUnsavedChanges) {
      await saveNote();
    }
    onClose();
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved ${Math.floor(diff / 3600)}h ago`;
  };

  if (isLoading) {
    return (
      <div className="simple-note-editor">
        <div className="editor-loading">Loading note...</div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="simple-note-editor">
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="title-input"
          aria-label="Note title"
        />
        <button
          onClick={handleClose}
          className="close-button"
          aria-label="Close editor"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="editor-content">
        <MarkdownEditor
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing your notes..."
          toolbarMode="simple"
          onSave={saveNote}
        />
      </div>

      <div className="editor-footer">
        <div className="save-indicator">
          {isSaving && (
            <span className="saving-text">
              <span className="spinner"></span>
              Saving...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className="saved-text">{formatLastSaved()}</span>
          )}
          {!isSaving && hasUnsavedChanges && !lastSaved && (
            <span className="unsaved-text">Unsaved changes</span>
          )}
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .simple-note-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 600px;
    background-color: white;
    border-left: 1px solid #ddd;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .editor-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #ddd;
    background-color: #f9f9f9;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .title-input {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.2s;
  }

  .title-input:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }

  .close-button {
    min-width: 36px;
    min-height: 36px;
    padding: 8px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button:hover {
    background-color: #f5f5f5;
    border-color: #999;
    color: #333;
  }

  .close-button:active {
    background-color: #e8e8e8;
  }

  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .editor-footer {
    padding: 12px 16px;
    border-top: 1px solid #ddd;
    background-color: #f9f9f9;
    position: sticky;
    bottom: 0;
  }

  .save-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .saving-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4a90e2;
  }

  .saved-text {
    color: #28a745;
  }

  .unsaved-text {
    color: #ffc107;
  }

  .spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid #4a90e2;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    padding: 12px 16px;
    background-color: #fee;
    color: #c33;
    border-bottom: 1px solid #fcc;
    font-size: 14px;
  }

  .editor-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 16px;
    color: #666;
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .simple-note-editor {
      width: 60%;
    }
  }

  @media (max-width: 768px) {
    .simple-note-editor {
      width: 100%;
    }

    .title-input {
      font-size: 16px;
    }

    .close-button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
