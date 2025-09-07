"""
Views for the MangaKG reader app.
"""

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Q, Count, Prefetch
from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Series, Chapter, Page, Author, Artist, Category, ApprovalStatus
from .serializers import (
    SeriesListSerializer, SeriesDetailSerializer,
    ChapterListSerializer, ChapterDetailSerializer,
    PageSerializer, AuthorSerializer, ArtistSerializer, CategorySerializer
)


@api_view(['GET'])
def health_check(request):
    """Health check endpoint for deployment monitoring."""
    return Response({'status': 'healthy', 'service': 'mangakg-backend'})


class SeriesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Series model providing list and detail views.
    Supports filtering, searching, and pagination.
    """
    queryset = Series.objects.prefetch_related(
        'authors', 'artists', 'categories', 'aliases',
        Prefetch('chapters', queryset=Chapter.objects.filter(approval_status=ApprovalStatus.APPROVED))
    ).select_related()
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'kind', 'rating', 'licensed', 'categories', 'authors', 'artists']
    search_fields = ['title', 'description', 'authors__name', 'artists__name', 'aliases__name']
    ordering_fields = ['title', 'updated_at', 'created_at']
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve':
            return SeriesDetailSerializer
        return SeriesListSerializer
    
    def get_queryset(self):
        """Filter queryset to only include series with approved chapters."""
        queryset = super().get_queryset()
        
        # Filter by categories if specified
        categories = self.request.query_params.get('categories')
        if categories:
            category_list = categories.split(',')
            queryset = queryset.filter(categories__id__in=category_list).distinct()
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        """Get chapters for a specific series."""
        series = self.get_object()
        chapters = series.chapters.filter(approval_status=ApprovalStatus.APPROVED).order_by(
            'volume__number', 'number'
        ).select_related('volume')
        
        serializer = ChapterListSerializer(chapters, many=True, context={'request': request})
        return Response(serializer.data)


class ChapterViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Chapter model providing list and detail views.
    Only shows approved chapters.
    """
    queryset = Chapter.objects.filter(
        approval_status=ApprovalStatus.APPROVED
    ).select_related('series', 'volume').prefetch_related('pages')
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['series', 'volume', 'is_final']
    ordering_fields = ['published_at', 'number']
    ordering = ['-published_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve':
            return ChapterDetailSerializer
        return ChapterListSerializer
    
    @action(detail=True, methods=['get'])
    def pages(self, request, pk=None):
        """Get pages for a specific chapter."""
        chapter = self.get_object()
        pages = chapter.pages.all().order_by('number')
        
        serializer = PageSerializer(pages, many=True, context={'request': request})
        return Response(serializer.data)


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Author model."""
    queryset = Author.objects.prefetch_related('aliases').all()
    serializer_class = AuthorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'aliases__name']
    ordering = ['name']


class ArtistViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Artist model."""
    queryset = Artist.objects.prefetch_related('aliases').all()
    serializer_class = ArtistSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'aliases__name']
    ordering = ['name']


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Category model."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']


class SeriesChaptersView(APIView):
    """
    Custom view to get chapters for a specific series by slug.
    """
    
    def get(self, request, slug):
        """Get chapters for a series."""
        series = get_object_or_404(Series, slug=slug)
        chapters = series.chapters.filter(
            approval_status=ApprovalStatus.APPROVED
        ).select_related('volume').order_by('volume__number', 'number')
        
        serializer = ChapterListSerializer(chapters, many=True, context={'request': request})
        return Response(serializer.data)


class ChapterPagesView(APIView):
    """
    Custom view to get pages for a specific chapter.
    """
    
    def get(self, request, chapter_id):
        """Get pages for a chapter."""
        chapter = get_object_or_404(
            Chapter, 
            id=chapter_id, 
            approval_status=ApprovalStatus.APPROVED
        )
        pages = chapter.pages.all().order_by('number')
        
        serializer = PageSerializer(pages, many=True, context={'request': request})
        return Response(serializer.data)


# Traditional Django views for HTML responses
def series_detail(request, slug):
    """Display series detail page."""
    series = get_object_or_404(
        Series.objects.prefetch_related(
            'authors', 'artists', 'categories',
            Prefetch('chapters', queryset=Chapter.objects.filter(approval_status=ApprovalStatus.APPROVED))
        ),
        slug=slug
    )
    
    context = {
        'series': series,
        'chapters': series.chapters.filter(approval_status=ApprovalStatus.APPROVED).order_by('volume__number', 'number')
    }
    return render(request, 'reader/series_detail.html', context)


def chapter_detail(request, series_slug, volume, number):
    """Display chapter reading interface."""
    series = get_object_or_404(Series, slug=series_slug)
    
    # Handle volume being 0 (no volume)
    if volume == 0:
        chapter = get_object_or_404(
            Chapter,
            series=series,
            volume__isnull=True,
            number=float(number),
            approval_status=ApprovalStatus.APPROVED
        )
    else:
        chapter = get_object_or_404(
            Chapter,
            series=series,
            volume__number=volume,
            number=float(number),
            approval_status=ApprovalStatus.APPROVED
        )
    
    pages = chapter.pages.all().order_by('number')
    
    # Get previous and next chapters
    chapters = series.chapters.filter(approval_status=ApprovalStatus.APPROVED).order_by('volume__number', 'number')
    chapter_list = list(chapters)
    current_index = next((i for i, ch in enumerate(chapter_list) if ch.id == chapter.id), None)
    
    prev_chapter = chapter_list[current_index - 1] if current_index and current_index > 0 else None
    next_chapter = chapter_list[current_index + 1] if current_index is not None and current_index < len(chapter_list) - 1 else None
    
    context = {
        'series': series,
        'chapter': chapter,
        'pages': pages,
        'prev_chapter': prev_chapter,
        'next_chapter': next_chapter
    }
    return render(request, 'reader/chapter_detail.html', context)


def page_view(request, series_slug, volume, chapter_number, page_number):
    """Display individual page view."""
    series = get_object_or_404(Series, slug=series_slug)
    
    # Handle volume being 0 (no volume)
    if volume == 0:
        chapter = get_object_or_404(
            Chapter,
            series=series,
            volume__isnull=True,
            number=float(chapter_number),
            approval_status=ApprovalStatus.APPROVED
        )
    else:
        chapter = get_object_or_404(
            Chapter,
            series=series,
            volume__number=volume,
            number=float(chapter_number),
            approval_status=ApprovalStatus.APPROVED
        )
    
    page = get_object_or_404(Page, chapter=chapter, number=page_number)
    pages = chapter.pages.all().order_by('number')
    
    # Get previous and next pages
    page_list = list(pages)
    current_index = next((i for i, p in enumerate(page_list) if p.id == page.id), None)
    
    prev_page = page_list[current_index - 1] if current_index and current_index > 0 else None
    next_page = page_list[current_index + 1] if current_index is not None and current_index < len(page_list) - 1 else None
    
    context = {
        'series': series,
        'chapter': chapter,
        'page': page,
        'pages': pages,
        'prev_page': prev_page,
        'next_page': next_page
    }
    return render(request, 'reader/page_detail.html', context)