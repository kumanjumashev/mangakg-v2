import { Header } from "@/components/Header";
import { MangaCarousel } from "@/components/MangaCarousel";
import { MangaCard } from "@/components/MangaCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import attackOnTitanCover from "@/assets/manga-covers/attack-on-titan.jpg";
import onePieceCover from "@/assets/manga-covers/one-piece.jpg";

// Mock data - in real app this would come from Django backend
const featuredMangas = [
  {
    id: "1",
    title: "Attack on Titan",
    rating: 9.6,
    coverImage: attackOnTitanCover,
    latestChapter: 139
  },
  {
    id: "2", 
    title: "One Piece",
    rating: 9.8,
    coverImage: onePieceCover,
    latestChapter: 1098
  },
  {
    id: "3",
    title: "Demon Slayer",
    rating: 9.7,
    coverImage: "/api/placeholder/300/400", 
    latestChapter: 205
  },
  {
    id: "4",
    title: "My Hero Academia",
    rating: 9.5,
    coverImage: "/api/placeholder/300/400",
    latestChapter: 403
  },
  {
    id: "5",
    title: "Tokyo Ghoul",
    rating: 9.4,
    coverImage: "/api/placeholder/300/400",
    latestChapter: 179
  },
  {
    id: "6",
    title: "Naruto",
    rating: 9.3,
    coverImage: "/api/placeholder/300/400",
    latestChapter: 700
  }
];

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
  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Featured Section */}
        <section className="mb-12">
          <MangaCarousel title="Featured Manga" mangas={featuredMangas} />
        </section>

        {/* Continue Reading Section */}
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

        {/* Popular This Week */}
        <section>
          <MangaCarousel title="Popular This Week" mangas={featuredMangas} />
        </section>
      </main>
    </div>
  );
};

export default HomePage;