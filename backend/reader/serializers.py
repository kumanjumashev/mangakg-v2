"""
Django REST Framework serializers for the MangaKG reader app.
"""

from rest_framework import serializers
from .models import Series, Chapter, Page, Volume, Author, Artist, Category, Alias


class AliasSerializer(serializers.ModelSerializer):
    """Serializer for Alias model."""
    class Meta:
        model = Alias
        fields = ['name']


class AuthorSerializer(serializers.ModelSerializer):
    """Serializer for Author model."""
    aliases = AliasSerializer(many=True, read_only=True)
    
    class Meta:
        model = Author
        fields = ['id', 'name', 'aliases']


class ArtistSerializer(serializers.ModelSerializer):
    """Serializer for Artist model."""
    aliases = AliasSerializer(many=True, read_only=True)
    
    class Meta:
        model = Artist
        fields = ['id', 'name', 'aliases']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class VolumeSerializer(serializers.ModelSerializer):
    """Serializer for Volume model."""
    chapter_count = serializers.IntegerField(source='chapters.count', read_only=True)
    
    class Meta:
        model = Volume
        fields = ['id', 'number', 'title', 'description', 'chapter_count']


class PageSerializer(serializers.ModelSerializer):
    """Serializer for Page model."""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Page
        fields = [
            'id', 'number', 'image_url', 'width', 'height', 
            'position', 'is_spread'
        ]
    
    def get_image_url(self, obj):
        """Get the full URL for the page image."""
        if obj.image:
            request = self.context.get('request')
            if request:
                # Use Django media serving endpoint instead of direct S3 URLs
                from django.urls import reverse
                media_url = reverse('reader:serve-media', kwargs={'file_path': obj.image.name})
                return request.build_absolute_uri(media_url)
            return f'/media/{obj.image.name}'
        return None


class ChapterListSerializer(serializers.ModelSerializer):
    """Simplified serializer for chapter lists."""
    volume_number = serializers.IntegerField(source='volume.number', read_only=True)
    page_count = serializers.IntegerField(source='pages.count', read_only=True)
    
    class Meta:
        model = Chapter
        fields = [
            'id', 'title', 'number', 'volume_number', 'page_count',
            'published_at', 'views', 'approval_status'
        ]


class ChapterDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual chapters."""
    volume = VolumeSerializer(read_only=True)
    pages = PageSerializer(many=True, read_only=True)
    series_title = serializers.CharField(source='series.title', read_only=True)
    series_slug = serializers.CharField(source='series.slug', read_only=True)
    
    class Meta:
        model = Chapter
        fields = [
            'id', 'title', 'number', 'volume', 'series_title', 'series_slug',
            'pages', 'published_at', 'views', 'approval_status', 'is_final'
        ]


class SeriesListSerializer(serializers.ModelSerializer):
    """Simplified serializer for series lists."""
    authors = AuthorSerializer(many=True, read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    cover_url = serializers.SerializerMethodField()
    chapter_count = serializers.IntegerField(source='chapters.count', read_only=True)
    latest_chapter = serializers.SerializerMethodField()
    
    class Meta:
        model = Series
        fields = [
            'id', 'title', 'slug', 'description', 'cover_url', 'status', 'kind', 
            'rating', 'licensed', 'authors', 'artists', 'categories',
            'chapter_count', 'latest_chapter', 'updated_at'
        ]
    
    def get_cover_url(self, obj):
        """Get the full URL for the series cover."""
        if obj.cover:
            request = self.context.get('request')
            if request:
                # Use Django media serving endpoint instead of direct S3 URLs
                from django.urls import reverse
                media_url = reverse('reader:serve-media', kwargs={'file_path': obj.cover.name})
                return request.build_absolute_uri(media_url)
            return f'/media/{obj.cover.name}'
        return None
    
    def get_latest_chapter(self, obj):
        """Get the latest approved chapter."""
        latest = obj.chapters.filter(approval_status='approved').order_by('-published_at').first()
        if latest:
            return {
                'id': latest.id,
                'title': latest.title,
                'number': latest.number,
                'volume_number': latest.volume.number if latest.volume else None,
                'published_at': latest.published_at
            }
        return None


class SeriesDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual series."""
    authors = AuthorSerializer(many=True, read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    aliases = AliasSerializer(many=True, read_only=True)
    volumes = VolumeSerializer(many=True, read_only=True)
    chapters = ChapterListSerializer(many=True, read_only=True)
    cover_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Series
        fields = [
            'id', 'title', 'slug', 'description', 'cover_url', 'status', 'kind',
            'rating', 'licensed', 'authors', 'artists', 'categories', 'aliases',
            'volumes', 'chapters', 'created_at', 'updated_at'
        ]
    
    def get_cover_url(self, obj):
        """Get the full URL for the series cover."""
        if obj.cover:
            request = self.context.get('request')
            if request:
                # Use Django media serving endpoint instead of direct S3 URLs
                from django.urls import reverse
                media_url = reverse('reader:serve-media', kwargs={'file_path': obj.cover.name})
                return request.build_absolute_uri(media_url)
            return f'/media/{obj.cover.name}'
        return None