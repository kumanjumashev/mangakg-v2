import { Link } from "react-router-dom";
// TODO: Re-enable for v2 - import { Star } from "lucide-react";
import { Series } from "@/lib/types";

interface MangaCardProps {
  // Support both old format (for legacy compatibility) and new Series type
  id?: string;
  title?: string;
  rating?: number;
  coverImage?: string;
  latestChapter?: number;
  className?: string;
  // New Series-based props
  series?: Series;
}

export const MangaCard = ({ 
  id, 
  title, 
  rating, 
  coverImage, 
  latestChapter,
  series,
  className = "" 
}: MangaCardProps) => {
  // Use series data if available, otherwise fall back to individual props
  const seriesData = series || {
    id: parseInt(id || "0"),
    slug: id || "",
    title: title || "",
    rating: rating || 0,
    cover_image: coverImage,
    latest_chapter: latestChapter ? { 
      id: 0, 
      title: `Chapter ${latestChapter}`, 
      number: latestChapter,
      created_at: ""
    } : undefined
  };

  const linkTo = `/manga/${series ? series.id : id}`;
  const displayTitle = series ? series.title : title || "";
  const displayRating = series ? (series.rating === 'safe' ? 8.5 : 7.5) : rating || 0; // Convert rating string to number
  const displayCover = series?.cover_url || coverImage;
  const displayLatestChapter = series?.latest_chapter?.number || latestChapter;

  return (
    <Link to={linkTo} className={`group ${className}`}>
      <div className="relative overflow-hidden rounded-lg transition-all duration-300">
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={displayCover}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* TODO: Implement rating system for v2 */}
          {/* <div className="absolute top-2 left-2 bg-manga-success text-white px-2 py-1 rounded text-xs font-bold">
            {displayRating.toFixed(1)}
          </div> */}
          {displayLatestChapter && (
            <div className="absolute bottom-2 right-2 bg-manga-primary text-manga-dark px-2 py-1 rounded text-xs font-bold">
              Ch. {displayLatestChapter}
            </div>
          )}
          {series?.kind === 'featured' && (
            <div className="absolute top-2 right-2 bg-manga-primary text-manga-dark px-2 py-1 rounded text-xs font-bold">
              Featured
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3">
          <h3 className="text-manga-text font-medium text-sm line-clamp-2 group-hover:text-manga-primary transition-colors">
            {displayTitle}
          </h3>
          {series && (
            <div className="mt-1 text-xs text-manga-text-muted">
              {series.categories.slice(0, 2).map(cat => cat.name).join(", ")}
              {series.categories.length > 2 && "..."}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};