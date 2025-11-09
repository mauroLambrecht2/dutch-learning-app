# Design Document

## Overview

The enhanced markdown note editor provides two distinct experiences: a simplified side panel for quick note-taking during lessons, and a comprehensive full-page editor for detailed note creation and editing. The system uses a markdown-based approach with live preview, auto-population of lesson content, and a template system for consistent note structure.

## Architecture

### Component Structure

```
src/components/notes/
├── SimpleNoteEditor.tsx          # Simplified side panel editor
├── FullNoteEditor.tsx            # Full-page markdown editor
├── MarkdownEditor.tsx            # Reusable markdown editor component
├── MarkdownPreview.tsx           # Live preview renderer
├── MarkdownToolbar.tsx           # Formatting toolbar
├── NoteTemplate.ts               # Template generation utilities
├── NotesGrid.tsx                 # Improved notes display grid
└── NoteCard.tsx                  # Individual note card component
```

### State Management

- **Local State**: Editor content, cursor position, preview scroll sync
- **Auto-save**: Debounced save every 2 seconds using useEffect
- **API Integration**: CRUD operations for notes via existing API

### Markdown Library

Use **react-markdown** for rendering with **remark-gfm** for GitHub Flavored Markdown support (tables, strikethrough, task lists).

## Components and Interfaces

### 1. SimpleNoteEditor Component

**Purpose**: Lightweight editor for quick notes during lessons

**Props**:
```typescript
interface SimpleNoteEditorProps {
  accessToken: string;
  lessonId: string;
  topicId: string;
  noteId?: string;
  onClose: () => void;
}
```

**Features**:
- Title input field
- Markdown textarea with basic toolbar (bold, italic, list)
- Auto-save indicator
- Minimal UI - no tags, no class info display
- Auto-populates template on first load

**Layout**:
- Fixed width: 600px on desktop
- Full height with scroll
- Sticky header with title and close button
- Floating save indicator at bottom

### 2. FullNoteEditor Component

**Purpose**: Comprehensive editor with all features

**Props**:
```typescript
interface FullNoteEditorProps {
  accessToken: string;
  noteId?: string;
  lessonId?: string;
  topicId?: string;
}
```

**Features**:
- Split-screen layout (editor left, preview right)
- Full markdown toolbar
- Tag management section
- Class info display (read-only)
- Vocabulary display (read-only)
- Manual save button + auto-save
- Breadcrumb navigation

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Header: Breadcrumb | Save Button               │
├──────────────────────┬──────────────────────────┤
│                      │                          │
│  Markdown Editor     │   Live Preview          │
│  (50%)               │   (50%)                 │
│                      │                          │
│  - Toolbar           │   - Rendered markdown   │
│  - Text area         │   - Synced scroll       │
│                      │                          │
├──────────────────────┴──────────────────────────┤
│ Sidebar: Tags, Class Info, Vocabulary          │
│ (Collapsible, 300px width)                     │
└─────────────────────────────────────────────────┘
```

### 3. MarkdownEditor Component

**Purpose**: Reusable markdown editing component

**Props**:
```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  toolbarMode: 'simple' | 'full';
  onSave?: () => void;
}
```

**Features**:
- Textarea with markdown syntax highlighting (optional)
- Toolbar integration
- Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- Tab key handling for indentation
- Undo/redo support

### 4. MarkdownPreview Component

**Purpose**: Render markdown with live updates

**Props**:
```typescript
interface MarkdownPreviewProps {
  content: string;
  className?: string;
}
```

**Features**:
- Uses react-markdown with remark-gfm
- Custom styling for all markdown elements
- Syntax highlighting for code blocks (optional)
- Scroll sync with editor

**Styling**:
- Headings: Different sizes with bottom borders
- Lists: Proper indentation and bullets
- Tables: Bordered with alternating row colors
- Code blocks: Gray background with monospace font
- Links: Blue color with underline on hover

### 5. MarkdownToolbar Component

**Purpose**: Formatting controls for markdown

**Props**:
```typescript
interface MarkdownToolbarProps {
  onInsert: (syntax: string, wrapSelection?: boolean) => void;
  mode: 'simple' | 'full';
}
```

**Buttons (Full Mode)**:
- H1, H2, H3 (heading levels)
- Bold (Ctrl+B)
- Italic (Ctrl+I)
- Unordered list
- Ordered list
- Link
- Code block
- Table
- Blockquote

**Buttons (Simple Mode)**:
- Bold
- Italic
- Unordered list

### 6. NoteTemplate Utilities

**Purpose**: Generate consistent note templates

**Functions**:
```typescript
interface NoteTemplateData {
  lessonTitle?: string;
  lessonDate?: string;
  topicName?: string;
  level?: string;
  vocabulary?: VocabularyItem[];
}

function generateNoteTemplate(data: NoteTemplateData): string;
function generateVocabularyTable(vocabulary: VocabularyItem[]): string;
function generateClassInfoSection(classInfo: ClassInfo): string;
```

**Template Structure**:
```markdown
# [Lesson Title]

## Class Information
- **Lesson**: [Title]
- **Date**: [Date]
- **Topic**: [Topic]
- **Level**: [Level]

## Vocabulary

| Dutch | English | Example |
|-------|---------|---------|
| word1 | trans1  | example1 |
| word2 | trans2  | example2 |

## My Notes

[Your notes here...]

## Key Concepts

- 

## Questions

- 
```

### 7. NotesGrid Component

**Purpose**: Display notes in a responsive grid

**Props**:
```typescript
interface NotesGridProps {
  notes: Note[];
  onNoteClick: (noteId: string) => void;
  loading?: boolean;
}
```

**Features**:
- Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- Note cards with hover effects
- Empty state with CTA
- Loading skeleton

### 8. NoteCard Component

**Purpose**: Individual note preview card

**Props**:
```typescript
interface NoteCardProps {
  note: Note;
  onClick: () => void;
}
```

**Display**:
- Title (truncated to 2 lines)
- Content preview (first 100 characters)
- Tags as colored badges
- Last updated date
- Lesson title (if available)

## Data Models

### Note Model (Enhanced)

```typescript
interface Note {
  id: string;
  userId: string;
  lessonId: string;
  topicId: string;
  title: string;
  content: string;  // Markdown content
  tags: string[];
  classInfo?: ClassInfo;
  vocabulary?: VocabularyItem[];
  createdAt: string;
  updatedAt: string;
}
```

### Editor State

```typescript
interface EditorState {
  content: string;
  title: string;
  tags: string[];
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}
```

## Error Handling

### Auto-save Failures
- Show toast notification: "Auto-save failed. Your changes are not saved."
- Retry automatically after 5 seconds
- Provide manual save button as fallback

### Load Failures
- Display error message with retry button
- Preserve any unsaved changes in local storage
- Offer to create new note if load fails

### Network Issues
- Detect offline status
- Queue saves for when connection returns
- Show offline indicator in UI

## Testing Strategy

### Unit Tests

1. **NoteTemplate.test.ts**
   - Test template generation with various data
   - Test vocabulary table formatting
   - Test class info section generation

2. **MarkdownEditor.test.tsx**
   - Test toolbar button insertions
   - Test keyboard shortcuts
   - Test auto-save debouncing

3. **MarkdownPreview.test.tsx**
   - Test markdown rendering
   - Test various markdown syntax
   - Test custom styling application

### Integration Tests

1. **SimpleNoteEditor.integration.test.tsx**
   - Test creating new note from lesson
   - Test auto-save functionality
   - Test closing with unsaved changes

2. **FullNoteEditor.integration.test.tsx**
   - Test split-screen layout
   - Test live preview updates
   - Test saving with all metadata

3. **NotesGrid.integration.test.tsx**
   - Test note card display
   - Test navigation to editor
   - Test empty state

### E2E Tests

1. Complete note-taking workflow during lesson
2. Full-page editor workflow with all features
3. Template auto-population from lesson data
4. Responsive behavior on different screen sizes

## Performance Considerations

### Debouncing
- Auto-save: 2 second debounce
- Preview update: 200ms debounce
- Search/filter: 300ms debounce

### Optimization
- Lazy load markdown preview component
- Virtualize notes grid for large lists
- Memoize markdown rendering
- Use React.memo for toolbar buttons

### Bundle Size
- react-markdown: ~50KB
- remark-gfm: ~20KB
- Total addition: ~70KB (acceptable)

## Accessibility

- Keyboard navigation for all toolbar buttons
- ARIA labels for all controls
- Focus management when switching between editor and preview
- Screen reader announcements for auto-save status
- High contrast mode support

## Migration Strategy

### Phase 1: Create New Components
- Build SimpleNoteEditor
- Build FullNoteEditor
- Build supporting components

### Phase 2: Update Routing
- Add route for full-page editor: `/notes/:noteId/edit`
- Update ClassPlayer to use SimpleNoteEditor
- Update Notes page to use NotesGrid

### Phase 3: Deprecate Old Components
- Keep old NoteEditor as fallback
- Gradually migrate existing notes
- Remove old components after testing

## Dependencies

### New Packages
```json
{
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0"
}
```

### Installation
```bash
npm install react-markdown remark-gfm
```

## Design Decisions

### Why Markdown?
- Industry standard for note-taking
- Easy to learn and use
- Portable and future-proof
- Great for technical content

### Why Split-Screen?
- Immediate feedback on formatting
- No mode switching required
- Common pattern in markdown editors
- Better learning experience

### Why Two Modes?
- Different contexts require different UIs
- Side panel: minimal distraction during lessons
- Full editor: comprehensive features for detailed work
- Optimizes for both quick notes and deep work

### Why Auto-population?
- Reduces manual data entry
- Ensures consistency
- Saves student time
- Provides good starting structure
