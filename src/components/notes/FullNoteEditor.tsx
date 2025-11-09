import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { TagManager } from './TagManager';
import { generateNoteTemplate, NoteTemplateData } from './NoteTemplate';
import { api } from '../../utils/api';
import { Note, VocabularyItem, ClassInfo } from '../../types/notes';
import { ChevronLeft, Save, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export interface FullNoteEditorProps {
  accessToken: string;
  noteId?: string;
  lessonId?: string;
  topicId?: string;
  onBack?: () => void;
  onNoteCreated?: (noteId: string) => void;
}

export const FullNoteEditor: React.FC<FullNoteEditorProps> = ({
  accessToken,
  noteId: propNoteId,
  lessonId: propLessonId,
  topicId: propTopicId,
  onBack,
  onNoteCreated,
}) => {
  // Get route parameters
  const { noteId: routeNoteId } = useParams<{ noteId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Use route params if available, otherwise use props
  const noteId = routeNoteId || propNoteId;
  const lessonId = searchParams.get('lessonId') || propLessonId;
  const topicId = searchParams.get('topicId') || propTopicId;
  
  // Editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);

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
          setTags(note.tags);
          setClassInfo(note.classInfo);
          setVocabulary(note.vocabulary);
          setLastSaved(new Date(note.updatedAt));
        } else if (lessonId) {
          // Generate template for new note from lesson
          // Fetch lesson data
          const lessonData = await fetchLessonData(lessonId);
          
          const templateData: NoteTemplateData = {
            lessonTitle: lessonData.title,
            lessonDate: lessonData.date,
            topicName: lessonData.topicName,
            level: lessonData.level,
            vocabulary: lessonData.vocabulary,
          };

          const template = generateNoteTemplate(templateData);
          setTitle(lessonData.title || 'New Note');
          setContent(template);
          setClassInfo({
            lessonTitle: lessonData.title,
            lessonDate: lessonData.date,
            topicName: lessonData.topicName,
            level: lessonData.level,
          });
          setVocabulary(lessonData.vocabulary);
        } else {
          // New standalone note
          const template = generateNoteTemplate({});
          setTitle('New Note');
          setContent(template);
        }
      } catch (err) {
        console.error('Failed to load note:', err);
        setError(err instanceof Error ? err.message : 'Failed to load note');
        toast.error('Failed to load note', {
          description: err instanceof Error ? err.message : 'An error occurred',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [accessToken, noteId, lessonId]);

  // Fetch lesson data helper
  const fetchLessonData = async (lessonId: string) => {
    // This would call the actual API to get lesson data
    // For now, return mock data structure
    return {
      title: 'Lesson Title',
      date: new Date().toISOString(),
      topicName: 'Topic Name',
      level: 'A1',
      vocabulary: [] as VocabularyItem[],
    };
  };

  // Manual save function
  const saveNote = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      if (noteId) {
        // Update existing note
        await api.updateNote(accessToken, noteId, {
          title,
          content,
          tags,
        });
        toast.success('Note saved successfully');
      } else {
        // Create new note
        const response = await api.createNote(accessToken, {
          lessonId: lessonId || '',
          topicId: topicId || '',
          title,
          content,
          tags,
        });
        toast.success('Note created successfully');
        // Notify parent component of new note
        if (onNoteCreated) {
          onNoteCreated(response.note.id);
        }
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save note:', err);
      setError(err instanceof Error ? err.message : 'Failed to save note');
      toast.error('Failed to save note', {
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSaving(false);
    }
  }, [accessToken, noteId, lessonId, topicId, title, content, tags, isSaving, onNoteCreated]);

  // Auto-save with debounce
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

  // Handle tags changes
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setHasUnsavedChanges(true);
  };

  // Handle back navigation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Do you want to save before leaving?');
      if (confirmLeave) {
        saveNote().then(() => {
          if (onBack) {
            onBack();
          } else {
            navigate(-1);
          }
        });
      } else {
        if (onBack) {
          onBack();
        } else {
          navigate(-1);
        }
      }
    } else {
      if (onBack) {
        onBack();
      } else {
        navigate(-1);
      }
    }
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        const confirmLeave = window.confirm('You have unsaved changes. Do you want to save before leaving?');
        if (confirmLeave) {
          saveNote().then(() => {
            navigate(-1);
          });
        } else {
          navigate(-1);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges, saveNote, navigate]);

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
      <div className="full-note-editor">
        <div className="editor-loading">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading note...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="full-note-editor">
      {/* Header */}
      <header className="editor-header">
        <div className="header-left">
          <button
            onClick={handleBack}
            className="back-button"
            aria-label="Back to notes"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <button onClick={handleBack} className="breadcrumb-link">
              Notes
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{title || 'New Note'}</span>
          </nav>
        </div>

        <div className="header-right">
          {lastSaved && !isSaving && (
            <span className="save-status">{formatLastSaved()}</span>
          )}
          {isSaving && (
            <span className="save-status saving">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          )}
          <Button
            onClick={saveNote}
            disabled={isSaving || !hasUnsavedChanges}
            className="save-button"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="editor-main">
        {/* Split Screen Layout */}
        <div className="editor-split-view">
          {/* Editor Panel */}
          <div className={`editor-panel ${isMobilePreview ? 'mobile-hidden' : ''}`}>
            <div className="title-section">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Note title..."
                className="title-input"
                aria-label="Note title"
              />
            </div>
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Start typing your notes..."
              toolbarMode="full"
              onSave={saveNote}
            />
          </div>

          {/* Preview Panel */}
          <div className={`preview-panel ${!isMobilePreview ? 'mobile-hidden' : ''}`}>
            <div className="preview-header">
              <h3>Preview</h3>
            </div>
            <div className="preview-content">
              <MarkdownPreview content={content} />
            </div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setIsMobilePreview(!isMobilePreview)}
          aria-label={isMobilePreview ? 'Show editor' : 'Show preview'}
        >
          {isMobilePreview ? 'Edit' : 'Preview'}
        </button>

        {/* Collapsible Sidebar */}
        <aside className={`editor-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>

          {!isSidebarCollapsed && (
            <div className="sidebar-content">
              {/* Tags Section */}
              <section className="sidebar-section">
                <h3 className="sidebar-section-title">Tags</h3>
                <TagManager
                  accessToken={accessToken}
                  selectedTags={tags}
                  onTagsChange={handleTagsChange}
                />
              </section>

              {/* Class Info Section */}
              {classInfo && (
                <section className="sidebar-section">
                  <h3 className="sidebar-section-title">Class Information</h3>
                  <div className="class-info">
                    <div className="info-item">
                      <span className="info-label">Lesson:</span>
                      <span className="info-value">{classInfo.lessonTitle}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-value">
                        {new Date(classInfo.lessonDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Topic:</span>
                      <span className="info-value">{classInfo.topicName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Level:</span>
                      <span className="info-value">{classInfo.level}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Vocabulary Section */}
              {vocabulary && vocabulary.length > 0 && (
                <section className="sidebar-section">
                  <h3 className="sidebar-section-title">Vocabulary</h3>
                  <div className="vocabulary-list">
                    {vocabulary.map((item, index) => (
                      <div key={index} className="vocabulary-item">
                        <div className="vocab-word">{item.word}</div>
                        <div className="vocab-translation">{item.translation}</div>
                        {item.exampleSentence && (
                          <div className="vocab-example">{item.exampleSentence}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </aside>
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .full-note-editor {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
  }

  /* Header */
  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background-color: white;
    border-bottom: 1px solid #e5e5e5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    z-index: 20;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 36px;
    padding: 8px;
    background-color: transparent;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
  }

  .back-button:hover {
    background-color: #f5f5f5;
    border-color: #999;
    color: #333;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .breadcrumb-link {
    color: #4a90e2;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: color 0.2s;
  }

  .breadcrumb-link:hover {
    color: #357abd;
    text-decoration: underline;
  }

  .breadcrumb-separator {
    color: #999;
  }

  .breadcrumb-current {
    color: #333;
    font-weight: 500;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .save-status {
    font-size: 13px;
    color: #28a745;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .save-status.saving {
    color: #4a90e2;
  }

  .save-button {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Error Banner */
  .error-banner {
    padding: 12px 24px;
    background-color: #fee;
    color: #c33;
    border-bottom: 1px solid #fcc;
    font-size: 14px;
  }

  /* Main Content */
  .editor-main {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* Split View */
  .editor-split-view {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-right: 1px solid #e5e5e5;
    overflow: hidden;
  }

  .title-section {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e5e5e5;
  }

  .title-input {
    width: 100%;
    font-size: 28px;
    font-weight: 600;
    padding: 8px 0;
    border: none;
    outline: none;
    background: transparent;
  }

  .title-input::placeholder {
    color: #ccc;
  }

  .preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
    overflow: hidden;
  }

  .preview-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e5e5;
    background-color: #f9f9f9;
  }

  .preview-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .preview-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  /* Mobile Toggle */
  .mobile-toggle {
    display: none;
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 24px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    z-index: 30;
    transition: all 0.2s;
  }

  .mobile-toggle:hover {
    background-color: #357abd;
    box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
  }

  .mobile-toggle:active {
    transform: scale(0.95);
  }

  /* Sidebar */
  .editor-sidebar {
    width: 320px;
    background-color: white;
    border-left: 1px solid #e5e5e5;
    overflow-y: auto;
    position: relative;
    transition: width 0.3s ease;
  }

  .editor-sidebar.collapsed {
    width: 48px;
  }

  .sidebar-toggle {
    position: absolute;
    top: 16px;
    left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: white;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
    z-index: 10;
  }

  .sidebar-toggle:hover {
    background-color: #f5f5f5;
    border-color: #999;
    color: #333;
  }

  .sidebar-content {
    padding: 60px 16px 16px;
  }

  .sidebar-section {
    margin-bottom: 32px;
  }

  .sidebar-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Class Info */
  .class-info {
    background-color: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .info-item:last-child {
    margin-bottom: 0;
  }

  .info-label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-size: 14px;
    color: #333;
  }

  /* Vocabulary */
  .vocabulary-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .vocabulary-item {
    background-color: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 12px;
  }

  .vocab-word {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .vocab-translation {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .vocab-example {
    font-size: 13px;
    color: #999;
    font-style: italic;
    padding-top: 8px;
    border-top: 1px solid #e5e5e5;
  }

  /* Loading State */
  .editor-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .editor-sidebar {
      width: 280px;
    }
  }

  @media (max-width: 768px) {
    .editor-header {
      padding: 12px 16px;
    }

    .breadcrumb-current {
      max-width: 150px;
    }

    .editor-split-view {
      flex-direction: column;
    }

    .editor-panel,
    .preview-panel {
      flex: 1;
      border-right: none;
    }

    .mobile-hidden {
      display: none;
    }

    .mobile-toggle {
      display: block;
    }

    .editor-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 320px;
      z-index: 40;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }

    .editor-sidebar:not(.collapsed) {
      transform: translateX(0);
    }

    .title-input {
      font-size: 24px;
    }
  }

  @media (max-width: 480px) {
    .back-button {
      min-width: 44px;
      min-height: 44px;
    }

    .breadcrumb {
      font-size: 12px;
    }

    .breadcrumb-current {
      max-width: 100px;
    }

    .save-status {
      display: none;
    }

    .title-input {
      font-size: 20px;
    }
  }
`;
