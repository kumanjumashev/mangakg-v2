"""
Django admin configuration for the MangaKG reader app.
"""

from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.contrib.admin import SimpleListFilter

from .models import (
    Series, Chapter, Page, Volume, Author, Artist, Category, Alias,
    ApprovalStatus
)


class AliasInline(GenericTabularInline):
    """Inline admin for aliases."""
    model = Alias
    extra = 1
    fields = ['name']


class ApprovalStatusFilter(SimpleListFilter):
    """Filter for chapter approval status."""
    title = 'Approval Status'
    parameter_name = 'approval_status'

    def lookups(self, request, model_admin):
        return ApprovalStatus.choices

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(approval_status=self.value())
        return queryset


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    """Admin interface for Author model."""
    list_display = ['name', 'created_at', 'series_count']
    list_filter = ['created_at']
    search_fields = ['name', 'aliases__name']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    inlines = [AliasInline]
    
    def series_count(self, obj):
        """Display number of series for this author."""
        return obj.series.count()
    series_count.short_description = 'Series Count'


@admin.register(Artist) 
class ArtistAdmin(admin.ModelAdmin):
    """Admin interface for Artist model."""
    list_display = ['name', 'created_at', 'series_count']
    list_filter = ['created_at']
    search_fields = ['name', 'aliases__name']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    inlines = [AliasInline]
    
    def series_count(self, obj):
        """Display number of series for this artist."""
        return obj.series.count()
    series_count.short_description = 'Series Count'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    list_display = ['name', 'id', 'created_at', 'series_count']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['id', 'created_at']
    
    def series_count(self, obj):
        """Display number of series in this category."""
        return obj.series.count()
    series_count.short_description = 'Series Count'


class VolumeInline(admin.TabularInline):
    """Inline admin for volumes."""
    model = Volume
    extra = 1
    fields = ['number', 'title', 'description']
    ordering = ['number']


class ChapterInline(admin.TabularInline):
    """Inline admin for chapters."""
    model = Chapter
    extra = 0
    fields = ['number', 'title', 'volume', 'approval_status', 'published_at']
    readonly_fields = ['approval_status']
    ordering = ['volume__number', 'number']
    show_change_link = True


@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    """Admin interface for Series model."""
    list_display = [
        'title', 'status', 'kind', 'rating', 'manager', 
        'chapter_count', 'updated_at'
    ]
    list_filter = ['status', 'kind', 'rating', 'licensed', 'created_at']
    search_fields = ['title', 'description', 'aliases__name']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['authors', 'artists', 'categories']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'cover')
        }),
        ('Classification', {
            'fields': ('status', 'kind', 'rating', 'licensed')
        }),
        ('People & Categories', {
            'fields': ('authors', 'artists', 'categories', 'manager')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    inlines = [AliasInline, VolumeInline, ChapterInline]
    
    def chapter_count(self, obj):
        """Display number of chapters for this series."""
        return obj.chapters.count()
    chapter_count.short_description = 'Chapters'
    
    def get_queryset(self, request):
        """Optimize queryset with prefetch_related."""
        return super().get_queryset(request).select_related('manager').prefetch_related(
            'authors', 'artists', 'categories'
        )


@admin.register(Volume)
class VolumeAdmin(admin.ModelAdmin):
    """Admin interface for Volume model."""
    list_display = ['__str__', 'series', 'number', 'chapter_count', 'created_at']
    list_filter = ['series', 'created_at']
    search_fields = ['title', 'series__title']
    ordering = ['series', 'number']
    readonly_fields = ['created_at']
    
    def chapter_count(self, obj):
        """Display number of chapters in this volume."""
        return obj.chapters.count()
    chapter_count.short_description = 'Chapters'


class PageInline(admin.TabularInline):
    """Inline admin for pages."""
    model = Page
    extra = 0
    fields = ['number', 'image_thumbnail', 'position', 'is_spread']
    readonly_fields = ['image_thumbnail', 'width', 'height', 'mime_type']
    ordering = ['number']
    
    def image_thumbnail(self, obj):
        """Display thumbnail of the page image."""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: auto;" />',
                obj.image.url
            )
        return '-'
    image_thumbnail.short_description = 'Thumbnail'


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    """Admin interface for Chapter model."""
    list_display = [
        'title', 'series', 'volume', 'number', 'approval_status', 
        'views', 'published_at', 'uploaded_by'
    ]
    list_filter = [
        'series', 'approval_status', 'is_final', 'published_at', 
        'created_at', ApprovalStatusFilter
    ]
    search_fields = ['title', 'series__title']
    ordering = ['series', 'volume__number', 'number']
    readonly_fields = [
        'views', 'created_at', 'updated_at', 'approved_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'number', 'series', 'volume')
        }),
        ('File Upload', {
            'fields': ('file',),
            'description': 'Upload a ZIP file containing the chapter pages.'
        }),
        ('Approval Workflow', {
            'fields': (
                'approval_status', 'rejection_reason', 
                'approved_by', 'approved_at'
            )
        }),
        ('Publishing', {
            'fields': ('is_final', 'published_at')
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'views', 'created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    inlines = [PageInline]
    
    actions = ['approve_chapters', 'reject_chapters']
    
    def approve_chapters(self, request, queryset):
        """Approve selected chapters."""
        updated = queryset.filter(
            approval_status=ApprovalStatus.PENDING
        ).update(
            approval_status=ApprovalStatus.APPROVED,
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(
            request, f'{updated} chapter(s) were approved.'
        )
    approve_chapters.short_description = 'Approve selected chapters'
    
    def reject_chapters(self, request, queryset):
        """Reject selected chapters."""
        updated = queryset.filter(
            approval_status=ApprovalStatus.PENDING
        ).update(
            approval_status=ApprovalStatus.REJECTED
        )
        self.message_user(
            request, f'{updated} chapter(s) were rejected.'
        )
    reject_chapters.short_description = 'Reject selected chapters'
    
    def get_queryset(self, request):
        """Optimize queryset."""
        return super().get_queryset(request).select_related(
            'series', 'volume', 'uploaded_by', 'approved_by'
        )
    
    def save_model(self, request, obj, form, change):
        """Set uploaded_by when creating new chapter."""
        if not change:  # Creating new object
            obj.uploaded_by = request.user
        
        # Set approved_by and approved_at when approving
        if obj.approval_status == ApprovalStatus.APPROVED and not obj.approved_by:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        
        # Handle file field for existing chapters that might have dangling references
        if change and obj.file:
            try:
                # Try to access the file to see if it exists
                _ = obj.file.size
            except (OSError, FileNotFoundError):
                # File doesn't exist, clear the field
                obj.file = None
        
        super().save_model(request, obj, form, change)


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    """Admin interface for Page model."""
    list_display = [
        'chapter', 'number', 'image_thumbnail', 'dimensions', 
        'position', 'is_spread'
    ]
    list_filter = ['chapter__series', 'position', 'is_spread', 'created_at']
    search_fields = ['chapter__title', 'chapter__series__title']
    ordering = ['chapter', 'number']
    readonly_fields = ['width', 'height', 'mime_type', 'created_at']
    
    def image_thumbnail(self, obj):
        """Display thumbnail of the page image."""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 100px; height: auto;" />',
                obj.image.url
            )
        return '-'
    image_thumbnail.short_description = 'Image'
    
    def dimensions(self, obj):
        """Display image dimensions."""
        return f'{obj.width} × {obj.height}'
    dimensions.short_description = 'Dimensions'
    
    def get_queryset(self, request):
        """Optimize queryset."""
        return super().get_queryset(request).select_related(
            'chapter', 'chapter__series'
        )


@admin.register(Alias)
class AliasAdmin(admin.ModelAdmin):
    """Admin interface for Alias model."""
    list_display = ['name', 'content_type', 'content_object']
    list_filter = ['content_type']
    search_fields = ['name']
    ordering = ['name']


# Customize admin site headers
admin.site.site_header = 'MangaKG Administration'
admin.site.site_title = 'MangaKG Admin'
admin.site.index_title = 'Welcome to MangaKG Administration'