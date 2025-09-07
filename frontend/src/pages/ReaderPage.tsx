import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, Menu, Settings, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorPage } from "@/components/ui/error-page";
import { useChapterPages, useSeriesDetail, useSeriesList } from "@/hooks/useApi";
import { useContinueReading } from "@/hooks/useContinueReading";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import ChapterSelector from "@/components/ChapterSelector";

const ReaderPage = () => {
  const { chapterId, page } = useParams<{ chapterId: string; page?: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(page ? parseInt(page) : 1);
  const [viewMode, setViewMode] = useState("single"); // single, double, vertical
  const [zoom, setZoom] = useState(100);
  
  // Continue reading functionality
  const { addProgress } = useContinueReading();
  
  // Fetch chapter pages
  const { 
    data: chapterData, 
    isLoading: isChapterLoading, 
    error: chapterError,
    refetch: refetchChapter 
  } = useChapterPages(parseInt(chapterId || "0"));

  // Fetch series list to find the series by slug
  const { data: seriesListData, isLoading: isSeriesListLoading } = useSeriesList({ page_size: 100 });
  
  // Find the series that matches our chapter's series_slug
  const currentSeries = seriesListData?.results.find(series => series.slug === chapterData?.series_slug);
  
  // Fetch series details to get all chapters
  const { 
    data: seriesData, 
    isLoading: isSeriesLoading,
    error: seriesError
  } = useSeriesDetail(currentSeries?.id || 0);
  
  const isLoading = isChapterLoading || isSeriesListLoading || isSeriesLoading;
  const error = chapterError || seriesError;

  const totalPages = chapterData?.pages.length || 0;
  
  // Get real chapters data from series
  const allChapters = seriesData?.chapters || [];
  
  // Update current page when page parameter changes
  useEffect(() => {
    if (page) {
      const pageNum = parseInt(page);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
      }
    }
  }, [page, totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      // Update URL to reflect current page
      navigate(`/read/${chapterId}/${newPage}`, { replace: true });
    }
  }, [currentPage, totalPages, chapterId, navigate]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      // Update URL to reflect current page
      navigate(`/read/${chapterId}/${newPage}`, { replace: true });
    }
  }, [currentPage, chapterId, navigate]);
  
  // Chapter navigation
  const handleChapterSelect = useCallback((newChapterId: number) => {
    navigate(`/read/${newChapterId}/1`);
  }, [navigate]);

  // Get chapter navigation info
  const { chapterNav } = useKeyboardNavigation({
    chapters: allChapters,
    currentChapterId: parseInt(chapterId || "0"),
    currentPage,
    totalPages,
    seriesSlug: chapterData?.series_slug || "",
    onPageChange: (page) => {
      setCurrentPage(page);
      navigate(`/read/${chapterId}/${page}`, { replace: true });
    },
    onNextPage: nextPage,
    onPrevPage: prevPage,
    enabled: false, // We'll handle navigation separately
  });

  // Chapter navigation functions
  const goToPreviousChapter = useCallback(() => {
    if (chapterNav.previousChapter) {
      navigate(`/read/${chapterNav.previousChapter.id}/1`);
    }
  }, [chapterNav.previousChapter, navigate]);

  const goToNextChapter = useCallback(() => {
    if (chapterNav.nextChapter) {
      navigate(`/read/${chapterNav.nextChapter.id}/1`);
    } else if (currentSeries) {
      // Redirect to details page using series ID
      navigate(`/manga/${currentSeries.id}`);
    }
  }, [chapterNav.nextChapter, navigate, currentSeries]);

  // Enhanced next page function that handles chapter progression
  const enhancedNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      nextPage();
    } else {
      // At last page of chapter, automatically advance to next chapter
      goToNextChapter();
    }
  }, [currentPage, totalPages, nextPage, goToNextChapter]);

  // Keyboard navigation
  useEffect(() => {
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
          prevPage();
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
          if (viewMode !== "vertical") {
            event.preventDefault();
            window.scrollBy(0, -100);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (viewMode !== "vertical") {
            event.preventDefault();
            window.scrollBy(0, 100);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPreviousChapter, goToNextChapter, prevPage, enhancedNextPage, viewMode]);

  // Track reading progress when chapter data loads or page changes
  useEffect(() => {
    if (chapterData && currentSeries) {
      // Add/update progress in continue reading with real data
      addProgress({
        mangaId: currentSeries.id.toString(),
        mangaTitle: chapterData.series_title,
        mangaSlug: chapterData.series_slug,
        coverImage: currentSeries.cover_url || "/api/placeholder/300/400",
        currentChapter: chapterData.number,
        currentChapterTitle: chapterData.title,
        currentChapterId: chapterId || "",
        currentPage: currentPage,
        totalPagesInChapter: totalPages,
        totalChapters: currentSeries.chapter_count || allChapters.length
      });
    }
  }, [chapterData, currentSeries, chapterId, currentPage, totalPages, allChapters.length, addProgress]);

  // Auto-scroll to top when changing pages in single/double mode
  useEffect(() => {
    if (viewMode !== "vertical") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, viewMode]);

  // Preload next few images for better performance
  useEffect(() => {
    if (chapterData?.pages && viewMode === "single") {
      const preloadCount = 3;
      for (let i = currentPage; i < Math.min(currentPage + preloadCount, chapterData.pages.length); i++) {
        const img = new Image();
        img.src = chapterData.pages[i].image_url;
      }
    }
  }, [currentPage, chapterData?.pages, viewMode]);

  // Note: Keyboard navigation is now handled by useKeyboardNavigation hook

  if (isLoading) {
    return (
      <div className="min-h-screen bg-manga-darker">
        <LoadingState message="Loading chapter..." className="py-24" />
      </div>
    );
  }

  if (error || !chapterData) {
    return (
      <div className="min-h-screen bg-manga-darker">
        <ErrorPage 
          error={error} 
          onRetry={refetchChapter}
          className="py-24"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-darker">
      {/* Reader Header */}
      <header className="bg-manga-dark border-b border-manga-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left Side - Navigation */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-manga-text hover:text-manga-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-manga-card border-manga-border">
                <DropdownMenuItem asChild>
                  <Link to={`/manga/${currentSeries?.id || chapterData.series_slug}`} className="text-manga-text hover:text-manga-primary">
                    Back to Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/catalogue" className="text-manga-text hover:text-manga-primary">
                    Back to Catalogue
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Manga Title */}
            <div>
              <h1 className="text-manga-text font-bold text-lg">{chapterData.series_title}</h1>
              <p className="text-manga-text-muted text-sm">
                Chapter {chapterData.number}: {chapterData.title}
              </p>
            </div>
          </div>

          {/* Center - Chapter Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousChapter}
              disabled={!chapterNav.previousChapter}
              className="text-manga-text hover:text-manga-primary disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {allChapters.length > 0 && (
              <ChapterSelector
                chapters={allChapters}
                currentChapterId={parseInt(chapterId || "0")}
                onChapterSelect={handleChapterSelect}
                readChapterIds={new Set()} // Will be implemented with reading progress
                className="min-w-[250px]"
              />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextChapter}
              disabled={!chapterNav.nextChapter && !currentSeries}
              className="text-manga-text hover:text-manga-primary disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right Side - Settings */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="text-manga-text hover:text-manga-primary"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-manga-text text-sm min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="text-manga-text hover:text-manga-primary"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="bg-manga-card border-manga-border text-manga-text w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-manga-card border-manga-border">
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Reader Content */}
      <main className="container mx-auto px-4 py-4">
        {/* Page Counter */}
        {viewMode !== "vertical" && (
          <div className="text-center mb-4">
            <span className="text-manga-text-muted">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}

        {/* Manga Pages */}
        <div className="flex justify-center">
          <div 
            className="relative max-w-4xl"
            style={{ 
              transform: viewMode !== "vertical" ? `scale(${zoom / 100})` : undefined,
              transformOrigin: 'top center'
            }}
          >
            {viewMode === "single" && (
              <div className="flex justify-center">
                <img
                  src={chapterData.pages[currentPage - 1]?.image_url}
                  alt={`Page ${currentPage}`}
                  className="max-w-full h-auto shadow-2xl rounded-lg cursor-pointer"
                  onClick={enhancedNextPage}
                  style={{ 
                    maxHeight: '90vh',
                    width: 'auto',
                    cursor: "pointer"
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/800/1200";
                  }}
                />
              </div>
            )}
            
            {viewMode === "double" && (
              <div className="flex justify-center space-x-4">
                {currentPage > 1 && (
                  <img
                    src={chapterData.pages[currentPage - 2]?.image_url}
                    alt={`Page ${currentPage - 1}`}
                    className="max-w-md h-auto shadow-2xl rounded-lg"
                    style={{ maxHeight: '90vh' }}
                    onError={(e) => {
                      e.currentTarget.src = "/api/placeholder/800/1200";
                    }}
                  />
                )}
                <img
                  src={chapterData.pages[currentPage - 1]?.image_url}
                  alt={`Page ${currentPage}`}
                  className="max-w-md h-auto shadow-2xl rounded-lg cursor-pointer"
                  style={{ maxHeight: '90vh' }}
                  onClick={enhancedNextPage}
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/800/1200";
                  }}
                />
              </div>
            )}
            
            {viewMode === "vertical" && (
              <div className="space-y-4">
                {chapterData.pages.map((page) => (
                  <img
                    key={page.id}
                    src={page.image_url}
                    alt={`Page ${page.number}`}
                    className="max-w-full h-auto shadow-2xl rounded-lg mx-auto block"
                    style={{ 
                      width: `${zoom}%`,
                      maxWidth: '800px'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/api/placeholder/800/1200";
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        {viewMode !== "vertical" && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <Button
              variant="secondary"
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="bg-manga-card hover:bg-manga-card-hover"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Select 
              value={currentPage.toString()} 
              onValueChange={(value) => {
                const newPage = parseInt(value);
                setCurrentPage(newPage);
                navigate(`/read/${chapterId}/${newPage}`, { replace: true });
              }}
            >
              <SelectTrigger className="bg-manga-card border-manga-border text-manga-text w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-manga-card border-manga-border max-h-60">
                {chapterData.pages.map((page) => (
                  <SelectItem key={page.number} value={page.number.toString()} className="text-manga-text">
                    Page {page.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="secondary"
              onClick={nextPage}
              disabled={currentPage >= totalPages}
              className="bg-manga-card hover:bg-manga-card-hover"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Chapter Navigation Placeholder */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            onClick={() => navigate(`/manga/${currentSeries?.id || chapterData.series_slug}`)}
            className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Series
          </Button>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="text-center mt-8 text-manga-text-muted text-sm">
          <p>Use arrow keys, WASD, or click to navigate pages</p>
          <p>Use Ctrl + arrow keys to navigate between chapters</p>
        </div>
      </main>
    </div>
  );
};

export default ReaderPage;