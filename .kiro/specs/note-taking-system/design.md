# Note-Taking System Design Document

## Overview

The note-taking system is a comprehensive feature that enables students to capture, organize, and review lesson notes within the Dutch Learning App. The system automatically organizes notes by topic, extracts vocabulary and class information from lessons, and provides search and PDF export capabilities. This design integrates seamlessly with the existing React/TypeScript frontend and Supabase backend architecture.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Student Dashboard                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Lessons    │  │    Notes     │  │   Progress   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Notes Components Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ NotesViewer  │  │ NoteEditor   │  │ NotesSearch  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ NotesExport  │  │  TagManager  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (api.ts)                      │
│  - getNotes()          - updateNote()                        │
│  - createNote()        - deleteNote()                        │
│  - searchNotes()       - exportNotesToPDF()                  │
│  - getNoteTags()       - addNoteTag()                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Function (Backend)                │
│  - Notes CRUD operations                                     │
│  - Tag management                                            │
│  - Search indexing                                           │
│  - PDF generation                                            │
│  - Auto-extraction logic                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase KV Store Database                  │
│  - notes:{userId}:{noteId}                                   │
│  - note-tags:{userId}:{noteId}                               │
│  - note-index:{userId}:by-topic:{topicId}                    │
│  - note-index:{userId}:by-lesson:{lessonId}                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Radix UI components
- **State Management**: React hooks (useState, useEffect)
- **Backend**: Supabase Edge Functions (Hono framework)
- **Database**: Supabase KV Store (key-value storage)
- **PDF Generation**: jsPDF library (client-side)
- **Styling**: Tailwind CSS (existing)

## Components and Interfaces

### 1. Type Definitions

**File**: `src/types/notes.ts`

```typescript
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
```

### 2. Frontend Components

#### NotesViewer Component

**File**: `src/components/notes/NotesViewer.tsx`

**Purpose**: Main component for viewing and organizing notes

**Props**:
```typescript
interface NotesViewerProps {
  accessToken: string;
  userId: string;
}
```

**Features**:
- Display notes grouped by topic
- Filter by topic or tag
- Quick search interface
- Navigate to note editor
- Trigger PDF export

#### NoteEditor Component

**File**: `src/components/notes/NoteEditor.tsx`

**Purpose**: Rich text editor for creating and editing notes

**Props**:
```typescript
interface NoteEditorProps {
  accessToken: string;
  noteId?: string; // undefined for new note
  lessonId: string;
  topicId: string;
  onSave: (note: Note) => void;
  onCancel: () => void;
}
```

**Features**:
- Auto-save functionality (debounced)
- Display auto-extracted class info (read-only)
- Display auto-extracted vocabulary (read-only)
- Tag management interface
- Manual note content editing

#### NotesSearch Component

**File**: `src/components/notes/NotesSearch.tsx`

**Purpose**: Advanced search interface for notes

**Props**:
```typescript
interface NotesSearchProps {
  accessToken: string;
  userId: string;
  onResultSelect: (note: Note) => void;
}
```

**Features**:
- Full-text search across note content
- Filter by tags
- Filter by topics
- Highlight search terms in results
- Display search result snippets

#### NotesExport Component

**File**: `src/components/notes/NotesExport.tsx`

**Purpose**: PDF export functionality

**Props**:
```typescript
interface NotesExportProps {
  accessToken: string;
  userId: string;
  options: NotesExportOptions;
  onComplete: () => void;
}
```

**Features**:
- Generate PDF from notes
- Apply consistent formatting
- Include/exclude sections based on options
- Progress indicator during generation
- Automatic download trigger

#### TagManager Component

**File**: `src/components/notes/TagManager.tsx`

**Purpose**: Manage note tags

**Props**:
```typescript
interface TagManagerProps {
  accessToken: string;
  userId: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}
```

**Features**:
- Create new tags
- Select/deselect tags
- Color-coded tag display
- Tag autocomplete

### 3. API Layer

**File**: `src/utils/api.ts` (additions)

```typescript
// Notes Management
async getNotes(accessToken: string, filters?: {
  topicId?: string;
  lessonId?: string;
  tags?: string[];
}): Promise<{ notes: Note[] }>

async getNote(accessToken: string, noteId: string): Promise<Note>

async createNote(accessToken: string, noteData: {
  lessonId: string;
  topicId: string;
  title: string;
  content: string;
  tags: string[];
}): Promise<Note>

async updateNote(accessToken: string, noteId: string, updates: {
  content?: string;
  tags?: string[];
  title?: string;
}): Promise<Note>

async deleteNote(accessToken: string, noteId: string): Promise<void>

async searchNotes(accessToken: string, query: string, filters?: {
  topicId?: string;
  tags?: string[];
}): Promise<{ results: NoteSearchResult[] }>

// Tag Management
async getNoteTags(accessToken: string): Promise<{ tags: NoteTag[] }>

async createNoteTag(accessToken: string, tagData: {
  name: string;
  color: string;
}): Promise<NoteTag>

async deleteNoteTag(accessToken: string, tagId: string): Promise<void>

// Export
async exportNotesToPDF(accessToken: string, options: NotesExportOptions): Promise<Blob>
```

### 4. Backend Implementation

**File**: `supabase/functions/make-server-a784a06a/index.ts` (additions)

**Endpoints**:

```typescript
// GET /notes - Get all notes for user with optional filters
app.get('/notes', async (c) => {
  // Extract user from JWT
  // Parse query params for filters
  // Fetch notes from KV store
  // Return filtered notes
})

// GET /notes/:noteId - Get specific note
app.get('/notes/:noteId', async (c) => {
  // Extract user from JWT
  // Fetch note from KV store
  // Verify ownership
  // Return note
})

// POST /notes - Create new note
app.post('/notes', async (c) => {
  // Extract user from JWT
  // Parse request body
  // Auto-extract class info and vocabulary from lesson
  // Generate note ID
  // Store in KV store
  // Update indexes
  // Return created note
})

// PATCH /notes/:noteId - Update note
app.patch('/notes/:noteId', async (c) => {
  // Extract user from JWT
  // Fetch existing note
  // Verify ownership
  // Apply updates
  // Update timestamp
  // Store in KV store
  // Return updated note
})

// DELETE /notes/:noteId - Delete note
app.delete('/notes/:noteId', async (c) => {
  // Extract user from JWT
  // Verify ownership
  // Delete from KV store
  // Update indexes
  // Return success
})

// GET /notes/search - Search notes
app.get('/notes/search', async (c) => {
  // Extract user from JWT
  // Parse search query and filters
  // Search across note content
  // Generate highlighted snippets
  // Return search results
})

// GET /notes/tags - Get user's tags
app.get('/notes/tags', async (c) => {
  // Extract user from JWT
  // Fetch tags from KV store
  // Return tags
})

// POST /notes/tags - Create tag
app.post('/notes/tags', async (c) => {
  // Extract user from JWT
  // Parse request body
  // Create tag
  // Store in KV store
  // Return created tag
})

// DELETE /notes/tags/:tagId - Delete tag
app.delete('/notes/tags/:tagId', async (c) => {
  // Extract user from JWT
  // Verify ownership
  // Remove tag from all notes
  // Delete from KV store
  // Return success
})

// POST /notes/export - Export notes to PDF
app.post('/notes/export', async (c) => {
  // Extract user from JWT
  // Parse export options
  // Fetch relevant notes
  // Generate PDF (or return data for client-side generation)
  // Return PDF blob or data
})
```

## Data Models

### KV Store Schema

The system uses Supabase KV Store with the following key patterns:

```
# Individual notes
notes:{userId}:{noteId} → Note object

# User's tags
note-tags:{userId} → NoteTag[]

# Index: Notes by topic
note-index:{userId}:by-topic:{topicId} → string[] (noteIds)

# Index: Notes by lesson
note-index:{userId}:by-lesson:{lessonId} → string (noteId)

# Index: Notes by tag
note-index:{userId}:by-tag:{tagName} → string[] (noteIds)

# Search index (simplified - for full-text search)
note-search:{userId} → { [noteId]: string } (searchable content)
```

### Auto-Extraction Logic

When a note is created for a lesson, the backend automatically extracts:

1. **Class Information**:
   - Fetch lesson data using `lessonId`
   - Extract: title, date, topic, level, series info
   - Store in `note.classInfo`

2. **Vocabulary**:
   - Fetch lesson's vocabulary items
   - Extract: word, translation, example, audio URL
   - Store in `note.vocabulary[]`

3. **Updates**:
   - When lesson data changes, update associated notes
   - Maintain sync between lessons and notes

## Error Handling

### Frontend Error Handling

```typescript
// Use try-catch with user-friendly messages
try {
  await api.createNote(accessToken, noteData);
  toast.success('Note saved successfully');
} catch (error) {
  console.error('Failed to save note:', error);
  toast.error('Failed to save note. Please try again.');
}
```

### Backend Error Handling

```typescript
// Consistent error responses
try {
  // Operation
} catch (error) {
  return c.json({
    error: 'Failed to create note',
    details: error.message
  }, 500);
}
```

### Error Scenarios

1. **Note not found**: Return 404 with clear message
2. **Unauthorized access**: Return 403 when user tries to access another user's notes
3. **Invalid data**: Return 400 with validation errors
4. **Database errors**: Return 500 with generic message (log details server-side)
5. **PDF generation failure**: Show error toast, allow retry

## Testing Strategy

### Unit Tests

**File**: `src/components/notes/__tests__/NoteEditor.test.tsx`

```typescript
describe('NoteEditor', () => {
  it('should auto-save note content after debounce', async () => {
    // Test auto-save functionality
  });
  
  it('should display auto-extracted class info', () => {
    // Test class info display
  });
  
  it('should display auto-extracted vocabulary', () => {
    // Test vocabulary display
  });
  
  it('should handle tag addition and removal', () => {
    // Test tag management
  });
});
```

**File**: `src/components/notes/__tests__/NotesSearch.test.tsx`

```typescript
describe('NotesSearch', () => {
  it('should filter notes by search query', async () => {
    // Test search functionality
  });
  
  it('should highlight search terms in results', () => {
    // Test highlighting
  });
  
  it('should filter by tags', () => {
    // Test tag filtering
  });
});
```

### Integration Tests

**File**: `src/components/notes/__tests__/NotesViewer.integration.test.tsx`

```typescript
describe('NotesViewer Integration', () => {
  it('should load and display notes grouped by topic', async () => {
    // Test full flow from API to display
  });
  
  it('should create new note and update list', async () => {
    // Test create flow
  });
  
  it('should export notes to PDF', async () => {
    // Test export flow
  });
});
```

### Backend Tests

**File**: `supabase/functions/make-server-a784a06a/__tests__/notes.test.ts`

```typescript
describe('Notes API', () => {
  it('should create note with auto-extracted data', async () => {
    // Test note creation with extraction
  });
  
  it('should search notes by content', async () => {
    // Test search functionality
  });
  
  it('should update note indexes correctly', async () => {
    // Test index management
  });
});
```

### Test Data

Create mock data for:
- Sample lessons with vocabulary
- Sample notes with various content
- Sample tags
- Sample search queries

## PDF Export Implementation

### Client-Side PDF Generation

Use `jspdf` library for client-side PDF generation:

```typescript
import jsPDF from 'jspdf';

function generateNotesPDF(notes: Note[], options: NotesExportOptions): Blob {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('My Dutch Learning Notes', 20, 20);
  
  let yPosition = 40;
  
  notes.forEach((note, index) => {
    // Add note title
    doc.setFontSize(16);
    doc.text(note.title, 20, yPosition);
    yPosition += 10;
    
    // Add class info if enabled
    if (options.includeClassInfo) {
      doc.setFontSize(10);
      doc.text(`Lesson: ${note.classInfo.lessonTitle}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Date: ${note.classInfo.lessonDate}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Topic: ${note.classInfo.topicName}`, 20, yPosition);
      yPosition += 10;
    }
    
    // Add manual notes
    doc.setFontSize(12);
    const splitContent = doc.splitTextToSize(note.content, 170);
    doc.text(splitContent, 20, yPosition);
    yPosition += splitContent.length * 7;
    
    // Add vocabulary if enabled
    if (options.includeVocabulary && note.vocabulary.length > 0) {
      yPosition += 5;
      doc.setFontSize(14);
      doc.text('Vocabulary:', 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      note.vocabulary.forEach(vocab => {
        doc.text(`• ${vocab.word} - ${vocab.translation}`, 25, yPosition);
        yPosition += 6;
        if (vocab.exampleSentence) {
          doc.text(`  Example: ${vocab.exampleSentence}`, 30, yPosition);
          yPosition += 6;
        }
      });
    }
    
    yPosition += 15;
    
    // Add new page if needed
    if (yPosition > 270 && index < notes.length - 1) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  return doc.output('blob');
}
```

## Integration with Existing Features

### StudentDashboard Integration

Add "Notes" tab to existing tabs:

```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="lessons">Lessons</TabsTrigger>
    <TabsTrigger value="notes">Notes</TabsTrigger>
    <TabsTrigger value="progress">Progress</TabsTrigger>
    <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
    <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
    <TabsTrigger value="review">Review</TabsTrigger>
  </TabsList>
  
  <TabsContent value="notes">
    <NotesViewer accessToken={accessToken} userId={userId} />
  </TabsContent>
  
  {/* Other tabs */}
</Tabs>
```

### ClassPlayer Integration

Add "Take Notes" button during lesson:

```typescript
<Button
  onClick={() => openNoteEditor(classData.id, classData.topicId)}
  variant="outline"
>
  📝 Take Notes
</Button>
```

### Lesson Completion Flow

Auto-create note template when lesson is completed:

```typescript
async function handleClassComplete(classId: string, score: number) {
  await api.saveProgress(accessToken, classId, true, score);
  
  // Auto-create note template
  await api.createNote(accessToken, {
    lessonId: classId,
    topicId: classData.topicId,
    title: `Notes: ${classData.title}`,
    content: '', // Empty for student to fill
    tags: []
  });
  
  setSelectedClass(null);
  await loadData();
}
```

## Performance Considerations

1. **Debounced Auto-Save**: Use 1-second debounce to avoid excessive API calls
2. **Lazy Loading**: Load notes on-demand when switching topics
3. **Search Optimization**: Implement client-side filtering for small datasets, server-side for large
4. **PDF Generation**: Generate PDFs client-side to reduce server load
5. **Caching**: Cache frequently accessed notes in component state

## Security Considerations

1. **Authorization**: Verify user ownership for all note operations
2. **Input Validation**: Sanitize note content to prevent XSS
3. **Rate Limiting**: Implement rate limits on note creation/updates
4. **Data Privacy**: Ensure notes are only accessible by the owner
5. **JWT Validation**: Validate access tokens on all backend endpoints

## Future Enhancements

1. **Rich Text Formatting**: Add markdown or WYSIWYG editor
2. **Image Attachments**: Allow students to add images to notes
3. **Audio Notes**: Record audio notes during lessons
4. **Collaborative Notes**: Share notes with other students
5. **AI Summaries**: Auto-generate note summaries using AI
6. **Offline Support**: Enable offline note-taking with sync
7. **Note Templates**: Provide pre-formatted note templates
8. **Export Formats**: Support additional formats (Word, Markdown, HTML)
