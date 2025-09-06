import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangaCard } from "./MangaCard";

interface MangaCarouselProps {
  title: string;
  mangas: Array<{
    id: string;
    title: string;
    rating: number;
    coverImage: string;
    latestChapter: number;
  }>;
}

export const MangaCarousel = ({ title, mangas }: MangaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 6;

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= mangas.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, mangas.length - itemsPerView) : Math.max(0, prev - itemsPerView)
    );
  };

  return (
    <div className="relative bg-manga-card rounded-xl border border-manga-border p-4 carousel-container">
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

      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${(currentIndex / itemsPerView) * 100}%)` }}
        >
          {mangas.map((manga) => (
            <div key={manga.id} className="flex-none w-1/6 px-2">
              <MangaCard {...manga} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};