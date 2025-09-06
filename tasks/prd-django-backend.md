# Product Requirements Document: Django Backend for MangaKG

## Introduction/Overview

This document outlines the requirements for developing a Django backend service that will serve as the content management system for the MangaKG manga reading platform. The backend will provide a comprehensive admin interface for manga content upload and management, along with REST API endpoints to serve the React frontend. The system will handle complex manga data structures including series metadata, chapter uploads via zip files, and automated content processing workflows.

## Goals

1. **Content Management**: Provide a robust Django admin interface for series creation and chapter upload management
2. **Automated Processing**: Implement secure zip file upload, validation, and extraction functionality 
3. **API Integration**: Serve structured manga data to the React frontend via REST API endpoints
4. **Cloud Deployment**: Deploy as a separate service on Fly.io with Tigris S3-compatible storage
5. **Security & Validation**: Implement comprehensive file validation and user permission controls
6. **Scalability**: Design for future feature expansion while maintaining clean architecture

## User Stories

### Admin User Stories
- As an admin user, I want to create new manga series with comprehensive metadata so that users can discover and read content
- As an admin user, I want to upload chapter zip files and have them automatically processed so that pages are ready for reading
- As an admin user, I want to review and approve uploaded content before it goes live so that quality is maintained
- As an admin user, I want to manage authors, artists, and categories so that series metadata is accurate and searchable

### API Consumer Stories  
- As a frontend application, I want to retrieve series lists with metadata so that I can display catalog pages
- As a frontend application, I want to access individual chapter pages so that I can render the reading interface
- As a frontend application, I want to get series details and chapter lists so that I can show manga information pages

### Content Uploader Stories
- As a content uploader, I want to upload manga chapters via zip files so that I can efficiently add new content
- As a content uploader, I want to receive feedback on upload validation so that I know if my files are properly formatted
- As a content uploader, I want to track the approval status of my uploads so that I know when content will be live

## Functional Requirements

### 1. Django Models Implementation
1.1. Implement core models: `Alias`, `Author`, `Artist`, `Series`, `Chapter`, `Page`, `Category`  
1.2. Include choice fields: `Status` (ongoing, completed, hiatus, canceled), `Kind` (manga, comic, webtoon), `Rating` (safe, suggestive, explicit)  
1.3. Support generic foreign key relationships for aliases across different models  
1.4. Implement proper model constraints and validators as defined in inspiration models
1.5. Support Volume model with auto-incrementing numbers starting from 1

### 2. File Upload and Processing
2.1. Accept single zip file uploads up to 500MB through Django admin interface (one chapter per zip file)  
2.2. Validate zip files for security threats including zip bombs and malicious structures  
2.3. Extract zip contents with validation: allow maximum 1 subfolder, discard non-image files  
2.4. Verify sequential image numbering (001.jpg, 002.png, etc.)  
2.5. Generate Page model instances for each extracted image with proper metadata  
2.6. Store processed images in Fly.io Tigris S3-compatible storage  
2.7. Delete original zip files after successful processing and admin approval  

### 3. Content Hierarchy Management
3.1. Series → Volume → Chapter → Page hierarchy implementation
3.2. Volume titles default to volume numbers (1, 2, 3, etc.)
3.3. Chapter upload workflow: Select Series → Specify Volume (existing or new) → Upload zip file
3.4. Support chapter titles (typically integers) with optional custom naming
3.5. Auto-create volumes if they don't exist during chapter upload

### 4. Admin Interface
4.1. Implement comprehensive Django admin interface based on inspiration admin.py  
4.2. Provide Series management with inline alias editing (with kind of content (manga, manhwa etc) as a field) 
4.3. Enable Chapter upload with file field and metadata (existing or new volume, chapter number, title)  
4.4. Include Page inline editing within Chapter admin with preview functionality  
4.5. Implement approval workflow for uploaded content  
4.6. Add batch actions for content management (toggle status, delete pages)
4.7. Add "Upload Chapter" action within Series admin interface

### 5. Content Approval Workflow
5.1. Mark all uploaded chapters as "pending review" by default  
5.2. Provide admin interface for reviewing pending content  
5.3. Enable approval/rejection actions with mandatory rejection reasons  
5.4. Notify content uploaders of approval status changes  
5.5. Only make approved content visible through API endpoints  

### 6. REST API Endpoints
6.1. Implement read-only API endpoints for frontend consumption  
6.2. Provide series list endpoint with filtering and search capabilities  
6.3. Create series detail endpoint including chapter lists  
6.4. Develop chapter detail endpoint with page information  
6.5. Include pagination for large datasets  
6.6. Return data in format compatible with existing frontend mock data structure
6.7. Implement rate limiting to prevent API abuse

### 7. Storage Integration
7.1. Configure Django to use Fly.io Tigris for file storage  
7.2. Implement proper file path organization: series/slug/volume/chapter/pages  
7.3. Handle image serving through CDN-compatible URLs  
7.4. Implement file cleanup procedures for rejected or deleted content  

### 8. Security and Validation
8.1. Implement zip bomb detection and prevention  
8.2. Validate file types and reject non-image content  
8.3. Implement user authentication for admin access  
8.4. Ban users who upload malicious content  
8.5. Sanitize file names and prevent directory traversal attacks  

### 9. Internationalization Support
9.1. Design models to support English and Kyrgyz languages
9.2. Implement language field for series and chapter titles
9.3. Prepare database schema for future multi-language expansion

## Non-Goals (Out of Scope)

- User authentication system for frontend readers (handled by frontend localStorage)
- Image optimization, thumbnail generation, or format conversion  
- Content versioning system in v1
- Advanced user roles beyond single admin user
- Real-time notifications or websocket connections
- Content recommendation algorithms
- Reading progress tracking on backend
- Search indexing beyond basic Django capabilities
- Mobile app API endpoints
- Payment or subscription management
- Batch/bulk series imports
- Advanced monitoring and alerting systems
- Custom backup solutions (handled by cloud providers)

## Design Considerations

### Database Schema
- Follow the proven model structure from inspiration files
- Use Neon.tech PostgreSQL as the primary database
- Implement proper indexing for performance on series and chapter queries
- Design for eventual multi-language support expansion

### API Design
- Follow RESTful conventions for endpoint structure
- Use Django REST Framework for consistent API implementation  
- Implement proper HTTP status codes and error responses
- Design URLs to match frontend routing expectations
- Include rate limiting middleware

### File Organization
- Maintain consistent directory structure: `series/{slug}/{volume}/{chapter}/`
- Use hash-based file naming to prevent conflicts and ensure uniqueness
- Implement proper MIME type detection and validation

## Technical Considerations

### Dependencies
- Django 5.0+ with PostgreSQL database support
- Django REST Framework for API implementation
- Pillow for image validation and processing
- Boto3 for S3-compatible storage integration
- Python-magic for file type detection
- Django-ratelimit for API rate limiting

### Deployment Architecture
- Deploy as separate Fly.io service from React frontend inside the `backend` directory
- Use Fly.io Tigris for object storage
- Use Neon.tech for PostgreSQL database
- Configure environment variables for storage and database credentials
- Integrate with Sentry for error tracking

### Performance Considerations
- Implement database query optimization for large manga catalogs
- Use appropriate caching strategies for API endpoints
- Design for efficient file upload processing
- Consider background task processing for heavy operations

## Success Metrics

### Technical Metrics
- Successfully process 95%+ of valid zip file uploads without manual intervention
- API response times under 200ms for catalog endpoints
- Zero security incidents related to file uploads
- 99.9% uptime for backend services

### Functional Metrics  
- Admin users can create and manage series within 5 minutes
- Chapter upload and approval workflow completes within 10 minutes
- Frontend successfully consumes all API endpoints without errors
- File storage costs remain within expected budget parameters

### User Experience Metrics
- Admin interface requires minimal training for content management
- Upload validation provides clear feedback on file issues
- Content approval workflow reduces manual review time by 50%
- API provides all data needed for frontend features without additional requests

## Resolved Open Questions

1. **Batch Operations**: Only single zip file uploading supported (one chapter per zip file). Hierarchy: Series → Volume (numbered 1, 2, 3...) → Chapter (from zip) → Pages (extracted images)
2. **Content Versioning**: No versioning in v1
3. **Analytics Integration**: Not implemented in v1  
4. **Backup Strategy**: Handled by Fly.io Tigris and Neon.tech
5. **Rate Limiting**: Yes, implement API rate limiting
6. **Content Migration**: No existing data migration needed
7. **Internationalization**: Support English and Kyrgyz languages
8. **Monitoring**: Basic Sentry integration for error tracking only

## Additional info:
Inspiration files are: `/Users/kuman/projects/mangakg/tmp_files/admin.py` and `/Users/kuman/projects/mangakg/tmp_files/models.py`.