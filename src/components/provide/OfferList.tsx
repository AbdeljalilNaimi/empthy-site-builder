import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ProvideOffer, ProvideCategory, PROVIDE_CATEGORIES } from '@/types/provide';
import { OfferCard } from './OfferCard';
import { Package, Apple, Pill, Wrench, Car } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<ProvideCategory, LucideIcon> = {
  food: Apple,
  medicine: Pill,
  tools: Wrench,
  transport: Car,
  other: Package,
};

interface OfferListProps {
  offers: ProvideOffer[];
  loading: boolean;
  selectedCategory: ProvideCategory | undefined;
  onCategoryChange: (cat: ProvideCategory | undefined) => void;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}

export const OfferList = ({
  offers,
  loading,
  selectedCategory,
  onCategoryChange,
  isOwner,
  onEdit,
  onDelete,
  deletingId,
}: OfferListProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Tabs
        value={selectedCategory || 'all'}
        onValueChange={(v) => onCategoryChange(v === 'all' ? undefined : (v as ProvideCategory))}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">{t('offers', 'all')}</TabsTrigger>
          {PROVIDE_CATEGORIES.map((c) => {
            const Icon = categoryIcons[c.value];
            return (
              <TabsTrigger key={c.value} value={c.value} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {t('offers', c.labelKey as any)}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <Package className="h-12 w-12 mx-auto opacity-40" />
          <p className="text-lg font-medium">{t('offers', 'noOffers')}</p>
          <p className="text-sm">{t('offers', 'noOffersHint')}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              isOwner={isOwner}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingId === offer.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
