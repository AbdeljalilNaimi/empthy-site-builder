import { describe, it, expect } from 'vitest';
import { CityHealthProvider } from '@/data/providers';
import { isProviderVerified } from '@/utils/verificationUtils';

// Pure filtering logic extracted for testing
export function filterProviders(
  providers: CityHealthProvider[],
  options: {
    searchQuery?: string;
    categories?: string[];
    minRating?: number;
    verifiedOnly?: boolean;
    emergencyServices?: boolean;
  }
): CityHealthProvider[] {
  let results = providers;

  // Text search
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    results = results.filter(provider =>
      provider.name.toLowerCase().includes(query) ||
      (provider.specialty || '').toLowerCase().includes(query) ||
      provider.address.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (options.categories && options.categories.length > 0) {
    results = results.filter(provider =>
      options.categories!.some(category =>
        (provider.specialty || '').toLowerCase().includes(category.toLowerCase()) ||
        provider.type.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  // Rating filter
  if (options.minRating && options.minRating > 0) {
    results = results.filter(provider => provider.rating >= options.minRating!);
  }

  // Verified only - use canonical verification check
  if (options.verifiedOnly) {
    results = results.filter(provider => isProviderVerified(provider));
  }

  // Emergency services
  if (options.emergencyServices) {
    results = results.filter(provider => provider.emergency);
  }

  return results;
}

// Mock providers for testing
const mockProviders: CityHealthProvider[] = [
  {
    id: '1',
    name: 'Hôpital Central',
    type: 'hospital',
    specialty: 'Général',
    rating: 4.5,
    reviewsCount: 100,
    distance: 2.5,
    verified: true,
    emergency: true,
    accessible: true,
    isOpen: true,
    address: '123 Rue Principale',
    city: 'Sidi Bel Abbès',
    area: 'Centre',
    phone: '048123456',
    image: '/placeholder.svg',
    lat: 35.19,
    lng: -0.63,
    languages: ['fr', 'ar'],
    description: 'Hôpital général',
    verificationStatus: 'verified',
    isPublic: true,
  },
  {
    id: '2',
    name: 'Dr. Ahmed - Cardiologue',
    type: 'doctor',
    specialty: 'Cardiologie',
    rating: 4.8,
    reviewsCount: 50,
    distance: 1.2,
    verified: true,
    emergency: false,
    accessible: true,
    isOpen: true,
    address: '45 Avenue de la Santé',
    city: 'Sidi Bel Abbès',
    area: 'Hai El Badr',
    phone: '048654321',
    image: '/placeholder.svg',
    lat: 35.20,
    lng: -0.62,
    languages: ['fr', 'ar'],
    description: 'Cardiologue expérimenté',
    verificationStatus: 'verified',
    isPublic: true,
  },
  {
    id: '3',
    name: 'Pharmacie Moderne',
    type: 'pharmacy',
    rating: 3.9,
    reviewsCount: 30,
    distance: 0.5,
    verified: false,
    emergency: false,
    accessible: true,
    isOpen: true,
    address: '78 Boulevard Central',
    city: 'Sidi Bel Abbès',
    area: 'Centre',
    phone: '048111222',
    image: '/placeholder.svg',
    lat: 35.19,
    lng: -0.64,
    languages: ['fr'],
    description: 'Pharmacie de quartier',
    verificationStatus: 'pending',
    isPublic: true,
  },
  {
    id: '4',
    name: 'Clinique Urgences 24h',
    type: 'clinic',
    specialty: 'Urgences',
    rating: 4.2,
    reviewsCount: 75,
    distance: 3.0,
    verified: true,
    emergency: true,
    accessible: true,
    isOpen: true,
    address: '99 Rue des Urgences',
    city: 'Sidi Bel Abbès',
    area: 'Ouest',
    phone: '048999888',
    image: '/placeholder.svg',
    lat: 35.18,
    lng: -0.65,
    languages: ['fr', 'ar'],
    description: 'Clinique urgences',
    verificationStatus: 'verified',
    isPublic: true,
  },
];

describe('Provider Search Filtering', () => {
  describe('Text Search', () => {
    it('filters by name', () => {
      const results = filterProviders(mockProviders, { searchQuery: 'Ahmed' });
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('filters by specialty', () => {
      const results = filterProviders(mockProviders, { searchQuery: 'cardiologie' });
      
      expect(results).toHaveLength(1);
      expect(results[0].specialty).toBe('Cardiologie');
    });

    it('filters by address', () => {
      const results = filterProviders(mockProviders, { searchQuery: 'Boulevard' });
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Pharmacie Moderne');
    });

    it('is case-insensitive', () => {
      const results = filterProviders(mockProviders, { searchQuery: 'AHMED' });
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('doctor');
    });

    it('returns all when search is empty', () => {
      const results = filterProviders(mockProviders, { searchQuery: '' });
      
      expect(results).toHaveLength(4);
    });
  });

  describe('Category Filter', () => {
    it('filters by type category', () => {
      const results = filterProviders(mockProviders, { categories: ['hospital'] });
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('hospital');
    });

    it('filters by specialty category', () => {
      const results = filterProviders(mockProviders, { categories: ['cardiologie'] });
      
      expect(results).toHaveLength(1);
      expect(results[0].specialty).toBe('Cardiologie');
    });

    it('handles multiple categories (OR logic)', () => {
      const results = filterProviders(mockProviders, { 
        categories: ['hospital', 'pharmacy'] 
      });
      
      expect(results).toHaveLength(2);
    });

    it('returns all when no categories specified', () => {
      const results = filterProviders(mockProviders, { categories: [] });
      
      expect(results).toHaveLength(4);
    });
  });

  describe('Rating Filter', () => {
    it('filters by minimum rating', () => {
      const results = filterProviders(mockProviders, { minRating: 4.5 });
      
      expect(results).toHaveLength(2);
      expect(results.every(p => p.rating >= 4.5)).toBe(true);
    });

    it('returns all when minRating is 0', () => {
      const results = filterProviders(mockProviders, { minRating: 0 });
      
      expect(results).toHaveLength(4);
    });

    it('returns none when minRating is too high', () => {
      const results = filterProviders(mockProviders, { minRating: 5 });
      
      expect(results).toHaveLength(0);
    });
  });

  describe('Verified Filter', () => {
    it('filters to only verified providers', () => {
      const results = filterProviders(mockProviders, { verifiedOnly: true });
      
      expect(results).toHaveLength(3);
      expect(results.every(p => p.verified)).toBe(true);
    });

    it('returns all when verifiedOnly is false', () => {
      const results = filterProviders(mockProviders, { verifiedOnly: false });
      
      expect(results).toHaveLength(4);
    });
  });

  describe('Emergency Filter', () => {
    it('filters to only emergency providers', () => {
      const results = filterProviders(mockProviders, { emergencyServices: true });
      
      expect(results).toHaveLength(2);
      expect(results.every(p => p.emergency)).toBe(true);
    });
  });

  describe('Combined Filters', () => {
    it('applies multiple filters together', () => {
      const results = filterProviders(mockProviders, {
        verifiedOnly: true,
        minRating: 4.5,
      });
      
      // Only providers with verified=true OR verificationStatus='verified' AND rating >= 4.5
      // Hospital (4.5) and Cardiologue (4.8) qualify
      expect(results).toHaveLength(2);
      expect(results.every(p => (p.verified || p.verificationStatus === 'verified') && p.rating >= 4.5)).toBe(true);
    });

    it('combines search with filters', () => {
      const results = filterProviders(mockProviders, {
        searchQuery: 'central',
        emergencyServices: true,
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Hôpital Central');
    });
  });
});
