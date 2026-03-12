import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommunityCategory } from '@/services/communityService';
import { Lightbulb, MessageCircle, Heart, HelpCircle, Shield } from 'lucide-react';

export type CategoryFilterValue = CommunityCategory | 'admin' | null;

interface Props {
  selected: CategoryFilterValue;
  onChange: (category: CategoryFilterValue) => void;
}

export const CategoryFilter = ({ selected, onChange }: Props) => {
  const { t } = useLanguage();

  const categories: { value: CategoryFilterValue; label: string; icon: React.ReactNode }[] = [
    { value: null, label: t('community', 'allCategories'), icon: null },
    { value: 'suggestion', label: t('community', 'catSuggestion'), icon: <Lightbulb className="h-3.5 w-3.5" /> },
    { value: 'feedback', label: t('community', 'catFeedback'), icon: <MessageCircle className="h-3.5 w-3.5" /> },
    { value: 'experience', label: t('community', 'catExperience'), icon: <Heart className="h-3.5 w-3.5" /> },
    { value: 'question', label: t('community', 'catQuestion'), icon: <HelpCircle className="h-3.5 w-3.5" /> },
    { value: 'admin', label: t('community', 'catAdmin'), icon: <Shield className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => (
        <Button
          key={cat.value ?? 'all'}
          variant={selected === cat.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(cat.value)}
          className="gap-1.5 text-xs rounded-full px-4 py-2"
        >
          {cat.icon}
          {cat.label}
        </Button>
      ))}
    </div>
  );
};
