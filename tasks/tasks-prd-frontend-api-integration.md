# Tasks: Frontend API Integration

## Relevant Files

- `frontend/src/lib/api.ts` - API client configuration with base URL setup, error handling, and timeout management
- `frontend/src/lib/types.ts` - Comprehensive TypeScript interfaces for all API responses and data models
- `frontend/src/hooks/useApi.ts` - Custom hooks for API calls using TanStack Query with caching and pagination
- `frontend/src/pages/HomePage.tsx` - Homepage component fully integrated with real backend API for featured and recent series
- `frontend/src/pages/CataloguePage.tsx` - Complete catalogue page with search, filtering, and pagination using real data
- `frontend/src/pages/MangaDetailsPage.tsx` - Series details page with real metadata, chapters list, and navigation
- `frontend/src/pages/ReaderPage.tsx` - Manga reader with chapter pages, keyboard controls, and performance optimizations
- `frontend/src/components/MangaCard.tsx` - Updated component supporting both legacy and new Series data structure
- `frontend/src/components/MangaCarousel.tsx` - Enhanced carousel with loading states, error handling, and real data
- `frontend/src/components/ui/loading-spinner.tsx` - Reusable loading state components with different sizes and messages
- `frontend/src/components/ui/error-page.tsx` - Error handling components including "cooking page" for server errors
- `frontend/src/lib/utils/debounce.ts` - Search debouncing utility with React hook for optimized search performance
- `frontend/src/App.tsx` - Updated with enhanced TanStack Query configuration and better error handling
- `frontend/.env.local` - Environment configuration for API base URL
- `frontend/.env.example` - Example environment file documenting required variables

## Tasks

- [x] 1.0 Set up API Infrastructure and Configuration
  - [x] 1.1 Create API client configuration with base URL in `frontend/src/lib/api.ts`
  - [x] 1.2 Define TypeScript interfaces for all API responses in `frontend/src/lib/types.ts`
  - [x] 1.3 Set up TanStack Query client configuration with proper defaults
  - [x] 1.4 Configure CORS handling and error response types

- [x] 2.0 Implement Core API Integration Services
  - [x] 2.1 Create custom hooks for series operations (`useSeriesList`, `useSeriesDetail`)
  - [x] 2.2 Create custom hooks for chapter operations (`useChaptersList`, `useChapterPages`)
  - [x] 2.3 Create custom hooks for search and filtering (`useSeriesSearch`, `useCategories`)
  - [x] 2.4 Implement pagination handling for all paginated endpoints
  - [x] 2.5 Add proper caching configuration (5min series list, 10min details, 30min pages)

- [x] 3.0 Update Homepage with Real Backend Data
  - [x] 3.1 Replace mock data calls in HomePage component with `useSeriesList` hook
  - [x] 3.2 Update MangaCarousel component to handle real series data structure
  - [x] 3.3 Implement featured/trending series section using backend data
  - [x] 3.4 Add recent updates section using real chapter data with pagination
  - [x] 3.5 Update MangaCard component to display real series metadata

- [x] 4.0 Integrate Catalogue Page with Search and Filtering
  - [x] 4.1 Replace mock catalogue data with paginated series list API
  - [x] 4.2 Implement search functionality with 300ms debouncing
  - [x] 4.3 Add category filtering using real categories from backend
  - [x] 4.4 Implement status and metadata filtering options
  - [x] 4.5 Add pagination controls for large series collections
  - [x] 4.6 Handle empty search results and no-data states

- [x] 5.0 Connect Series Details and Reader Pages to Backend
  - [x] 5.1 Update MangaDetailsPage to fetch series data using slug parameter
  - [x] 5.2 Implement chapter list loading with pagination for large series
  - [x] 5.3 Display real series metadata (authors, categories, description, status)
  - [x] 5.4 Update ReaderPage to fetch chapter pages from backend API
  - [x] 5.5 Ensure manga page images fit screen height on all devices
  - [x] 5.6 Implement proper navigation between pages using real data

- [x] 6.0 Add Error Handling and Loading States
  - [x] 6.1 Create loading spinner component for API calls
  - [x] 6.2 Create "We're cooking right now" page for backend unavailability
  - [x] 6.3 Implement graceful error handling with appropriate user messages
  - [x] 6.4 Add retry buttons for failed API calls
  - [x] 6.5 Handle partial failures (series loads but chapters fail)
  - [x] 6.6 Add fallback behavior for missing data

- [x] 7.0 Implement Performance Optimizations
  - [x] 7.1 Add preloading for next 3 manga pages during reading
  - [x] 7.2 Implement search debouncing utility function
  - [x] 7.3 Configure TanStack Query retry logic (3 attempts with exponential backoff)
  - [x] 7.4 Add client-side pagination for chapter lists (50 chapters per page)
  - [x] 7.5 Optimize image loading and caching strategies
  - [x] 7.6 Test and validate performance across different devices