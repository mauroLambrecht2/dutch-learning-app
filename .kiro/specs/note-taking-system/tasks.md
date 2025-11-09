# Implementation Plan

- [x] 1. Create type definitions for notes system

  - Create `src/types/notes.ts` with Note, ClassInfo, VocabularyItem, NoteTag, NoteSearchResult, and NotesExportOptions interfaces
  - Export all types from `src/types/index.ts`
  - _Requirements: 1.1, 1.3, 2.1, 3.2, 4.1, 5.2, 6.2, 7.2_

- [x] 2. Add notes API functions to API layer

  - Add `getNotes()`, `getNote()`, `createNote()`, `updateNote()`, `deleteNote()` functions to `src/utils/api.ts`
  - Add `searchNotes()` function for search functionality

  - Add `getNoteTags()`, `createNoteTag()`, `deleteNoteTag()` functions for tag management
  - Add `exportNotesToPDF()` function for PDF export
  - _Requirements: 1.1, 1.5, 3.1, 3.2, 4.1, 4.2, 7.1, 7.2_

- [x] 3. Implement backend notes CRUD endpoints

  - [x] 3.1 Create GET /notes endpoint with filtering support

    - Extract user from JWT token
    - Parse query parameters for topicId, lessonId, and tags filters
    - Fetch notes from KV store using key pattern `notes:{userId}:{noteId}`
    - Apply filters to results
    - Return filtered notes array
    - _Requirements: 1.4, 2.2, 2.3, 8.3_

  - [x] 3.2 Create GET /notes/:noteId endpoint

    - Extract user from JWT token
    - Fetch specific note from KV store
    - Verify user owns the note
    - Return note or 403 error
    - _Requirements: 1.4_

  - [x] 3.3 Create POST /notes endpoint with auto-extraction

    - Extract user from JWT token
    - Parse request body (lessonId, topicId, title, content, tags)
    - Fetch lesson data to extract class info (title, date, topic, level, series)
    - Fetch lesson vocabulary items
    - Generate unique note ID
    - Create Note object with manual content and auto-extracted data
    - Store in KV store at `notes:{userId}:{noteId}`
    - Update indexes: `note-index:{userId}:by-topic:{topicId}`, `note-index:{userId}:by-lesson:{lessonId}`
    - Return created note

    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

  - [x] 3.4 Create PATCH /notes/:noteId endpoint

    - Extract user from JWT token
    - Fetch existing note from KV store
    - Verify user owns the note
    - Apply updates to content, tags, or title
    - Update `updatedAt` and `lastEditedAt` timestamps
    - Store updated note in KV store
    - Update tag indexes if tags changed

    - Return updated note
    - _Requirements: 1.2, 3.2, 3.4_

  - [x] 3.5 Create DELETE /notes/:noteId endpoint
    - Extract user from JWT token
    - Fetch note to verify ownership
    - Delete note from KV store
    - Remove from all indexes (topic, lesson, tag)
    - Return success response
    - _Requirements: 1.1_

- [x] 4. Implement backend search endpoint

  - Create GET /notes/search endpoint
  - Extract user from JWT token
  - Parse search query and optional filters (topicId, tags)
  - Fetch all user notes from KV store
  - Filter notes by search query (case-insensitive content matching)
  - Apply additional filters if provided
  - Generate highlighted snippets showing matched content
  - Return NoteSearchResult array with matched notes and snippets

  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 5. Implement backend tag management endpoints

  - [x] 5.1 Create GET /notes/tags endpoint

    - Extract user from JWT token
    - Fetch tags from KV store at `note-tags:{userId}`
    - Return tags array
    - _Requirements: 3.1, 3.3_

  - [x] 5.2 Create POST /notes/tags endpoint

    - Extract user from JWT token
    - Parse request body (name, color)
    - Generate unique tag ID
    - Create NoteTag object
    - Store in KV store at `note-tags:{userId}`
    - Return created tag
    - _Requirements: 3.1, 3.2_

  - [x] 5.3 Create DELETE /notes/tags/:tagId endpoint
    - Extract user from JWT token
    - Verify tag ownership
    - Remove tag from all notes that use it
    - Delete tag from KV store
    - Update tag indexes
    - Return success response
    - _Requirements: 3.4_


- [x] 6. Create NoteEditor component



  - Create `src/components/notes/NoteEditor.tsx` component
  - Accept props: accessToken, noteId (optional), lessonId, topicId, onSave, onCancel
  - Implement textarea for manual note content with auto-save (1-second debounce)
  - Display auto-extracted class info section (read-only)
  - Display auto-extracted vocabulary section (read-only)
  - Integrate TagManager component for tag selection


  - Implement save handler that calls `api.createNote()` or `api.updateNote()`
  - Add cancel button that calls onCancel prop
  - Show loading state during save operations
  - Display error messages using toast notifications
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 5.3, 5.4, 6.3_



- [ ] 7. Create TagManager component

  - Create `src/components/notes/TagManager.tsx` component
  - Accept props: accessToken, userId, selectedTags, onTagsChange
  - Fetch available tags using `api.getNoteTags()`
  - Display tags as color-coded badges
  - Implement tag selection/deselection with checkboxes
  - Add "Create New Tag" button with dialog
  - Implement tag creation form with name and color picker
  - Call `api.createNoteTag()` when creating new tag




  - Update selectedTags via onTagsChange callback
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 8. Create NotesViewer component

  - Create `src/components/notes/NotesViewer.tsx` component
  - Accept props: accessToken, userId
  - Fetch notes using `api.getNotes()` on mount
  - Group notes by topic for display
  - Implement topic filter dropdown
  - Implement tag filter with multi-select
  - Display notes in card layout with title, preview, and metadata




  - Add "New Note" button that opens NoteEditor
  - Add "Edit" button on each note card that opens NoteEditor
  - Add "Delete" button on each note card with confirmation dialog
  - Integrate NotesSearch component
  - Integrate NotesExport component
  - _Requirements: 1.1, 1.4, 2.2, 2.3, 2.5, 3.3, 3.5, 8.1, 8.3, 8.5_

- [ ] 9. Create NotesSearch component

  - Create `src/components/notes/NotesSearch.tsx` component


  - Accept props: accessToken, userId, onResultSelect
  - Implement search input with debounced search (500ms)
  - Add topic filter dropdown
  - Add tag filter multi-select
  - Call `api.searchNotes()` with query and filters
  - Display search results with highlighted snippets
  - Implement result click handler that calls onResultSelect
  - Show "No results" message when search returns empty
  - Add "Clear search" button to reset filters
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 10. Create NotesExport component

  - Create `src/components/notes/NotesExport.tsx` component




  - Accept props: accessToken, userId, options, onComplete
  - Install jspdf package: `npm install jspdf`
  - Implement PDF generation function using jsPDF library
  - Fetch notes based on export scope (single, topic, or all)
  - Generate PDF with title, formatted notes, class info, and vocabulary



  - Apply consistent styling and page breaks
  - Add checkboxes for includeVocabulary and includeClassInfo options
  - Implement export button that triggers PDF generation
  - Show progress indicator during generation
  - Trigger automatic download of generated PDF
  - Call onComplete callback after successful export
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_



- [ ] 11. Integrate notes into StudentDashboard

  - Open `src/components/StudentDashboard.tsx`
  - Import NotesViewer component
  - Add "Notes" tab to existing TabsList
  - Add TabsContent for "notes" value with NotesViewer component
  - Pass accessToken and userId props to NotesViewer
  - _Requirements: 1.1, 2.2, 8.5_





- [ ] 12. Add note-taking button to ClassPlayer

  - Open `src/components/ClassPlayer.tsx`
  - Import NoteEditor component
  - Add state for showing note editor modal
  - Add "Take Notes" button to lesson interface



  - Implement button click handler that opens NoteEditor in dialog
  - Pass lessonId and topicId to NoteEditor
  - Handle note save by closing dialog and showing success toast
  - _Requirements: 1.1, 1.3_

- [ ] 13. Auto-create note template on lesson completion

  - Open `src/components/ClassPlayer.tsx`


  - Modify handleClassComplete function

  - After saving progress, call `api.createNote()` with empty content
  - Set note title to "Notes: {lessonTitle}"
  - Pass lessonId and topicId from classData
  - Handle errors silently (don't block lesson completion)
  - _Requirements: 1.1, 1.3, 2.1, 2.4_

- [x] 14. Write unit tests for NoteEditor component





  - Create `src/components/notes/__tests__/NoteEditor.test.tsx`
  - Write test for auto-save functionality with debounce
  - Write test for displaying auto-extracted class info
  - Write test for displaying auto-extracted vocabulary
  - Write test for tag addition and removal
  - Write test for save and cancel handlers



  - Mock API calls using vitest
  - _Requirements: 1.2, 3.1, 5.3, 6.3_

- [ ] 15. Write unit tests for NotesSearch component

  - Create `src/components/notes/__tests__/NotesSearch.test.tsx`
  - Write test for filtering notes by search query



  - Write test for highlighting search terms in results
  - Write test for filtering by tags
  - Write test for filtering by topics
  - Write test for "No results" message display
  - Mock API calls using vitest
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_





- [ ] 16. Write integration tests for NotesViewer

  - Create `src/components/notes/__tests__/NotesViewer.integration.test.tsx`
  - Write test for loading and displaying notes grouped by topic
  - Write test for creating new note and updating list
  - Write test for editing existing note
  - Write test for deleting note with confirmation
  - Write test for filtering by topic and tags
  - Mock API calls using vitest
  - _Requirements: 1.1, 1.4, 2.2, 2.3, 3.3_

- [ ] 17. Write backend tests for notes endpoints

  - Create test file for notes API endpoints
  - Write test for POST /notes with auto-extraction of class info and vocabulary
  - Write test for GET /notes with filtering by topic, lesson, and tags
  - Write test for PATCH /notes updating content and tags
  - Write test for DELETE /notes and index cleanup
  - Write test for GET /notes/search with query and filters
  - Write test for authorization (users can only access their own notes)
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 4.1, 5.1, 5.2, 6.1_

- [ ] 18. Add error handling and loading states

  - Add try-catch blocks to all API calls in components
  - Display user-friendly error messages using toast notifications
  - Add loading spinners during data fetching
  - Add loading state during PDF generation
  - Handle network errors gracefully
  - Add retry logic for failed operations
  - _Requirements: 1.1, 1.2, 4.1, 7.1_

- [ ] 19. Implement note synchronization for lesson updates

  - Create backend function to update notes when lesson data changes
  - Listen for lesson update events
  - Fetch all notes associated with the lesson
  - Update classInfo and vocabulary sections in each note
  - Update `updatedAt` timestamp
  - Store updated notes in KV store
  - _Requirements: 5.5, 6.4_

- [ ] 20. Add styling and responsive design

  - Style NotesViewer with card layout and topic grouping
  - Style NoteEditor with clear sections for manual notes, class info, and vocabulary
  - Style NotesSearch with prominent search bar and filter options
  - Style TagManager with color-coded tag badges
  - Ensure all components are responsive for mobile and tablet
  - Use existing Tailwind CSS classes and Radix UI components
  - Add icons from lucide-react for visual clarity
  - _Requirements: 1.1, 2.2, 3.3, 4.2, 7.6_
