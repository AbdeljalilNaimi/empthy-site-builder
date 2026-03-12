import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal } from 'lucide-react';
import { RESEARCH_CATEGORIES } from '@/services/researchService';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ArticleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sort: 'newest' | 'popular' | 'featured';
  onSortChange: (value: 'newest' | 'popular' | 'featured') => void;
}

export function ArticleFilters({
  search, onSearchChange,
  category, onCategoryChange,
  sort, onSortChange,
}: ArticleFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, auteur, mot-clé..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 bg-card"
        />
      </div>

      {/* Sort & Category row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Sort buttons */}
        <div className="flex gap-1.5">
          {([
            { value: 'newest' as const, label: 'Récents' },
            { value: 'popular' as const, label: 'Populaires' },
            { value: 'featured' as const, label: 'En vedette' },
          ]).map(opt => (
            <Button
              key={opt.value}
              variant={sort === opt.value ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs rounded-full"
              onClick={() => onSortChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Category select */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px] h-8 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {RESEARCH_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
