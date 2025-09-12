"""
Custom middleware for handling health checks and storage errors.
"""

import logging
from django.http import JsonResponse
from django.core.exceptions import ImproperlyConfigured
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)


class HealthCheckMiddleware:
    """
    Middleware to handle health checks without going through Django's URL routing
    to avoid APPEND_SLASH redirects.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Handle health check directly to avoid APPEND_SLASH redirects
        if request.path in ['/api/health', '/api/health/']:
            return JsonResponse({
                'status': 'healthy', 
                'service': 'mangakg-backend',
                'path': request.path
            })
        
        response = self.get_response(request)
        return response


class StorageErrorMiddleware:
    """
    Middleware to handle storage backend errors and return appropriate API responses.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except ImproperlyConfigured as e:
            # Storage configuration error - likely Tigris is unavailable
            logger.error(f"Storage backend unavailable: {e}")
            return JsonResponse({
                'error': 'Backend Unavailable',
                'message': 'File storage is temporarily unavailable. Please try again later.',
                'code': 'STORAGE_UNAVAILABLE'
            }, status=503)
        except (ClientError, NoCredentialsError) as e:
            # Direct storage API errors
            logger.error(f"Storage API error: {e}")
            return JsonResponse({
                'error': 'Backend Unavailable', 
                'message': 'File storage is temporarily unavailable. Please try again later.',
                'code': 'STORAGE_ERROR'
            }, status=503)