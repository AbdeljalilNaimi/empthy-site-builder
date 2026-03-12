// Migration Script: Upload providers to Firestore
// Combines reference providers with generated mock data

import { generateMockProviders } from '@/data/providers';
import { REFERENCE_PROVIDERS, getReferenceProvidersSummary, getTotalReferenceProviders } from '@/data/referenceProviders';
import { batchSaveProviders, hasProviders } from '@/services/firestoreProviderService';

export interface MigrationOptions {
  includeReference: boolean;
  additionalCount: number;
}

/**
 * Migrate providers to Firestore
 * Combines reference providers with additional mock providers
 */
export async function migrateProvidersToFirestore(
  count: number = 50,
  options: MigrationOptions = { includeReference: true, additionalCount: 0 }
): Promise<{
  success: boolean;
  message: string;
  count: number;
  breakdown?: Record<string, number>;
}> {
  try {
    // Check if providers already exist
    const existingProviders = await hasProviders();
    
    if (existingProviders) {
      return {
        success: true,
        message: 'Providers already exist in Firestore. Skipping migration.',
        count: 0,
      };
    }
    
    // Build provider list
    let allProviders = [];
    
    // Add reference providers if requested
    if (options.includeReference) {
      allProviders = [...REFERENCE_PROVIDERS];
    }
    
    // Calculate how many additional mock providers to generate
    const remainingCount = Math.max(0, count - allProviders.length);
    
    if (remainingCount > 0 || options.additionalCount > 0) {
      const mockCount = options.additionalCount || remainingCount;
      const mockProviders = generateMockProviders(mockCount);
      
      // Adjust IDs to avoid conflicts
      const adjustedMockProviders = mockProviders.map((p, i) => ({
        ...p,
        id: `mock-${Date.now()}-${i}`,
      }));
      
      allProviders = [...allProviders, ...adjustedMockProviders];
    }
    
    // Upload to Firestore
    const uploadedCount = await batchSaveProviders(allProviders);
    
    // Calculate breakdown by type
    const breakdown: Record<string, number> = {};
    for (const provider of allProviders) {
      breakdown[provider.type] = (breakdown[provider.type] || 0) + 1;
    }
    
    return {
      success: true,
      message: `Successfully migrated ${uploadedCount} providers to Firestore`,
      count: uploadedCount,
      breakdown,
    };
  } catch {
    return {
      success: false,
      message: 'Migration failed',
      count: 0,
    };
  }
}

/**
 * Force re-migration (delete existing and re-upload)
 * Use with caution - this will add to existing data
 */
export async function forceMigrateProviders(
  count: number = 50,
  options: MigrationOptions = { includeReference: true, additionalCount: 0 }
): Promise<{
  success: boolean;
  message: string;
  count: number;
  breakdown?: Record<string, number>;
}> {
  try {
    let allProviders = [];
    
    // Add reference providers if requested
    if (options.includeReference) {
      allProviders = [...REFERENCE_PROVIDERS];
    }
    
    // Add mock providers
    const remainingCount = Math.max(0, count - allProviders.length);
    if (remainingCount > 0 || options.additionalCount > 0) {
      const mockCount = options.additionalCount || remainingCount;
      const mockProviders = generateMockProviders(mockCount);
      const adjustedMockProviders = mockProviders.map((p, i) => ({
        ...p,
        id: `mock-force-${Date.now()}-${i}`,
      }));
      allProviders = [...allProviders, ...adjustedMockProviders];
    }
    
    const uploadedCount = await batchSaveProviders(allProviders);
    
    // Calculate breakdown
    const breakdown: Record<string, number> = {};
    for (const provider of allProviders) {
      breakdown[provider.type] = (breakdown[provider.type] || 0) + 1;
    }
    
    return {
      success: true,
      message: `Force migrated ${uploadedCount} providers to Firestore`,
      count: uploadedCount,
      breakdown,
    };
  } catch {
    return {
      success: false,
      message: 'Force migration failed',
      count: 0,
    };
  }
}

/**
 * Get summary of reference providers for preview
 */
export function getReferenceSummary(): {
  total: number;
  breakdown: Record<string, number>;
} {
  return {
    total: getTotalReferenceProviders(),
    breakdown: getReferenceProvidersSummary(),
  };
}
