/**
 * Type definitions for the note-taking system
 */

/**
 * Note content structure
 */
export interface Note {
  id: string;
  userId: string;
  lessonId: string;
  topicId: string;
  title: string;
  content: string; // Manual notes by student
  tags: string[];
  
  // Auto-extracted content
  classInfo: ClassInfo;
  vocabulary: VocabularyItem[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastEditedAt: string;
}

/**
 * Class information auto-extracted from lesson
 */
export interface ClassInfo {
  lessonTitle: string;
  lessonDate: string;
  topicName: string;
  level: string;
  seriesInfo?: string;
}

/**
 * Vocabulary item auto-extracted from lesson
 */
export interface VocabularyItem {
  word: string;
  translation: string;
  exampleSentence?: string;
  audioUrl?: string;
}

/**
 * Note tag for categorization
 */
export interface NoteTag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
}

/**
 * Search result with highlighting
 */
export interface NoteSearchResult {
  note: Note;
  matchedContent: string;
  highlightedSnippet: string;
}

/**
 * Export options for PDF generation
 */
export interface NotesExportOptions {
  scope: 'single' | 'topic' | 'all';
  noteId?: string;
  topicId?: string;
  includeVocabulary: boolean;
  includeClassInfo: boolean;
  format: 'pdf';
}
