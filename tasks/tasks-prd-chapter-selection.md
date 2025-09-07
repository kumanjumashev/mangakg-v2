# Task List: Chapter Selection Feature

Based on the Product Requirements Document for Chapter Selection Feature.

## Relevant Files

- `frontend/src/pages/ReaderPage.tsx` - Main reader page component that needs chapter selection integration (UPDATED)
- `frontend/src/components/ChapterSelector.tsx` - New component for chapter dropdown selector (CREATED)
- `frontend/src/components/ui/select.tsx` - shadcn/ui select component for dropdown implementation
- `frontend/src/hooks/useKeyboardNavigation.tsx` - New hook for keyboard navigation handling (CREATED)
- `frontend/src/lib/types.ts` - Type definitions for chapter data and navigation
- `frontend/src/lib/utils.ts` - Utility functions for chapter formatting and validation (UPDATED)

### Notes

- This is a frontend-only feature implementation using React TypeScript
- Uses existing shadcn/ui components and patterns from the codebase
- Integrates with existing routing and state management systems
- No backend changes required as chapter data fetching is already implemented

## Tasks

- [x] 1.0 Create Chapter Selector Component
  - [x] 1.1 Create ChapterSelector component with shadcn/ui Select
  - [x] 1.2 Implement chapter formatting logic (Vol # Chapter # Title format)
  - [x] 1.3 Add chapter status indicators (checkmarks for read chapters, highlighting for current)
  - [x] 1.4 Implement dropdown height limit (6 elements maximum)
  - [x] 1.5 Add text truncation with ellipsis for long chapter titles
  - [x] 1.6 Handle edge cases (no volume numbers, no titles)
- [x] 2.0 Implement Chapter Navigation Logic
  - [x] 2.1 Create chapter navigation utilities and helper functions
  - [x] 2.2 Implement chapter switching with URL updates
  - [x] 2.3 Add loading states and error handling for chapter transitions
  - [x] 2.4 Ensure navigation starts from page 1 of new chapter
  - [x] 2.5 Filter out unpublished/processing chapters from navigation
- [x] 3.0 Add Keyboard Shortcuts Support
  - [x] 3.1 Create useKeyboardNavigation hook for chapter shortcuts
  - [x] 3.2 Implement Ctrl+Left/Right arrow navigation
  - [x] 3.3 Handle edge cases (first/last chapter boundary behavior)
  - [x] 3.4 Ensure existing page navigation shortcuts remain functional
  - [x] 3.5 Add keyboard event cleanup and proper event handling
- [x] 4.0 Integrate Automatic Chapter Progression
  - [x] 4.1 Detect when user reaches last page of current chapter
  - [x] 4.2 Implement automatic advancement to next published chapter
  - [x] 4.3 Add redirect to details page when no next chapter available
  - [x] 4.4 Ensure smooth transition with loading indicators
  - [x] 4.5 Handle progression failures and maintain user position
- [x] 5.0 Update Reader Page Integration
  - [x] 5.1 Replace current chapter display with ChapterSelector component
  - [x] 5.2 Integrate chapter navigation with existing page navigation
  - [x] 5.3 Update reader header layout and positioning
  - [x] 5.4 Test mobile responsiveness and touch interactions
  - [x] 5.5 Ensure proper integration with existing state management
  - [x] 5.6 Update reading progress tracking for chapter switches