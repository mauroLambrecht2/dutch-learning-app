import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FullNoteEditor } from '../FullNoteEditor';
import * as apiModule from '../../../utils/api';
import { Note } from '../../../types/notes';

// Mock the API module
vi.mock('../../../utils/api', () => ({
  api: {
    getNote: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    getNoteTags: vi.fn(),
  },
}));

// Mock child components
vi.mock('../MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="markdown-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content }: any) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}));

vi.mock('../TagManager', () => ({
  TagManager: ({ selectedTags, onTagsChange }: any) => (
    <div data-testid="tag-manager">
      <div data-testid="selected-tags">{selectedTags.join(',')}</div>
      <button
        data-testid="add-tag-button"
        onClick={() => onTagsChange([...selectedTags, 'new-tag'])}
      >
        Add Tag
      </button>
    </div>
  ),
}));

// Mock UI components
vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="save-button">
      {children}
    </button>
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  lessonId: 'lesson-1',
  topicId: 'topic-1',
  title: 'Test Note',
  content: '# Test Content\n\nThis is a test note.',
  tags: ['tag-1', 'tag-2'],
  classInfo: {
    lessonTitle: 'Test Lesson',
    lessonDate: '2024-01-01',
    topicName: 'Test Topic',
    level: 'A1',
  },
  vocabulary: [
    {
      word: 'hallo',
      translation: 'hello',
      exampleSentence: 'Hallo, hoe gaat het?',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastEditedAt: '2024-01-01T00:00:00Z',
};

describe('FullNoteEditor - Integration Tests', () => {
  const mockOnBack = vi.fn();
  const mockOnNoteCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (apiModule.api.getNoteTags as any).mockResolvedValue({ tags: [] });
  });

  describe('Loading and Displaying Existing Note', () => {
    it('should load and display an existing note', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      // Wait for loading to complete
      await waitFor(() => {
        const editor = screen.queryByTestId('markdown-editor');
        expect(editor).toBeTruthy();
      });

      // Verify API was called
      expect(apiModule.api.getNote).toHaveBeenCalledWith('test-token', 'note-1');

      // Verify content is displayed
      const editor = screen.getByTestId('markdown-editor') as HTMLTextAreaElement;
      expect(editor.value).toBe('# Test Content\n\nThis is a test note.');
    });

    it('should handle loading errors', async () => {
      const error = new Error('Failed to load note');
      (apiModule.api.getNote as any).mockRejectedValue(error);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        const errorText = screen.queryByText('Failed to load note');
        expect(errorText).toBeTruthy();
      });
    });
  });

  describe('Real-time Preview Updates', () => {
    it('should update preview when content changes', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('markdown-editor')).toBeTruthy();
      });

      const editor = screen.getByTestId('markdown-editor') as HTMLTextAreaElement;
      const preview = screen.getByTestId('markdown-preview');

      // Update content
      fireEvent.change(editor, { target: { value: '## New Content' } });

      // Verify preview updates
      expect(preview.textContent).toBe('## New Content');
    });
  });

  describe('Manual Save Functionality', () => {
    it('should save note when save button is clicked', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);
      (apiModule.api.updateNote as any).mockResolvedValue({ success: true });

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('markdown-editor')).toBeTruthy();
      });

      // Make a change
      const editor = screen.getByTestId('markdown-editor');
      fireEvent.change(editor, { target: { value: 'Updated content' } });

      // Click save button
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Verify API was called
      await waitFor(() => {
        expect(apiModule.api.updateNote).toHaveBeenCalledWith(
          'test-token',
          'note-1',
          expect.objectContaining({
            content: 'Updated content',
          })
        );
      });
    });

    it('should handle save errors', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);
      (apiModule.api.updateNote as any).mockRejectedValue(new Error('Save failed'));

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('markdown-editor')).toBeTruthy();
      });

      // Make a change
      const editor = screen.getByTestId('markdown-editor');
      fireEvent.change(editor, { target: { value: 'Updated' } });

      // Click save
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.queryByText('Save failed')).toBeTruthy();
      });
    });
  });

  describe('Tag Management Integration', () => {
    it('should integrate with TagManager', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('tag-manager')).toBeTruthy();
      });

      // Verify initial tags
      const selectedTags = screen.getByTestId('selected-tags');
      expect(selectedTags.textContent).toBe('tag-1,tag-2');

      // Add a tag
      const addTagButton = screen.getByTestId('add-tag-button');
      fireEvent.click(addTagButton);

      // Verify tags updated
      expect(selectedTags.textContent).toBe('tag-1,tag-2,new-tag');
    });
  });

  describe('Creating New Note', () => {
    it('should create a new note', async () => {
      (apiModule.api.createNote as any).mockResolvedValue({
        note: { id: 'new-note-id' },
      });

      render(
        <FullNoteEditor
          accessToken="test-token"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('markdown-editor')).toBeTruthy();
      });

      // Update content
      const editor = screen.getByTestId('markdown-editor');
      fireEvent.change(editor, { target: { value: '# My First Note' } });

      // Click save
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Verify create API was called
      await waitFor(() => {
        expect(apiModule.api.createNote).toHaveBeenCalled();
      });

      // Verify callback was called
      expect(mockOnNoteCreated).toHaveBeenCalledWith('new-note-id');
    });
  });

  describe('Class Info and Vocabulary Display', () => {
    it('should display class info when available', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Class Information')).toBeTruthy();
      });

      // Verify class info is displayed
      expect(screen.queryByText('Test Lesson')).toBeTruthy();
      expect(screen.queryByText('Test Topic')).toBeTruthy();
      expect(screen.queryByText('A1')).toBeTruthy();
    });

    it('should display vocabulary when available', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Vocabulary')).toBeTruthy();
      });

      // Verify vocabulary is displayed
      expect(screen.queryByText('hallo')).toBeTruthy();
      expect(screen.queryByText('hello')).toBeTruthy();
    });

    it('should not display class info when not available', async () => {
      const noteWithoutClassInfo = { ...mockNote, classInfo: null };
      (apiModule.api.getNote as any).mockResolvedValue(noteWithoutClassInfo);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('markdown-editor')).toBeTruthy();
      });

      expect(screen.queryByText('Class Information')).toBeFalsy();
    });

    it('should not display vocabulary when empty', async () => {
      const noteWithoutVocab = { ...mockNote, vocabulary: [] };
      (apiModule.api.getNote as any).mockResolvedValue(noteWithoutVocab);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('markdown-editor')).toBeTruthy();
      });

      expect(screen.queryByText('Vocabulary')).toBeFalsy();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      (apiModule.api.getNote as any).mockResolvedValue(mockNote);

      render(
        <FullNoteEditor
          accessToken="test-token"
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByLabelText('Back to notes')).toBeTruthy();
      });

      const backButton = screen.getByLabelText('Back to notes');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});
