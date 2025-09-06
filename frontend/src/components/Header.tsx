import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Search, MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-manga-dark border-b border-manga-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-manga-primary text-manga-dark px-2 py-1 rounded font-bold text-lg">
              Manga
            </div>
            <span className="text-manga-text font-semibold text-lg">LIB</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/catalogue"
              className={`text-sm font-medium transition-colors hover:text-manga-primary ${
                isActive("/catalogue") ? "text-manga-primary" : "text-manga-text"
              }`}
            >
              Catalogue
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-manga-primary ${
                isActive("/about") ? "text-manga-primary" : "text-manga-text"
              }`}
            >
              About
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-manga-text-muted w-4 h-4" />
              <Input
                placeholder="Search manga..."
                className="pl-10 w-64 bg-manga-card border-manga-border text-manga-text placeholder:text-manga-text-muted"
              />
            </div>
            <Button variant="ghost" size="sm" className="text-manga-text hover:text-manga-primary">
              <MessageCircle className="w-4 h-4 mr-2" />
              Forum
            </Button>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="text-manga-text hover:text-manga-primary"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-manga-text"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-manga-border py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/catalogue"
                className={`text-sm font-medium transition-colors hover:text-manga-primary ${
                  isActive("/catalogue") ? "text-manga-primary" : "text-manga-text"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catalogue
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors hover:text-manga-primary ${
                  isActive("/about") ? "text-manga-primary" : "text-manga-text"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-manga-text-muted w-4 h-4" />
                <Input
                  placeholder="Search manga..."
                  className="pl-10 bg-manga-card border-manga-border text-manga-text placeholder:text-manga-text-muted"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-manga-text hover:text-manga-primary justify-start">
                <MessageCircle className="w-4 h-4 mr-2" />
                Forum
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};