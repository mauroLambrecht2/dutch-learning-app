import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FullNoteEditor } from '../FullNoteEditor';
import * as apiModule from '../../../utils/api';

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
  MarkdownEditor: ({ value, onChange, placeholder }: any) => (
    <textarea
      data-testid="markdown-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
      <button onClick={() => onTagsChange([...selectedTags, 'new-tag'])}>
        Add Tag
      </button>
    </div>
  ),
}));

// Mock UI components
vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
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

const mockNote = {
  id: 'note-1',
  userId: 'user-1',
  lessonId: 'lesson-1',
  topicId: 'topic-1',
  title: 'Test Note',
  content: '# Test Content',
  tags: ['tag-1'],
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

describe('FullNoteEditor - Layout and Structure', () => {
  const mockOnBack = vi.fn();
  const mockOnNoteCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (apiModule.api.getNoteTags as any).mockResolvedValue({ tags: [] });
  });

  describe('Header Layout', () => {
    it('should render header with breadcrumb and save button', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      // Check breadcrumb
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Test Note')).toBeInTheDocument();

      // Check save button
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render back button in header', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      const backButton = screen.getByLabelText('Back to notes');
      expect(backButton).toBeInTheDocument();
    });

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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      const backButton = screen.getByLabelText('Back to notes');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Split-Screen Layout', () => {
    it('should render editor and preview panels side by side', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      // Check editor panel
      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toBeInTheDocument();

      // Check preview panel
      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toBeInTheDocument();
    });

    it('should render title input in editor panel', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Note title');
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveValue('Test Note');
    });

    it('should render preview header', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      // Check for preview header specifically (h3 element)
      const previewHeaders = screen.getAllByText('Preview');
      expect(previewHeaders.length).toBeGreaterThan(0);
      expect(previewHeaders[0].tagName).toBe('H3');
    });
  });

  describe('Collapsible Sidebar', () => {
    it('should render sidebar with tags section', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByTestId('tag-manager')).toBeInTheDocument();
    });

    it('should render class info section when available', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Class Information')).toBeInTheDocument();
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
      expect(screen.getByText('Test Topic')).toBeInTheDocument();
      expect(screen.getByText('A1')).toBeInTheDocument();
    });

    it('should render vocabulary section when available', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Vocabulary')).toBeInTheDocument();
      expect(screen.getByText('hallo')).toBeInTheDocument();
      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('Hallo, hoe gaat het?')).toBeInTheDocument();
    });

    it('should toggle sidebar collapse state', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);

      // After collapse, button label should change
      await waitFor(() => {
        expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
      });
    });

    it('should not render class info section when not available', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Class Information')).not.toBeInTheDocument();
    });

    it('should not render vocabulary section when empty', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Vocabulary')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render mobile toggle button', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      const toggleButton = screen.getByLabelText('Show preview');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('Preview');
    });

    it('should toggle between editor and preview on mobile', async () => {
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
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      const toggleButton = screen.getByLabelText('Show preview');
      fireEvent.click(toggleButton);

      // After toggle, button should show "Edit"
      await waitFor(() => {
        expect(screen.getByLabelText('Show editor')).toBeInTheDocument();
        expect(screen.getByLabelText('Show editor')).toHaveTextContent('Edit');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      (apiModule.api.getNote as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <FullNoteEditor 
          accessToken="test-token" 
          noteId="note-1"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      expect(screen.getByText('Loading note...')).toBeInTheDocument();
    });
  });

  describe('New Note Creation', () => {
    it('should render with empty template for new note', async () => {
      render(
        <FullNoteEditor 
          accessToken="test-token"
          onBack={mockOnBack}
          onNoteCreated={mockOnNoteCreated}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading note...')).not.toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Note title');
      expect(titleInput).toHaveValue('New Note');
    });
  });
});
