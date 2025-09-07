"""
Unit tests for MangaKG reader models.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from reader.models import (
    Series, Chapter, Page, Volume, Author, Artist, Category, Alias,
    Status, Kind, Rating, ApprovalStatus
)


class AuthorModelTest(TestCase):
    """Test cases for Author model."""
    
    def test_create_author(self):
        """Test creating an author."""
        author = Author.objects.create(name="Akira Toriyama")
        self.assertEqual(str(author), "Akira Toriyama")
        self.assertEqual(author.name, "Akira Toriyama")
    
    def test_author_unique_name(self):
        """Test that author names must be unique."""
        Author.objects.create(name="Akira Toriyama")
        with self.assertRaises(IntegrityError):
            Author.objects.create(name="Akira Toriyama")


class ArtistModelTest(TestCase):
    """Test cases for Artist model."""
    
    def test_create_artist(self):
        """Test creating an artist."""
        artist = Artist.objects.create(name="Akira Toriyama")
        self.assertEqual(str(artist), "Akira Toriyama")
        self.assertEqual(artist.name, "Akira Toriyama")


class CategoryModelTest(TestCase):
    """Test cases for Category model."""
    
    def test_create_category(self):
        """Test creating a category."""
        category = Category.objects.create(
            name="Action",
            description="Action-packed manga"
        )
        self.assertEqual(str(category), "Action")
        self.assertEqual(category.id, "action")  # Should be auto-slugified
    
    def test_category_id_generation(self):
        """Test automatic ID generation from name."""
        category = Category.objects.create(
            name="Science Fiction",
            description="Sci-fi manga"
        )
        self.assertEqual(category.id, "science-fiction")


class SeriesModelTest(TestCase):
    """Test cases for Series model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass'
        )
        self.author = Author.objects.create(name="Test Author")
        self.artist = Artist.objects.create(name="Test Artist")
        self.category = Category.objects.create(
            name="Test Category",
            description="Test description"
        )
    
    def test_create_series(self):
        """Test creating a series."""
        series = Series.objects.create(
            title="Dragon Ball",
            description="A martial arts adventure",
            status=Status.COMPLETED,
            kind=Kind.MANGA,
            rating=Rating.SAFE
        )
        
        self.assertEqual(str(series), "Dragon Ball")
        self.assertEqual(series.slug, "dragon-ball")  # Auto-generated
        self.assertEqual(series.status, Status.COMPLETED)
        self.assertEqual(series.kind, Kind.MANGA)
        self.assertEqual(series.rating, Rating.SAFE)
    
    def test_series_slug_generation(self):
        """Test automatic slug generation."""
        series = Series.objects.create(
            title="My Test Series",
            description="Test description"
        )
        self.assertEqual(series.slug, "my-test-series")
    
    def test_series_relationships(self):
        """Test many-to-many relationships."""
        series = Series.objects.create(
            title="Test Series",
            description="Test description"
        )
        
        series.authors.add(self.author)
        series.artists.add(self.artist)
        series.categories.add(self.category)
        
        self.assertIn(self.author, series.authors.all())
        self.assertIn(self.artist, series.artists.all())
        self.assertIn(self.category, series.categories.all())


class VolumeModelTest(TestCase):
    """Test cases for Volume model."""
    
    def setUp(self):
        """Set up test data."""
        self.series = Series.objects.create(
            title="Test Series",
            description="Test description"
        )
    
    def test_create_volume(self):
        """Test creating a volume."""
        volume = Volume.objects.create(
            series=self.series,
            number=1,
            title="First Volume"
        )
        
        self.assertEqual(str(volume), "Vol. 1: First Volume")
        self.assertEqual(volume.series, self.series)
        self.assertEqual(volume.number, 1)
    
    def test_volume_without_title(self):
        """Test volume string representation without title."""
        volume = Volume.objects.create(
            series=self.series,
            number=1
        )
        
        self.assertEqual(str(volume), "Vol. 1")
    
    def test_volume_unique_constraint(self):
        """Test unique constraint on series and number."""
        Volume.objects.create(series=self.series, number=1)
        
        with self.assertRaises(IntegrityError):
            Volume.objects.create(series=self.series, number=1)


class ChapterModelTest(TestCase):
    """Test cases for Chapter model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass'
        )
        self.series = Series.objects.create(
            title="Test Series",
            description="Test description"
        )
        self.volume = Volume.objects.create(
            series=self.series,
            number=1
        )
    
    def test_create_chapter(self):
        """Test creating a chapter."""
        chapter = Chapter.objects.create(
            title="First Chapter",
            number=1,
            series=self.series,
            volume=self.volume,
            uploaded_by=self.user
        )
        
        self.assertEqual(str(chapter), "Vol. 1, Ch. 1: First Chapter")
        self.assertEqual(chapter.approval_status, ApprovalStatus.PENDING)
        self.assertEqual(chapter.uploaded_by, self.user)
    
    def test_chapter_without_volume(self):
        """Test chapter without volume."""
        chapter = Chapter.objects.create(
            title="First Chapter",
            number=1,
            series=self.series,
            uploaded_by=self.user
        )
        
        self.assertEqual(str(chapter), "Ch. 1: First Chapter")
    
    def test_chapter_unique_constraint(self):
        """Test unique constraint on series, volume, and number."""
        Chapter.objects.create(
            title="Chapter 1",
            number=1,
            series=self.series,
            volume=self.volume,
            uploaded_by=self.user
        )
        
        with self.assertRaises(IntegrityError):
            Chapter.objects.create(
                title="Another Chapter 1",
                number=1,
                series=self.series,
                volume=self.volume,
                uploaded_by=self.user
            )


class PageModelTest(TestCase):
    """Test cases for Page model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass'
        )
        self.series = Series.objects.create(
            title="Test Series",
            description="Test description"
        )
        self.chapter = Chapter.objects.create(
            title="Test Chapter",
            number=1,
            series=self.series,
            uploaded_by=self.user
        )
    
    def test_create_page(self):
        """Test creating a page."""
        page = Page.objects.create(
            chapter=self.chapter,
            number=1,
            image="test/path/image.jpg",
            width=800,
            height=1200,
            mime_type="image/jpeg"
        )
        
        self.assertEqual(str(page), "Ch. 1: Test Chapter - Page 1")
        self.assertEqual(page.number, 1)
        self.assertEqual(page.position, 'c')  # Default position
        self.assertFalse(page.is_spread)  # Default is False
    
    def test_page_unique_constraint(self):
        """Test unique constraint on chapter and number."""
        Page.objects.create(
            chapter=self.chapter,
            number=1,
            image="test/path/image1.jpg",
            width=800,
            height=1200,
            mime_type="image/jpeg"
        )
        
        with self.assertRaises(IntegrityError):
            Page.objects.create(
                chapter=self.chapter,
                number=1,
                image="test/path/image2.jpg",
                width=800,
                height=1200,
                mime_type="image/jpeg"
            )


class AliasModelTest(TestCase):
    """Test cases for Alias model."""
    
    def setUp(self):
        """Set up test data."""
        self.author = Author.objects.create(name="Test Author")
    
    def test_create_alias(self):
        """Test creating an alias."""
        alias = Alias.objects.create(
            name="Alternate Name",
            content_object=self.author
        )
        
        self.assertEqual(str(alias), "Alternate Name")
        self.assertEqual(alias.content_object, self.author)
    
    def test_alias_relationship(self):
        """Test generic foreign key relationship."""
        alias = Alias.objects.create(
            name="Alternate Name",
            content_object=self.author
        )
        
        # Test accessing alias from author
        self.assertIn(alias, self.author.aliases.all())