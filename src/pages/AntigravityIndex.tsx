import { useEffect, lazy, Suspense } from 'react';
import { AntigravityHero } from '@/components/AntigravityHero';
import Footer from '@/components/Footer';
import { AnnouncementBannerTop } from '@/components/homepage/AnnouncementBannerTop';
import { FloatingProviderBanner } from '@/components/homepage/FloatingProviderBanner';
import { useLanguage } from '@/hooks/useLanguage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const EmergencyProvidersSection = lazy(() => import('@/components/homepage/EmergencyProvidersSection').then(m => ({ default: m.EmergencyProvidersSection })));
const EmergencyBanner = lazy(() => import('@/components/homepage/EmergencyBanner').then(m => ({ default: m.EmergencyBanner })));
const HowItWorksSection = lazy(() => import('@/components/homepage/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })));
const ServicesGrid = lazy(() => import('@/components/homepage/ServicesGrid').then(m => ({ default: m.ServicesGrid })));
const AnimatedMapSection = lazy(() => import('@/components/homepage/AnimatedMapSection').then(m => ({ default: m.AnimatedMapSection })));
const FeaturedProviders = lazy(() => import('@/components/homepage/FeaturedProviders').then(m => ({ default: m.FeaturedProviders })));
const TestimonialsSlider = lazy(() => import('@/components/homepage/TestimonialsSlider').then(m => ({ default: m.TestimonialsSlider })));
const PricingSection = lazy(() => import('@/components/homepage/PricingSection').then(m => ({ default: m.PricingSection })));
const ProviderRegistrationSection = lazy(() => import('@/components/homepage/ProviderRegistrationSection').then(m => ({ default: m.ProviderRegistrationSection })));

const SectionFallback = () => <div className="min-h-[200px]" />;

const SafeSection = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary fallback={null}>
    <Suspense fallback={<SectionFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const AntigravityIndex = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `CityHealth - ${t('homepage.findYourDoctor')} - ${t('homepage.locationBadge')}`;
  }, [language, t]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ErrorBoundary fallback={null}>
        <AnnouncementBannerTop />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <AntigravityHero />
      </ErrorBoundary>

      <SafeSection>
        <div id="urgences">
          <EmergencyProvidersSection />
          <EmergencyBanner />
        </div>
      </SafeSection>

      <SafeSection>
        <div id="assistant-ia">
          <HowItWorksSection />
        </div>
      </SafeSection>

      <SafeSection>
        <ServicesGrid />
      </SafeSection>

      <SafeSection>
        <div id="recherche-medecins">
          <div id="carte-interactive">
            <AnimatedMapSection />
          </div>
        </div>
      </SafeSection>

      <SafeSection>
        <div id="recherche-medicale">
          <FeaturedProviders />
        </div>
      </SafeSection>

      <SafeSection>
        <div id="avis-idees">
          <TestimonialsSlider />
        </div>
      </SafeSection>

      <SafeSection>
        <div id="annonces">
          <div id="publicite">
            <div id="inscription-provider">
              <ProviderRegistrationSection />
            </div>
          </div>
        </div>
      </SafeSection>

      <SafeSection>
        <div id="pricing">
          <PricingSection />
        </div>
      </SafeSection>

      <ErrorBoundary fallback={null}>
        <Footer />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <FloatingProviderBanner />
      </ErrorBoundary>
    </div>
  );
};

export default AntigravityIndex;
