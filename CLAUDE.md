# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MangaKG is a manga reading application built with a React TypeScript frontend and a planned Django backend. The frontend uses Vite for development and building, with shadcn/ui components and Tailwind CSS for styling.

## Architecture

### Frontend Structure
- **Technology Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Main Framework**: Single-page application using React Router for navigation
- **State Management**: TanStack Query for server state, localStorage for theme persistence
- **Styling**: Tailwind CSS with custom manga-themed color palette
- **UI Components**: shadcn/ui component library with Radix UI primitives

### Key Directories
- `/frontend/src/pages/` - Page components (HomePage, CataloguePage, MangaDetailsPage, ReaderPage, etc.)
- `/frontend/src/components/` - Reusable components (Header, MangaCard, MangaCarousel)
- `/frontend/src/components/ui/` - shadcn/ui component library
- `/frontend/src/lib/` - Utility functions and configurations
- `/frontend/src/hooks/` - Custom React hooks
- `/frontend/src/assets/` - Static assets including manga covers

### Backend Structure
- **Technology Stack**: Django 5.0+ + PostgreSQL + Django REST Framework + Poetry + Fly.io Tigris Storage
- **Status**: Planned implementation with comprehensive requirements documented
- **Database**: Neon.tech PostgreSQL for production, SQLite for development
- **Storage**: Fly.io Tigris S3-compatible storage for manga pages and covers
- **Key Models**: Series, Chapter, Page, Author, Artist, Category, Alias with approval workflow
- **Admin Interface**: Django admin with custom file upload processing and approval system

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
poetry run python manage.py runserver     # Start Django development server
poetry run python manage.py migrate       # Run database migrations
poetry run python manage.py createsuperuser  # Create admin user
poetry run python manage.py test reader   # Run backend tests
poetry run python manage.py collectstatic # Collect static files for production
```

### Installation
```bash
# Frontend
cd frontend
npm install          # Install dependencies

# Backend (when implemented)
cd backend
poetry install                   # Install Python dependencies via Poetry
poetry run python manage.py migrate  # Set up database
```

## Code Conventions

### Styling
- Uses custom manga-themed color palette defined in `tailwind.config.ts`
- Dark mode is the default theme, managed through localStorage and CSS classes
- Custom CSS variables for manga-specific colors (manga-primary, manga-dark, etc.)

### Component Structure
- Functional components with TypeScript
- Uses React Router for navigation between pages
- TanStack Query for data fetching (currently using mock data)
- Components follow shadcn/ui patterns and conventions

### File Organization
- Page components are in `/pages/` directory
- Reusable UI components in `/components/`
- All shadcn/ui components in `/components/ui/`
- TypeScript strict mode enabled

### Backend Code Structure
- Django models in `/backend/reader/models.py` with proper constraints and relationships
- Admin interface in `/backend/reader/admin.py` with custom upload processing
- API views in `/backend/reader/views.py` using Django REST Framework
- File processing utilities in `/backend/reader/utils.py` for zip extraction and validation
- Custom validators in `/backend/reader/validators.py` for security checks

## Current State

### Frontend Status
- Frontend is fully functional with mock data
- Uses placeholder API endpoints (`/api/placeholder/300/400`) for manga covers
- Dark theme implementation with localStorage persistence
- Responsive design with mobile-first approach
- Ready for backend API integration

### Backend Status
- Django backend implemented and functional
- Core models completed: Series, Chapter, Page, Author, Artist, Category, Alias
- Admin interface with approval workflow and file upload processing
- REST API endpoints available for frontend integration
- Ready for frontend API integration

## Key Features Implemented

### Frontend Features
- Manga catalog browsing (currently with mock data)
- Manga details view (currently with mock data)
- Reading interface (currently with mock data)
- Theme switching (dark/light mode)
- Responsive navigation
- Progress tracking UI (mock data)
- Search and filtering UI (mock functionality)

### Backend Features
- Django REST API with all required endpoints
- File upload and processing system for manga chapters
- Admin interface with approval workflow
- Database models for manga content management

## Implementation Roadmap

### ✅ Phase 1-4: Backend Development (COMPLETED)
- Django project setup with Poetry dependency management
- Core database models and choice classes implemented
- File processing system with zip upload and validation
- Admin interface with approval workflow
- REST API endpoints with DRF serializers

### 🚧 Current Phase: Frontend API Integration
- Replace mock data with real backend API calls
- Implement proper error handling and loading states
- Add caching strategy with TanStack Query
- Implement search debouncing and pagination
- Add preloading for smooth manga page transitions
- Detailed requirements in `/tasks/prd-frontend-api-integration.md`

### 📋 Future Phase: Production Deployment
- Fly.io deployment configuration
- Environment variables and production settings
- Static file serving through Tigris CDN
- SSL/HTTPS and CORS configuration

## Next Steps

Priority is now on frontend API integration using the completed backend. Key tasks:

1. **API Integration Setup**
   - Configure API base URL and HTTP client
   - Set up TanStack Query for API state management
   - Create TypeScript interfaces for API responses

2. **Replace Mock Data**
   - Update HomePage to use `/api/series/` endpoint
   - Update CataloguePage with real search and filtering
   - Update MangaDetailsPage to use `/api/series/<slug>/chapters/`
   - Update ReaderPage to use `/api/chapters/<id>/pages/`

3. **Performance Optimizations**
   - Implement caching strategy with appropriate stale times
   - Add preloading for next 3 manga pages
   - Add search debouncing (300ms)
   - Handle large chapter lists with pagination

## Notes
- Project was initially created with Lovable platform
- Uses Bun lockfile (`bun.lockb`) but npm commands work fine
- ESLint configured with React and TypeScript rules
- No test framework currently configured
- Backend implementation completed and ready for integration
- Frontend API integration requirements in `/tasks/prd-frontend-api-integration.md`
- You are in YOLO mode, so after completing a task and its sub-tasks, move on to the next one without asking human intervention
- The project is simple, do not install OS packages. Just use Python/Typescript libs