// Custom hooks for API calls using TanStack Query
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  SeriesListResponse,
  SeriesDetailResponse,
  ChapterListResponse,
  ChapterPagesResponse,
  CategoriesResponse,
  SearchParams,
  SeriesSearchResponse,
} from '@/lib/types';

// Query keys
export const queryKeys = {
  series: {
    all: ['series'] as const,
    lists: () => [...queryKeys.series.all, 'list'] as const,
    list: (params?: SearchParams) => [...queryKeys.series.lists(), params] as const,
    details: () => [...queryKeys.series.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.series.details(), slug] as const,
    search: (params: SearchParams) => [...queryKeys.series.all, 'search', params] as const,
  },
  chapters: {
    all: ['chapters'] as const,
    lists: () => [...queryKeys.chapters.all, 'list'] as const,
    list: (seriesSlug: string, page?: number) => [...queryKeys.chapters.lists(), seriesSlug, page] as const,
    details: () => [...queryKeys.chapters.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.chapters.details(), id] as const,
    pages: (id: number) => [...queryKeys.chapters.all, 'pages', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
} as const;

// Series hooks
export function useSeriesList(params?: SearchParams) {
  return useQuery({
    queryKey: queryKeys.series.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
      if (params?.search) searchParams.append('search', params.search);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.categories?.length) {
        params.categories.forEach(cat => searchParams.append('categories', cat));
      }
      if (params?.authors?.length) {
        params.authors.forEach(author => searchParams.append('authors', author));
      }
      if (params?.publication_year) {
        searchParams.append('publication_year', params.publication_year.toString());
      }
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `${API_ENDPOINTS.SERIES}?${queryString}` : API_ENDPOINTS.SERIES;
      return apiClient.get<SeriesListResponse>(endpoint);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSeriesDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.series.detail(id.toString()),
    queryFn: () => apiClient.get<SeriesDetailResponse>(API_ENDPOINTS.SERIES_DETAIL(id)),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id && id > 0,
  });
}

export function useSeriesInfinite(params?: SearchParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.series.list(params),
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', pageParam.toString());
      if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
      if (params?.search) searchParams.append('search', params.search);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.categories?.length) {
        params.categories.forEach(cat => searchParams.append('categories', cat));
      }
      if (params?.authors?.length) {
        params.authors.forEach(author => searchParams.append('authors', author));
      }
      if (params?.publication_year) {
        searchParams.append('publication_year', params.publication_year.toString());
      }
      
      const endpoint = `${API_ENDPOINTS.SERIES}?${searchParams.toString()}`;
      return apiClient.get<SeriesListResponse>(endpoint);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      const page = url.searchParams.get('page');
      return page ? parseInt(page) : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Chapter hooks - get chapters from series detail instead of separate endpoint
export function useChaptersList(seriesId: number, page = 1) {
  const seriesDetail = useSeriesDetail(seriesId);
  
  return {
    data: seriesDetail.data ? {
      count: seriesDetail.data.chapters?.length || 0,
      next: null,
      previous: null,
      results: seriesDetail.data.chapters || []
    } : undefined,
    isLoading: seriesDetail.isLoading,
    error: seriesDetail.error,
    refetch: seriesDetail.refetch,
  };
}

export function useChapterPages(chapterId: number) {
  return useQuery({
    queryKey: queryKeys.chapters.pages(chapterId),
    queryFn: () => apiClient.get<ChapterPagesResponse>(API_ENDPOINTS.CHAPTER_PAGES(chapterId)),
    staleTime: 30 * 60 * 1000, // 30 minutes for pages
  });
}

// Search and filtering hooks
export function useSeriesSearch(params: SearchParams) {
  return useQuery({
    queryKey: queryKeys.series.search(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.page_size) searchParams.append('page_size', params.page_size.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.categories?.length) {
        params.categories.forEach(cat => searchParams.append('categories', cat));
      }
      if (params.authors?.length) {
        params.authors.forEach(author => searchParams.append('authors', author));
      }
      if (params.publication_year) {
        searchParams.append('publication_year', params.publication_year.toString());
      }
      
      const endpoint = `${API_ENDPOINTS.SEARCH}?${searchParams.toString()}`;
      return apiClient.get<SeriesSearchResponse>(endpoint);
    },
    enabled: !!params.search || !!params.categories?.length || !!params.authors?.length || !!params.status,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => apiClient.get<CategoriesResponse>(API_ENDPOINTS.CATEGORIES),
    staleTime: 60 * 60 * 1000, // 1 hour for categories
  });
}

// Featured/trending series hooks  
export function useFeaturedSeries() {
  return useQuery({
    queryKey: [...queryKeys.series.lists(), 'featured'],
    queryFn: () => {
      // Just get the first 10 series as "featured"
      const endpoint = `${API_ENDPOINTS.SERIES}?page_size=10`;
      return apiClient.get<SeriesListResponse>(endpoint);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRecentUpdates() {
  return useQuery({
    queryKey: [...queryKeys.series.lists(), 'recent-updates'],
    queryFn: () => {
      // Get series ordered by last update
      const endpoint = `${API_ENDPOINTS.SERIES}?page_size=12`;
      return apiClient.get<SeriesListResponse>(endpoint);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}