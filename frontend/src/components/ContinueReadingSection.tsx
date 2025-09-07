import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ContinueReadingItem } from "@/types/continueReading";
import { useContinueReading } from "@/hooks/useContinueReading";

interface ContinueReadingSectionProps {
  className?: string;
}

export const ContinueReadingSection = ({ className = "" }: ContinueReadingSectionProps) => {
  const { items, isLoading, error, removeItem, refreshData } = useContinueReading();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;

  // Don't render if no items and not loading
  if (!isLoading && items.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= items.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, items.length - itemsPerView) : Math.max(0, prev - itemsPerView)
    );
  };

  const handleRemoveItem = (e: React.MouseEvent, mangaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(mangaId);
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await refreshData();
  };

  if (isLoading) {
    return (
      <div className={`mb-6 ${className}`}>
        <h2 className="text-2xl font-bold text-manga-text mb-4">Continue Reading</h2>
        <div className="relative bg-manga-card rounded-xl border border-manga-border p-4">
          <LoadingState message="Loading reading history..." className="py-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mb-6 ${className}`}>
        <h2 className="text-2xl font-bold text-manga-text mb-4">Continue Reading</h2>
        <div className="relative bg-manga-card rounded-xl border border-manga-border p-4">
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <p className="text-manga-text-muted mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-manga-text">Continue Reading</h2>
        {items.length > 0 && (
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size="sm"
            className="text-manga-text-muted hover:text-manga-primary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
      
      <div className="relative bg-manga-card rounded-xl border border-manga-border p-4 carousel-container">
        {/* Navigation buttons - only show if more items than view */}
        {items.length > itemsPerView && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 transition-opacity duration-300 bg-manga-card/80 hover:bg-manga-card-hover border border-manga-border text-manga-text hover:text-manga-primary nav-button-left"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 transition-opacity duration-300 bg-manga-card/80 hover:bg-manga-card-hover border border-manga-border text-manga-text hover:text-manga-primary nav-button-right"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ 
              transform: items.length > itemsPerView 
                ? `translateX(-${(currentIndex / itemsPerView) * 100}%)` 
                : 'translateX(0)' 
            }}
          >
            {items.map((item) => (
              <ContinueReadingCard 
                key={item.mangaId} 
                item={item}
                onRemove={handleRemoveItem}
                className="flex-none px-2 w-1/4 min-w-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContinueReadingCardProps {
  item: ContinueReadingItem;
  onRemove: (e: React.MouseEvent, mangaId: string) => void;
  className?: string;
}

const ContinueReadingCard = ({ item, onRemove, className = "" }: ContinueReadingCardProps) => {
  const linkTo = `/manga/${item.mangaId}${item.currentChapterId ? `/chapter/${item.currentChapterId}` : ''}`;

  return (
    <div className={`group relative ${className}`}>
      <Link to={linkTo} className="block">
        <div className="relative overflow-hidden rounded-lg transition-all duration-300 bg-manga-card-hover border border-manga-border hover:border-manga-primary">
          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => onRemove(e, item.mangaId)}
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-0 h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Cover image */}
          <div className="aspect-[3/4] relative overflow-hidden">
            <img
              src={item.coverImage}
              alt={item.mangaTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/api/placeholder/300/400";
              }}
            />
            
            {/* Progress overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Chapter info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-white text-sm font-medium mb-2">
                Chapter {item.currentChapter}
                {item.currentChapterTitle && (
                  <span className="block text-xs text-white/80 truncate">
                    {item.currentChapterTitle}
                  </span>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="space-y-1">
                <Progress 
                  value={item.progressPercentage} 
                  className="h-2 bg-white/20" 
                />
                <div className="flex justify-between text-xs text-white/80">
                  <span>{item.progressPercentage}% complete</span>
                  <span>{item.currentChapter} / {item.totalChapters}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="p-3">
            <h3 className="text-manga-text font-medium text-sm line-clamp-2 group-hover:text-manga-primary transition-colors">
              {item.mangaTitle}
            </h3>
            <p className="text-xs text-manga-text-muted mt-1">
              Last read {new Date(item.lastReadAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};