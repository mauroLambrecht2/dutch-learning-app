# Implementation Plan

- [x] 1. Install dependencies and setup markdown infrastructure

  - Install react-markdown and remark-gfm packages
  - Create basic markdown preview component with styling
  - Test markdown rendering with various syntax
  - _Requirements: 4.3, 4.4_

- [x] 2. Create note template utilities

  - Implement generateNoteTemplate function
  - Implement generateVocabularyTable function for markdown table format
  - Implement generateClassInfoSection function
  - Write unit tests for template generation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2_

-

- [x] 3. Build MarkdownToolbar component

  - Create toolbar component with button layout
  - Implement insert functions for each markdown syntax (headings, bold, italic, lists, links, code, tables)
  - Add keyboard shortcut handlers (Ctrl+B, Ctrl+I, etc.)
  - Create simple mode with limited buttons
  - Write unit tests for toolbar functionality

  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 4. Build MarkdownEditor component

  - Create textarea component with markdown support
  - Integrate MarkdownToolbar
  - Implement text insertion at cursor position
  - Add text wrapping for selected text
  - Handle tab key for indentation
  - Write unit tests for editor functionality
  - _Requirements: 4.1, 6.3, 6.4, 6.5_

- [x] 5. Build MarkdownPreview component

  - Create preview component using react-markdown
  - Configure remark-gfm plugin for tables and extended syntax

  - Apply custom styling for all markdown elements (headings, lists, tables, code blocks, links)
  - Implement scroll sync with editor
  - Write unit tests for preview rendering
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 6. Build SimpleNoteEditor component

  - Create side panel layout with title input and markdown editor
  - Integrate MarkdownToolbar in simple mode
  - Implement auto-save with 2-second debounce
  - Add auto-save indicator UI

  - Load existing note or generate template for new notes
  - Add close handler with auto-save
  - Write integration tests for simple editor
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 7. Build FullNoteEditor component - Layout and Structure

  - Create full-page layout with header (breadcrumb, save button)
  - Implement split-screen layout (50% editor, 50% preview)
  - Add collapsible sidebar for tags, class info, v
    ocabulary
  - Implement responsive layout (toggle for mobile)
  - _Requirements: 2.1, 2.2, 2.5, 8.4, 8.5_

- [x] 8. Build FullNoteEditor component - Functionality

  - Integrate MarkdownEditor and MarkdownPreview
  - Implement real-time preview updates

  - Add manual save button with loading state
  - Implement auto-save with debounce
  - Load existing note or generate template
  - Integrate TagManager component
  - Display class info and vocabulary (read-only)
  - Write integration tests for full editor
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 9. Build NoteCard component

  - Create card component with note prev
    iew
  - Display title (truncated to 2 lines)
  - Show content preview (first 100 characters)
  - Display tags as colored badges
  - Show last updated date
  - Add hover effects
  - Write unit tests for card component
  - _Requirements: 5.2_

- [x] 10. Build NotesGrid component

  - Create responsive grid layout (3 cols desktop, 2 tablet, 1 mobile)
  - Integrate NoteCard components
  - Add loading skeleton state
  - Create empty state with "Create Your First Note" CTA
  - Implement note click handler to navigate to full editor
  - Write integration tests for grid
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 11. Update NotesViewer page

  - Replace old layout with NotesGrid component
  - Remove placeholder sections for unimplemented features
  - Keep filter functionality (topic and tags)
  - Update navigation to use full-page editor route
  - Add "New Note" button that navigates to full editor
  - Write integration tests for updated viewer

  - _Requirements: 5.1, 5.5, 5.6_

- [x] 12. Update ClassPlayer to use SimpleNoteEditor

  - Replace old NoteEditor with SimpleNoteEditor in side panel
  - Ensure proper integration with lesson data
  - Test auto-population of template from lesson
  - Verify auto-save functionality during lesson
  - Write integration tests for lesson note-taking
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3_

- [x] 13. Add routing for full-page editor

  - Create route: /notes/:noteId/edit

  - Create route: /notes/:noteId/edit
  - Create route: /notes/new (with optional lessonId query param)
  - Implement navigation from NotesGrid to editor
  - Add breadcrumb navigation in editor
  - Handle browser back button
  - _Requirements: 2.1, 5.3_

- [ ] 14. Implement responsive design

  - Test side panel on desktop (50% width)
  - Test side panel on tablet (60% width)
  - Test side panel on mobile (100% width overlay)
  - Test full editor split-screen on desktop
  - Test full editor toggle mode on mobile
  - Ensure all touch targets are 44px minimum
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 15. Add error handling and offline support

  - Implement auto-save failure notifications
  - Add retry logic for failed saves
  - Detect offline status and show indicator
  - Queue saves for when connection returns
  - Preserve unsaved changes in local storage
  - Add manual save fallback button
  - _Requirements: All requirements (error handling)_

- [ ] 16. Implement accessibility features

  - Add keyboard navigation for toolbar
  - Add ARIA labels for all controls
  - Implement focus management between editor and preview
  - Add screen reader announcements for auto-save
  - Test with keyboard-only navigation
  - Test with screen reader
  - _Requirements: All requirements (accessibility)_

- [ ] 17. Performance optimization

  - Add debouncing for preview updates (200ms)
  - Memoize markdown rendering
  - Use React.memo for toolbar buttons
  - Lazy load preview component
  - Test performance with large notes (>10KB)
  - _Requirements: All requirements (performance)_

- [ ] 18. End-to-end testing
  - Test complete workflow: lesson → quick notes → full editor
  - Test template auto-population from lesson data
  - Test creating standalone note without lesson
  - Test editing existing note
  - Test responsive behavior on different devices
  - Test auto-save and manual save
  - _Requirements: All requirements_
