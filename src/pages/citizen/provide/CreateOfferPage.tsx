import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OfferForm } from '@/components/provide/OfferForm';
import { useCreateOffer } from '@/hooks/useProvide';
import { toast } from 'sonner';
import type { OfferInput } from '@/services/provide/provideService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProvider } from '@/contexts/ProviderContext';
import { OFFER_ALLOWED_PROVIDER_TYPES } from '@/constants/providerTypes';

const CreateOfferPage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateOffer();
  const { t } = useLanguage();
  const { provider } = useProvider();

  const isAllowed = provider?.type && (OFFER_ALLOWED_PROVIDER_TYPES as readonly string[]).includes(provider.type.toLowerCase());

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
    try {
      await createMutation.mutateAsync(data);
      toast.success(t('offers', 'offerPublished'));
      navigate('/citizen/provide/mine');
    } catch {
      toast.error(t('offers', 'publishError'));
    }
  };

  return (
    <div className="container-wide section-spacing-sm max-w-2xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4 rtl-flip" /> {t('common', 'back')}
      </Button>
      <h1 className="text-3xl font-bold mb-6">{t('offers', 'proposeHelp')}</h1>
      <OfferForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
};

export default CreateOfferPage;
