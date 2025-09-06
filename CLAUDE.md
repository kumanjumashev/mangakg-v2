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
- Comprehensive PRD completed with detailed requirements
- Task breakdown created with 100+ specific implementation tasks
- Inspiration models and admin interface analyzed from existing codebase
- Architecture planned: Django + PostgreSQL + DRF + Fly.io + Tigris Storage
- Key features designed: File upload processing, approval workflow, REST API endpoints

## Key Features Implemented
- Manga catalog browsing
- Manga details view
- Reading interface
- Theme switching (dark/light mode)
- Responsive navigation
- Progress tracking UI (mock data)
- Search and filtering UI (mock functionality)

## Implementation Roadmap

### Phase 1: Django Backend Core (Tasks 1.0-2.0)
- Django project setup with Poetry dependency management, PostgreSQL and storage configuration
- Core database models: Series, Chapter, Page, Author, Artist, Category, Alias
- Choice classes: Status (ongoing/completed/hiatus/canceled), Kind (manga/comic/webtoon), Rating (safe/suggestive/explicit)

### Phase 2: File Processing System (Task 3.0)
- Zip file upload and validation (max 500MB, security checks)
- Automated image extraction with sequential numbering verification
- Hash-based file naming and Tigris S3 storage integration
- Content approval workflow with pending/approved states

### Phase 3: Admin Interface (Task 4.0)
- Django admin with Series management and inline alias editing
- Chapter upload interface with volume/chapter organization
- Page inline editing with image previews
- Approval workflow actions and batch operations

### Phase 4: REST API Development (Task 5.0)
- DRF serializers and viewsets for all models
- API endpoints: series list/detail, chapter detail with pagination
- Rate limiting and security measures
- Frontend-compatible data structure responses

### Phase 5: Production Deployment (Task 6.0)
- Fly.io deployment configuration
- Environment variables and production settings
- Static file serving through Tigris CDN
- SSL/HTTPS and CORS configuration

## Notes
- Project was initially created with Lovable platform
- Uses Bun lockfile (`bun.lockb`) but npm commands work fine
- ESLint configured with React and TypeScript rules
- No test framework currently configured
- Backend implementation follows inspiration from `/tmp_files/models.py` and `/tmp_files/admin.py`
- Detailed requirements in `/tasks/prd-django-backend.md` and task breakdown in `/tasks/tasks-prd-django-backend.md`