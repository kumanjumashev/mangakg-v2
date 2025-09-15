import { Header } from "@/components/Header";
import { Construction } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-manga-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <Construction className="w-24 h-24 text-manga-primary" />
          <h1 className="text-4xl font-bold text-manga-text">{t('construction.title')}</h1>
          <p className="text-manga-text-muted text-lg max-w-md">
            {t('construction.message')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;