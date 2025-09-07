export interface ContinueReadingItem {
  mangaId: string;
  mangaTitle: string;
  mangaSlug: string;
  coverImage: string;
  currentChapter: number;
  currentChapterTitle?: string;
  currentChapterId?: string;
  totalChapters: number;
  lastReadAt: string; // ISO string
  progressPercentage: number; // 0-100
}

export interface ContinueReadingData {
  items: ContinueReadingItem[];
  lastUpdated: string; // ISO string
}

export interface ContinueReadingStorage {
  continueReading: ContinueReadingData;
}

export interface AddProgressParams {
  mangaId: string;
  mangaTitle: string;
  mangaSlug: string;
  coverImage: string;
  currentChapter: number;
  currentChapterTitle?: string;
  currentChapterId?: string;
  totalChapters: number;
}

export interface ContinueReadingHookReturn {
  items: ContinueReadingItem[];
  isLoading: boolean;
  error: string | null;
  addProgress: (params: AddProgressParams) => void;
  removeItem: (mangaId: string) => void;
  clearAll: () => void;
  refreshData: () => Promise<void>;
}