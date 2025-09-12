"""
Custom storage backends for the MangaKG reader app.
"""

import logging
import os
from botocore.exceptions import ClientError, NoCredentialsError
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from storages.backends.s3boto3 import S3Boto3Storage

logger = logging.getLogger(__name__)


class TigrisMediaStorage(S3Boto3Storage):
    """
    Custom storage backend for Fly.io Tigris S3-compatible storage.
    Used for manga pages and cover images.
    """
    # Set defaults to avoid import-time errors
    bucket_name = None
    region_name = None
    endpoint_url = None
    custom_domain = None
    default_acl = 'public-read'  # Make uploaded files publicly readable
    file_overwrite = False
    
    # Media files settings
    location = 'media'
    querystring_auth = False  # Don't add auth to URLs for public media
    object_parameters = {
        'CacheControl': 'max-age=86400',  # 24 hours cache for media files
    }
    
    def __init__(self, *args, **kwargs):
        # Set configuration from settings
        self.bucket_name = (getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None) or 
                           os.getenv('BUCKET_NAME', 'mangakg-media'))
        self.region_name = (getattr(settings, 'AWS_S3_REGION_NAME', None) or 
                           os.getenv('AWS_REGION', 'fra'))
        self.endpoint_url = (getattr(settings, 'AWS_S3_ENDPOINT_URL', None) or 
                            os.getenv('AWS_ENDPOINT_URL_S3', 'https://fly.storage.tigris.dev'))
        self.custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None)
        
        super().__init__(*args, **kwargs)
        
        # Set access credentials
        self.access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
        self.secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
    
    def _save(self, name, content):
        """
        Save file to Tigris storage with error handling.
        """
        try:
            return super()._save(name, content)
        except (ClientError, NoCredentialsError) as e:
            logger.error(f"Failed to save file {name} to Tigris storage: {e}")
            # Re-raise as ImproperlyConfigured so Django can handle it gracefully
            raise ImproperlyConfigured(
                "Tigris storage is not properly configured or unavailable. "
                "Please check your AWS credentials and endpoint settings."
            ) from e
    
    def delete(self, name):
        """
        Delete file from Tigris storage with error handling.
        """
        try:
            return super().delete(name)
        except (ClientError, NoCredentialsError) as e:
            logger.error(f"Failed to delete file {name} from Tigris storage: {e}")
            # Log error but don't raise - deletion failures shouldn't break the app
            pass
    
    def exists(self, name):
        """
        Check if file exists in Tigris storage with error handling.
        """
        try:
            return super().exists(name)
        except (ClientError, NoCredentialsError) as e:
            logger.error(f"Failed to check existence of file {name} in Tigris storage: {e}")
            # Return False if we can't check - safer than raising an error
            return False
        
    def url(self, name, parameters=None, expire=None, http_method=None):
        """
        Return the URL for accessing the given file name.
        Use custom domain if configured, otherwise use the default S3 URL.
        """
        try:
            if self.custom_domain:
                return f"https://{self.custom_domain}/{self.location}/{name}"
            return super().url(name, parameters, expire, http_method)
        except (ClientError, NoCredentialsError) as e:
            logger.error(f"Failed to generate URL for file {name}: {e}")
            # Return a placeholder URL if we can't generate the real one
            return f"/media/{name}"


class TigrisStaticStorage(S3Boto3Storage):
    """
    Custom storage backend for serving static files via Tigris.
    """
    # Set defaults to avoid import-time errors
    bucket_name = None
    region_name = None
    endpoint_url = None
    custom_domain = None
    default_acl = None
    
    # Static files settings
    location = 'static'
    querystring_auth = False
    file_overwrite = True  # Allow overwriting static files
    
    def __init__(self, *args, **kwargs):
        # Set configuration from settings
        self.bucket_name = (getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None) or 
                           os.getenv('BUCKET_NAME', 'mangakg-media'))
        self.region_name = (getattr(settings, 'AWS_S3_REGION_NAME', None) or 
                           os.getenv('AWS_REGION', 'fra'))
        self.endpoint_url = (getattr(settings, 'AWS_S3_ENDPOINT_URL', None) or 
                            os.getenv('AWS_ENDPOINT_URL_S3', 'https://fly.storage.tigris.dev'))
        self.custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None)
        
        super().__init__(*args, **kwargs)
        
        # Set access credentials
        self.access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
        self.secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
        
    def url(self, name, parameters=None, expire=None, http_method=None):
        """
        Return the URL for accessing the given static file name.
        """
        if self.custom_domain:
            return f"https://{self.custom_domain}/{self.location}/{name}"
        return super().url(name, parameters, expire, http_method)