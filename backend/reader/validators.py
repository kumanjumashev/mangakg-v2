"""
Custom validation functions for the MangaKG reader app.
"""

import zipfile
import mimetypes
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile


def validate_file_size(file: UploadedFile, max_size_mb: int = 500):
    """
    Validate that the uploaded file does not exceed the maximum size.
    
    Args:
        file: The uploaded file
        max_size_mb: Maximum size in MB (default: 500MB)
    """
    max_size = max_size_mb * 1024 * 1024  # Convert to bytes
    
    if file.size > max_size:
        raise ValidationError(
            f'File size {file.size / (1024*1024):.1f}MB exceeds maximum allowed size of {max_size_mb}MB.'
        )


def validate_zip_file(file: UploadedFile):
    """
    Validate that the uploaded file is a valid ZIP archive with proper structure.
    
    Args:
        file: The uploaded file
        
    Raises:
        ValidationError: If the file is not a valid ZIP or contains invalid content
    """
    # Check MIME type
    content_type = getattr(file, 'content_type', None)
    if content_type and content_type not in ['application/zip', 'application/x-zip-compressed']:
        raise ValidationError('File must be a ZIP archive.')
    
    # Check file extension
    if not file.name.lower().endswith(('.zip', '.cbz')):
        raise ValidationError('File must have .zip or .cbz extension.')
    
    try:
        # Get file path - handle both TemporaryUploadedFile and InMemoryUploadedFile
        if hasattr(file, 'temporary_file_path'):
            file_path = file.temporary_file_path()
        else:
            # For InMemoryUploadedFile or FieldFile, we need to use the file object directly
            file.seek(0)  # Reset file pointer
            file_path = file
        
        with zipfile.ZipFile(file_path) as zf:
            # Check for zip bombs - limit number of files
            if len(zf.namelist()) > 1000:
                raise ValidationError('ZIP file contains too many files (maximum: 1000).')
            
            # Check for zip bombs - limit total uncompressed size
            total_size = sum(info.file_size for info in zf.infolist())
            max_uncompressed_size = 2 * 1024 * 1024 * 1024  # 2GB
            if total_size > max_uncompressed_size:
                raise ValidationError('ZIP file uncompressed size is too large.')
            
            # Check compression ratio for zip bomb detection
            compressed_size = sum(info.compress_size for info in zf.infolist())
            if compressed_size > 0:
                compression_ratio = total_size / compressed_size
                if compression_ratio > 100:  # Suspicious compression ratio
                    raise ValidationError('ZIP file has suspicious compression ratio.')
            
            # Validate directory structure - only allow one level of subdirectory
            folder_count = 0
            valid_image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
            image_count = 0
            
            for name in zf.namelist():
                info = zf.getinfo(name)
                
                # Check for directory traversal attempts
                if '..' in name or name.startswith('/'):
                    raise ValidationError('ZIP file contains invalid path names.')
                
                # Count directories
                if info.is_dir():
                    # Only count non-root directories
                    if name.count('/') > 1:
                        folder_count += 1
                        if folder_count > 1:
                            raise ValidationError('ZIP file cannot contain more than one level of subdirectories.')
                else:
                    # Validate image files
                    file_ext = Path(name).suffix.lower()
                    if file_ext in valid_image_extensions:
                        image_count += 1
                        
                        # Check individual file size
                        if info.file_size > 50 * 1024 * 1024:  # 50MB per image
                            raise ValidationError(f'Image file {name} is too large (maximum: 50MB).')
                    elif file_ext:  # Skip files without extensions (like .DS_Store)
                        # Allow some common metadata files
                        allowed_files = {'.txt', '.nfo', '.xml', '.json'}
                        if file_ext not in allowed_files and not name.startswith('__MACOSX'):
                            raise ValidationError(f'ZIP file contains non-image file: {name}')
            
            # Ensure we have at least one image
            if image_count == 0:
                raise ValidationError('ZIP file must contain at least one image.')
                
    except zipfile.BadZipFile:
        raise ValidationError('File is not a valid ZIP archive.')
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError(f'Error validating ZIP file: {str(e)}')


def validate_image_file(file: UploadedFile):
    """
    Validate that the uploaded file is a valid image.
    
    Args:
        file: The uploaded file
    """
    try:
        from PIL import Image
        
        # Check file extension
        valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
        if not any(file.name.lower().endswith(ext) for ext in valid_extensions):
            raise ValidationError('File must be a valid image format (JPEG, PNG, GIF, WebP, or BMP).')
        
        # Get file path - handle both TemporaryUploadedFile and InMemoryUploadedFile
        if hasattr(file, 'temporary_file_path'):
            file_path = file.temporary_file_path()
        else:
            file.seek(0)  # Reset file pointer
            file_path = file
        
        # Try to open and verify the image
        with Image.open(file_path) as img:
            img.verify()
            
        # Reopen to get dimensions (verify() closes the file)
        # Reset file pointer for in-memory files
        if not hasattr(file, 'temporary_file_path'):
            file.seek(0)
            
        with Image.open(file_path) as img:
            width, height = img.size
            
            # Check reasonable dimensions
            if width > 10000 or height > 10000:
                raise ValidationError('Image dimensions are too large (maximum: 10000x10000).')
                
            if width < 100 or height < 100:
                raise ValidationError('Image dimensions are too small (minimum: 100x100).')
                
    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError('File is not a valid image.') from e


def validate_cover_image(file: UploadedFile):
    """
    Validate that the uploaded file is a valid cover image.
    
    Args:
        file: The uploaded file
    """
    # First validate as a regular image
    validate_image_file(file)
    
    # Additional validation for cover images
    max_size = 2 * 1024 * 1024  # 2MB
    if file.size > max_size:
        raise ValidationError('Cover image must be smaller than 2MB.')
    
    try:
        from PIL import Image
        
        # Get file path - handle both TemporaryUploadedFile and InMemoryUploadedFile
        if hasattr(file, 'temporary_file_path'):
            file_path = file.temporary_file_path()
        else:
            file.seek(0)  # Reset file pointer
            file_path = file
        
        with Image.open(file_path) as img:
            width, height = img.size
            
            # Prefer portrait orientation for covers
            aspect_ratio = width / height
            if aspect_ratio > 1.5:  # Too wide
                raise ValidationError('Cover image should be portrait or square (not too wide).')
                
    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError('Error validating cover image.') from e