import { Header } from "@/components/Header";
import { MangaCarousel } from "@/components/MangaCarousel";
import { ContinueReadingSection } from "@/components/ContinueReadingSection";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorPage, CookingPage } from "@/components/ui/error-page";
import { useFeaturedSeries, useRecentUpdates } from "@/hooks/useApi";
import { useTranslation } from "@/hooks/useTranslation";


const HomePage = () => {
  const { t } = useTranslation();

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
          {/* Featured Manga section - title removed */}
          <MangaCarousel 
            series={featuredData?.results || []}
            isLoading={featuredLoading}
            error={featuredError}
            onRetry={refetchFeatured}
          />
        </section>

        {/* Continue Reading Section */}
        <ContinueReadingSection />

        {/* Recent Updates */}
        <section>
          <MangaCarousel
            title={t('manga.recentUpdates')}
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