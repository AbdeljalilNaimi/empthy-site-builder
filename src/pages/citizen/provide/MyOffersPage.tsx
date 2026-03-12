import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfferList } from '@/components/provide/OfferList';
import { useMyOffers, useDeleteOffer, useUpdateOffer } from '@/hooks/useProvide';
import { useProvider } from '@/contexts/ProviderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProvideCategory, ProvideStatus, PROVIDE_STATUS_KEYS } from '@/types/provide';
import { OFFER_ALLOWED_PROVIDER_TYPES } from '@/constants/providerTypes';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MyOffersPage = () => {
  const navigate = useNavigate();
  const { provider } = useProvider();
  const { t } = useLanguage();
  const { offers, loading } = useMyOffers();
  const deleteMutation = useDeleteOffer();
  const updateMutation = useUpdateOffer();
  const [category, setCategory] = useState<ProvideCategory | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const isAllowed = provider?.type && (OFFER_ALLOWED_PROVIDER_TYPES as readonly string[]).includes(provider.type);

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

  const filtered = category ? offers.filter((o) => o.category === category) : offers;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast.success(t('offers', 'offerDeleted'));
    } catch {
      toast.error(t('offers', 'deleteError'));
    }
    setDeleteTarget(null);
  };

  const handleStatusChange = async (id: string, status: ProvideStatus) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status } });
      toast.success(t('offers', 'statusUpdated'));
    } catch {
      toast.error(t('offers', 'statusError'));
    }
  };

  return (
    <div className="container-wide section-spacing-sm">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('offers', 'myOffers')}</h1>
          <p className="text-muted-foreground mt-1">{t('offers', 'myOffersDesc')}</p>
        </div>
        <Button asChild>
          <Link to="/citizen/provide/new" className="gap-1.5">
            <Plus className="h-4 w-4" /> {t('offers', 'newOffer')}
          </Link>
        </Button>
      </div>

      {/* Quick status changer per offer */}
      {offers.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {offers.map((o) => (
            <div key={o.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium truncate max-w-[140px]">{o.title}</span>
              <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as ProvideStatus)}>
                <SelectTrigger className="h-7 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDE_STATUS_KEYS).map(([k, labelKey]) => (
                    <SelectItem key={k} value={k}>{t('offers', labelKey as any)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      <OfferList
        offers={filtered}
        loading={loading}
        selectedCategory={category}
        onCategoryChange={setCategory}
        isOwner
        onEdit={(id) => navigate(`/citizen/provide/edit/${id}`)}
        onDelete={(id) => setDeleteTarget(id)}
        deletingId={deleteMutation.isPending ? (deleteMutation.variables as string) : null}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('offers', 'deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('offers', 'deleteConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('offers', 'cancelLbl')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('offers', 'deleteOffer')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyOffersPage;
