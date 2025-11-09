import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleNoteEditor } from '../SimpleNoteEditor';
import { api } from '../../../utils/api';
import type { Note, VocabularyItem } from '../../../types/notes';

vi.mock('../../../utils/api', () => ({
  api: {
    getNote: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
  },
}));

describe('SimpleNoteEditor Integration Tests', () => {
  const mockAccessToken = 'test-token';
  const mockLessonId = 'lesson-123';
  const mockTopicId = 'topic-456';
  const mockNoteId = 'note-789';
  const mockOnClose = vi.fn();

  const mockVocabulary: VocabularyItem[] = [
    { id: '1', dutch: 'hallo', english: 'hello', example: 'Hallo, hoe gaat het?' },
    { id: '2', dutch: 'dag', english: 'day', example: 'Het is een mooie dag.' },
  ];

  const mockLessonData = {
    title: 'Test Lesson',
    date: '2024-01-15',
    topicName: 'Greetings',
    level: 'A1',
    vocabulary: mockVocabulary,
  };

  const mockNote: Note = {
    id: mockNoteId,
    userId: 'user-123',
    lessonId: mockLessonId,
    topicId: mockTopicId,
    title: 'Existing Note',
    content: '# Existing Note\n\nThis is existing content.',
    tags: ['test'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Creating new note from lesson', () => {
    it('should generate template with lesson data', async () => {
      render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          onClose={mockOnClose}
          lessonData={mockLessonData}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const titleInput = screen.getByLabelText('Note title') as HTMLInputElement;
      expect(titleInput.value).toBe('Test Lesson');

      const textarea = screen.getByPlaceholderText('Start typing your notes...') as HTMLTextAreaElement;
      expect(textarea.value).toContain('# Test Lesson');
      expect(textarea.value).toContain('## Class Information');
      expect(textarea.value).toContain('**Lesson**: Test Lesson');
      expect(textarea.value).toContain('**Topic**: Greetings');
      expect(textarea.value).toContain('**Level**: A1');
      expect(textarea.value).toContain('## Vocabulary');
      // Check that vocabulary table structure exists
      expect(textarea.value).toContain('| Dutch | English | Example |');
    });

    it('should generate basic template without lesson data', async () => {
      render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const titleInput = screen.getByLabelText('Note title') as HTMLInputElement;
      expect(titleInput.value).toBe('New Note');

      const textarea = screen.getByPlaceholderText('Start typing your notes...') as HTMLTextAreaElement;
      expect(textarea.value).toContain('# New Note');
      expect(textarea.value).toContain('## My Notes');
    });
  });

  describe('Loading existing note', () => {
    it('should load existing note data', async () => {
      vi.mocked(api.getNote).mockResolvedValue(mockNote);

      render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          noteId={mockNoteId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(api.getNote).toHaveBeenCalledWith(mockAccessToken, mockNoteId);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const titleInput = screen.getByLabelText('Note title') as HTMLInputElement;
      expect(titleInput.value).toBe('Existing Note');

      const textarea = screen.getByPlaceholderText('Start typing your notes...') as HTMLTextAreaElement;
      expect(textarea.value).toBe('# Existing Note\n\nThis is existing content.');

      expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });

    it('should handle load error', async () => {
      vi.mocked(api.getNote).mockRejectedValue(new Error('Failed to load'));

      render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          noteId={mockNoteId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Toolbar integration', () => {
    it('should integrate MarkdownToolbar in simple mode', async () => {
      render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          onClose={mockOnClose}
          lessonData={mockLessonData}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
      expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument();
      expect(screen.getByTitle('Unordered List')).toBeInTheDocument();

      expect(screen.queryByTitle('Heading 1')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Insert Link')).not.toBeInTheDocument();
    });

    it('should apply formatting from toolbar', async () => {
      const user = userEvent.setup();

      render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          onClose={mockOnClose}
          lessonData={mockLessonData}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const textarea = screen.getByPlaceholderText('Start typing your notes...') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'test text');

      textarea.setSelectionRange(0, 9);

      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      await user.click(boldButton);

      expect(textarea.value).toContain('**test text**');
    });
  });

  describe('Responsive design', () => {
    it('should render with proper styling', async () => {
      const { container } = render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          onClose={mockOnClose}
          lessonData={mockLessonData}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const editor = container.querySelector('.simple-note-editor');
      expect(editor).toBeInTheDocument();

      const header = container.querySelector('.editor-header');
      expect(header).toBeInTheDocument();

      const footer = container.querySelector('.editor-footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Close handler', () => {
    it('should close when close button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.getNote).mockResolvedValue(mockNote);

      render(
        <SimpleNoteEditor
          accessToken={mockAccessToken}
          lessonId={mockLessonId}
          topicId={mockTopicId}
          noteId={mockNoteId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const closeButton = screen.getByLabelText('Close editor');
      await user.click(closeButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
