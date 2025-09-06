import { Header } from "@/components/Header";
import { Construction } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <Construction className="w-24 h-24 text-manga-primary" />
          <h1 className="text-4xl font-bold text-manga-text">Under Construction</h1>
          <p className="text-manga-text-muted text-lg max-w-md">
            We're working hard to bring you this page. Please check back soon!
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;