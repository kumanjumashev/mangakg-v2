import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorPageProps {
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorPage = ({ error, onRetry, className = "" }: ErrorPageProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <AlertTriangle className="w-16 h-16 text-manga-danger mb-4" />
      
      <h2 className="text-xl font-bold text-manga-text mb-2">
        Oops! Something went wrong
      </h2>
      
      <p className="text-manga-text-muted mb-6 max-w-md">
        {error?.message || "We're having trouble loading the content. Please try again."}
      </p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-manga-primary hover:bg-manga-primary-hover text-manga-dark"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

interface CookingPageProps {
  className?: string;
}

export const CookingPage = ({ className = "" }: CookingPageProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="w-24 h-24 mb-6 relative">
        <div className="absolute inset-0 border-4 border-manga-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-manga-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <h2 className="text-2xl font-bold text-manga-text mb-2">
        🍜 We're cooking right now!
      </h2>
      
      <p className="text-manga-text-muted mb-4 max-w-md">
        Our servers are temporarily unavailable, but we'll be back soon with fresh manga content.
      </p>
      
      <p className="text-manga-text-muted text-sm">
        Please check back in a few minutes.
      </p>
    </div>
  );
};