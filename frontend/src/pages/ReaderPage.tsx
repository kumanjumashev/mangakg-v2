import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, Menu, Settings, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data
const mangaInfo = {
  id: "1",
  title: "Attack on Titan",
  alternativeTitle: "Shingeki no Kyojin",
  totalChapters: 139
};

const currentChapter = {
  number: 1,
  volume: 1,
  pages: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    url: "/api/placeholder/800/1200"
  }))
};

const ReaderPage = () => {
  const { mangaId, chapterNumber } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("single"); // single, double, vertical
  const [zoom, setZoom] = useState(100);
  
  const totalPages = currentChapter.pages.length;
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const nextChapter = () => {
    // Navigate to next chapter
    const nextChapterNum = parseInt(chapterNumber || "1") + 1;
    if (nextChapterNum <= mangaInfo.totalChapters) {
      window.location.href = `/read/${mangaId}/${nextChapterNum}`;
    }
  };
  
  const prevChapter = () => {
    // Navigate to previous chapter  
    const prevChapterNum = parseInt(chapterNumber || "1") - 1;
    if (prevChapterNum >= 1) {
      window.location.href = `/read/${mangaId}/${prevChapterNum}`;
    }
  };

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
                  <Link to={`/manga/${mangaId}`} className="text-manga-text hover:text-manga-primary">
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
              <h1 className="text-manga-text font-bold text-lg">{mangaInfo.title}</h1>
              <p className="text-manga-text-muted text-sm">{mangaInfo.alternativeTitle}</p>
            </div>
          </div>

          {/* Center - Chapter Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevChapter}
              className="text-manga-text hover:text-manga-primary"
              disabled={parseInt(chapterNumber || "1") <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Select 
              value={chapterNumber} 
              onValueChange={(value) => window.location.href = `/read/${mangaId}/${value}`}
            >
              <SelectTrigger className="bg-manga-card border-manga-border text-manga-text min-w-[200px]">
                <SelectValue>
                  Vol. {currentChapter.volume}; Chapter {chapterNumber}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-manga-card border-manga-border max-h-60">
                {Array.from({ length: mangaInfo.totalChapters }, (_, i) => (
                  <SelectItem key={i + 1} value={`${i + 1}`} className="text-manga-text">
                    Vol. {Math.ceil((i + 1) / 4)}; Chapter {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextChapter}
              className="text-manga-text hover:text-manga-primary"
              disabled={parseInt(chapterNumber || "1") >= mangaInfo.totalChapters}
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
        <div className="text-center mb-4">
          <span className="text-manga-text-muted">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Manga Pages */}
        <div className="flex justify-center">
          <div 
            className="relative max-w-4xl"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {viewMode === "single" && (
              <div className="flex justify-center">
                <img
                  src={currentChapter.pages[currentPage - 1]?.url}
                  alt={`Page ${currentPage}`}
                  className="max-w-full h-auto shadow-2xl rounded-lg"
                  onClick={nextPage}
                  style={{ cursor: currentPage < totalPages ? "pointer" : "default" }}
                />
              </div>
            )}
            
            {viewMode === "double" && (
              <div className="flex justify-center space-x-4">
                {currentPage > 1 && (
                  <img
                    src={currentChapter.pages[currentPage - 2]?.url}
                    alt={`Page ${currentPage - 1}`}
                    className="max-w-md h-auto shadow-2xl rounded-lg"
                  />
                )}
                <img
                  src={currentChapter.pages[currentPage - 1]?.url}
                  alt={`Page ${currentPage}`}
                  className="max-w-md h-auto shadow-2xl rounded-lg"
                />
              </div>
            )}
            
            {viewMode === "vertical" && (
              <div className="space-y-4">
                {currentChapter.pages.map((page) => (
                  <img
                    key={page.id}
                    src={page.url}
                    alt={`Page ${page.id}`}
                    className="max-w-full h-auto shadow-2xl rounded-lg mx-auto block"
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
                {currentChapter.pages.map((_, index) => (
                  <SelectItem key={index + 1} value={`${index + 1}`} className="text-manga-text">
                    Page {index + 1}
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

        {/* Chapter Navigation */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            onClick={prevChapter}
            disabled={parseInt(chapterNumber || "1") <= 1}
            className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Chapter
          </Button>
          
          <Button
            onClick={nextChapter}
            disabled={parseInt(chapterNumber || "1") >= mangaInfo.totalChapters}
            className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
          >
            Next Chapter
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ReaderPage;