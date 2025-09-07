import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangaCard } from "./MangaCard";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorPage } from "@/components/ui/error-page";
import { Series } from "@/lib/types";

interface MangaCarouselProps {
  title: string;
  // Support both old format (for legacy compatibility) and new Series type
  mangas?: Array<{
    id: string;
    title: string;
    rating: number;
    coverImage: string;
    latestChapter: number;
  }>;
  series?: Series[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const MangaCarousel = ({ 
  title, 
  mangas = [], 
  series = [], 
  isLoading = false,
  error = null,
  onRetry
}: MangaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 6;

  // Use series data if available, otherwise fall back to mangas
  const items = series.length > 0 ? series : mangas;

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

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-manga-text mb-4">{title}</h2>
      
      <div className="relative bg-manga-card rounded-xl border border-manga-border p-4 carousel-container">
        {isLoading ? (
          <LoadingState message={`Loading ${title.toLowerCase()}...`} className="py-12" />
        ) : error ? (
          <ErrorPage error={error} onRetry={onRetry} className="py-8" />
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-manga-text-muted">No manga available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Navigation buttons - only show if more items than view */}
            {items.length > itemsPerView && (
              <>
                {/* Left Navigation Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 transition-opacity duration-300 bg-manga-card/80 hover:bg-manga-card-hover border border-manga-border text-manga-text hover:text-manga-primary nav-button-left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {/* Right Navigation Button */}
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
                  <div 
                    key={('slug' in item) ? item.slug : item.id} 
                    className="flex-none px-2 w-1/6 min-w-0"
                    style={{ maxWidth: '200px' }}
                  >
                    {'slug' in item ? (
                      <MangaCard series={item} />
                    ) : (
                      <MangaCard {...item} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};