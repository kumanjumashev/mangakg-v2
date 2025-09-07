import { Link } from "react-router-dom";
import { BookOpen, X, RotateCcw } from "lucide-react";
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

  // Don't render if no items and not loading
  if (!isLoading && items.length === 0) {
    return null;
  }

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
      <section className={`mb-12 ${className}`}>
        <div className="flex items-center mb-6">
          <BookOpen className="w-6 h-6 text-manga-primary mr-2" />
          <h2 className="text-2xl font-bold text-manga-text">Continue Reading</h2>
        </div>
        <LoadingState message="Loading reading history..." className="py-8" />
      </section>
    );
  }

  if (error) {
    return (
      <section className={`mb-12 ${className}`}>
        <div className="flex items-center mb-6">
          <BookOpen className="w-6 h-6 text-manga-primary mr-2" />
          <h2 className="text-2xl font-bold text-manga-text">Continue Reading</h2>
        </div>
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <p className="text-manga-text-muted mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen className="w-6 h-6 text-manga-primary mr-2" />
          <h2 className="text-2xl font-bold text-manga-text">Continue Reading</h2>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="ghost" 
          size="sm"
          className="text-manga-text-muted hover:text-manga-primary"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <ContinueReadingCard 
            key={item.mangaId} 
            item={item}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>
    </section>
  );
};

interface ContinueReadingCardProps {
  item: ContinueReadingItem;
  onRemove: (e: React.MouseEvent, mangaId: string) => void;
}

const ContinueReadingCard = ({ item, onRemove }: ContinueReadingCardProps) => {
  const linkTo = item.currentChapterId ? 
    `/read/${item.currentChapterId}/${item.currentPage}` : 
    `/manga/${item.mangaId}`;

  return (
    <div className="bg-manga-card hover:bg-manga-card-hover rounded-lg p-4 transition-colors duration-300 group relative">
      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => onRemove(e, item.mangaId)}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-0 h-6 w-6"
      >
        <X className="w-3 h-3" />
      </Button>

      <Link to={linkTo} className="flex space-x-4">
        <div className="flex-shrink-0">
          <img
            src={item.coverImage}
            alt={item.mangaTitle}
            className="w-16 h-20 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = "/api/placeholder/300/400";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-manga-text font-medium mb-1 truncate">
            {item.mangaTitle}
          </h3>
          <p className="text-manga-text-muted text-sm mb-2">
            Chapter {item.currentChapter} - Page {item.currentPage} of {item.totalPagesInChapter}
          </p>
          <Progress value={item.progressPercentage} className="mb-3" />
          <Button 
            size="sm" 
            className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark pointer-events-none"
          >
            Continue Reading
          </Button>
        </div>
      </Link>
    </div>
  );
};