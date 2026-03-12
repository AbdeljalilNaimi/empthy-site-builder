import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReportReason } from '@/services/communityService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => Promise<void>;
}

export const ReportDialog = ({ open, onClose, onSubmit }: Props) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(reason, details.trim() || undefined);
      onClose();
      setReason('spam');
      setDetails('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('community', 'reportTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={reason} onValueChange={v => setReason(v as ReportReason)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spam">{t('community', 'reportSpam')}</SelectItem>
              <SelectItem value="abuse">{t('community', 'reportAbuse')}</SelectItem>
              <SelectItem value="false_info">{t('community', 'reportFalseInfo')}</SelectItem>
              <SelectItem value="other">{t('community', 'reportOther')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t('community', 'reportDetailsPlaceholder')}
            value={details}
            onChange={e => setDetails(e.target.value)}
            maxLength={500}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t('common', 'cancel')}</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {t('community', 'reportSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
