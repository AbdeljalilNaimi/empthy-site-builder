import { FileQuestion } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 text-foreground">{t('notFound', 'title')}</h1>
        <p className="text-xl text-muted-foreground mb-4">{t('notFound', 'message')}</p>
        <a href="/" className="text-primary hover:text-primary/80 underline">
          {t('notFound', 'returnHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
