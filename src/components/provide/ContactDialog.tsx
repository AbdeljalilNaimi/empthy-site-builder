import { useState } from 'react';
import { Phone, Mail, MessageSquare, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ProvideOffer } from '@/types/provide';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactDialogProps {
  offer: ProvideOffer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactDialog = ({ offer, open, onOpenChange }: ContactDialogProps) => {
  const [revealed, setRevealed] = useState(false);
  const { t } = useLanguage();

  const methodLabels: Record<string, { label: string; icon: typeof Phone }> = {
    phone: { label: t('offers', 'phone'), icon: Phone },
    email: { label: t('offers', 'email'), icon: Mail },
    in_app: { label: t('offers', 'message'), icon: MessageSquare },
  };

  const method = methodLabels[offer.contactMethod];
  const Icon = method.icon;

  const handleClose = (val: boolean) => {
    if (!val) setRevealed(false);
    onOpenChange(val);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {t('offers', 'contactOwner')} {offer.ownerName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {revealed ? (
              <span className="block mt-3 text-lg font-medium text-foreground select-all break-all">
                {offer.contactValue}
              </span>
            ) : (
              <span className="block mt-2">
                {t('offers', 'contactMethod')} : <strong>{method.label}</strong>. {t('offers', 'clickToReveal')}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('offers', 'closeLbl')}</AlertDialogCancel>
          {!revealed && (
            <Button onClick={() => setRevealed(true)} className="gap-1.5">
              <Eye className="h-4 w-4" /> {t('offers', 'reveal')}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
