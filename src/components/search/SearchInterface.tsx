import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MapPin, Grid, List, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { type ViewMode, type SortOption } from '@/pages/SearchPage';

interface SearchInterfaceProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  resultCount: number;
  hideSearchBar?: boolean;
}

export const SearchInterface = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  resultCount,
  hideSearchBar = false,
}: SearchInterfaceProps) => {
  const { t, language } = useLanguage();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Load recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cityhealth_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchRef = useRef<HTMLDivElement>(null);

  // Language-aware suggestions
  const suggestions: Record<string, string[]> = {
    fr: [
      'Cardiologue près de moi',
      'Pharmacies 24h/24',
      'Dentiste urgence',
      'Dermatologue Oran',
      'Pédiatre disponible aujourd\'hui',
      'Orthopédiste',
      'Clinique ophtalmologique',
      'Psychiatre'
    ],
    ar: [
      'طبيب قلب بالقرب مني',
      'صيدليات 24 ساعة',
      'طبيب أسنان طوارئ',
      'طبيب جلدية وهران',
      'طبيب أطفال متاح اليوم',
      'طبيب عظام',
      'عيادة عيون',
      'طبيب نفسي'
    ],
    en: [
      'Cardiologist near me',
      '24/7 pharmacies',
      'Emergency dentist',
      'Dermatologist Oran',
      'Pediatrician available today',
      'Orthopedic specialist',
      'Eye clinic',
      'Mental health support'
    ]
  };

  // Voice search simulation
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      setTimeout(() => {
        setSearchQuery(language === 'ar' ? 'طبيب قلب بالقرب مني' : language === 'fr' ? 'cardiologue près de moi' : 'cardiologist near me');
        setIsListening(false);
      }, 2000);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save search to history
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('cityhealth_recent_searches', JSON.stringify(updated));
  };

  // Clear search history
  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('cityhealth_recent_searches');
  };

  // Handle search submission
  const handleSearchSubmit = (query: string) => {
    saveToHistory(query);
    setSearchQuery(query);
    setShowSuggestions(false);
  };

  const sortOptions = [
    { value: 'relevance', label: t('search', 'sortRelevance') },
    { value: 'distance', label: t('search', 'sortDistance') },
    { value: 'rating', label: t('search', 'sortRating') },
    { value: 'price', label: t('search', 'sortPrice') },
    { value: 'newest', label: t('search', 'sortNewest') }
  ];

  const currentSuggestions = suggestions[language] || suggestions.en;

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main Search Bar — hidden in map mode */}
        {!hideSearchBar && (
        <div className="relative mb-4" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder={t('search', 'searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-12 pr-20 h-12 text-lg border-2 focus:border-primary transition-colors"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            <div className={`absolute top-1/2 transform -translate-y-1/2 flex gap-2 ${language === 'ar' ? 'left-3' : 'right-3'}`}>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceSearch}
                className={`${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}
              >
                <Mic size={18} />
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground">
                <MapPin size={18} />
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && (
            <Card className="absolute top-full left-0 right-0 mt-1 p-4 shadow-lg z-[45] bg-popover border-2">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{t('search', 'recentSearches')}</p>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {t('search', 'clearHistory')}
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSubmit(search)}
                      className="block w-full text-left px-2 py-1.5 hover:bg-muted rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('search', 'suggestions')}</p>
                {currentSuggestions
                  .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSubmit(suggestion)}
                      className="block w-full text-left px-2 py-1.5 hover:bg-muted rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            </Card>
          )}
        </div>
        )}

        {/* Controls Row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Results count and filters */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{resultCount}</span> {t('search', 'foundProviders')} {t('search', 'inYourArea')}
            </p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
            >
              <SlidersHorizontal size={16} className="mr-2" />
              {t('common', 'filters')}
            </Button>
          </div>

          {/* Right: Sort and view options */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('search', 'sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
                title={t('search', 'viewList')}
              >
                <List size={16} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
                title={t('search', 'viewGrid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className="h-8 px-3"
                title={t('search', 'viewMap')}
              >
                <MapIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
