# Requirements Document

## Introduction

This feature enhances the note-taking system with a powerful markdown editor that provides live preview, auto-population of lesson content, and two distinct modes: a simplified side panel for quick notes during lessons and a full-page editor for comprehensive note editing.

## Requirements

### Requirement 1: Simplified Side Panel Note Editor

**User Story:** As a student, I want a simple, distraction-free note editor in the side panel during lessons, so that I can quickly jot down thoughts without losing focus on the lesson.

#### Acceptance Criteria

1. WHEN the student clicks "Take Notes" during a lesson THEN a simplified side panel SHALL appear on the right side of the screen
2. WHEN the side panel is open THEN it SHALL display only essential fields: title input and markdown content area
3. WHEN the student types in the markdown area THEN changes SHALL auto-save every 2 seconds
4. WHEN the side panel is displayed THEN it SHALL NOT show class info, vocabulary, or tag management (these are available in full editor)
5. WHEN the student closes the side panel THEN the note SHALL be saved automatically
6. WHEN the markdown area is focused THEN it SHALL provide basic markdown shortcuts (bold, italic, lists)

### Requirement 2: Full-Page Markdown Note Editor

**User Story:** As a student, I want a dedicated full-page note editor with advanced features, so that I can create comprehensive, well-structured notes with all lesson materials.

#### Acceptance Criteria

1. WHEN the student navigates to edit a note from the Notes page THEN a full-page editor SHALL be displayed
2. WHEN the full-page editor loads THEN it SHALL display a split view with markdown editor on the left and live preview on the right
3. WHEN the student types markdown THEN the preview SHALL update in real-time
4. WHEN the editor loads THEN it SHALL include a toolbar with markdown formatting buttons (headings, bold, italic, lists, links, code blocks)
5. WHEN the editor is displayed THEN it SHALL show all settings: title, tags, class info, and vocabulary sections
6. WHEN the student saves THEN the note SHALL be persisted to the backend

### Requirement 3: Auto-Population of Lesson Content

**User Story:** As a student, I want my notes to automatically include vocabulary and class information from the lesson, so that I don't have to manually copy this information.

#### Acceptance Criteria

1. WHEN a new note is created from a lesson THEN the markdown content SHALL be pre-populated with a template
2. WHEN the template is generated THEN it SHALL include a "Class Information" section with lesson title, date, topic, and level
3. WHEN the template is generated THEN it SHALL include a "Vocabulary" section with all vocabulary items from the lesson formatted as a markdown table
4. WHEN vocabulary is included THEN each entry SHALL display: Dutch word, English translation, and example sentence (if available)
5. WHEN the student edits the auto-populated content THEN they SHALL be able to modify or remove any section
6. WHEN a lesson is updated THEN existing notes SHALL NOT be automatically updated (manual sync option available)

### Requirement 4: Markdown Editor with Live Preview

**User Story:** As a student, I want to see a live preview of my markdown notes, so that I can ensure my formatting looks correct before saving.

#### Acceptance Criteria

1. WHEN the full-page editor is displayed THEN it SHALL show a split-screen layout with editor on left (50%) and preview on right (50%)
2. WHEN the student types markdown syntax THEN the preview SHALL render the formatted content within 200ms
3. WHEN markdown is rendered THEN it SHALL support: headings, bold, italic, lists, links, code blocks, tables, and blockquotes
4. WHEN the preview is displayed THEN it SHALL use consistent styling that matches the app's design system
5. WHEN the student scrolls in the editor THEN the preview SHALL sync scroll position proportionally
6. WHEN the editor is in mobile view THEN it SHALL provide a toggle to switch between edit and preview modes

### Requirement 5: Improved Notes Viewer Layout

**User Story:** As a student, I want to see my notes immediately when I visit the Notes page, so that I can quickly access my study materials.

#### Acceptance Criteria

1. WHEN the student navigates to the Notes page THEN notes SHALL be displayed immediately in a card grid layout
2. WHEN notes are displayed THEN each card SHALL show: title, preview of content (first 100 characters), tags, and last updated date
3. WHEN the student clicks on a note card THEN they SHALL be navigated to the full-page editor
4. WHEN no notes exist THEN a prominent "Create Your First Note" call-to-action SHALL be displayed
5. WHEN the page loads THEN placeholder sections for unimplemented features SHALL NOT be shown
6. WHEN filters are applied THEN only matching notes SHALL be displayed in the grid

### Requirement 6: Markdown Toolbar and Shortcuts

**User Story:** As a student, I want quick access to markdown formatting options, so that I can format my notes efficiently without memorizing syntax.

#### Acceptance Criteria

1. WHEN the markdown editor is displayed THEN a toolbar SHALL appear above the text area
2. WHEN the toolbar is displayed THEN it SHALL include buttons for: H1, H2, H3, bold, italic, list, numbered list, link, code, and table
3. WHEN the student clicks a toolbar button THEN the appropriate markdown syntax SHALL be inserted at the cursor position
4. WHEN text is selected and a toolbar button is clicked THEN the selected text SHALL be wrapped with the appropriate markdown syntax
5. WHEN the student uses keyboard shortcuts (Ctrl+B, Ctrl+I, etc.) THEN the corresponding formatting SHALL be applied
6. WHEN the toolbar is in the side panel THEN it SHALL show only essential buttons (bold, italic, list)

### Requirement 7: Note Template System

**User Story:** As a student, I want my notes to follow a consistent structure, so that I can easily find information across all my notes.

#### Acceptance Criteria

1. WHEN a new note is created THEN it SHALL use a default template with sections: Class Info, Vocabulary, My Notes, Key Concepts, Questions
2. WHEN the template is applied THEN each section SHALL be a markdown heading with placeholder text
3. WHEN the student creates a note from a lesson THEN the Class Info and Vocabulary sections SHALL be auto-populated
4. WHEN the student creates a standalone note THEN all sections SHALL contain placeholder text
5. WHEN the student edits a note THEN they SHALL be able to add, remove, or reorder sections freely
6. WHEN a note is saved THEN the template structure SHALL be preserved in the markdown content

### Requirement 8: Responsive Design for Both Modes

**User Story:** As a student, I want the note editor to work well on different screen sizes, so that I can take notes on any device.

#### Acceptance Criteria

1. WHEN the side panel is displayed on desktop THEN it SHALL occupy 50% of the screen width
2. WHEN the side panel is displayed on tablet THEN it SHALL occupy 60% of the screen width
3. WHEN the side panel is displayed on mobile THEN it SHALL occupy 100% of the screen width as a full overlay
4. WHEN the full-page editor is displayed on desktop THEN it SHALL show split view (editor + preview)
5. WHEN the full-page editor is displayed on mobile THEN it SHALL show a toggle to switch between editor and preview
6. WHEN any editor is displayed THEN all controls SHALL be touch-friendly with minimum 44px tap targets
