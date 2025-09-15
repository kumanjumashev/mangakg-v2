import { useState } from "react";
import { useParams, Link } from "react-router-dom"; 
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorPage } from "@/components/ui/error-page";
import { BookOpen, Calendar, User, Eye, Play, ChevronLeft, ChevronRight } from "lucide-react";
// TODO: Re-enable for v2 - import { Star, Heart, Bookmark } from "lucide-react";
import { useSeriesDetail, useChaptersList } from "@/hooks/useApi";
import { useTranslation } from "@/hooks/useTranslation";

const MangaDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  // TODO: Re-enable for v2
  // const [isInFavorites, setIsInFavorites] = useState(false);
  // const [isBookmarked, setIsBookmarked] = useState(false);
  const [chaptersPage, setChaptersPage] = useState(1);

  const seriesId = parseInt(id || "0");

  // Fetch series details
  const { 
    data: seriesData, 
    isLoading: seriesLoading, 
    error: seriesError,
    refetch: refetchSeries 
  } = useSeriesDetail(seriesId);

  // Fetch chapters list
  const { 
    data: chaptersData, 
    isLoading: chaptersLoading, 
    error: chaptersError,
    refetch: refetchChapters 
  } = useChaptersList(seriesId, chaptersPage);

  if (seriesLoading) {
    return (
      <div className="min-h-screen bg-manga-dark">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <LoadingState message="Loading manga details..." className="py-24" />
        </main>
      </div>
    );
  }

  if (seriesError || !seriesData) {
    return (
      <div className="min-h-screen bg-manga-dark">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ErrorPage 
            error={seriesError} 
            onRetry={refetchSeries}
            className="py-24"
          />
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-600 text-white';
      case 'completed': return 'bg-blue-600 text-white';
      case 'hiatus': return 'bg-yellow-600 text-black';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Use series images or fallback to placeholder API
  const coverImage = seriesData.cover_url;
  const bannerImage = seriesData.cover_url;

  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />
      
      <main>
        {/* Hero Banner */}
        <div 
          className="relative h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-manga-dark via-manga-dark/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-manga-dark via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="flex items-end h-full pb-8">
              <div className="flex space-x-6">
                {/* Cover Image */}
                <div className="flex-shrink-0">
                  <img
                    src={coverImage}
                    alt={seriesData.title}
                    className="w-48 h-72 object-cover rounded-lg shadow-2xl"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-manga-text mb-2">
                    {seriesData.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    {/* TODO: Implement rating system for v2 */}
                    {/* <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-manga-text font-bold">
                        {seriesData.rating === 'safe' ? '8.5' : '7.5'}
                      </span>
                    </div> */}
                    <Badge className={getStatusColor(seriesData.status)}>
                      {t(`manga.status.${seriesData.status}`)}
                    </Badge>
                    {seriesData.licensed && (
                      <Badge className="bg-green-600 text-white">
                        {t('manga.licensed')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {seriesData.categories.map((category) => (
                      <Badge key={category.slug} className="bg-manga-primary text-manga-dark">
                        {category.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
                      asChild
                    >
                      <Link to={`/read/${seriesData.chapters?.[0]?.id || 1}`}>
                        <Play className="w-4 h-4 mr-2" />
                        {t('manga.startReading')}
                      </Link>
                    </Button>
                    {/* TODO: Implement favorites and bookmarks for v2 */}
                    {/* <Button
                      variant="secondary"
                      onClick={() => setIsInFavorites(!isInFavorites)}
                      className={isInFavorites ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isInFavorites ? "fill-current" : ""}`} />
                      {isInFavorites ? t('manga.inFavorites') : t('manga.addToFavorites')}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                      {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              {seriesData.description && (
                <Card className="bg-manga-card border-manga-border mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-manga-text mb-3">{t('manga.description')}</h3>
                    <p className="text-manga-text-muted leading-relaxed">
                      {seriesData.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Chapters */}
              <Card className="bg-manga-card border-manga-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-manga-text">{t('manga.chapters')}</h3>
                    <span className="text-manga-text-muted">
                      {seriesData.chapter_count || 0} chapters
                    </span>
                  </div>
                  
                  {chaptersLoading ? (
                    <LoadingState message="Loading chapters..." className="py-8" />
                  ) : chaptersError ? (
                    <ErrorPage 
                      error={chaptersError} 
                      onRetry={refetchChapters}
                      className="py-8"
                    />
                  ) : !chaptersData?.results.length ? (
                    <div className="text-center py-8">
                      <p className="text-manga-text-muted">No chapters available yet.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {chaptersData.results.map((chapter) => (
                          <Link
                            key={chapter.id}
                            to={`/read/${chapter.id}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-manga-darker hover:bg-manga-card-hover transition-colors group"
                          >
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 text-manga-text-muted mr-3" />
                              <div>
                                <span className="text-manga-text group-hover:text-manga-primary font-medium">
                                  {t('manga.chapterNumber', { number: chapter.number, title: chapter.title })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-manga-text-muted text-sm block">
                                {new Date(chapter.published_at).toLocaleDateString()}
                              </span>
                              <span className="text-manga-text-muted text-xs">
                                {chapter.page_count} pages
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Chapter Pagination */}
                      {chaptersData && Math.ceil(chaptersData.count / 20) > 1 && (
                        <div className="flex justify-center mt-6">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              onClick={() => setChaptersPage(chaptersPage - 1)}
                              disabled={!chaptersData.previous}
                              className="text-manga-text hover:text-manga-primary disabled:opacity-50"
                              size="sm"
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Previous
                            </Button>
                            
                            <span className="text-manga-text-muted text-sm px-2">
                              Page {chaptersPage} of {Math.ceil(chaptersData.count / 20)}
                            </span>
                            
                            <Button 
                              variant="ghost" 
                              onClick={() => setChaptersPage(chaptersPage + 1)}
                              disabled={!chaptersData.next}
                              className="text-manga-text hover:text-manga-primary disabled:opacity-50"
                              size="sm"
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="bg-manga-card border-manga-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-manga-text mb-4">{t('manga.information')}</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-manga-text-muted text-sm">{t('filters.status')}</span>
                      <p className="text-manga-text font-medium">
                        {t(`manga.status.${seriesData.status}`)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">{t('manga.type')}</span>
                      <p className="text-manga-text font-medium">
                        {seriesData.kind.charAt(0).toUpperCase() + seriesData.kind.slice(1)}
                      </p>
                    </div>
                    
                    {seriesData.authors.length > 0 && (
                      <div>
                        <span className="text-manga-text-muted text-sm">{t('manga.authors')}</span>
                        <p className="text-manga-text font-medium">
                          {seriesData.authors.map(author => author.name).join(", ")}
                        </p>
                      </div>
                    )}
                    
                    {seriesData.artists.length > 0 && (
                      <div>
                        <span className="text-manga-text-muted text-sm">{t('manga.artists')}</span>
                        <p className="text-manga-text font-medium">
                          {seriesData.artists.map(artist => artist.name).join(", ")}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">{t('manga.contentRating')}</span>
                      <p className="text-manga-text font-medium">
                        {seriesData.rating.charAt(0).toUpperCase() + seriesData.rating.slice(1)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">{t('manga.chapters')}</span>
                      <p className="text-manga-text font-medium">
                        {seriesData.chapter_count}
                      </p>
                    </div>

                    <div>
                      <span className="text-manga-text-muted text-sm">{t('manga.lastUpdated')}</span>
                      <p className="text-manga-text font-medium">
                        {new Date(seriesData.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">{t('manga.licensed')}</span>
                      <p className="text-manga-text font-medium">
                        {seriesData.licensed ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MangaDetailsPage;