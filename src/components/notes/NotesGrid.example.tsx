/**
 * Example usage of NotesGrid component
 * This file demonstrates how to use the NotesGrid in different scenarios
 */

import React, { useState } from 'react';
import { NotesGrid } from './NotesGrid';
import { Note } from '../../types/notes';

// Example 1: Basic usage with notes
export const BasicNotesGridExample: React.FC = () => {
  const sampleNotes: Note[] = [
    {
      id: '1',
      userId: 'user1',
      lessonId: 'lesson1',
      topicId: 'topic1',
      title: 'Dutch Greetings',
      content: '# Greetings\n\nToday we learned basic greetings in Dutch...',
      tags: ['grammar', 'basics'],
      classInfo: {
        lessonTitle: 'Introduction to Dutch',
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
      title: 'Numbers and Counting',
      content: 'Learning to count from 1 to 100 in Dutch...',
      tags: ['vocabulary', 'numbers'],
      classInfo: {
        lessonTitle: 'Dutch Numbers',
        lessonDate: '2024-01-16',
        topicName: 'Numbers',
        level: 'A1',
      },
      vocabulary: [],
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:30:00Z',
      lastEditedAt: '2024-01-16T10:30:00Z',
    },
  ];

  const handleNoteClick = (noteId: string) => {
    console.log('Navigate to note:', noteId);
    // In real app: navigate(`/notes/${noteId}/edit`)
  };

  return (
    <div>
      <h2>My Notes</h2>
      <NotesGrid notes={sampleNotes} onNoteClick={handleNoteClick} />
    </div>
  );
};

// Example 2: Loading state
export const LoadingNotesGridExample: React.FC = () => {
  const handleNoteClick = (noteId: string) => {
    console.log('Navigate to note:', noteId);
  };

  return (
    <div>
      <h2>Loading Notes...</h2>
      <NotesGrid notes={[]} onNoteClick={handleNoteClick} loading={true} />
    </div>
  );
};

// Example 3: Empty state
export const EmptyNotesGridExample: React.FC = () => {
  const handleNoteClick = (noteId: string) => {
    if (noteId === 'new') {
      console.log('Create new note');
      // In real app: navigate('/notes/new')
    }
  };

  return (
    <div>
      <h2>Your Notes</h2>
      <NotesGrid notes={[]} onNoteClick={handleNoteClick} />
    </div>
  );
};

// Example 4: With state management (realistic scenario)
export const InteractiveNotesGridExample: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading notes
  React.useEffect(() => {
    setTimeout(() => {
      setNotes([
        {
          id: '1',
          userId: 'user1',
          lessonId: 'lesson1',
          topicId: 'topic1',
          title: 'My First Note',
          content: 'This is my first note content...',
          tags: ['test'],
          classInfo: {
            lessonTitle: 'Test Lesson',
            lessonDate: '2024-01-15',
            topicName: 'Test Topic',
            level: 'A1',
          },
          vocabulary: [],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          lastEditedAt: '2024-01-15T10:30:00Z',
        },
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  const handleNoteClick = (noteId: string) => {
    if (noteId === 'new') {
      console.log('Create new note');
    } else {
      console.log('Open note:', noteId);
    }
  };

  return (
    <div>
      <h2>Interactive Example</h2>
      <NotesGrid notes={notes} onNoteClick={handleNoteClick} loading={loading} />
    </div>
  );
};

// Example 5: Integration with React Router
export const RouterIntegratedExample: React.FC = () => {
  const sampleNotes: Note[] = [
    {
      id: '1',
      userId: 'user1',
      lessonId: 'lesson1',
      topicId: 'topic1',
      title: 'Dutch Basics',
      content: 'Learning the basics...',
      tags: ['basics'],
      classInfo: {
        lessonTitle: 'Introduction',
        lessonDate: '2024-01-15',
        topicName: 'Basics',
        level: 'A1',
      },
      vocabulary: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      lastEditedAt: '2024-01-15T10:30:00Z',
    },
  ];

  const handleNoteClick = (noteId: string) => {
    // With React Router:
    // const navigate = useNavigate();
    if (noteId === 'new') {
      // navigate('/notes/new');
      console.log('Navigate to: /notes/new');
    } else {
      // navigate(`/notes/${noteId}/edit`);
      console.log(`Navigate to: /notes/${noteId}/edit`);
    }
  };

  return (
    <div>
      <h2>Notes with Router Integration</h2>
      <NotesGrid notes={sampleNotes} onNoteClick={handleNoteClick} />
    </div>
  );
};
