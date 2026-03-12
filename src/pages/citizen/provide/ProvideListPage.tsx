import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfferList } from '@/components/provide/OfferList';
import { usePublicOffers } from '@/hooks/useProvide';
import { useAuth } from '@/contexts/AuthContext';
import { useProviderOptional } from '@/contexts/ProviderContext';
import { ProvideCategory } from '@/types/provide';
import { useLanguage } from '@/contexts/LanguageContext';
import { OFFER_ALLOWED_PROVIDER_TYPES } from '@/constants/providerTypes';
import { ProvideOffer } from '@/types/provide';

const createMockOffer = (): ProvideOffer => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  return {
    id: 'demo-preview-001',
    ownerId: 'bNUeaRVjGEcl1rCPAiK9gW2aYdm1',
    ownerName: 'Test Medical Pr',
    providerId: 'provider_bNUeaRVjGEcl1rCPAiK9gW2aYdm1',
    title: 'Lot de médicaments pédiatriques',
    description: 'Don gratuit d\'un lot de médicaments pédiatriques (sirop, paracétamol, vitamines). Produits neufs, non périmés. Disponibles pour les familles dans le besoin.',
    category: 'medicine',
    location: { lat: 35.19926, lng: -0.63016, label: '123 Rue de Test, Yaounde' },
    contactMethod: 'phone',
    contactValue: '+237 600 000 000',
    status: 'available',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
  };
};

const MOCK_OFFER = createMockOffer();

const ProvideListPage = () => {
  const [category, setCategory] = useState<ProvideCategory | undefined>();
  const { offers, loading } = usePublicOffers(category);
  const { isAuthenticated, isProvider } = useAuth();
  const providerCtx = useProviderOptional();
  const { t } = useLanguage();

  const canPublish = isAuthenticated && isProvider && providerCtx?.provider?.type
    ? (OFFER_ALLOWED_PROVIDER_TYPES as readonly string[]).includes(providerCtx.provider.type)
    : false;

  return (
    <div className="container-wide section-spacing-sm">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('offers', 'communityAid')}</h1>
          <p className="text-muted-foreground mt-1">{t('offers', 'communityAidDesc')}</p>
        </div>
        {canPublish && (
          <Button asChild>
            <Link to="/citizen/provide/new" className="gap-1.5">
              <Plus className="h-4 w-4" /> {t('offers', 'proposeHelp')}
            </Link>
          </Button>
        )}
      </div>

      <OfferList
        offers={(!category || category === MOCK_OFFER.category) ? [MOCK_OFFER, ...offers] : offers}
        loading={loading}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />
    </div>
  );
};

export default ProvideListPage;
