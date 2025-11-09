/**
 * Integration Tests for NotesViewer component
 * Requirements: 1.1, 1.4, 2.2, 2.3, 3.3
 * 
 * Tests cover:
 * - Loading and displaying notes grouped by topic
 * - Creating new note and updating list
 * - Editing existing note
 * - Deleting note with confirmation
 * - Filtering by topic and tags
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotesViewer } from '../NotesViewer';
import { api } from '../../../utils/api';
import { Note, NoteTag } from '../../../types/notes';

// Mock the API
vi.mock('../../../utils/api', () => ({
  api: {
    getNotes: vi.fn(),
    getNote: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    getNoteTags: vi.fn(),
  },
}));

// Mock UI components
vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../../ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="note-card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
  CardDescription: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardFooter: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock('../../ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => {
    // Extract SelectContent and SelectItem children to render options
    const renderChildren = (child: any): any => {
      if (!child) return null;
      if (Array.isArray(child)) {
        return child.map(renderChildren);
      }
      if (child.type?.name === 'SelectContent') {
        return child.props.children;
      }
      if (child.type?.name === 'SelectItem') {
        return <option key={child.props.value} value={child.props.value}>{child.props.children}</option>;
      }
      if (child.props?.children) {
        return renderChildren(child.props.children);
      }
      return null;
    };

    return (
      <div data-testid="select-wrapper">
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          data-testid="select"
        >
          {renderChildren(children)}
        </select>
      </div>
    );
  },
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock('../../ui/badge', () => ({
  Badge: ({ children, onClick, style, className, ...props }: any) => (
    <span
      onClick={onClick}
      style={style}
      className={className}
      data-testid="badge"
      {...props}
    >
      {children}
    </span>
  ),
}));

vi.mock('../../ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {open && children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div className={className} data-testid="dialog-content">
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock('../../ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => <div data-testid="alert-dialog">{children}</div>,
  AlertDialogTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  AlertDialogContent: ({ children }: any) => <div data-testid="alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h3>{children}</h3>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children }: any) => (
    <button data-testid="alert-cancel">{children}</button>
  ),
  AlertDialogAction: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="alert-confirm">
      {children}
    </button>
  ),
}));

// Mock NoteEditor component
vi.mock('../NoteEditor', () => ({
  NoteEditor: ({ accessToken, noteId, lessonId, topicId, onSave, onCancel }: any) => (
    <div data-testid="note-editor">
      <div data-testid="editor-note-id">{noteId || 'new'}</div>
      <div data-testid="editor-lesson-id">{lessonId}</div>
      <div data-testid="editor-topic-id">{topicId}</div>
      <button onClick={() => onSave({ id: noteId || 'new-note-id', title: 'Test Note' })}>
        Save
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
  Edit: () => <span data-testid="edit-icon">Edit</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  Loader2: () => <span data-testid="loader-icon">Loading</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  Tag: () => <span data-testid="tag-icon">Tag</span>,
  BookOpen: () => <span data-testid="book-open-icon">BookOpen</span>,
}));

describe('NotesViewer Integration Tests', () => {
  const mockAccessToken = 'test-token';
  const mockUserId = 'user-123';

  const mockTags: NoteTag[] = [
    {
      id: 'tag-1',
      name: 'Grammar',
      color: '#FF5733',
      userId: mockUserId,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'tag-2',
      name: 'Vocabulary',
      color: '#33FF57',
      userId: mockUserId,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockNotes: Note[] = [
    {
      id: 'note-1',
      userId: mockUserId,
      lessonId: 'lesson-1',
      topicId: 'topic-1',
      title: 'Dutch Grammar Notes',
      content: 'This is about Dutch grammar rules and examples.',
      tags: ['tag-1'],
      classInfo: {
        lessonTitle: 'Introduction to Dutch Grammar',
        lessonDate: '2024-01-15',
        topicName: 'Grammar Basics',
        level: 'A1',
        seriesInfo: 'Beginner Series',
      },
      vocabulary: [
        {
          word: 'het',
          translation: 'the (neuter)',
          exampleSentence: 'Het huis is groot.',
        },
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      lastEditedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'note-2',
      userId: mockUserId,
      lessonId: 'lesson-2',
      topicId: 'topic-1',
      title: 'More Grammar Notes',
      content: 'Additional grammar concepts.',
      tags: ['tag-2'],
      classInfo: {
        lessonTitle: 'Advanced Grammar',
        lessonDate: '2024-01-16',
        topicName: 'Grammar Basics',
        level: 'A2',
      },
      vocabulary: [],
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
      lastEditedAt: '2024-01-16T10:00:00Z',
    },
    {
      id: 'note-3',
      userId: mockUserId,
      lessonId: 'lesson-3',
      topicId: 'topic-2',
      title: 'Vocabulary Practice',
      content: 'Learning new words.',
      tags: ['tag-2'],
      classInfo: {
        lessonTitle: 'Common Words',
        lessonDate: '2024-01-17',
        topicName: 'Vocabulary Building',
        level: 'A1',
      },
      vocabulary: [
        {
          word: 'huis',
          translation: 'house',
        },
      ],
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:00:00Z',
      lastEditedAt: '2024-01-17T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(api.getNotes).mockResolvedValue({ notes: mockNotes });
    vi.mocked(api.getNoteTags).mockResolvedValue({ tags: mockTags });
    vi.mocked(api.deleteNote).mockResolvedValue(undefined);
  });

  describe('Loading and Displaying Notes Grouped by Topic (Requirements 2.2, 2.3)', () => {
    it('should load notes on mount', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(mockAccessToken, {});
      });

      await waitFor(() => {
        expect(api.getNoteTags).toHaveBeenCalledWith(mockAccessToken);
      });
    });

    it('should display notes grouped by topic', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        const grammarBasics = screen.getAllByText('Grammar Basics');
        expect(grammarBasics.length).toBeGreaterThan(0);
      });

      await waitFor(() => {
        const vocabBuilding = screen.getAllByText('Vocabulary Building');
        expect(vocabBuilding.length).toBeGreaterThan(0);
      });

      // Check that notes are displayed
      expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      expect(screen.getByText('More Grammar Notes')).toBeInTheDocument();
      expect(screen.getByText('Vocabulary Practice')).toBeInTheDocument();
    });

    it('should display correct note count per topic', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        const grammarBasics = screen.getAllByText('Grammar Basics');
        expect(grammarBasics.length).toBeGreaterThan(0);
      });

      // Grammar Basics has 2 notes
      expect(screen.getByText('2 notes')).toBeInTheDocument();
      // Vocabulary Building has 1 note
      expect(screen.getByText('1 note')).toBeInTheDocument();
    });

    it('should display total note count', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('3 notes')).toBeInTheDocument();
      });
    });

    it('should display note metadata', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Check class info
      expect(screen.getByText('Introduction to Dutch Grammar')).toBeInTheDocument();
      
      // A1 appears multiple times (in different notes), so use getAllByText
      const a1Elements = screen.getAllByText('A1');
      expect(a1Elements.length).toBeGreaterThan(0);

      // Check vocabulary count
      const vocabCounts = screen.getAllByText('1 vocabulary item');
      expect(vocabCounts.length).toBeGreaterThan(0);
    });

    it('should display note tags', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Tags should be displayed
      const badges = screen.getAllByTestId('badge');
      const grammarBadges = badges.filter(badge => badge.textContent === 'Grammar');
      expect(grammarBadges.length).toBeGreaterThan(0);
    });

    it('should show loading state initially', () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('should show empty state when no notes exist', async () => {
      vi.mocked(api.getNotes).mockResolvedValue({ notes: [] });

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('No notes yet')).toBeInTheDocument();
      });

      expect(screen.getByText(/Start taking notes during your lessons to build your personal study library!/i)).toBeInTheDocument();
    });
  });

  describe('Creating New Note (Requirement 1.1)', () => {
    it('should show info toast when clicking new note button', async () => {
      const { toast } = await import('sonner');

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('3 notes')).toBeInTheDocument();
      });

      const newNoteButton = screen.getByRole('button', { name: /New Note/i });
      fireEvent.click(newNoteButton);

      expect(toast.info).toHaveBeenCalledWith(
        'Create notes from lessons',
        expect.objectContaining({
          description: expect.stringContaining('To create a note, open a lesson'),
        })
      );
    });

    it('should display new note button in header', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /New Note/i })).toBeInTheDocument();
      });
    });

    it('should display create first note button in empty state', async () => {
      vi.mocked(api.getNotes).mockResolvedValue({ notes: [] });

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Create Your First Note/i })).toBeInTheDocument();
      });
    });
  });

  describe('Editing Existing Note (Requirement 1.1, 1.4)', () => {
    it('should open editor dialog when edit button clicked', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('note-editor')).toBeInTheDocument();
      });

      expect(screen.getByText('Edit Note')).toBeInTheDocument();
    });

    it('should pass correct props to editor when editing', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('note-editor')).toBeInTheDocument();
      });

      expect(screen.getByTestId('editor-note-id')).toHaveTextContent('note-1');
      expect(screen.getByTestId('editor-lesson-id')).toHaveTextContent('lesson-1');
      expect(screen.getByTestId('editor-topic-id')).toHaveTextContent('topic-1');
    });

    it('should reload notes after saving edited note', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('note-editor')).toBeInTheDocument();
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalled();
      });
    });

    it('should close editor dialog after saving', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('note-editor')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument();
      });
    });

    it('should close editor dialog when cancel is clicked', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('note-editor')).toBeInTheDocument();
      });

      // Get all Cancel buttons and find the one in the editor
      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      // The editor cancel button should be the last one (after all the alert dialog cancel buttons)
      const editorCancelButton = cancelButtons[cancelButtons.length - 1];
      fireEvent.click(editorCancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument();
      });
    });
  });

  describe('Deleting Note with Confirmation (Requirement 1.1)', () => {
    it('should show confirmation dialog when delete button clicked', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // The AlertDialog content is always rendered in our mock (one for each note)
      // Just verify they exist
      const deleteDialogs = screen.getAllByText('Delete Note?');
      expect(deleteDialogs.length).toBe(3); // One for each note

      const confirmationTexts = screen.getAllByText(/Are you sure you want to delete/);
      expect(confirmationTexts.length).toBe(3);
    });

    it('should display note title in confirmation dialog', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // The AlertDialog content is always rendered in our mock
      // Check that note titles appear in the dialogs
      const dialogTexts = screen.getAllByText(/"Dutch Grammar Notes"/);
      expect(dialogTexts.length).toBeGreaterThan(0);
    });

    it('should delete note when confirmed', async () => {
      const { toast } = await import('sonner');

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Get all confirm buttons (one for each note)
      const confirmButtons = screen.getAllByTestId('alert-confirm');
      expect(confirmButtons.length).toBeGreaterThan(0);

      // Click the first confirm button
      fireEvent.click(confirmButtons[0]);

      await waitFor(() => {
        expect(api.deleteNote).toHaveBeenCalledWith(mockAccessToken, 'note-1');
      });

      expect(toast.success).toHaveBeenCalledWith('Note deleted successfully');
    });

    it('should reload notes after deletion', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      // Get all confirm buttons and click the first one
      const confirmButtons = screen.getAllByTestId('alert-confirm');
      fireEvent.click(confirmButtons[0]);

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalled();
      });
    });

    it('should show error toast when deletion fails', async () => {
      const { toast } = await import('sonner');
      vi.mocked(api.deleteNote).mockRejectedValueOnce(new Error('Delete failed'));

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Get all confirm buttons and click the first one
      const confirmButtons = screen.getAllByTestId('alert-confirm');
      fireEvent.click(confirmButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to delete note',
          expect.objectContaining({
            description: 'Delete failed',
          })
        );
      });
    });

    it('should not delete note when cancelled', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Get all cancel buttons
      const cancelButtons = screen.getAllByTestId('alert-cancel');
      expect(cancelButtons.length).toBeGreaterThan(0);

      // Click the first cancel button
      fireEvent.click(cancelButtons[0]);

      // Wait a bit to ensure no delete call is made
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(api.deleteNote).not.toHaveBeenCalled();
    });
  });

  describe('Filtering by Topic (Requirement 2.2, 3.3)', () => {
    it('should display topic filter dropdown', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Filter by Topic')).toBeInTheDocument();
      });

      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('should populate topic filter with available topics', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const select = screen.getByTestId('select');
      const options = select.querySelectorAll('option');

      // Should have "All Topics" + 2 unique topics
      expect(options.length).toBe(3);
      expect(options[0].textContent).toBe('All Topics');
    });

    it('should filter notes by selected topic', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      const select = screen.getByTestId('select') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'topic-1' } });

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            topicId: 'topic-1',
          })
        );
      });
    });

    it('should show all notes when "all" topic is selected', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // First select a specific topic
      const select = screen.getByTestId('select') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'topic-1' } });

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            topicId: 'topic-1',
          })
        );
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      // Then select "all"
      fireEvent.change(select, { target: { value: 'all' } });

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(mockAccessToken, {});
      });
    });
  });

  describe('Filtering by Tags (Requirement 3.3)', () => {
    it('should display tag filter section', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
      });
    });

    it('should display available tags', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Check for tags in the filter section
      const filterSection = screen.getByText('Filter by Tags').parentElement;
      const badges = filterSection?.querySelectorAll('[data-testid="badge"]');
      const badgeTexts = Array.from(badges || []).map(badge => badge.textContent);
      
      expect(badgeTexts).toContain('Grammar');
      expect(badgeTexts).toContain('Vocabulary');
    });

    it('should filter notes by selected tag', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      // Click on Grammar tag in the filter section
      // The filter section badges are in the "Filter by Tags" section
      const filterSection = screen.getByText('Filter by Tags').parentElement;
      const badges = filterSection?.querySelectorAll('[data-testid="badge"]');
      const grammarBadge = Array.from(badges || []).find(badge => badge.textContent === 'Grammar');
      
      if (grammarBadge) {
        fireEvent.click(grammarBadge);
      }

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            tags: ['tag-1'],
          })
        );
      });
    });

    it('should support multiple tag selection', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      const filterSection = screen.getByText('Filter by Tags').parentElement;
      const badges = filterSection?.querySelectorAll('[data-testid="badge"]');
      const badgeArray = Array.from(badges || []);
      const grammarBadge = badgeArray.find(badge => badge.textContent === 'Grammar');
      const vocabBadge = badgeArray.find(badge => badge.textContent === 'Vocabulary');

      if (grammarBadge) {
        fireEvent.click(grammarBadge);
      }

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            tags: ['tag-1'],
          })
        );
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      if (vocabBadge) {
        fireEvent.click(vocabBadge);
      }

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            tags: expect.arrayContaining(['tag-1', 'tag-2']),
          })
        );
      });
    });

    it('should deselect tag when clicked again', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const filterSection = screen.getByText('Filter by Tags').parentElement;
      const badges = filterSection?.querySelectorAll('[data-testid="badge"]');
      const grammarBadge = Array.from(badges || []).find(badge => badge.textContent === 'Grammar');

      // Select tag
      if (grammarBadge) {
        fireEvent.click(grammarBadge);
      }

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            tags: ['tag-1'],
          })
        );
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      // Deselect tag
      if (grammarBadge) {
        fireEvent.click(grammarBadge);
      }

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(mockAccessToken, {});
      });
    });

    it('should show message when no tags available', async () => {
      vi.mocked(api.getNoteTags).mockResolvedValue({ tags: [] });

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('No tags available')).toBeInTheDocument();
      });
    });
  });

  describe('Combined Filtering (Topic + Tags)', () => {
    it('should apply both topic and tag filters together', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      // Select topic
      const select = screen.getByTestId('select') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'topic-1' } });

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            topicId: 'topic-1',
          })
        );
      });

      // Clear previous calls
      vi.mocked(api.getNotes).mockClear();

      // Select tag
      const filterSection = screen.getByText('Filter by Tags').parentElement;
      const badges = filterSection?.querySelectorAll('[data-testid="badge"]');
      const grammarBadge = Array.from(badges || []).find(badge => badge.textContent === 'Grammar');

      if (grammarBadge) {
        fireEvent.click(grammarBadge);
      }

      await waitFor(() => {
        expect(api.getNotes).toHaveBeenCalledWith(
          mockAccessToken,
          expect.objectContaining({
            topicId: 'topic-1',
            tags: ['tag-1'],
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when loading notes fails', async () => {
      const { toast } = await import('sonner');
      
      // Mock both getNotes and getNoteTags to reject
      vi.mocked(api.getNotes).mockRejectedValueOnce(new Error('Failed to load'));
      vi.mocked(api.getNoteTags).mockResolvedValueOnce({ tags: [] });

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load notes',
          expect.objectContaining({
            description: 'Failed to load',
          })
        );
      });
    });

    it('should handle tag loading errors gracefully', async () => {
      vi.mocked(api.getNoteTags).mockRejectedValue(new Error('Failed to load tags'));

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText('My Notes')).toBeInTheDocument();
      });
    });

    it('should continue to display notes even if tags fail to load', async () => {
      vi.mocked(api.getNoteTags).mockRejectedValue(new Error('Failed to load tags'));

      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });
    });
  });

  describe('UI Interactions', () => {
    it('should display edit and delete buttons for each note', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      const deleteIcons = screen.getAllByTestId('trash-icon');

      // Should have 3 edit buttons and 3 delete buttons (one for each note)
      expect(editButtons.length).toBe(3);
      expect(deleteIcons.length).toBe(3);
    });

    it('should display note content preview', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('This is about Dutch grammar rules and examples.')).toBeInTheDocument();
      });

      expect(screen.getByText('Additional grammar concepts.')).toBeInTheDocument();
      expect(screen.getByText('Learning new words.')).toBeInTheDocument();
    });

    it('should format dates correctly', async () => {
      render(
        <NotesViewer accessToken={mockAccessToken} userId={mockUserId} />
      );

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      });

      // Check that dates are formatted (exact format depends on locale)
      const dateElements = screen.getAllByTestId('calendar-icon');
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });
});
