"""
Custom storage backends for the MangaKG reader app.
"""

import os
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class TigrisMediaStorage(S3Boto3Storage):
    """
    Custom storage backend for Fly.io Tigris S3-compatible storage.
    Used for manga pages and cover images.
    """
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    region_name = settings.AWS_S3_REGION_NAME
    endpoint_url = settings.AWS_S3_ENDPOINT_URL
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN
    default_acl = None
    file_overwrite = False
    
    # Media files settings
    location = 'media'
    querystring_auth = False  # Don't add auth to URLs for public media
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set access credentials
        self.access_key = settings.AWS_ACCESS_KEY_ID
        self.secret_key = settings.AWS_SECRET_ACCESS_KEY
        
    def url(self, name, parameters=None, expire=None, http_method=None):
        """
        Return the URL for accessing the given file name.
        Use custom domain if configured, otherwise use the default S3 URL.
        """
        if self.custom_domain:
            return f"https://{self.custom_domain}/{self.location}/{name}"
        return super().url(name, parameters, expire, http_method)


class TigrisStaticStorage(S3Boto3Storage):
    """
    Custom storage backend for serving static files via Tigris.
    """
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    region_name = settings.AWS_S3_REGION_NAME
    endpoint_url = settings.AWS_S3_ENDPOINT_URL
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN
    default_acl = None
    
    # Static files settings
    location = 'static'
    querystring_auth = False
    file_overwrite = True  # Allow overwriting static files
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set access credentials
        self.access_key = settings.AWS_ACCESS_KEY_ID
        self.secret_key = settings.AWS_SECRET_ACCESS_KEY
        
    def url(self, name, parameters=None, expire=None, http_method=None):
        """
        Return the URL for accessing the given static file name.
        """
        if self.custom_domain:
            return f"https://{self.custom_domain}/{self.location}/{name}"
        return super().url(name, parameters, expire, http_method)