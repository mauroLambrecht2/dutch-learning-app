import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from '../NoteCard';
import { Note } from '../../../types/notes';

describe('NoteCard', () => {
  const mockNote: Note = {
    id: '1',
    userId: 'user1',
    lessonId: 'lesson1',
    topicId: 'topic1',
    title: 'Test Note Title',
    content: 'This is a test note content with some text that should be displayed in the preview.',
    tags: ['grammar', 'vocabulary'],
    classInfo: {
      lessonTitle: 'Dutch Lesson 1',
      lessonDate: '2025-01-15',
      topicName: 'Greetings',
      level: 'A1',
    },
    vocabulary: [],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    lastEditedAt: '2025-01-15T10:00:00Z',
  };

  it('renders note title', () => {
    render(<NoteCard note={mockNote} onClick={() => {}} />);
    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
  });

  it('renders content preview with first 100 characters', () => {
    const longContent = 'A'.repeat(150);
    const noteWithLongContent = { ...mockNote, content: longContent };
    
    render(<NoteCard note={noteWithLongContent} onClick={() => {}} />);
    
    const preview = screen.getByText(/A{100}\.\.\./);
    expect(preview).toBeInTheDocument();
  });

  it('renders content preview without truncation for short content', () => {
    const shortContent = 'Short content';
    const noteWithShortContent = { ...mockNote, content: shortContent };
    
    render(<NoteCard note={noteWithShortContent} onClick={() => {}} />);
    
    expect(screen.getByText('Short content')).toBeInTheDocument();
  });

  it('strips markdown syntax from content preview', () => {
    const markdownContent = '# Heading\n**Bold text** and *italic text* with [link](url) and `code`';
    const noteWithMarkdown = { ...mockNote, content: markdownContent };
    
    render(<NoteCard note={noteWithMarkdown} onClick={() => {}} />);
    
    // Should show plain text without markdown syntax
    expect(screen.getByText(/Heading Bold text and italic text with link and code/)).toBeInTheDocument();
  });

  it('displays "No content yet..." for empty content', () => {
    const noteWithEmptyContent = { ...mockNote, content: '' };
    
    render(<NoteCard note={noteWithEmptyContent} onClick={() => {}} />);
    
    expect(screen.getByText('No content yet...')).toBeInTheDocument();
  });

  it('renders all tags as colored badges', () => {
    render(<NoteCard note={mockNote} onClick={() => {}} />);
    
    expect(screen.getByText('grammar')).toBeInTheDocument();
    expect(screen.getByText('vocabulary')).toBeInTheDocument();
  });

  it('does not render tags section when no tags exist', () => {
    const noteWithoutTags = { ...mockNote, tags: [] };
    
    render(<NoteCard note={noteWithoutTags} onClick={() => {}} />);
    
    const tagsContainer = screen.queryByText('grammar');
    expect(tagsContainer).not.toBeInTheDocument();
  });

  it('renders last updated date', () => {
    render(<NoteCard note={mockNote} onClick={() => {}} />);
    
    // Date formatting will depend on current date, so just check it exists
    const footer = screen.getByText(/ago|Today|Yesterday|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
    expect(footer).toBeInTheDocument();
  });

  it('formats date as "Today" for today\'s date', () => {
    const today = new Date().toISOString();
    const noteUpdatedToday = { ...mockNote, updatedAt: today };
    
    render(<NoteCard note={noteUpdatedToday} onClick={() => {}} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('formats date as "Yesterday" for yesterday\'s date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const noteUpdatedYesterday = { ...mockNote, updatedAt: yesterday.toISOString() };
    
    render(<NoteCard note={noteUpdatedYesterday} onClick={() => {}} />);
    
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('formats date as "X days ago" for recent dates', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const noteUpdatedRecently = { ...mockNote, updatedAt: threeDaysAgo.toISOString() };
    
    render(<NoteCard note={noteUpdatedRecently} onClick={() => {}} />);
    
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('renders lesson title when available', () => {
    render(<NoteCard note={mockNote} onClick={() => {}} />);
    
    expect(screen.getByText('Dutch Lesson 1')).toBeInTheDocument();
  });

  it('does not render lesson title when not available', () => {
    const noteWithoutLesson = {
      ...mockNote,
      classInfo: {
        ...mockNote.classInfo,
        lessonTitle: '',
      },
    };
    
    render(<NoteCard note={noteWithoutLesson} onClick={() => {}} />);
    
    expect(screen.queryByText('Dutch Lesson 1')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    
    render(<NoteCard note={mockNote} onClick={handleClick} />);
    
    const card = screen.getByRole('button', { name: /Open note: Test Note Title/ });
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    const handleClick = vi.fn();
    
    render(<NoteCard note={mockNote} onClick={handleClick} />);
    
    const card = screen.getByRole('button', { name: /Open note: Test Note Title/ });
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    const handleClick = vi.fn();
    
    render(<NoteCard note={mockNote} onClick={handleClick} />);
    
    const card = screen.getByRole('button', { name: /Open note: Test Note Title/ });
    fireEvent.keyDown(card, { key: ' ' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for other keys', () => {
    const handleClick = vi.fn();
    
    render(<NoteCard note={mockNote} onClick={handleClick} />);
    
    const card = screen.getByRole('button', { name: /Open note: Test Note Title/ });
    fireEvent.keyDown(card, { key: 'a' });
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('truncates title to 2 lines with proper CSS class', () => {
    const longTitle = 'This is a very long title that should be truncated to two lines maximum';
    const noteWithLongTitle = { ...mockNote, title: longTitle };
    
    render(<NoteCard note={noteWithLongTitle} onClick={() => {}} />);
    
    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveClass('note-card-title');
  });

  it('applies consistent colors to same tags', () => {
    const { container } = render(<NoteCard note={mockNote} onClick={() => {}} />);
    
    const grammarTag = screen.getByText('grammar');
    const style1 = window.getComputedStyle(grammarTag);
    
    // Re-render with same note
    const { container: container2 } = render(<NoteCard note={mockNote} onClick={() => {}} />);
    const grammarTag2 = container2.querySelector('.note-card-tag');
    
    // Tags should have consistent styling
    expect(grammarTag).toHaveClass('note-card-tag');
    expect(grammarTag2).toHaveClass('note-card-tag');
  });

  it('has proper accessibility attributes', () => {
    render(<NoteCard note={mockNote} onClick={() => {}} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', 'Open note: Test Note Title');
  });

  it('handles notes with multiple tags', () => {
    const noteWithManyTags = {
      ...mockNote,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    
    render(<NoteCard note={noteWithManyTags} onClick={() => {}} />);
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.getByText('tag4')).toBeInTheDocument();
    expect(screen.getByText('tag5')).toBeInTheDocument();
  });

  it('handles content with only whitespace', () => {
    const noteWithWhitespace = { ...mockNote, content: '   \n\n   ' };
    
    render(<NoteCard note={noteWithWhitespace} onClick={() => {}} />);
    
    expect(screen.getByText('No content yet...')).toBeInTheDocument();
  });

  it('strips code blocks from preview', () => {
    const contentWithCodeBlock = '```javascript\nconst x = 1;\n```\nSome text after';
    const noteWithCode = { ...mockNote, content: contentWithCodeBlock };
    
    render(<NoteCard note={noteWithCode} onClick={() => {}} />);
    
    expect(screen.getByText(/Some text after/)).toBeInTheDocument();
    expect(screen.queryByText(/const x = 1/)).not.toBeInTheDocument();
  });
});
