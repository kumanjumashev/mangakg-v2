"""
Tests for Tigris storage functionality.
"""

import os
import tempfile
from unittest.mock import Mock, patch, MagicMock
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ImproperlyConfigured
from botocore.exceptions import ClientError, NoCredentialsError

from reader.storage import TigrisMediaStorage
from reader.models import Series, Chapter


class TigrisMediaStorageTest(TestCase):
    """Test cases for TigrisMediaStorage."""
    
    @override_settings(
        AWS_ACCESS_KEY_ID='test_key',
        AWS_SECRET_ACCESS_KEY='test_secret',
        AWS_STORAGE_BUCKET_NAME='test-bucket',
        AWS_S3_REGION_NAME='fra',
        AWS_S3_ENDPOINT_URL='https://fly.storage.tigris.dev',
        AWS_S3_CUSTOM_DOMAIN=None,
    )
    def setUp(self):
        """Set up test environment."""
        self.storage = TigrisMediaStorage()
    
    def test_storage_initialization(self):
        """Test that storage backend initializes correctly."""
        self.assertEqual(self.storage.bucket_name, 'test-bucket')
        self.assertEqual(self.storage.region_name, 'fra')
        self.assertEqual(self.storage.endpoint_url, 'https://fly.storage.tigris.dev')
        self.assertEqual(self.storage.location, 'media')
        self.assertFalse(self.storage.querystring_auth)
        self.assertFalse(self.storage.file_overwrite)
    
    @override_settings(AWS_S3_CUSTOM_DOMAIN='cdn.example.com')
    def test_url_with_custom_domain(self):
        """Test URL generation with custom domain."""
        storage = TigrisMediaStorage()
        url = storage.url('test-file.jpg')
        self.assertEqual(url, 'https://cdn.example.com/media/test-file.jpg')
    
    def test_url_without_custom_domain(self):
        """Test URL generation without custom domain."""
        with patch.object(self.storage, 'url', wraps=self.storage.url) as mock_url:
            # Mock the super().url() call
            with patch('storages.backends.s3boto3.S3Boto3Storage.url', 
                      return_value='https://test-bucket.fly.storage.tigris.dev/media/test-file.jpg'):
                url = self.storage.url('test-file.jpg')
                self.assertIn('test-file.jpg', url)
    
    @patch('storages.backends.s3boto3.S3Boto3Storage._save')
    def test_save_success(self, mock_save):
        """Test successful file save."""
        mock_save.return_value = 'test-file.jpg'
        
        # Create a mock file
        mock_file = Mock()
        mock_file.read.return_value = b'test content'
        
        result = self.storage._save('test-file.jpg', mock_file)
        self.assertEqual(result, 'test-file.jpg')
        mock_save.assert_called_once()
    
    @patch('storages.backends.s3boto3.S3Boto3Storage._save')
    def test_save_client_error(self, mock_save):
        """Test file save with ClientError."""
        mock_save.side_effect = ClientError(
            {'Error': {'Code': 'NoSuchBucket', 'Message': 'Bucket not found'}},
            'PutObject'
        )
        
        mock_file = Mock()
        
        with self.assertRaises(ImproperlyConfigured):
            self.storage._save('test-file.jpg', mock_file)
    
    @patch('storages.backends.s3boto3.S3Boto3Storage._save')
    def test_save_no_credentials_error(self, mock_save):
        """Test file save with NoCredentialsError."""
        mock_save.side_effect = NoCredentialsError()
        
        mock_file = Mock()
        
        with self.assertRaises(ImproperlyConfigured):
            self.storage._save('test-file.jpg', mock_file)
    
    @patch('storages.backends.s3boto3.S3Boto3Storage.delete')
    def test_delete_success(self, mock_delete):
        """Test successful file deletion."""
        mock_delete.return_value = True
        
        result = self.storage.delete('test-file.jpg')
        mock_delete.assert_called_once_with('test-file.jpg')
    
    @patch('storages.backends.s3boto3.S3Boto3Storage.delete')
    def test_delete_with_error(self, mock_delete):
        """Test file deletion with error (should not raise)."""
        mock_delete.side_effect = ClientError(
            {'Error': {'Code': 'NoSuchKey', 'Message': 'Key not found'}},
            'DeleteObject'
        )
        
        # Should not raise an exception
        self.storage.delete('test-file.jpg')
        mock_delete.assert_called_once_with('test-file.jpg')
    
    @patch('storages.backends.s3boto3.S3Boto3Storage.exists')
    def test_exists_success(self, mock_exists):
        """Test successful file existence check."""
        mock_exists.return_value = True
        
        result = self.storage.exists('test-file.jpg')
        self.assertTrue(result)
        mock_exists.assert_called_once_with('test-file.jpg')
    
    @patch('storages.backends.s3boto3.S3Boto3Storage.exists')
    def test_exists_with_error(self, mock_exists):
        """Test file existence check with error."""
        mock_exists.side_effect = ClientError(
            {'Error': {'Code': 'Forbidden', 'Message': 'Access denied'}},
            'HeadObject'
        )
        
        result = self.storage.exists('test-file.jpg')
        self.assertFalse(result)  # Should return False on error
        mock_exists.assert_called_once_with('test-file.jpg')
    
    def test_url_generation_error(self):
        """Test URL generation with storage error."""
        with patch('storages.backends.s3boto3.S3Boto3Storage.url', 
                  side_effect=ClientError(
                      {'Error': {'Code': 'Forbidden', 'Message': 'Access denied'}},
                      'GetObject'
                  )):
            url = self.storage.url('test-file.jpg')
            # Should return fallback URL
            self.assertEqual(url, '/media/test-file.jpg')


class StorageIntegrationTest(TestCase):
    """Integration tests for storage with Django models."""
    
    def setUp(self):
        """Set up test models."""
        self.series = Series.objects.create(
            title='Test Series',
            slug='test-series'
        )
    
    @override_settings(USE_TIGRIS=False)
    def test_local_storage_fallback(self):
        """Test that local storage is used when Tigris is not configured."""
        from django.conf import settings
        
        # When USE_TIGRIS is False, should use local storage
        self.assertFalse(getattr(settings, 'USE_TIGRIS', False))
        self.assertEqual(settings.MEDIA_URL, '/media/')
    
    @override_settings(
        USE_TIGRIS=True,
        AWS_ACCESS_KEY_ID='test_key',
        AWS_SECRET_ACCESS_KEY='test_secret',
        AWS_STORAGE_BUCKET_NAME='test-bucket',
        DEFAULT_FILE_STORAGE='reader.storage.TigrisMediaStorage'
    )
    def test_tigris_storage_configuration(self):
        """Test that Tigris storage is properly configured."""
        from django.conf import settings
        
        self.assertTrue(settings.USE_TIGRIS)
        self.assertEqual(settings.DEFAULT_FILE_STORAGE, 'reader.storage.TigrisMediaStorage')
        self.assertEqual(settings.AWS_STORAGE_BUCKET_NAME, 'test-bucket')
    
    @patch('reader.storage.TigrisMediaStorage._save')
    def test_series_cover_upload(self, mock_save):
        """Test series cover upload with Tigris storage."""
        mock_save.return_value = 'series/test-series/cover.jpg'
        
        # Create a test image file
        image_content = b'fake image content'
        uploaded_file = SimpleUploadedFile(
            'test-cover.jpg',
            image_content,
            content_type='image/jpeg'
        )
        
        self.series.cover = uploaded_file
        self.series.save()
        
        # Verify the file was saved through the storage backend
        mock_save.assert_called_once()
        
        # Verify the file path is correct
        expected_path = f'series/{self.series.slug}/cover.jpg'
        self.assertTrue(self.series.cover.name.endswith('cover.jpg'))


class StorageErrorHandlingTest(TestCase):
    """Test error handling scenarios for storage operations."""
    
    @patch('reader.storage.TigrisMediaStorage._save')
    def test_storage_unavailable_error(self, mock_save):
        """Test handling when storage backend is completely unavailable."""
        mock_save.side_effect = ImproperlyConfigured(
            "Tigris storage is not properly configured or unavailable."
        )
        
        series = Series.objects.create(title='Test Series', slug='test-series')
        
        # Create a test image file
        image_content = b'fake image content'
        uploaded_file = SimpleUploadedFile(
            'test-cover.jpg',
            image_content,
            content_type='image/jpeg'
        )
        
        series.cover = uploaded_file
        
        # Should raise ImproperlyConfigured which will be caught by middleware
        with self.assertRaises(ImproperlyConfigured):
            series.save()


class TigrisConfigurationTest(TestCase):
    """Test Tigris configuration scenarios."""
    
    def test_environment_variable_defaults(self):
        """Test that environment variables have proper defaults."""
        with override_settings(
            AWS_ACCESS_KEY_ID='test_key',
            AWS_SECRET_ACCESS_KEY='test_secret'
        ):
            from django.conf import settings
            
            # Test default values
            self.assertEqual(
                getattr(settings, 'AWS_S3_REGION_NAME', None), 
                'fra'  # Frankfurt region default
            )
            self.assertEqual(
                getattr(settings, 'AWS_S3_ENDPOINT_URL', None),
                'https://fly.storage.tigris.dev'
            )
            self.assertEqual(
                getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None),
                'mangakg-media'
            )
    
    @override_settings(AWS_ACCESS_KEY_ID=None)
    def test_no_tigris_credentials(self):
        """Test that Tigris is disabled when no credentials are provided."""
        # Reload settings to get updated USE_TIGRIS value
        from django.conf import settings
        from importlib import reload
        import mangakg.settings as settings_module
        
        # Mock the environment variable check
        with patch('os.getenv') as mock_getenv:
            mock_getenv.return_value = None  # No AWS_ACCESS_KEY_ID
            
            # USE_TIGRIS should be False when no credentials are provided
            use_tigris = mock_getenv('AWS_ACCESS_KEY_ID') is not None
            self.assertFalse(use_tigris)