import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chapter } from '@/lib/types';
import { getChapterNavigation, getReaderUrl } from '@/lib/utils';

interface UseKeyboardNavigationProps {
  chapters: Chapter[];
  currentChapterId: number;
  currentPage: number;
  totalPages: number;
  seriesSlug: string;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  chapters,
  currentChapterId,
  currentPage,
  totalPages,
  seriesSlug,
  onPageChange,
  onNextPage,
  onPrevPage,
  enabled = true,
}: UseKeyboardNavigationProps) {
  const navigate = useNavigate();
  
  // Get chapter navigation info
  const chapterNav = getChapterNavigation(chapters, currentChapterId);
  
  // Navigate to previous chapter
  const goToPreviousChapter = useCallback(() => {
    if (chapterNav.previousChapter) {
      navigate(getReaderUrl(chapterNav.previousChapter.id, 1));
    }
    // If no previous chapter, do nothing (as per requirements)
  }, [chapterNav.previousChapter, navigate]);
  
  // Navigate to next chapter or details page
  const goToNextChapter = useCallback(() => {
    if (chapterNav.nextChapter) {
      navigate(getReaderUrl(chapterNav.nextChapter.id, 1));
    } else {
      // If no next chapter, redirect to details page (as per requirements)
      // Note: This should use series ID, but we only have slug here
      navigate(`/manga/${seriesSlug}`);
    }
  }, [chapterNav.nextChapter, navigate, seriesSlug]);
  
  // Enhanced next page function that handles chapter progression
  const enhancedNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onNextPage();
    } else {
      // At last page of chapter, automatically advance to next chapter
      goToNextChapter();
    }
  }, [currentPage, totalPages, onNextPage, goToNextChapter]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Handle chapter navigation with Ctrl+Left/Right
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            goToPreviousChapter();
            break;
          case 'ArrowRight':
            event.preventDefault();
            goToNextChapter();
            break;
        }
        return;
      }
      
      // Handle regular page navigation
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          onPrevPage();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case ' ': // Spacebar for next page
          event.preventDefault();
          enhancedNextPage();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          window.scrollBy(0, -100);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          window.scrollBy(0, 100);
          break;
        case 'Home':
          event.preventDefault();
          onPageChange(1);
          break;
        case 'End':
          event.preventDefault();
          onPageChange(totalPages);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    enabled,
    goToPreviousChapter,
    goToNextChapter,
    onPrevPage,
    enhancedNextPage,
    onPageChange,
    totalPages,
  ]);
  
  return {
    chapterNav,
    goToPreviousChapter,
    goToNextChapter,
    enhancedNextPage,
  };
}