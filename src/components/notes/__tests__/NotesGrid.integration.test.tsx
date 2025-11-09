import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesGrid } from '../NotesGrid';
import { Note } from '../../../types/notes';

describe('NotesGrid Integration Tests', () => {
  const mockNotes: Note[] = [
    {
      id: '1',
      userId: 'user1',
      lessonId: 'lesson1',
      topicId: 'topic1',
      title: 'My First Note',
      content: 'This is the content of my first note with some interesting information.',
      tags: ['grammar', 'vocabulary'],
      classInfo: {
        lessonTitle: 'Dutch Basics',
        lessonDate: '2024-01-15',
        topicName: 'Greetings',
        level: 'A1',
      },
      vocabulary: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      lastEditedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      lessonId: 'lesson2',
      topicId: 'topic1',
      title: 'Second Note',
      content: 'Another note with different content.',
      tags: ['pronunciation'],
      classInfo: {
        lessonTitle: 'Dutch Intermediate',
        lessonDate: '2024-01-16',
        topicName: 'Conversations',
        level: 'A2',
      },
      vocabulary: [],
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:30:00Z',
      lastEditedAt: '2024-01-16T10:30:00Z',
    },
    {
      id: '3',
      userId: 'user1',
      lessonId: 'lesson3',
      topicId: 'topic2',
      title: 'Third Note',
      content: 'Yet another note for testing the grid layout.',
      tags: ['culture', 'history'],
      classInfo: {
        lessonTitle: 'Dutch Culture',
        lessonDate: '2024-01-17',
        topicName: 'Traditions',
        level: 'B1',
      },
      vocabulary: [],
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:30:00Z',
      lastEditedAt: '2024-01-17T10:30:00Z',
    },
  ];

  describe('Grid Layout', () => {
    it('should render all notes in a grid', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      expect(screen.getByText('My First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
      expect(screen.getByText('Third Note')).toBeInTheDocument();
    });

    it('should apply grid CSS class', () => {
      const onNoteClick = vi.fn();
      const { container } = render(
        <NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />
      );

      const grid = container.querySelector('.notes-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should render NoteCard components for each note', () => {
      const onNoteClick = vi.fn();
      const { container } = render(
        <NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />
      );

      const noteCards = container.querySelectorAll('.note-card');
      expect(noteCards).toHaveLength(3);
    });
  });

  describe('Loading State', () => {
    it('should display loading skeletons when loading is true', () => {
      const onNoteClick = vi.fn();
      const { container } = render(
        <NotesGrid notes={[]} onNoteClick={onNoteClick} loading={true} />
      );

      const skeletons = container.querySelectorAll('.note-card-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display 6 skeleton cards', () => {
      const onNoteClick = vi.fn();
      const { container } = render(
        <NotesGrid notes={[]} onNoteClick={onNoteClick} loading={true} />
      );

      const skeletons = container.querySelectorAll('.note-card-skeleton');
      expect(skeletons).toHaveLength(6);
    });

    it('should not display notes when loading', () => {
      const onNoteClick = vi.fn();
      render(
        <NotesGrid notes={mockNotes} onNoteClick={onNoteClick} loading={true} />
      );

      expect(screen.queryByText('My First Note')).not.toBeInTheDocument();
    });

    it('should not display empty state when loading', () => {
      const onNoteClick = vi.fn();
      render(
        <NotesGrid notes={[]} onNoteClick={onNoteClick} loading={true} />
      );

      expect(screen.queryByText('No Notes Yet')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no notes', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={[]} onNoteClick={onNoteClick} />);

      expect(screen.getByText('No Notes Yet')).toBeInTheDocument();
    });

    it('should display empty state message', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={[]} onNoteClick={onNoteClick} />);

      expect(
        screen.getByText(/Start taking notes during your lessons/i)
      ).toBeInTheDocument();
    });

    it('should display "Create Your First Note" CTA button', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={[]} onNoteClick={onNoteClick} />);

      const ctaButton = screen.getByRole('button', {
        name: /create your first note/i,
      });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should call onNoteClick with "new" when CTA is clicked', async () => {
      const user = userEvent.setup();
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={[]} onNoteClick={onNoteClick} />);

      const ctaButton = screen.getByRole('button', {
        name: /create your first note/i,
      });
      await user.click(ctaButton);

      expect(onNoteClick).toHaveBeenCalledWith('new');
      expect(onNoteClick).toHaveBeenCalledTimes(1);
    });

    it('should display empty state icon', () => {
      const onNoteClick = vi.fn();
      const { container } = render(
        <NotesGrid notes={[]} onNoteClick={onNoteClick} />
      );

      const icon = container.querySelector('.empty-state-icon');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('📝');
    });
  });

  describe('Note Click Handler', () => {
    it('should call onNoteClick with correct note ID when card is clicked', async () => {
      const user = userEvent.setup();
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      const firstCard = screen.getByText('My First Note').closest('.note-card');
      expect(firstCard).toBeInTheDocument();
      
      if (firstCard) {
        await user.click(firstCard);
      }

      expect(onNoteClick).toHaveBeenCalledWith('1');
    });

    it('should call onNoteClick for different notes', async () => {
      const user = userEvent.setup();
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      const secondCard = screen.getByText('Second Note').closest('.note-card');
      if (secondCard) {
        await user.click(secondCard);
      }

      expect(onNoteClick).toHaveBeenCalledWith('2');
    });

    it('should handle keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup();
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      const firstCard = screen.getByText('My First Note').closest('.note-card');
      if (firstCard) {
        firstCard.focus();
        await user.keyboard('{Enter}');
      }

      expect(onNoteClick).toHaveBeenCalledWith('1');
    });

    it('should handle keyboard navigation (Space key)', async () => {
      const user = userEvent.setup();
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      const firstCard = screen.getByText('My First Note').closest('.note-card');
      if (firstCard) {
        firstCard.focus();
        await user.keyboard(' ');
      }

      expect(onNoteClick).toHaveBeenCalledWith('1');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render correctly with single note', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={[mockNotes[0]]} onNoteClick={onNoteClick} />);

      expect(screen.getByText('My First Note')).toBeInTheDocument();
    });

    it('should render correctly with many notes', () => {
      const onNoteClick = vi.fn();
      const manyNotes = Array.from({ length: 12 }, (_, i) => ({
        ...mockNotes[0],
        id: `note-${i}`,
        title: `Note ${i + 1}`,
      }));

      const { container } = render(
        <NotesGrid notes={manyNotes} onNoteClick={onNoteClick} />
      );

      const noteCards = container.querySelectorAll('.note-card');
      expect(noteCards).toHaveLength(12);
    });
  });

  describe('Integration with NoteCard', () => {
    it('should display note titles from NoteCard', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      mockNotes.forEach((note) => {
        expect(screen.getByText(note.title)).toBeInTheDocument();
      });
    });

    it('should display note tags from NoteCard', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      expect(screen.getByText('grammar')).toBeInTheDocument();
      expect(screen.getByText('vocabulary')).toBeInTheDocument();
      expect(screen.getByText('pronunciation')).toBeInTheDocument();
    });

    it('should display content previews from NoteCard', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      expect(
        screen.getByText(/This is the content of my first note/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible CTA button', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={[]} onNoteClick={onNoteClick} />);

      const ctaButton = screen.getByRole('button', {
        name: /create your first note/i,
      });
      expect(ctaButton).toHaveAttribute('aria-label');
    });

    it('should have focusable note cards', () => {
      const onNoteClick = vi.fn();
      render(<NotesGrid notes={mockNotes} onNoteClick={onNoteClick} />);

      const cards = screen.getAllByRole('button');
      cards.forEach((card) => {
        expect(card).toHaveAttribute('tabIndex');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle notes with empty content', () => {
      const onNoteClick = vi.fn();
      const notesWithEmptyContent = [
        {
          ...mockNotes[0],
          content: '',
        },
      ];

      render(
        <NotesGrid notes={notesWithEmptyContent} onNoteClick={onNoteClick} />
      );

      expect(screen.getByText('My First Note')).toBeInTheDocument();
    });

    it('should handle notes with no tags', () => {
      const onNoteClick = vi.fn();
      const notesWithoutTags = [
        {
          ...mockNotes[0],
          tags: [],
        },
      ];

      render(<NotesGrid notes={notesWithoutTags} onNoteClick={onNoteClick} />);

      expect(screen.getByText('My First Note')).toBeInTheDocument();
    });

    it('should handle notes with long titles', () => {
      const onNoteClick = vi.fn();
      const notesWithLongTitle = [
        {
          ...mockNotes[0],
          title: 'This is a very long title that should be displayed correctly in the note card without breaking the layout',
        },
      ];

      render(<NotesGrid notes={notesWithLongTitle} onNoteClick={onNoteClick} />);

      expect(
        screen.getByText(/This is a very long title/i)
      ).toBeInTheDocument();
    });
  });
});
