# Product Requirements Document: Chapter Selection Feature

## Introduction/Overview

This feature adds chapter selection and navigation capabilities to the manga reader interface. Users will be able to select any chapter from a dropdown in the reader header and automatically advance to the next chapter when reaching the end of the current chapter. The feature enhances the reading experience by providing seamless chapter-to-chapter navigation without leaving the reader interface.

## Goals

1. Enable users to quickly jump to any chapter while reading
2. Provide automatic chapter progression when reaching the end of a chapter
3. Maintain reading flow with keyboard shortcuts for chapter navigation
4. Display clear visual indicators of reading progress across chapters
5. Ensure seamless integration with existing reader interface

## User Stories

- **As a manga reader**, I want to select any chapter from a dropdown so that I can quickly jump to a specific chapter without going back to the details page
- **As a manga reader**, I want to automatically advance to the next chapter when I reach the last page so that I can continue reading without interruption
- **As a manga reader**, I want to use keyboard shortcuts (Ctrl + Left/Right) to navigate between chapters so that I can quickly move between chapters while reading
- **As a manga reader**, I want to see which chapters I've already read so that I can track my progress through the series
- **As a manga reader**, I want the current chapter to be clearly highlighted in the dropdown so that I know which chapter I'm currently reading
- **As a manga reader**, I want to be redirected to the details page when I try to go beyond the last available chapter so that I can see series information or find more chapters

## Functional Requirements

1. **Chapter Dropdown Selector**
   - The system must display a chapter dropdown in the reader header, replacing the current chapter display
   - The dropdown must show all available/published chapters in the series (exclude chapters being uploaded/processed)
   - The dropdown must display a maximum of 6 elements at once, matching the page selector behavior
   - Each chapter entry must display: "Vol [#] Chapter [#] [Title]" format
   - For series without volume numbers, display: "Chapter [#] [Title]"
   - For chapters without titles, display: "Vol [#] Chapter [#]" or "Chapter [#]"
   - Chapter titles that exceed dropdown width must be truncated with ellipsis
   - The dropdown must be positioned in the top header area (not replacing the bottom page selector)

2. **Chapter Status Indicators**
   - All chapters before the current chapter must display a checkmark (✓) at the end
   - The current chapter must be visually highlighted (different text color)
   - Unread chapters must display with default styling

3. **Automatic Chapter Progression**
   - When a user reaches the last page of a chapter and navigates to the next page, the system must automatically advance to the first page of the next published chapter
   - If the user is on the last published chapter and tries to advance, the system must redirect to the manga details page
   - The system must not advance to chapters that are being uploaded/processed
   - Chapter transitions must include a loading indicator while the new chapter loads

4. **Keyboard Navigation**
   - Ctrl + Left Arrow must navigate to the previous chapter (first page)
   - Ctrl + Right Arrow must navigate to the next chapter (first page)
   - If user is on the first chapter and presses Ctrl + Left Arrow, nothing must happen
   - If user is on the last chapter and presses Ctrl + Right Arrow, the system must redirect to the details page
   - Existing Left/Right arrow keys must continue to work for page navigation
   - Clicking on the page must have the same effect as the Right arrow key

5. **URL and State Management**
   - The URL must update when switching chapters to maintain deep linking
   - Each chapter switch must start from page 1 of the new chapter
   - Reading progress must update using existing progress tracking mechanism

6. **Loading and Error Handling**
   - Display loading indicator during chapter transitions
   - Handle cases where chapter data fails to load
   - Maintain user's current position if chapter switch fails

## Non-Goals (Out of Scope)

- Remembering reading position within individual chapters when switching away
- Integration with bookmarking or advanced progress tracking features
- Chapter thumbnails or preview images in the dropdown
- Batch chapter downloads or preloading
- Chapter comments or ratings display
- Custom keyboard shortcut configuration

## Design Considerations

- Follow existing manga reader header design patterns
- Use consistent styling with current dropdown components in the application
- Ensure dropdown is accessible on mobile devices with touch interaction
- Maintain visual hierarchy with existing reader interface elements
- Use existing color palette for chapter status indicators (checkmarks, highlighting)

## Technical Considerations

- Integrate with existing chapter data fetching mechanisms
- Leverage current routing system for URL updates
- Use existing keyboard event handling patterns
- Ensure compatibility with existing page navigation logic
- Consider performance impact of loading chapter lists for series with many chapters

## Success Metrics

- Users can successfully navigate between chapters using both dropdown and keyboard shortcuts
- Automatic chapter progression works seamlessly for 100% of chapter transitions
- Chapter selection reduces user navigation to manga details page by 40%
- No increase in chapter loading errors or failures
- Keyboard shortcuts are discoverable and used by power users

## Resolved Questions

1. **Maximum dropdown height**: 6 elements maximum, matching page selector behavior
2. **Chapter grouping by volume**: Not required for v1
3. **Search/filter option**: Not required for v1  
4. **Chapters being uploaded/processed**: Exclude from dropdown and prevent automatic advancement to them
5. **Analytics tracking**: Not required for v1