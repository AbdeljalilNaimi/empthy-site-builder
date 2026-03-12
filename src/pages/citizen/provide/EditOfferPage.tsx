import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OfferForm } from '@/components/provide/OfferForm';
import { useUpdateOffer } from '@/hooks/useProvide';
import { useAuth } from '@/contexts/AuthContext';
import { useProvider } from '@/contexts/ProviderContext';
import { getOfferById } from '@/services/provide/provideService';
import { ProvideOffer } from '@/types/provide';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { OfferInput } from '@/services/provide/provideService';
import { useLanguage } from '@/contexts/LanguageContext';
import { OFFER_ALLOWED_PROVIDER_TYPES } from '@/constants/providerTypes';

const EditOfferPage = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { provider } = useProvider();
  const { t } = useLanguage();
  const updateMutation = useUpdateOffer();
  const [offer, setOffer] = useState<ProvideOffer | null>(null);
  const [loading, setLoading] = useState(true);

  const isAllowed = provider?.type && (OFFER_ALLOWED_PROVIDER_TYPES as readonly string[]).includes(provider.type);

  useEffect(() => {
    if (!offerId) return;
    getOfferById(offerId).then((o) => {
      if (!o || o.ownerId !== user?.uid) {
        toast.error(t('offers', 'offerNotFound'));
        navigate('/citizen/provide/mine', { replace: true });
        return;
      }
      setOffer(o);
      setLoading(false);
    });
  }, [offerId, user?.uid, t, navigate]);

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>{t('offers', 'accessDenied')}</CardTitle>
            <CardDescription>{t('offers', 'accessDeniedDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full gap-1.5">
              <ArrowLeft className="h-4 w-4 rtl-flip" /> {t('common', 'back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: OfferInput) => {
    if (!offerId) return;
    try {
      await updateMutation.mutateAsync({ id: offerId, data });
      toast.success(t('offers', 'offerUpdated'));
      navigate('/citizen/provide/mine');
    } catch {
      toast.error(t('offers', 'updateError'));
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="container-wide section-spacing-sm max-w-2xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4 rtl-flip" /> {t('offers', 'editBack')}
      </Button>
      <h1 className="text-3xl font-bold mb-6">{t('offers', 'editOffer')}</h1>
      {offer && (
        <OfferForm
          defaultValues={{
            title: offer.title,
            description: offer.description,
            category: offer.category,
            contactMethod: offer.contactMethod,
            contactValue: offer.contactValue,
            location: offer.location,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          submitLabel={t('common', 'save')}
        />
      )}
    </div>
  );
};

export default EditOfferPage;
