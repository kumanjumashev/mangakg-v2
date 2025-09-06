import { useState } from "react";
import { Header } from "@/components/Header";
import { MangaCard } from "@/components/MangaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, SlidersHorizontal, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data
const allMangas = Array.from({ length: 20 }, (_, i) => ({
  id: `manga-${i + 1}`,
  title: `Manga Title ${i + 1}`,
  rating: Math.round((Math.random() * 2 + 8) * 10) / 10,
  coverImage: "/api/placeholder/300/400",
  latestChapter: Math.floor(Math.random() * 200) + 1
}));

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", 
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural"
];

const tags = [
  "School Life", "Martial Arts", "Magic", "Demons", "Gods", "Military",
  "Historical", "Medical", "Music", "Cooking", "Gaming", "Reincarnation"
];

const CataloguePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [mangaType, setMangaType] = useState("all");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres(prev => [...prev, genre]);
    } else {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tag]);
    } else {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    }
  };

  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <Card className="bg-manga-card border-manga-border">
              <CardHeader>
                <CardTitle className="text-manga-text flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-manga-text text-sm font-medium mb-2 block">
                    Search by title
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-manga-text-muted w-4 h-4" />
                    <Input
                      placeholder="Search manga..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-manga-darker border-manga-border text-manga-text"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-manga-text text-sm font-medium mb-2 block">
                    Sort by
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-manga-darker border-manga-border text-manga-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-manga-card border-manga-border">
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="latest">Latest Updates</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div>
                  <label className="text-manga-text text-sm font-medium mb-2 block">
                    Type
                  </label>
                  <Select value={mangaType} onValueChange={setMangaType}>
                    <SelectTrigger className="bg-manga-darker border-manga-border text-manga-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-manga-card border-manga-border">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="manga">Manga</SelectItem>
                      <SelectItem value="manhwa">Manhwa</SelectItem>
                      <SelectItem value="manhua">Manhua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genres */}
                <div>
                  <label className="text-manga-text text-sm font-medium mb-2 block">
                    Genres
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {genres.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={selectedGenres.includes(genre)}
                          onCheckedChange={(checked) => handleGenreChange(genre, !!checked)}
                        />
                        <label
                          htmlFor={`genre-${genre}`}
                          className="text-manga-text text-sm cursor-pointer"
                        >
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-manga-text text-sm font-medium mb-2 block">
                    Tags
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={(checked) => handleTagChange(tag, !!checked)}
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="text-manga-text text-sm cursor-pointer"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <Button className="w-full bg-manga-primary hover:bg-manga-primary-hover text-manga-dark">
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-manga-text">Catalogue</h1>
              <div className="flex items-center space-x-4">
                <span className="text-manga-text-muted text-sm">
                  {allMangas.length} manga found
                </span>
                <Button
                  variant="ghost" 
                  size="sm"
                  className="md:hidden text-manga-text"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Manga Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allMangas.map((manga) => (
                <MangaCard key={manga.id} {...manga} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button variant="ghost" className="text-manga-text hover:text-manga-primary">
                  Previous
                </Button>
                <Button className="bg-manga-primary text-manga-dark">1</Button>
                <Button variant="ghost" className="text-manga-text hover:text-manga-primary">
                  2
                </Button>
                <Button variant="ghost" className="text-manga-text hover:text-manga-primary">
                  3
                </Button>
                <Button variant="ghost" className="text-manga-text hover:text-manga-primary">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CataloguePage;