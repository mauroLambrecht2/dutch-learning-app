# Notes Components

This directory contains components for the note-taking system.

## Components

### NoteEditor

The main component for creating and editing notes.

**Props:**
- `accessToken: string` - User authentication token
- `noteId?: string` - Optional ID for editing existing note
- `lessonId: string` - ID of the lesson this note is associated with
- `topicId: string` - ID of the topic this note is associated with
- `onSave: (note: Note) => void` - Callback when note is saved
- `onCancel: () => void` - Callback when editing is cancelled

**Features:**
- Auto-save with 1-second debounce for existing notes
- Manual note content editing with textarea
- Display of auto-extracted class information (read-only)
- Display of auto-extracted vocabulary (read-only)
- Tag management integration
- Loading and saving states
- Error handling with toast notifications

**Usage:**
```tsx
import { NoteEditor } from './components/notes';

<NoteEditor
  accessToken={accessToken}
  noteId={existingNoteId} // optional
  lessonId={lessonId}
  topicId={topicId}
  onSave={(note) => console.log('Note saved:', note)}
  onCancel={() => console.log('Cancelled')}
/>
```

### TagManager

Component for managing note tags with creation and selection capabilities.

**Props:**
- `accessToken: string` - User authentication token
- `selectedTags: string[]` - Array of selected tag IDs
- `onTagsChange: (tags: string[]) => void` - Callback when tags change

**Features:**
- Display available tags with checkboxes
- Color-coded tag badges
- Create new tags with name and color picker
- Tag selection/deselection
- Loading states
- Error handling with toast notifications

**Usage:**
```tsx
import { TagManager } from './components/notes';

<TagManager
  accessToken={accessToken}
  selectedTags={selectedTagIds}
  onTagsChange={(tags) => setSelectedTags(tags)}
/>
```

### NotesViewer

Main component for viewing and organizing all notes.

**Props:**
- `accessToken: string` - User authentication token
- `userId: string` - User ID for fetching notes

**Features:**
- Display notes grouped by topic
- Filter notes by topic using dropdown
- Filter notes by tags using multi-select badges
- Card layout with note preview, metadata, and actions
- Create new notes via "New Note" button
- Edit existing notes via "Edit" button on each card
- Delete notes with confirmation dialog
- Integration points for NotesSearch and NotesExport components
- Loading states and error handling

**Usage:**
```tsx
import { NotesViewer } from './components/notes';

<NotesViewer
  accessToken={accessToken}
  userId={userId}
/>
```

### NotesExport

Component for exporting notes to PDF format with customizable options.

**Props:**
- `accessToken: string` - User authentication token
- `userId: string` - User ID for fetching notes
- `options: NotesExportOptions` - Export configuration options
- `onComplete: () => void` - Callback when export is complete

**Export Options:**
```typescript
interface NotesExportOptions {
  scope: 'single' | 'topic' | 'all';  // What to export
  noteId?: string;                     // Required if scope is 'single'
  topicId?: string;                    // Required if scope is 'topic'
  includeVocabulary: boolean;          // Include vocabulary sections
  includeClassInfo: boolean;           // Include class information
  format: 'pdf';                       // Export format (currently only PDF)
}
```

**Features:**
- Export single note, all notes from a topic, or all notes
- Configurable checkboxes for including vocabulary and class info
- PDF generation using jsPDF library (client-side)
- Consistent formatting with proper page breaks
- Progress indicator during generation
- Automatic download trigger
- Error handling with toast notifications
- Displays scope information (e.g., "Exporting 1 note")

**PDF Content:**
- Title page with export date
- For each note:
  - Note title
  - Class information (if enabled): lesson title, date, topic, level, series
  - Tags (if present)
  - Manual note content
  - Vocabulary section (if enabled): word, translation, example sentences
- Proper page breaks and separators between notes

**Usage:**
```tsx
import { NotesExport } from './components/notes';

// Export all notes
<NotesExport
  accessToken={accessToken}
  userId={userId}
  options={{
    scope: 'all',
    includeVocabulary: true,
    includeClassInfo: true,
    format: 'pdf',
  }}
  onComplete={() => console.log('Export complete!')}
/>

// Export single note
<NotesExport
  accessToken={accessToken}
  userId={userId}
  options={{
    scope: 'single',
    noteId: 'note-123',
    includeVocabulary: false,
    includeClassInfo: true,
    format: 'pdf',
  }}
  onComplete={() => console.log('Note exported!')}
/>
```

## Implementation Notes

- All components use the Sonner toast library for notifications
- UI components are from the Radix UI library (Button, Input, Label, Badge, Checkbox, Textarea, Card, Select, Dialog, AlertDialog)
- Auto-save in NoteEditor uses a 1-second debounce to prevent excessive API calls
- TagManager and NotesViewer fetch available tags on mount
- NotesViewer groups notes by topic and supports multiple filter combinations
- NotesExport uses jsPDF for client-side PDF generation to reduce server load
- All API calls include proper error handling
