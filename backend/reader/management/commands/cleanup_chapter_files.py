"""
Django management command to clean up chapters with dangling file references.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from reader.models import Chapter


class Command(BaseCommand):
    """Clean up chapters with dangling file references."""
    
    help = 'Clean up chapters that have file fields pointing to non-existent files'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be cleaned without making changes',
        )
    
    def handle(self, *args, **options):
        """Handle the command."""
        dry_run = options['dry_run']
        
        self.stdout.write('Scanning chapters for dangling file references...')
        
        chapters_to_clean = []
        
        # Check all chapters that have a file field set
        for chapter in Chapter.objects.exclude(file__isnull=True).exclude(file=''):
            try:
                # Try to access the file size to check if file exists
                _ = chapter.file.size
            except (OSError, FileNotFoundError):
                # File doesn't exist
                chapters_to_clean.append(chapter)
                self.stdout.write(
                    f'Found dangling reference: {chapter} (file: {chapter.file})'
                )
        
        if not chapters_to_clean:
            self.stdout.write(
                self.style.SUCCESS('No chapters with dangling file references found.')
            )
            return
        
        self.stdout.write(
            f'Found {len(chapters_to_clean)} chapters with dangling file references.'
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN: No changes will be made.')
            )
            for chapter in chapters_to_clean:
                self.stdout.write(f'Would clean: {chapter}')
            return
        
        # Clean up the dangling references
        with transaction.atomic():
            for chapter in chapters_to_clean:
                old_file = str(chapter.file)
                chapter.file = None
                chapter.save(update_fields=['file'])
                self.stdout.write(
                    f'Cleaned: {chapter} (removed reference to {old_file})'
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully cleaned {len(chapters_to_clean)} chapters.'
            )
        )