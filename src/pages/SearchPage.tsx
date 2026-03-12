import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInterface } from '@/components/search/SearchInterface';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchMapSplitView } from '@/components/search/SearchMapSplitView';
import { MiniMapPreview } from '@/components/search/MiniMapPreview';
import { SearchResultsSkeleton } from '@/components/search/SearchResultsSkeleton';
import { SearchError } from '@/components/search/SearchError';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isProviderVerified } from '@/utils/verificationUtils';
import { isUsingFallbackData } from '@/services/firestoreProviderService';
import { AlertTriangle, Database } from 'lucide-react';
import type { CityHealthProvider } from '@/data/providers';
import type L from 'leaflet';

export type ViewMode = 'list' | 'grid' | 'map';
export type SortOption = 'relevance' | 'distance' | 'rating' | 'price' | 'newest';

export interface FilterState {
  categories: string[];
  location: string;
  radius: number;
  availability: string;
  minRating: number;
  verifiedOnly: boolean;
  emergencyServices: boolean;
  wheelchairAccessible: boolean;
  insuranceAccepted: boolean;
  priceRange: [number, number];
  equipmentBrands: string[];
  cnasOnly: boolean;
}

export type Provider = CityHealthProvider;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';
  
  // Map URL type param to filter categories
  const getInitialCategories = (type: string): string[] => {
    const typeMap: Record<string, string> = {
      doctor: 'doctors',
      pharmacy: 'pharmacies',
      lab: 'laboratories',
      clinic: 'clinics',
      ambulance: 'doctors',
      nurse: 'doctors',
      home_care: 'doctors',
    };
    const mapped = typeMap[type];
    return mapped ? [mapped] : [];
  };
  
  const [searchQuery, setSearchQuery] = useState(initialQuery || (initialType ? '' : ''));
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce search query for performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const [filters, setFilters] = useState<FilterState>({
    categories: getInitialCategories(initialType),
    location: '',
    radius: 25,
    availability: 'any',
    minRating: 0,
    verifiedOnly: false,
    emergencyServices: false,
    wheelchairAccessible: false,
    insuranceAccepted: false,
    priceRange: [0, 500],
    equipmentBrands: [],
    cnasOnly: false
  });

  // Map bounds for "search in this area" functionality
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  // Use TanStack Query for Firestore data - only fetches verified & public providers
  const { data: allProviders = [], isLoading, isError, error, refetch } = useVerifiedProviders();

  // Track if using fallback data (dev mode indicator)
  const [usingFallback, setUsingFallback] = useState(false);
  
  useEffect(() => {
    if (!isLoading && allProviders.length >= 0) {
      setUsingFallback(isUsingFallbackData());
    }
  }, [isLoading, allProviders]);

  // Filter and search logic using useMemo for performance
  const filteredProviders = useMemo(() => {
    let results = [...allProviders];

    // Text search with debounced value
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      results = results.filter(provider => {
        const brands = ((provider as any).equipmentBrands as string[] | undefined) || [];
        return (
          provider.name.toLowerCase().includes(query) ||
          (provider.specialty || '').toLowerCase().includes(query) ||
          provider.address.toLowerCase().includes(query) ||
          provider.type.toLowerCase().includes(query) ||
          brands.some(b => b.toLowerCase().includes(query))
        );
      });
    }

    // Category filter - match against type and specialty
    if (filters.categories.length > 0) {
      results = results.filter(provider =>
        filters.categories.some(category => {
          const categoryLower = category.toLowerCase();
          const typeLower = provider.type.toLowerCase();
          const specialtyLower = (provider.specialty || '').toLowerCase();
          
          // Map filter categories to provider types
          if (categoryLower === 'doctors' || categoryLower === 'specialists') {
            return typeLower.includes('doctor') || typeLower.includes('clinic') || typeLower.includes('specialist');
          }
          if (categoryLower === 'pharmacies') {
            return typeLower.includes('pharmacy');
          }
          if (categoryLower === 'laboratories') {
            return typeLower.includes('laboratory') || typeLower.includes('lab');
          }
          if (categoryLower === 'clinics') {
            return typeLower.includes('clinic') || typeLower.includes('hospital');
          }
          
          return specialtyLower.includes(categoryLower) || typeLower.includes(categoryLower);
        })
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      results = results.filter(provider => provider.rating >= filters.minRating);
    }

    // Verified only filter (note: useVerifiedProviders already returns only verified providers)
    if (filters.verifiedOnly) {
      results = results.filter(provider => isProviderVerified(provider));
    }

    // Emergency services filter
    if (filters.emergencyServices) {
      results = results.filter(provider => provider.emergency);
    }

    // Equipment brand filter
    if (filters.equipmentBrands.length > 0) {
      results = results.filter(provider => {
        const brands = (provider as any).equipmentBrands as string[] | undefined;
        if (!brands) return false;
        return filters.equipmentBrands.some(b => brands.includes(b));
      });
    }

    // CNAS reimbursable filter
    if (filters.cnasOnly) {
      results = results.filter(provider => {
        const catalog = (provider as any).equipmentCatalog as any[] | undefined;
        if (!catalog) return false;
        return catalog.some((item: any) => item.cnasReimbursable);
      });
    }

    // Filter by map bounds if set
    if (mapBounds) {
      results = results.filter(provider => 
        mapBounds.contains([provider.lat, provider.lng])
      );
    }

    // Sort results (create new array to avoid mutating)
    const sortedResults = [...results];
    switch (sortBy) {
      case 'rating':
        sortedResults.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        sortedResults.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case 'newest':
        // Sort by id (assuming newer providers have higher/later ids)
        // Note: Could add createdAt to CityHealthProvider if needed
        sortedResults.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Relevance - keep original order (or could implement scoring)
        break;
    }

    return sortedResults;
  }, [allProviders, debouncedSearchQuery, filters, sortBy, mapBounds]);

  // Handle filter by map bounds
  const handleFilterByBounds = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);

  // Handle view mode change - clears map bounds when switching away from map
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    if (mode !== 'map') {
      setMapBounds(null);
    }
    setViewMode(mode);
  }, []);

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <SearchResultsSkeleton viewMode={viewMode} count={8} />;
    }

    if (isError && error) {
      return <SearchError error={error} onRetry={() => refetch()} />;
    }

    if (viewMode === 'map') {
      return (
        <SearchMapSplitView 
          providers={filteredProviders} 
          searchQuery={searchQuery}
          onFilterByBounds={handleFilterByBounds}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onToggleFilters={() => setShowFilters(prev => !prev)}
          activeFiltersCount={
            (filters.categories.length > 0 ? 1 : 0) +
            (filters.minRating > 0 ? 1 : 0) +
            (filters.verifiedOnly ? 1 : 0) +
            (filters.emergencyServices ? 1 : 0) +
            (filters.wheelchairAccessible ? 1 : 0) +
            (filters.insuranceAccepted ? 1 : 0) +
            (filters.equipmentBrands.length > 0 ? 1 : 0) +
            (filters.cnasOnly ? 1 : 0)
          }
        />
      );
    }

    return (
      <div className="flex flex-col">
        {/* Mini Map Preview for list/grid views */}
        {filteredProviders.length > 0 && (
          <div className="px-4 pt-4">
            <MiniMapPreview 
              providers={filteredProviders}
              onOpenFullMap={() => handleViewModeChange('map')}
            />
          </div>
        )}
        
        <SearchResults 
          providers={filteredProviders}
          viewMode={viewMode}
          searchQuery={searchQuery}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Development mode data source indicator */}
      {import.meta.env.DEV && usingFallback && (
        <div className="card-status-warning border-b px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>
            <strong>Mode développement:</strong> Données de référence utilisées - Firebase non connecté ou collection vide
          </span>
          <Database className="h-4 w-4" />
        </div>
      )}
      
      {/* Firestore connected indicator (dev mode only) */}
      {import.meta.env.DEV && !usingFallback && !isLoading && (
        <div className="card-status-success border-b px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          <span>
            <strong>Firestore connecté:</strong> {allProviders.length} prestataires vérifiés chargés
          </span>
        </div>
      )}

      {/* Search Interface — masquée en mode carte (le panneau gauche gère la recherche) */}
      {viewMode !== 'map' && (
        <SearchInterface
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resultCount={filteredProviders.length}
          hideSearchBar={false}
        />
      )}

      <div className="flex">
        {/* Advanced Filters Sidebar */}
        <AdvancedFilters
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
        />

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
