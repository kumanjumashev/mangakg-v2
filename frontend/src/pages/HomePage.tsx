import { Header } from "@/components/Header";
import { MangaCarousel } from "@/components/MangaCarousel";
import { MangaCard } from "@/components/MangaCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorPage, CookingPage } from "@/components/ui/error-page";
import { BookOpen } from "lucide-react";
import { useFeaturedSeries, useRecentUpdates } from "@/hooks/useApi";
import attackOnTitanCover from "@/assets/manga-covers/attack-on-titan.jpg";
import onePieceCover from "@/assets/manga-covers/one-piece.jpg";

// Mock continue reading data - this would eventually come from user's reading history
const continueReading = [
  {
    id: "1",
    title: "Attack on Titan",
    rating: 9.6,
    coverImage: attackOnTitanCover,
    lastChapterRead: 85,
    totalChapters: 139,
    progress: 61
  },
  {
    id: "2",
    title: "One Piece", 
    rating: 9.8,
    coverImage: onePieceCover,
    lastChapterRead: 1090,
    totalChapters: 1098,
    progress: 99
  },
  {
    id: "3",
    title: "Demon Slayer",
    rating: 9.7,
    coverImage: "/api/placeholder/300/400",
    lastChapterRead: 180,
    totalChapters: 205,
    progress: 88
  }
];

const HomePage = () => {
  // Fetch data using API hooks
  const { 
    data: featuredData, 
    isLoading: featuredLoading, 
    error: featuredError,
    refetch: refetchFeatured 
  } = useFeaturedSeries();

  const { 
    data: recentData, 
    isLoading: recentLoading, 
    error: recentError,
    refetch: refetchRecent 
  } = useRecentUpdates();

  // Handle server unavailable errors with cooking page
  const isServerError = (error: unknown) => {
    if (!error || typeof error !== 'object') return false;
    const err = error as { status?: number; message?: string };
    return (err.status && err.status >= 500) || err.message?.includes('Failed to connect');
  };

  // If both API calls fail with server errors, show cooking page
  // Only show cooking page if both are actual server errors, not just any errors
  if (featuredError && recentError && 
      isServerError(featuredError) && isServerError(recentError)) {
    return (
      <div className="min-h-screen bg-manga-dark">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <CookingPage />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Featured Section */}
        <section className="mb-12">
          <MangaCarousel 
            title="Featured Manga" 
            series={featuredData?.results || []}
            isLoading={featuredLoading}
            error={featuredError}
            onRetry={refetchFeatured}
          />
        </section>

        {/* Continue Reading Section - keeping mock data for now */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 text-manga-primary mr-2" />
            <h2 className="text-2xl font-bold text-manga-text">Continue Reading</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueReading.map((manga) => (
              <div 
                key={manga.id} 
                className="bg-manga-card hover:bg-manga-card-hover rounded-lg p-4 transition-colors duration-300"
              >
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={manga.coverImage}
                      alt={manga.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-manga-text font-medium mb-1 truncate">
                      {manga.title}
                    </h3>
                    <p className="text-manga-text-muted text-sm mb-2">
                      Chapter {manga.lastChapterRead} of {manga.totalChapters}
                    </p>
                    <Progress value={manga.progress} className="mb-3" />
                    <Button 
                      size="sm" 
                      className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
                    >
                      Continue Reading
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Updates */}
        <section>
          <MangaCarousel 
            title="Recent Updates" 
            series={recentData?.results || []}
            isLoading={recentLoading}
            error={recentError}
            onRetry={refetchRecent}
          />
        </section>
      </main>
    </div>
  );
};

export default HomePage;