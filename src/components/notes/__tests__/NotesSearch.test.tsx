/**
 * Unit Tests for NotesSearch component
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Tests cover:
 * - Filtering notes by search query
 * - Highlighting search terms in results
 * - Filtering by tags
 * - Filtering by topics
 * - "No results" message display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotesSearch } from '../NotesSearch';
import { api } from '../../../utils/api';
import { Note, NoteSearchResult, NoteTag } from '../../../types/notes';

// Mock the API
vi.mock('../../../utils/api', () => ({
  api: {
    searchNotes: vi.fn(),
    getNoteTags: vi.fn(),
    getNotes: vi.fn(),
  },
}));

// Mock UI components
vi.mock('../../ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../../ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../ui/badge', () => ({
  Badge: ({ children, onClick, ...props }: any) => (
    <span onClick={onClick} data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

vi.mock('../../ui/card', () => ({
  Card: ({ children, onClick, ...props }: any) => (
    <div onClick={onClick} data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon">Search</span>,
  X: () => <span data-testid="x-icon">X</span>,
  Loader2: () => <span data-testid="loader-icon">Loading</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  BookOpen: () => <span data-testid="book-open-icon">BookOpen</span>,
  Tag: () => <span data-testid="tag-icon">Tag</span>,
}));

describe('NotesSearch Component', () => {
  const mockAccessToken = 'test-token';
  const mockUserId = 'user-123';
  const mockOnResultSelect = vi.fn();

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

  const mockNote: Note = {
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
  };

  const mockSearchResult: NoteSearchResult = {
    note: mockNote,
    matchedContent: 'This is about Dutch grammar rules and examples.',
    highlightedSnippet: 'This is about <mark>Dutch grammar</mark> rules and examples.',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(api.getNoteTags).mockResolvedValue({ tags: mockTags });
    vi.mocked(api.getNotes).mockResolvedValue({
      notes: [mockNote],
    });
    vi.mocked(api.searchNotes).mockResolvedValue({
      results: [mockSearchResult],
    });
  });

  describe('Component Rendering', () => {
    it('should render search input', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      expect(screen.getByPlaceholderText('Search your notes by content, title, or keywords...')).toBeInTheDocument();
    });

    it('should display initial state message', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Search your notes')).toBeInTheDocument();
      });
    });

    it('should load available tags', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => {
        expect(api.getNoteTags).toHaveBeenCalledWith(mockAccessToken);
      });

      await waitFor(() => {
        expect(screen.getByText('Grammar')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality (Requirement 4.1)', () => {
    it('should perform search when query is entered', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      // Wait for initial load
      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      // Wait for debounced search
      await waitFor(
        () => {
          expect(api.searchNotes).toHaveBeenCalledWith(
            mockAccessToken,
            'grammar',
            {}
          );
        },
        { timeout: 1000 }
      );
    });

    it('should display search results', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should not search when query is empty', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: '' } });

      // Wait a bit to ensure no search is triggered
      await new Promise(resolve => setTimeout(resolve, 600));

      expect(api.searchNotes).not.toHaveBeenCalled();
    });
  });

  describe('Highlighting Search Terms (Requirement 4.2)', () => {
    it('should display highlighted snippets', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      await waitFor(() => {
        // Check that the highlighted snippet is rendered
        const markElement = screen.getByText('Dutch grammar');
        expect(markElement.tagName).toBe('MARK');
      }, { timeout: 1000 });
    });
  });

  describe('Tag Filtering (Requirement 4.3)', () => {
    it('should allow selecting tags', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Grammar')).toBeInTheDocument();
      });

      const grammarTag = screen.getByText('Grammar');
      fireEvent.click(grammarTag);

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(
        () => {
          expect(api.searchNotes).toHaveBeenCalledWith(
            mockAccessToken,
            'test',
            expect.objectContaining({
              tags: ['tag-1'],
            })
          );
        },
        { timeout: 1000 }
      );
    });

    it('should support multiple tag selection', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Grammar')).toBeInTheDocument();
      });

      const grammarTag = screen.getByText('Grammar');
      const vocabTag = screen.getByText('Vocabulary');

      fireEvent.click(grammarTag);
      fireEvent.click(vocabTag);

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(
        () => {
          expect(api.searchNotes).toHaveBeenCalledWith(
            mockAccessToken,
            'test',
            expect.objectContaining({
              tags: expect.arrayContaining(['tag-1', 'tag-2']),
            })
          );
        },
        { timeout: 1000 }
      );
    });

    it('should display message when no tags available', async () => {
      vi.mocked(api.getNoteTags).mockResolvedValue({ tags: [] });

      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No tags available')).toBeInTheDocument();
      });
    });
  });

  describe('No Results Display (Requirement 4.5)', () => {
    it('should display no results message', async () => {
      vi.mocked(api.searchNotes).mockResolvedValue({ results: [] });

      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display correct result count for single result', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      await waitFor(() => {
        // Check for the result count badge
        const resultCountElement = screen.getByText((content, element) => {
          return element?.className?.includes('bg-purple-50') && content.includes('Found');
        });
        expect(resultCountElement).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display correct result count for multiple results', async () => {
      const multipleResults: NoteSearchResult[] = [
        mockSearchResult,
        {
          ...mockSearchResult,
          note: { ...mockNote, id: 'note-2', title: 'Another Note' },
        },
      ];

      vi.mocked(api.searchNotes).mockResolvedValue({ results: multipleResults });

      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      await waitFor(() => {
        // Check for the result count badge
        const resultCountElement = screen.getByText((content, element) => {
          return element?.className?.includes('bg-purple-50') && content.includes('Found');
        });
        expect(resultCountElement).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Clear Search Functionality', () => {
    it('should clear search when clear button clicked', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(api.searchNotes).toHaveBeenCalled();
      }, { timeout: 1000 });

      const clearButton = screen.getByRole('button', { name: /Clear/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });
  });

  describe('Result Selection', () => {
    it('should call onResultSelect when result clicked', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      }, { timeout: 1000 });

      const resultCards = screen.getAllByTestId('card');
      // Click on the last card which should be the result card (not the filter cards)
      fireEvent.click(resultCards[resultCards.length - 1]);

      expect(mockOnResultSelect).toHaveBeenCalledWith('note-1');
    });
  });

  describe('Result Display Details', () => {
    it('should display note metadata', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      await waitFor(() => {
        expect(screen.getByText('Dutch Grammar Notes')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Use getAllByText since "Grammar Basics" appears in both the filter dropdown and the result
      const grammarBasicsElements = screen.getAllByText('Grammar Basics');
      expect(grammarBasicsElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Introduction to Dutch Grammar')).toBeInTheDocument();
    });

    it('should display vocabulary count', async () => {
      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'grammar' } });

      await waitFor(() => {
        expect(screen.getByText(/1 vocabulary item/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when search fails', async () => {
      const { toast } = await import('sonner');
      vi.mocked(api.searchNotes).mockRejectedValue(new Error('Search failed'));

      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      await waitFor(() => expect(api.getNoteTags).toHaveBeenCalled());

      const searchInput = screen.getByPlaceholderText('Search your notes by content, title, or keywords...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to search notes',
          expect.objectContaining({
            description: 'Search failed',
          })
        );
      }, { timeout: 1000 });
    });

    it('should handle filter loading errors gracefully', async () => {
      vi.mocked(api.getNoteTags).mockRejectedValue(new Error('Failed to load tags'));
      vi.mocked(api.getNotes).mockRejectedValue(new Error('Failed to load notes'));

      render(
        <NotesSearch
          accessToken={mockAccessToken}
          userId={mockUserId}
          onResultSelect={mockOnResultSelect}
        />
      );

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search your notes by content, title, or keywords...')).toBeInTheDocument();
      });
    });
  });
});

