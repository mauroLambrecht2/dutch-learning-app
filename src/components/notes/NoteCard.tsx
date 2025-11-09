import React from 'react';
import { Note } from '../../types/notes';
import './NoteCard.css';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

/**
 * NoteCard component displays a preview of a note in a card format
 * Shows title, content preview, tags, and last updated date
 */
export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  // Format the date to a readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Extract first 100 characters of content, stripping markdown syntax
  const getContentPreview = (content: string): string => {
    // Remove markdown headers
    let preview = content.replace(/^#{1,6}\s+/gm, '');
    // Remove markdown bold/italic
    preview = preview.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');
    // Remove markdown links
    preview = preview.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove markdown code blocks
    preview = preview.replace(/```[\s\S]*?```/g, '');
    preview = preview.replace(/`([^`]+)`/g, '$1');
    // Remove extra whitespace
    preview = preview.replace(/\s+/g, ' ').trim();
    
    // Truncate to 100 characters
    if (preview.length > 100) {
      return preview.substring(0, 100) + '...';
    }
    return preview || 'No content yet...';
  };

  // Get color for tag badge
  const getTagColor = (tag: string): string => {
    // Simple hash function to generate consistent colors for tags
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 85%)`;
  };

  return (
    <div 
      className="note-card" 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Open note: ${note.title}`}
    >
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title}</h3>
      </div>
      
      <div className="note-card-content">
        <p className="note-card-preview">{getContentPreview(note.content)}</p>
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="note-card-tags">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="note-card-tag"
              style={{ backgroundColor: getTagColor(tag) }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="note-card-footer">
        <span className="note-card-date">
          {formatDate(note.updatedAt)}
        </span>
        {note.classInfo?.lessonTitle && (
          <span className="note-card-lesson" title={note.classInfo.lessonTitle}>
            {note.classInfo.lessonTitle}
          </span>
        )}
      </div>
    </div>
  );
};
