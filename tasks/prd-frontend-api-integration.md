# Product Requirements Document: Frontend API Integration

## Introduction/Overview

This PRD outlines the integration of the existing React TypeScript frontend with the Django backend API endpoints to replace mock data with real data. The goal is to transform the current frontend prototype into a fully functional manga reading platform that consumes the backend's REST API endpoints for displaying manga series, chapters, and reading pages.

## Goals

1. Replace all mock data in the frontend with real API calls to the Django backend
2. Implement proper error handling and loading states for all API interactions
3. Ensure seamless user experience across all devices with responsive image rendering
4. Create a robust search and filtering system using backend data
5. Maintain the existing UI/UX design patterns while adding real functionality

## User Stories

1. **As a reader, I want to browse available manga series so I can find something to read**
   - I can view all available manga series on the homepage and catalogue page
   - I can see series covers, titles, and basic metadata
   - Series data comes from the real backend API

2. **As a reader, I want to view chapter lists for a series so I can continue reading**
   - I can click on a manga series and see all available chapters
   - I can see chapter numbers, titles, and publication dates
   - Chapter data is fetched from the backend API

3. **As a reader, I want to be able to search for a specific manga series either by filtering using catalogue's filter feature or by entering a keyword in the search bar**
   - I can use the search bar to find manga by title, author, or keywords
   - I can filter manga by categories, status, and other metadata
   - Search and filter operations query the backend API

4. **As a reader, I want to read manga on any device, images must always fit in my screen's height**
   - I can read manga pages that automatically scale to my screen size
   - Images are fetched from the backend storage system
   - The reading experience is consistent across desktop, tablet, and mobile

5. **As a reader, I want to see helpful feedback when content is loading or unavailable**
   - I see appropriate loading states while API calls are in progress
   - I get a "We're cooking right now" message when the backend is unavailable
   - I receive clear error messages when something goes wrong

## Functional Requirements

1. **API Integration**
   1.1. The system must integrate with the following backend endpoints:
       - `GET /api/series/` - Fetch list of manga series
       - `GET /api/series/<slug>/` - Fetch individual series details
       - `GET /api/series/<slug>/chapters/` - Fetch chapters for a series
       - `GET /api/chapters/<id>/pages/` - Fetch pages for a chapter
       - `GET /api/authors/` - Fetch author information
       - `GET /api/categories/` - Fetch category information

   1.2. The system must handle API responses and map them to the existing component structure

   1.3. The system must replace all placeholder API calls (`/api/placeholder/`) with real backend endpoints

2. **Homepage Integration**
   2.1. The homepage must display real manga series from `/api/series/` endpoint
   2.2. The homepage must show featured/trending series using backend data
   2.3. The homepage must display recent updates using real chapter data

3. **Catalogue Page Integration**
   3.1. The catalogue must load all available series from the API
   3.2. The catalogue must implement real search functionality using backend filtering
   3.3. The catalogue must support filtering by categories, status, and other metadata
   3.4. The catalogue must handle pagination if the backend supports it

4. **Series Details Page Integration**
   4.1. The series details page must fetch series information using the slug parameter
   4.2. The page must display real chapter lists from `/api/series/<slug>/chapters/`
   4.3. The page must show actual series metadata (authors, categories, description, status)

5. **Reader Page Integration**
   5.1. The reader must fetch page data from `/api/chapters/<id>/pages/`
   5.2. The reader must display actual manga page images from the backend storage
   5.3. The reader must ensure images fit within screen height on all devices
   5.4. The reader must handle navigation between pages using real data

6. **Error Handling and Loading States**
   6.1. The system must show loading spinners during API calls
   6.2. The system must display a "We're cooking right now" page when the backend is unavailable
   6.3. The system must handle API errors gracefully with appropriate user messages
   6.4. The system must provide fallback behavior for missing data

7. **Search and Filtering**
   7.1. The search functionality must query the backend API with user input
   7.2. Filters must use real category and metadata from the backend
   7.3. Search results must be displayed in real-time or with minimal delay

## Non-Goals (Out of Scope)

1. **Static Site Generation** - The application will remain a client-side rendered SPA
2. **Server-Side Rendering (SSR)** - No SSR implementation in this version
3. **SEO Optimization** - Meta tags and SEO features are not included
4. **Image Optimization** - No client-side image processing or optimization
5. **Authentication System** - No user login or authentication features
6. **User Profiles** - No user account management or reading history
7. **Offline Reading** - No offline capabilities or PWA features
8. **Data Transformation** - No complex data mapping between API and frontend (v1)

## Design Considerations

1. **Maintain Existing UI/UX** - Keep all current design patterns, colors, and layouts unchanged
2. **Responsive Design** - Ensure API integration doesn't break mobile responsiveness
3. **Loading States** - Add appropriate loading indicators that match the existing design theme
4. **Error Pages** - Create error states that follow the current dark theme and styling patterns
5. **Image Display** - Ensure manga page images maintain aspect ratio and fit screen height

## Technical Considerations

1. **API Base URL** - Configure a base URL for API calls that can be easily changed for different environments
2. **HTTP Client** - Use a consistent HTTP client (fetch or axios) throughout the application
3. **Error Boundaries** - Implement React error boundaries to catch and handle component errors
4. **State Management** - Use TanStack Query (React Query) for API state management as mentioned in CLAUDE.md
5. **Type Safety** - Ensure all API responses have proper TypeScript interfaces
6. **CORS** - Backend must be configured to allow frontend domain for API calls

## Success Metrics

1. **Functionality** - All pages successfully load real data from backend APIs
2. **Performance** - API calls complete within reasonable time limits (< 3 seconds for initial load)
3. **Error Handling** - Zero unhandled API errors that break the user interface
4. **Search Accuracy** - Search functionality returns relevant results from backend data
5. **Mobile Compatibility** - Manga reading experience works properly on mobile devices
6. **Data Consistency** - All displayed data accurately reflects backend content

## Implementation Decisions

### Caching Strategy
- **Solution**: Implement browser-based caching using TanStack Query's built-in caching with appropriate stale times
  - Series list: 5 minutes stale time
  - Series details: 10 minutes stale time  
  - Chapter pages: 30 minutes stale time (images rarely change)
- **Preloading**: Implement preloading of the next 3 manga pages when a user is reading to ensure smooth page transitions
  - Use `queryClient.prefetchQuery()` to load upcoming pages in the background
  - Implement based on user's reading direction preference

### Partial API Failure Handling
- **Solution**: Implement graceful degradation without overengineering
  - If series loads but chapters fail: Show series info with "Chapters unavailable" message
  - If chapter list loads but individual pages fail: Show chapter list with error indicators
  - Use React Query's `isError` and `error` states to display appropriate fallback content
  - Provide "Retry" buttons for failed sections

### Search Debouncing
- **Implementation**: Use 300ms debouncing for search input to reduce API calls
- **Library**: Use `useDebouncedValue` hook or implement custom debouncing
- **UX**: Show loading indicator during debounce period

### Large Manga Series (Hundreds of Chapters)
- **Pagination**: Implement client-side pagination for chapter lists (50 chapters per page)
- **Best Practice**: Load chapters in batches and implement "Load More" button

### Analytics and Tracking
- **Decision**: Not implemented in this version as requested

### Retry Logic
- **Minimal Implementation**: 
  - Use TanStack Query's built-in retry (3 attempts with exponential backoff)
  - Add manual "Retry" buttons on error pages
  - No complex retry logic or custom retry strategies