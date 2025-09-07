import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, Menu, Settings, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorPage } from "@/components/ui/error-page";
import { useChapterPages, useSeriesList } from "@/hooks/useApi";

const ReaderPage = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("single"); // single, double, vertical
  const [zoom, setZoom] = useState(100);
  
  // Fetch chapter pages
  const { 
    data: chapterData, 
    isLoading, 
    error,
    refetch 
  } = useChapterPages(parseInt(chapterId || "0"));

  // Fetch series list to find series ID from slug
  const { data: seriesListData } = useSeriesList({ page_size: 100 });
  const series = seriesListData?.results.find(s => s.slug === chapterData?.series_slug);
  const seriesId = series?.id;

  const totalPages = chapterData?.pages.length || 0;
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);
  
  // Navigation helpers (these would need additional API calls to get chapter list)
  const navigateToChapter = (chapterId: number) => {
    navigate(`/read/${chapterId}`);
  };

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
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
          event.preventDefault();
          nextPage();
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
  }, [nextPage, prevPage, viewMode]);

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
          onRetry={refetch}
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
                  <Link to={`/manga/${seriesId || chapterData.series_slug}`} className="text-manga-text hover:text-manga-primary">
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

          {/* Center - Chapter Info */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-manga-text font-medium">
                Chapter {chapterData.number}
              </p>
              <p className="text-manga-text-muted text-sm">
                {totalPages} pages
              </p>
            </div>
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
                  onClick={nextPage}
                  style={{ 
                    maxHeight: '90vh',
                    width: 'auto',
                    cursor: currentPage < totalPages ? "pointer" : "default" 
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
                  onClick={nextPage}
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
              onValueChange={(value) => setCurrentPage(parseInt(value))}
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
            onClick={() => navigate(`/manga/${seriesId || chapterData.series_slug}`)}
            className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Series
          </Button>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="text-center mt-8 text-manga-text-muted text-sm">
          <p>Use arrow keys, WASD, or click to navigate pages</p>
        </div>
      </main>
    </div>
  );
};

export default ReaderPage;