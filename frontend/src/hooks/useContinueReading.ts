import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ContinueReadingItem, 
  ContinueReadingHookReturn, 
  AddProgressParams 
} from '../types/continueReading';
import {
  getContinueReadingItems,
  addToContinueReading,
  removeFromContinueReading,
  clearContinueReadingData,
  updateReadingProgress,
  isLocalStorageAvailable
} from '../lib/localStorage';
import { apiClient } from '../lib/api';
import { SeriesDetailResponse, ChapterListResponse } from '../lib/types';

export function useContinueReading(): ContinueReadingHookReturn {
  const [items, setItems] = useState<ContinueReadingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from localStorage
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      setError('localStorage is not available');
      setIsLoading(false);
      return;
    }

    try {
      const storedItems = getContinueReadingItems();
      setItems(storedItems);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load continue reading data:', err);
      setError('Failed to load reading history');
      setIsLoading(false);
    }
  }, []);

  // Validate manga existence and refresh data from API
  const { refetch: validateItems } = useQuery({
    queryKey: ['validateContinueReading'],
    queryFn: async () => {
      if (items.length === 0) return items;

      const validatedItems: ContinueReadingItem[] = [];
      
      for (const item of items) {
        try {
          // Check if manga still exists
          const mangaData = await apiClient.get<SeriesDetailResponse>(`/series/${item.mangaSlug}/`);
          
          // Get updated chapter count
          const chaptersData = await apiClient.get<ChapterListResponse>(`/series/${item.mangaSlug}/chapters/`);
          const totalChapters = chaptersData.results?.length || mangaData.chapter_count || item.totalChapters;
          
          // Update item with latest data
          const updatedItem: ContinueReadingItem = {
            ...item,
            mangaTitle: mangaData.title || item.mangaTitle,
            coverImage: mangaData.cover_url || item.coverImage,
            totalChapters,
            progressPercentage: item.totalPagesInChapter > 0 ? 
              Math.round((item.currentPage / item.totalPagesInChapter) * 100) : 0
          };
          
          validatedItems.push(updatedItem);
        } catch (err) {
          console.warn(`Failed to validate manga ${item.mangaSlug}, removing from continue reading:`, err);
          // Remove invalid items from localStorage
          removeFromContinueReading(item.mangaId);
        }
      }

      return validatedItems;
    },
    enabled: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add or update manga progress
  const addProgress = useCallback((params: AddProgressParams) => {
    try {
      addToContinueReading(params);
      const updatedItems = getContinueReadingItems();
      setItems(updatedItems);
      setError(null);
    } catch (err) {
      console.error('Failed to add progress:', err);
      setError('Failed to save reading progress');
    }
  }, []);

  // Remove specific item
  const removeItem = useCallback((mangaId: string) => {
    try {
      removeFromContinueReading(mangaId);
      const updatedItems = getContinueReadingItems();
      setItems(updatedItems);
      setError(null);
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item');
    }
  }, []);

  // Clear all items
  const clearAll = useCallback(() => {
    try {
      clearContinueReadingData();
      setItems([]);
      setError(null);
    } catch (err) {
      console.error('Failed to clear all items:', err);
      setError('Failed to clear reading history');
    }
  }, []);

  // Refresh data by validating with API
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await validateItems();
      if (result.data) {
        setItems(result.data);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh reading history');
    } finally {
      setIsLoading(false);
    }
  }, [validateItems]);

  // Update progress for existing manga (used in reader)
  const updateProgress = useCallback((
    mangaId: string, 
    currentChapter: number, 
    currentPage: number,
    totalPagesInChapter: number,
    totalChapters: number, 
    chapterTitle?: string, 
    chapterId?: string
  ) => {
    try {
      updateReadingProgress(mangaId, currentChapter, currentPage, totalPagesInChapter, totalChapters, chapterTitle, chapterId);
      const updatedItems = getContinueReadingItems();
      setItems(updatedItems);
      setError(null);
    } catch (err) {
      console.error('Failed to update progress:', err);
      setError('Failed to update reading progress');
    }
  }, []);

  return {
    items,
    isLoading,
    error,
    addProgress,
    removeItem,
    clearAll,
    refreshData,
    updateProgress
  } as ContinueReadingHookReturn & { updateProgress: typeof updateProgress };
}