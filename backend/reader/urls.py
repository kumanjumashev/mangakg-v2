"""
URL configuration for the reader app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

from . import views

def root_handler(request):
    """Simple root handler to prevent 404s on health checks."""
    return JsonResponse({
        'service': 'mangakg-backend',
        'status': 'running',
        'message': 'API available at /api/'
    })

# Create a router for DRF ViewSets
router = DefaultRouter()
router.register(r'series', views.SeriesViewSet)
router.register(r'chapters', views.ChapterViewSet)
router.register(r'authors', views.AuthorViewSet)
router.register(r'artists', views.ArtistViewSet)
router.register(r'categories', views.CategoryViewSet)

app_name = 'reader'

urlpatterns = [
    # Root handler for health checks
    path('', root_handler, name='root'),
    
    # API endpoints
    path('api/', include(router.urls)),
    
    # Health check endpoint (with and without trailing slash)
    path('api/health/', views.health_check, name='health'),
    path('api/health', views.health_check, name='health-no-slash'),
    
    # Custom API endpoints
    path('api/series/<slug:slug>/chapters/', views.SeriesChaptersView.as_view(), name='series-chapters'),
    path('api/chapters/<int:chapter_id>/pages/', views.ChapterPagesView.as_view(), name='chapter-pages'),
    
    # Media serving endpoint for private S3 files
    path('media/<path:file_path>', views.serve_media_file, name='serve-media'),
    
    # Reading interface endpoints
    path('series/<slug:slug>/', views.series_detail, name='series-detail'),
    path('series/<slug:series_slug>/vol<int:volume>/ch<path:number>/', 
         views.chapter_detail, name='chapter-detail'),
    path('series/<slug:series_slug>/vol<int:volume>/ch<path:chapter_number>/page<int:page_number>/', 
         views.page_view, name='page'),
]