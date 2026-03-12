import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, FileWarning } from 'lucide-react';
import { SENSITIVE_FIELD_LABELS, type SensitiveField } from '@/constants/sensitiveFields';
import { useLanguage } from '@/contexts/LanguageContext';

interface VerificationRevokedBannerProps {
  revokedReason?: string;
  revokedAt?: Date | string;
  onGoToVerification?: () => void;
}

export function VerificationRevokedBanner({ 
  revokedReason, 
  revokedAt,
  onGoToVerification 
}: VerificationRevokedBannerProps) {
  const { t, language } = useLanguage();
  
  // Parse the revoked reason to extract field names
  const modifiedFields = revokedReason?.startsWith('Modified:') 
    ? revokedReason.replace('Modified:', '').trim().split(', ')
    : [];

  // Format date based on language
  const getLocale = () => {
    switch (language) {
      case 'ar': return 'ar-DZ';
      case 'en': return 'en-US';
      default: return 'fr-FR';
    }
  };

  const formattedDate = revokedAt 
    ? new Date(revokedAt).toLocaleDateString(getLocale(), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
      <FileWarning className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-600 text-lg flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        {t('verification', 'revokedTitle')}
      </AlertTitle>
      <AlertDescription className="text-amber-700 mt-2 space-y-3">
        <p>
          {t('verification', 'revokedDescription')}
        </p>
        
        {modifiedFields.length > 0 && (
          <div className="bg-amber-500/10 rounded-lg p-3">
            <p className="font-medium text-sm mb-2">{t('verification', 'revokedFieldsLabel')} :</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {modifiedFields.map((field) => (
                <li key={field}>
                  {SENSITIVE_FIELD_LABELS[field as SensitiveField] || field}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {formattedDate && (
          <p className="text-xs text-amber-600/80">
            {t('verification', 'revokedAtLabel')} {formattedDate}
          </p>
        )}
        
        <div className="pt-2">
          <Button 
            onClick={onGoToVerification}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {t('verification', 'submitNewVerification')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
