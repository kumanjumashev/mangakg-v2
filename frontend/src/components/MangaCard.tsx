import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface MangaCardProps {
  id: string;
  title: string;
  rating: number;
  coverImage: string;
  latestChapter?: number;
  className?: string;
}

export const MangaCard = ({ 
  id, 
  title, 
  rating, 
  coverImage, 
  latestChapter,
  className = "" 
}: MangaCardProps) => {
  return (
    <Link to={`/manga/${id}`} className={`group ${className}`}>
      <div className="relative overflow-hidden rounded-lg transition-all duration-300">
        <div className="aspect-[3/4] relative">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-manga-success text-white px-2 py-1 rounded text-xs font-bold">
            {rating.toFixed(1)}
          </div>
          {latestChapter && (
            <div className="absolute bottom-2 right-2 bg-manga-primary text-manga-dark px-2 py-1 rounded text-xs font-bold">
              Ch. {latestChapter}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3">
          <h3 className="text-manga-text font-medium text-sm line-clamp-2 group-hover:text-manga-primary transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
};