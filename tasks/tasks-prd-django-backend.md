# Tasks for Django Backend Implementation

## Relevant Files

- `backend/manage.py` - Django project management script
- `backend/mangakg/settings.py` - Main Django settings configuration
- `backend/mangakg/urls.py` - Main URL routing configuration
- `backend/reader/models.py` - Core manga models (Series, Chapter, Page, etc.)
- `backend/reader/admin.py` - Django admin interface configuration
- `backend/reader/views.py` - API view handlers
- `backend/reader/serializers.py` - DRF serializers for API responses
- `backend/reader/urls.py` - Reader app URL routing
- `backend/reader/validators.py` - Custom validation functions for file uploads
- `backend/reader/storage.py` - Custom storage backend for Tigris
- `backend/reader/utils.py` - Utility functions for file processing
- `backend/reader/tests/test_models.py` - Unit tests for models
- `backend/reader/tests/test_admin.py` - Unit tests for admin interface
- `backend/reader/tests/test_views.py` - Unit tests for API views
- `backend/reader/tests/test_validators.py` - Unit tests for validators
- `backend/reader/tests/test_utils.py` - Unit tests for utility functions
- `backend/pyproject.toml` - Poetry configuration and Python dependencies
- `backend/poetry.lock` - Poetry lockfile for reproducible builds
- `backend/fly.toml` - Fly.io deployment configuration
- `backend/.env.example` - Environment variables template

### Notes

- Unit tests are placed in a `tests/` directory inside the reader app
- Use `poetry run python manage.py test reader` to run all reader app tests
- Use `poetry run python manage.py test reader.tests.test_models` to run specific test modules

## Tasks

- [ ] 1.0 Django Project Setup and Configuration
  - [ ] 1.1 Create Django project structure in backend/ directory
  - [ ] 1.2 Initialize Poetry and configure pyproject.toml with required dependencies (Django 5+, DRF, Pillow, Boto3, etc.)
  - [ ] 1.3 Configure settings.py for production with environment variables
  - [ ] 1.4 Set up Neon.tech PostgreSQL database connection
  - [ ] 1.5 Configure Fly.io Tigris S3-compatible storage backend
  - [ ] 1.6 Set up Sentry integration for error tracking
  - [ ] 1.7 Configure internationalization for English and Kyrgyz languages
  - [ ] 1.8 Create initial Django app structure (reader app)

- [ ] 2.0 Database Models Implementation
  - [ ] 2.1 Implement Status, Kind, and Rating choice classes
  - [ ] 2.2 Create Alias model with generic foreign key relationships
  - [ ] 2.3 Create Author and Artist models with alias support
  - [ ] 2.4 Create Category model with proper constraints
  - [ ] 2.5 Implement Series model with all metadata fields and relationships
  - [ ] 2.6 Create Volume model with auto-incrementing numbers
  - [ ] 2.7 Implement Chapter model with file upload and approval workflow fields
  - [ ] 2.8 Create Page model with image storage and metadata
  - [ ] 2.9 Add proper model constraints, validators, and database indexes
  - [ ] 2.10 Create and run initial database migrations

- [ ] 3.0 File Upload and Processing System
  - [ ] 3.1 Create custom validators for zip file security (zip bomb detection)
  - [ ] 3.2 Implement file type validation and MIME type checking
  - [ ] 3.3 Create zip extraction utility with single subfolder validation
  - [ ] 3.4 Implement image file validation and sequential numbering check
  - [ ] 3.5 Create file processing workflow for Chapter model save method
  - [ ] 3.6 Implement hash-based file naming for extracted images
  - [ ] 3.7 Add file cleanup procedures for rejected/deleted content
  - [ ] 3.8 Create user banning system for malicious uploads
  - [ ] 3.9 Implement file size limits and validation (500MB max)

- [ ] 4.0 Django Admin Interface Development
  - [ ] 4.1 Configure Series admin with inline alias editing and metadata fields
  - [ ] 4.2 Implement Chapter admin with file upload and approval workflow
  - [ ] 4.3 Create Page inline admin with image previews and metadata
  - [ ] 4.4 Add Author and Artist admin interfaces with alias management
  - [ ] 4.5 Configure Category admin with proper field restrictions
  - [ ] 4.6 Implement approval workflow actions (approve/reject with reasons)
  - [ ] 4.7 Add batch actions for content management (toggle status, delete pages)
  - [ ] 4.8 Create custom admin actions for "Upload Chapter" within Series
  - [ ] 4.9 Implement permission controls and user access restrictions
  - [ ] 4.10 Add admin notifications for pending content review

- [ ] 5.0 REST API Development
  - [ ] 5.1 Create DRF serializers for all models (Series, Chapter, Page, etc.)
  - [ ] 5.2 Implement series list API endpoint with filtering and search
  - [ ] 5.3 Create series detail API endpoint with chapter lists
  - [ ] 5.4 Implement chapter detail API endpoint with page information
  - [ ] 5.5 Add pagination support for large datasets
  - [ ] 5.6 Configure API URLs and routing
  - [ ] 5.7 Implement rate limiting middleware for API endpoints
  - [ ] 5.8 Ensure API responses match frontend mock data structure
  - [ ] 5.9 Add proper error handling and HTTP status codes
  - [ ] 5.10 Filter API responses to show only approved content

- [ ] 6.0 Deployment and Cloud Integration
  - [ ] 6.1 Create Fly.io configuration files (fly.toml)
  - [ ] 6.2 Configure environment variables for production deployment
  - [ ] 6.3 Set up static file serving through Tigris storage
  - [ ] 6.4 Configure database connection for Neon.tech in production
  - [ ] 6.5 Set up proper logging and monitoring integration
  - [ ] 6.6 Create deployment scripts and documentation
  - [ ] 6.7 Configure CORS settings for frontend communication
  - [ ] 6.8 Set up SSL/HTTPS configuration
  - [ ] 6.9 Test production deployment and verify all functionality
  - [ ] 6.10 Create backup and recovery procedures documentation