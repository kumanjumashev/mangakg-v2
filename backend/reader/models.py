"""
Database models for the MangaKG reader app.
"""

import io
import os
from hashlib import blake2b
from pathlib import Path
from shutil import rmtree
from zipfile import ZipFile, BadZipfile

from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F
from django.urls import reverse
from django.utils.text import slugify
from django.utils.timezone import now
from django.conf import settings

from PIL import Image

from reader.validators import validate_zip_file, validate_file_size


class Status(models.TextChoices):
    """The possible Series status values."""
    ONGOING = 'ongoing', 'Ongoing'
    COMPLETED = 'completed', 'Completed'  
    HIATUS = 'hiatus', 'On Hiatus'
    CANCELED = 'canceled', 'Canceled'


class Kind(models.TextChoices):
    """The possible Series kind values."""
    MANGA = 'manga', 'Manga'
    COMIC = 'comic', 'Comic'
    WEBTOON = 'webtoon', 'Webtoon'


class Rating(models.TextChoices):
    """The possible Series rating values."""
    SAFE = 'safe', 'Safe'
    SUGGESTIVE = 'suggestive', 'Suggestive'
    EXPLICIT = 'explicit', 'Explicit'


class ApprovalStatus(models.TextChoices):
    """The possible approval status values for chapters."""
    PENDING = 'pending', 'Pending Review'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class AliasManager(models.Manager):
    """A Manager for aliases."""

    def names(self):
        """Get the names of the aliases."""
        return list(self.get_queryset().values_list('name', flat=True))


class Alias(models.Model):
    """A generic alias model for linking alternative names to other models."""
    name = models.CharField(
        max_length=255, db_index=True, verbose_name='Alias Name',
        help_text='Alternative name or alias'
    )
    object_id = models.PositiveIntegerField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    objects = AliasManager()

    class Meta:
        verbose_name_plural = 'Aliases'
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'content_type', 'object_id'],
                name='unique_alias_content_object'
            ),
        ]
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name or ''


class Author(models.Model):
    """A model representing a manga/comic author."""
    name = models.CharField(
        max_length=100, db_index=True, unique=True,
        help_text="The author's full name"
    )
    aliases = GenericRelation(
        Alias, blank=True, related_query_name='author'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Artist(models.Model):
    """A model representing a manga/comic artist."""
    name = models.CharField(
        max_length=100, db_index=True, unique=True,
        help_text="The artist's full name"
    )
    aliases = GenericRelation(
        Alias, blank=True, related_query_name='artist'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Category(models.Model):
    """A model representing a manga/comic category or genre."""
    id = models.CharField(
        primary_key=True, max_length=25, auto_created=True
    )
    name = models.CharField(
        unique=True, max_length=25,
        help_text='The name of the category. Must be unique and cannot be changed once set.'
    )
    description = models.TextField(
        help_text='A description for the category.'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.name).lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


def series_cover_upload_path(instance, filename):
    """Generate upload path for series cover images."""
    ext = filename.split('.')[-1]
    return f'series/{instance.slug}/cover.{ext}'


class Series(models.Model):
    """A model representing a manga/comic series."""
    title = models.CharField(
        max_length=250, db_index=True,
        help_text='The title of the series'
    )
    slug = models.SlugField(
        unique=True, blank=True, verbose_name='URL Slug',
        help_text='The unique slug used in URLs. Will be auto-generated if left blank.'
    )
    description = models.TextField(
        blank=True,
        help_text='Description or synopsis of the series'
    )
    cover = models.ImageField(
        upload_to=series_cover_upload_path, blank=True, null=True,
        help_text='Cover image for the series. Maximum size: 2MB'
    )
    authors = models.ManyToManyField(Author, blank=True, related_name='series')
    artists = models.ManyToManyField(Artist, blank=True, related_name='series')
    categories = models.ManyToManyField(Category, blank=True, related_name='series')
    
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ONGOING,
        help_text='Publication status of the series'
    )
    kind = models.CharField(
        max_length=8, choices=Kind.choices, default=Kind.MANGA,
        help_text='Type of content (determines page layout)'
    )
    rating = models.CharField(
        max_length=11, choices=Rating.choices, default=Rating.SAFE,
        help_text='Content rating for the series'
    )
    licensed = models.BooleanField(
        default=False,
        help_text='Is this series officially licensed?'
    )
    
    aliases = GenericRelation(
        Alias, blank=True, related_query_name='series'
    )
    manager = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        help_text='The user who manages this series'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        verbose_name_plural = 'Series'
        ordering = ['title']
        get_latest_by = 'updated_at'
        indexes = [
            models.Index(fields=['status', 'updated_at']),
            models.Index(fields=['kind', 'rating']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('reader:series-detail', kwargs={'slug': self.slug})

    def __str__(self):
        return self.title


class Volume(models.Model):
    """A model representing a volume within a series."""
    series = models.ForeignKey(
        Series, on_delete=models.CASCADE, related_name='volumes'
    )
    number = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text='Volume number'
    )
    title = models.CharField(
        max_length=250, blank=True,
        help_text='Optional volume title'
    )
    description = models.TextField(
        blank=True,
        help_text='Optional volume description'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['series', 'number']
        unique_together = ['series', 'number']
        constraints = [
            models.CheckConstraint(
                check=models.Q(number__gte=1),
                name='volume_number_positive'
            ),
        ]

    def __str__(self):
        if self.title:
            return f'Vol. {self.number}: {self.title}'
        return f'Vol. {self.number}'


def chapter_upload_path(instance, filename):
    """Generate upload path for chapter files."""
    return f'uploads/chapters/{instance.series.slug}/vol{instance.volume.number if instance.volume else 0}/ch{instance.number}/{filename}'


class Chapter(models.Model):
    """A model representing a chapter within a series."""
    title = models.CharField(
        max_length=250,
        help_text='Chapter title'
    )
    number = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text='Chapter number (can be decimal for sub-chapters)'
    )
    volume = models.ForeignKey(
        Volume, on_delete=models.CASCADE, related_name='chapters',
        null=True, blank=True,
        help_text='The volume this chapter belongs to (optional)'
    )
    series = models.ForeignKey(
        Series, on_delete=models.CASCADE, related_name='chapters',
        help_text='The series this chapter belongs to'
    )
    
    # File upload and processing
    file = models.FileField(
        upload_to=chapter_upload_path, blank=True, null=True,
        validators=[validate_zip_file, validate_file_size],
        help_text='Upload a ZIP file containing chapter pages (max 500MB)'
    )
    
    # Approval workflow
    approval_status = models.CharField(
        max_length=10, choices=ApprovalStatus.choices, 
        default=ApprovalStatus.PENDING,
        help_text='Review status of the chapter'
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text='Reason for rejection (if applicable)'
    )
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_chapters',
        help_text='User who approved this chapter'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    is_final = models.BooleanField(
        default=False,
        help_text='Is this the final chapter of the series?'
    )
    published_at = models.DateTimeField(
        default=now, db_index=True,
        help_text='Publication date (can be scheduled for future)'
    )
    views = models.PositiveIntegerField(default=0, editable=False)
    
    # Uploader information
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='uploaded_chapters',
        help_text='User who uploaded this chapter'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ['series', F('volume__number').asc(nulls_last=True), 'number']
        get_latest_by = ['published_at', 'updated_at']
        unique_together = ['series', 'volume', 'number']
        constraints = [
            models.CheckConstraint(
                check=models.Q(number__gte=0),
                name='chapter_number_nonnegative'
            ),
        ]
        indexes = [
            models.Index(fields=['series', 'approval_status']),
            models.Index(fields=['published_at', 'approval_status']),
            models.Index(fields=['uploaded_by', 'approval_status']),
        ]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Process uploaded file
        if self.file and is_new:
            self.process_uploaded_file()

    def process_uploaded_file(self):
        """Process the uploaded ZIP file and extract pages."""
        if not self.file:
            return
            
        try:
            # Create directory for extracted pages
            vol_num = self.volume.number if self.volume else 0
            chapter_dir = Path(settings.MEDIA_ROOT) / 'series' / self.series.slug / f'vol{vol_num}' / f'ch{self.number}'
            
            if chapter_dir.exists():
                rmtree(chapter_dir)
            chapter_dir.mkdir(parents=True, exist_ok=True)
            
            # Extract and validate ZIP file
            pages = []
            # Get file path - handle both TemporaryUploadedFile and InMemoryUploadedFile
            if hasattr(self.file, 'path'):
                file_path = self.file.path
            else:
                # For in-memory files, we need to use the file object directly
                self.file.seek(0)
                file_path = self.file
            
            with ZipFile(file_path) as zf:
                namelist = sorted(zf.namelist())
                page_number = 1
                
                for name in namelist:
                    if zf.getinfo(name).is_dir():
                        continue
                        
                    # Read and validate image
                    data = zf.read(name)
                    try:
                        img = Image.open(io.BytesIO(data))
                        img.verify()
                    except Exception as e:
                        raise ValidationError(f'Invalid image file: {name}') from e
                    
                    # Generate hash-based filename
                    file_hash = blake2b(data, digest_size=16).hexdigest()
                    ext = os.path.splitext(name)[-1]
                    filename = f'{file_hash}{ext}'
                    
                    # Save file
                    file_path = chapter_dir / filename
                    file_path.write_bytes(data)
                    
                    # Create page object
                    relative_path = f'series/{self.series.slug}/vol{vol_num}/ch{self.number}/{filename}'
                    
                    # Re-open image to get dimensions
                    img = Image.open(io.BytesIO(data))
                    pages.append(Page(
                        chapter=self,
                        number=page_number,
                        image=relative_path,
                        width=img.width,
                        height=img.height,
                        mime_type=img.get_format_mimetype() or 'image/jpeg'
                    ))
                    page_number += 1
            
            # Delete existing pages and create new ones
            self.pages.all().delete()
            Page.objects.bulk_create(pages)
            
            # Clean up uploaded file
            self.file.delete(save=False)
            
        except BadZipfile:
            raise ValidationError('Invalid ZIP file format')
        except Exception as e:
            # Clean up on error
            if hasattr(self, 'file') and self.file:
                self.file.delete(save=False)
            raise ValidationError(f'Error processing file: {str(e)}') from e

    def get_absolute_url(self):
        vol_num = self.volume.number if self.volume else 0
        return reverse('reader:chapter-detail', kwargs={
            'series_slug': self.series.slug,
            'volume': vol_num,
            'number': self.number
        })

    def __str__(self):
        vol_part = f'Vol. {self.volume.number}, ' if self.volume else ''
        return f'{vol_part}Ch. {self.number:g}: {self.title}'


class Page(models.Model):
    """A model representing a page within a chapter."""
    chapter = models.ForeignKey(
        Chapter, on_delete=models.CASCADE, related_name='pages'
    )
    number = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text='Page number within the chapter'
    )
    image = models.ImageField(
        max_length=255,
        help_text='The page image file'
    )
    width = models.PositiveIntegerField(editable=False)
    height = models.PositiveIntegerField(editable=False)
    mime_type = models.CharField(max_length=50, editable=False)
    
    # Page positioning and layout
    position = models.CharField(
        max_length=1,
        choices=[
            ('l', 'Left'),
            ('r', 'Right'),
            ('c', 'Center'),
        ],
        default='c',
        help_text='Page position for reading layout'
    )
    is_spread = models.BooleanField(
        default=False,
        help_text='Is this a double-page spread?'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['chapter', 'number']
        unique_together = ['chapter', 'number']
        constraints = [
            models.CheckConstraint(
                check=models.Q(number__gte=1),
                name='page_number_positive'
            ),
        ]

    def get_absolute_url(self):
        vol_num = self.chapter.volume.number if self.chapter.volume else 0
        return reverse('reader:page', kwargs={
            'series_slug': self.chapter.series.slug,
            'volume': vol_num,
            'chapter_number': self.chapter.number,
            'page_number': self.number
        })

    def __str__(self):
        return f'{self.chapter} - Page {self.number}'