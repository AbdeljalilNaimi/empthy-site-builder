import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-healthcare.png';

export const ModernHeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/search');
  };

  return (
    <section className="relative pt-20 pb-32 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight whitespace-pre-line">
            {t('hero', 'title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 px-4">
            {t('hero', 'subtitle')}
          </p>

          {/* CTA Button */}
          <Button 
            size="lg" 
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            aria-label="Search for healthcare provider"
          >
            <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {t('hero', 'cta')}
          </Button>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 relative">
          <div className="aspect-video max-w-4xl mx-auto rounded-3xl shadow-2xl overflow-hidden border border-primary/20 animate-fade-in">
            <img 
              src={heroImage} 
              alt="Professional healthcare consultation illustration"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
