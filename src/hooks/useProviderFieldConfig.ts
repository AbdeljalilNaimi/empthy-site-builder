import { useMemo } from 'react';
import { getProviderFieldConfig, type ProviderCategoryId, type CategoryFieldConfig } from '@/config/providerCategoryConfig';

/**
 * Convenience hook to resolve category field config from category + sub-type.
 * Returns null if category or subType is missing.
 */
export function useProviderFieldConfig(
  category: ProviderCategoryId | '' | undefined,
  subType: string | undefined
): CategoryFieldConfig | null {
  return useMemo(() => {
    if (!category || !subType) return null;
    return getProviderFieldConfig(category, subType);
  }, [category, subType]);
}
