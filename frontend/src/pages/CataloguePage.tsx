import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { MangaCard } from "@/components/MangaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorPage } from "@/components/ui/error-page";
import { Filter, SlidersHorizontal, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeriesList, useCategories } from "@/hooks/useApi";
import { useDebounce } from "@/lib/utils/debounce";
import { SearchParams, SeriesStatus } from "@/lib/types";

const CataloguePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [sortBy, setSortBy] = useState("popularity");
  const [status, setStatus] = useState<SeriesStatus | "all">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build API parameters
  const apiParams: SearchParams = {
    page: currentPage,
    page_size: 24, // 4x6 grid
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(status !== "all" && { status: status as SeriesStatus }),
    ...(selectedCategories.length > 0 && { categories: selectedCategories }),
  };

  // API calls
  const { 
    data: seriesData, 
    isLoading: seriesLoading, 
    error: seriesError,
    refetch: refetchSeries 
  } = useSeriesList(apiParams);

  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();

  // Update search term when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || "";
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, status, selectedCategories]);

  // Handle category selection
  const handleCategoryChange = useCallback((categorySlug: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categorySlug]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== categorySlug));
    }
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatus("all");
    setSelectedCategories([]);
    setCurrentPage(1);
  }, []);

  // Pagination helpers
  const totalPages = seriesData ? Math.ceil(seriesData.count / 24) : 0;
  const hasNextPage = !!seriesData?.next;
  const hasPrevPage = !!seriesData?.previous;

  // Handle pagination
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
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
                <CardTitle className="text-manga-text flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-manga-text-muted hover:text-manga-primary text-xs"
                  >
                    Clear All
                  </Button>
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

                {/* Status */}
                <div>
                  <label className="text-manga-text text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select value={status} onValueChange={(value) => setStatus(value as SeriesStatus | "all")}>
                    <SelectTrigger className="bg-manga-darker border-manga-border text-manga-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-manga-card border-manga-border">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="hiatus">Hiatus</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-manga-text text-sm font-medium mb-2 block">
                    Categories
                  </label>
                  {categoriesLoading ? (
                    <LoadingState message="Loading categories..." className="py-4" />
                  ) : categoriesError ? (
                    <p className="text-manga-danger text-sm">Failed to load categories</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {categoriesData?.results.map((category) => (
                        <div key={category.slug} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.slug}`}
                            checked={selectedCategories.includes(category.slug)}
                            onCheckedChange={(checked) => handleCategoryChange(category.slug, !!checked)}
                          />
                          <label
                            htmlFor={`category-${category.slug}`}
                            className="text-manga-text text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-manga-text">Catalogue</h1>
              <div className="flex items-center space-x-4">
                {!seriesLoading && (
                  <span className="text-manga-text-muted text-sm">
                    {seriesData?.count || 0} manga found
                  </span>
                )}
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

            {/* Main Content Area */}
            {seriesLoading ? (
              <LoadingState message="Loading manga catalogue..." className="py-24" />
            ) : seriesError ? (
              <ErrorPage 
                error={seriesError} 
                onRetry={refetchSeries}
                className="py-24"
              />
            ) : !seriesData?.results.length ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search className="w-16 h-16 text-manga-text-muted mb-4" />
                <h3 className="text-xl font-bold text-manga-text mb-2">
                  No manga found
                </h3>
                <p className="text-manga-text-muted mb-4">
                  Try adjusting your search criteria or clearing filters.
                </p>
                <Button 
                  onClick={clearFilters}
                  className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Manga Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {seriesData.results.map((series) => (
                    <MangaCard key={series.slug} series={series} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={!hasPrevPage}
                        className="text-manga-text hover:text-manga-primary disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      
                      {getPaginationNumbers().map((page, index) => (
                        <div key={index}>
                          {page === '...' ? (
                            <span className="text-manga-text-muted px-2">...</span>
                          ) : (
                            <Button
                              variant={currentPage === page ? "default" : "ghost"}
                              onClick={() => goToPage(page as number)}
                              className={currentPage === page 
                                ? "bg-manga-primary text-manga-dark" 
                                : "text-manga-text hover:text-manga-primary"
                              }
                            >
                              {page}
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button 
                        variant="ghost" 
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={!hasNextPage}
                        className="text-manga-text hover:text-manga-primary disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CataloguePage;