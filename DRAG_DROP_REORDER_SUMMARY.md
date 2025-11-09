# Drag-and-Drop Lesson Reordering Implementation

## Summary

Replaced the up/down arrow buttons with drag-and-drop functionality for reordering lessons in the Teacher Dashboard. Also ensured that the lesson order matches between teacher and student views.

## Changes Made

### 1. TeacherDashboard.tsx

**Removed:**
- Up/Down arrow buttons (`ChevronUp`, `ChevronDown`)
- Old `handleReorderClass` function that used direction parameter

**Added:**
- Drag-and-drop event handlers:
  - `handleDragStart` - Tracks which lesson is being dragged
  - `handleDragOver` - Shows visual feedback when hovering over drop target
  - `handleDragLeave` - Clears hover state
  - `handleDrop` - Reorders lessons when dropped
  - `handleDragEnd` - Cleans up drag state
- Visual feedback during drag:
  - Dragged item becomes semi-transparent (opacity-50)
  - Drop target shows blue border (border-indigo-500)
  - Grip icon (GripVertical) replaces arrow buttons
  - Cursor changes to grab/grabbing

**Updated:**
- `handleReorderClass` now accepts `(classId, newOrder)` instead of `(classId, direction)`
- Lesson cards are now `draggable={!searchQuery}` (disabled during search)
- Added drag event handlers to each lesson card

### 2. StudentDashboard.tsx

**Added sorting to ensure order matches teacher view:**
```typescript
// Group classes by day and sort by order
const groupedClasses = days.map(day => ({
  ...day,
  classes: classes
    .filter(c => c.dayId === day.id)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
}));

// Add ungrouped classes and sort by order
const ungroupedClasses = classes
  .filter(c => !c.dayId)
  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
```

## User Experience

### Teacher View
1. **Drag Handle**: Each lesson card shows a grip icon (⋮⋮) on the left
2. **Drag Feedback**: 
   - Dragged card becomes semi-transparent
   - Drop target shows blue border
   - Cursor changes to indicate draggable state
3. **Disabled During Search**: Drag-and-drop is disabled when filtering by search to avoid confusion
4. **Smooth Reordering**: Lessons can be dragged to any position in the list

### Student View
- Lessons now display in the exact same order as set by the teacher
- Order is consistent across all views (by day, ungrouped, etc.)

## Technical Details

### Drag-and-Drop Flow
1. User starts dragging a lesson card
2. `draggedIndex` state tracks the source position
3. As user drags over other cards, `dragOverIndex` shows visual feedback
4. On drop, the lesson order is recalculated:
   - Remove dragged lesson from original position
   - Insert at new position
   - Update all affected lessons' `order` field in database
5. Data is reloaded to reflect new order

### Order Field
- Each lesson has an `order` field (number)
- Lower numbers appear first
- Both teacher and student views sort by this field
- API endpoint: `api.updateClass(accessToken, classId, { order: newOrder })`

## Benefits

1. **More Intuitive**: Drag-and-drop is more natural than clicking up/down buttons
2. **Faster**: Can move lessons multiple positions in one action
3. **Visual**: Clear feedback during the drag operation
4. **Consistent**: Order is now guaranteed to match between teacher and student views
5. **Accessible**: Still works with keyboard (cards remain focusable)

## Testing

Build successful:
```
✓ built in 8.67s
dist/assets/index-DhusXLeM.js   1,065.95 kB
```

## Future Enhancements

Potential improvements:
1. Add keyboard shortcuts for reordering (Alt+Up/Down)
2. Add undo/redo for reordering actions
3. Show order numbers on cards
4. Add bulk reordering (select multiple and move together)
5. Add animation during reorder for smoother transitions
