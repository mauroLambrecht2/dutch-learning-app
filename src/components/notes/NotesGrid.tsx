import React from 'react';
import { Note } from '../../types/notes';
import { NoteCard } from './NoteCard';
import './NotesGrid.css';

interface NotesGridProps {
  notes: Note[];
  onNoteClick: (noteId: string) => void;
  loading?: boolean;
}

/**
 * NotesGrid component displays notes in a responsive grid layout
 * Supports 3 columns on desktop, 2 on tablet, 1 on mobile
 */
export const NotesGrid: React.FC<NotesGridProps> = ({ 
  notes, 
  onNoteClick, 
  loading = false 
}) => {
  // Loading skeleton state
  if (loading) {
    return (
      <div className="notes-grid">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="note-card-skeleton">
            <div className="skeleton-title"></div>
            <div className="skeleton-content"></div>
            <div className="skeleton-tags">
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
            </div>
            <div className="skeleton-footer"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (notes.length === 0) {
    return (
      <div className="notes-grid-empty">
        <div className="empty-state-icon">📝</div>
        <h2 className="empty-state-title">No Notes Yet</h2>
        <p className="empty-state-description">
          Start taking notes during your lessons or create a new note to get started.
        </p>
        <button 
          className="empty-state-cta"
          onClick={() => onNoteClick('new')}
          aria-label="Create your first note"
        >
          Create Your First Note
        </button>
      </div>
    );
  }

  // Grid with notes
  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onClick={() => onNoteClick(note.id)}
        />
      ))}
    </div>
  );
};
