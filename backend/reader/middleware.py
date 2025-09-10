"""
Custom middleware for handling health checks.
"""

from django.http import JsonResponse


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