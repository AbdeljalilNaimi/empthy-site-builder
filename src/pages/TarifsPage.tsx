import { PricingSection } from '@/components/homepage/PricingSection';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const TarifsPage = () => {
  return (
    <>
      <Helmet>
        <title>Tarifs — CityHealth</title>
        <meta name="description" content="Découvrez les forfaits CityHealth pour les professionnels de santé. Gratuit la première année, sans engagement." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Compact nav */}
        <div className="container mx-auto max-w-5xl px-4 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>

        <PricingSection />
      </div>
    </>
  );
};

export default TarifsPage;
