import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { NotesViewer } from '../NotesViewer';
import { FullNoteEditor } from '../FullNoteEditor';
import { api } from '../../../utils/api';

// Mock the API
vi.mock('../../../utils/api', () => ({
  api: {
    getNotes: vi.fn(),
    getNoteTags: vi.fn(),
    getNote: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
  },
}));

// Mock child components
vi.mock('../NotesGrid', () => ({
  NotesGrid: ({ notes, onNoteClick }: any) => (
    <div data-testid="notes-grid">
      {notes.map((note: any) => (
        <button
          key={note.id}
          data-testid={`note-${note.id}`}
          onClick={() => onNoteClick(note.id)}
        >
          {note.title}
        </button>
      ))}
    </div>
  ),
}));

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
  TagManager: () => <div data-testid="tag-manager">Tag Manager</div>,
}));

describe('Note Routing Integration', () => {
  const mockAccessToken = 'test-token';
  const mockUserId = 'user-123';

  const mockNotes = [
    {
      id: 'note-1',
      userId: mockUserId,
      lessonId: 'lesson-1',
      topicId: 'topic-1',
      title: 'Test Note 1',
      content: '# Test Content',
      tags: ['tag-1'],
      classInfo: {
        lessonTitle: 'Lesson 1',
        lessonDate: '2024-01-01',
        topicName: 'Topic 1',
        level: 'A1',
      },
      vocabulary: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getNotes as any).mockResolvedValue({ notes: mockNotes });
    (api.getNoteTags as any).mockResolvedValue({ tags: [] });
    (api.getNote as any).mockResolvedValue(mockNotes[0]);
  });

  it('should navigate to /notes/new when clicking New Note button', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NotesViewer accessToken={mockAccessToken} userId={mockUserId} />} />
          <Route path="/notes/new" element={<div data-testid="new-note-editor">New Note Editor</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('New Note')).toBeInTheDocument();
    });

    const newNoteButton = screen.getByText('New Note');
    await user.click(newNoteButton);

    await waitFor(() => {
      expect(screen.getByTestId('new-note-editor')).toBeInTheDocument();
    });
  });

  it('should navigate to /notes/:noteId/edit when clicking a note card', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NotesViewer accessToken={mockAccessToken} userId={mockUserId} />} />
          <Route path="/notes/:noteId/edit" element={<div data-testid="edit-note-editor">Edit Note Editor</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('note-note-1')).toBeInTheDocument();
    });

    const noteCard = screen.getByTestId('note-note-1');
    await user.click(noteCard);

    await waitFor(() => {
      expect(screen.getByTestId('edit-note-editor')).toBeInTheDocument();
    });
  });

  it('should load note data from URL parameter in edit route', async () => {
    render(
      <MemoryRouter initialEntries={['/notes/note-1/edit']}>
        <Routes>
          <Route path="/notes/:noteId/edit" element={<FullNoteEditor accessToken={mockAccessToken} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getNote).toHaveBeenCalledWith(mockAccessToken, 'note-1');
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Note 1')).toBeInTheDocument();
    });
  });

  it('should load note data from query parameters in new route', async () => {
    render(
      <MemoryRouter initialEntries={['/notes/new?lessonId=lesson-123&topicId=topic-456']}>
        <Routes>
          <Route path="/notes/new" element={<FullNoteEditor accessToken={mockAccessToken} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    // Should not call getNote for new notes
    expect(api.getNote).not.toHaveBeenCalled();
  });

  it('should show breadcrumb navigation in editor', async () => {
    render(
      <MemoryRouter initialEntries={['/notes/note-1/edit']}>
        <Routes>
          <Route path="/notes/:noteId/edit" element={<FullNoteEditor accessToken={mockAccessToken} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    // Breadcrumb should show "Notes / [Note Title]"
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('should handle browser back button with unsaved changes', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/notes/note-1/edit']}>
        <Routes>
          <Route path="/notes/:noteId/edit" element={<FullNoteEditor accessToken={mockAccessToken} />} />
          <Route path="/" element={<div data-testid="home">Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    // Make a change to trigger unsaved state
    const editor = screen.getByTestId('markdown-editor');
    await user.clear(editor);
    await user.type(editor, 'New content');

    // Click back button
    const backButton = screen.getByLabelText('Back to notes');
    await user.click(backButton);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });
});
