import { useState } from "react";
import { useParams, Link } from "react-router-dom"; 
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, BookOpen, Calendar, User, Eye, Heart, Bookmark, Play } from "lucide-react";
import attackOnTitanCover from "@/assets/manga-covers/attack-on-titan.jpg";
import attackOnTitanBanner from "@/assets/banners/attack-on-titan-banner.jpg";

// Mock data - would come from Django backend
const mangaDetails = {
  id: "1",
  title: "Attack on Titan",
  alternativeTitle: "Shingeki no Kyojin",
  rating: 9.56,
  totalRatings: 752,
  status: "Completed",
  type: "Manga",
  releaseYear: 2009,
  author: "Hajime Isayama",
  artist: "Hajime Isayama",
  publisher: "Kodansha",
  genres: ["Action", "Drama", "Fantasy", "Military"],
  tags: ["Titans", "Post-Apocalyptic", "Survival", "War"],
  description: "Humanity lives in fear of the Titans, gigantic creatures who devour humans. Eren Yeager joins the military to fight the Titans after witnessing the destruction of his hometown and the death of his mother.",
  coverImage: attackOnTitanCover,
  bannerImage: attackOnTitanBanner,
  totalChapters: 139,
  views: "2.5M",
  favorites: "45K"
};

const chapters = Array.from({ length: 20 }, (_, i) => ({
  id: `chapter-${139 - i}`,
  number: 139 - i,
  title: `Chapter ${139 - i}`,
  releaseDate: new Date(2023, 0, i + 1).toLocaleDateString(),
  volume: Math.ceil((139 - i) / 4)
}));

const MangaDetailsPage = () => {
  const { id } = useParams();
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />
      
      <main>
        {/* Hero Banner */}
        <div 
          className="relative h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${mangaDetails.bannerImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-manga-dark via-manga-dark/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-manga-dark via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="flex items-end h-full pb-8">
              <div className="flex space-x-6">
                {/* Cover Image */}
                <div className="flex-shrink-0">
                  <img
                    src={mangaDetails.coverImage}
                    alt={mangaDetails.title}
                    className="w-48 h-72 object-cover rounded-lg shadow-2xl"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-manga-text mb-2">
                    {mangaDetails.title}
                  </h1>
                  <p className="text-manga-text-muted text-lg mb-4">
                    {mangaDetails.alternativeTitle}
                  </p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-manga-text font-bold">
                        {mangaDetails.rating}
                      </span>
                      <span className="text-manga-text-muted ml-1">
                        ({mangaDetails.totalRatings})
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-manga-success text-white">
                      {mangaDetails.status}
                    </Badge>
                    <div className="flex items-center text-manga-text-muted">
                      <Eye className="w-4 h-4 mr-1" />
                      {mangaDetails.views}
                    </div>
                    <div className="flex items-center text-manga-text-muted">
                      <Heart className="w-4 h-4 mr-1" />
                      {mangaDetails.favorites}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {mangaDetails.genres.map((genre) => (
                      <Badge key={genre} className="bg-manga-primary text-manga-dark">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
                      asChild
                    >
                      <Link to={`/read/${mangaDetails.id}/1`}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Reading
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsInFavorites(!isInFavorites)}
                      className={isInFavorites ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isInFavorites ? "fill-current" : ""}`} />
                      {isInFavorites ? "In Favorites" : "Add to Favorites"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                      {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
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
              <Card className="bg-manga-card border-manga-border mb-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-manga-text mb-3">Description</h3>
                  <p className="text-manga-text-muted leading-relaxed">
                    {mangaDetails.description}
                  </p>
                </CardContent>
              </Card>

              {/* Chapters */}
              <Card className="bg-manga-card border-manga-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-manga-text">Chapters</h3>
                    <span className="text-manga-text-muted">
                      {mangaDetails.totalChapters} chapters
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        to={`/read/${mangaDetails.id}/${chapter.number}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-manga-darker hover:bg-manga-card-hover transition-colors group"
                      >
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-manga-text-muted mr-3" />
                          <div>
                            <span className="text-manga-text group-hover:text-manga-primary font-medium">
                              Vol. {chapter.volume} {chapter.title}
                            </span>
                          </div>
                        </div>
                        <span className="text-manga-text-muted text-sm">
                          {chapter.releaseDate}
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="bg-manga-card border-manga-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-manga-text mb-4">Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-manga-text-muted text-sm">Type</span>
                      <p className="text-manga-text font-medium">{mangaDetails.type}</p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">Status</span>
                      <p className="text-manga-text font-medium">{mangaDetails.status}</p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">Release Year</span>
                      <p className="text-manga-text font-medium">{mangaDetails.releaseYear}</p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">Author</span>
                      <p className="text-manga-text font-medium">{mangaDetails.author}</p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">Artist</span>
                      <p className="text-manga-text font-medium">{mangaDetails.artist}</p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">Publisher</span>
                      <p className="text-manga-text font-medium">{mangaDetails.publisher}</p>
                    </div>
                    
                    <div>
                      <span className="text-manga-text-muted text-sm">Tags</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mangaDetails.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
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