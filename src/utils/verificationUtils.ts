/**
 * CANONICAL VERIFICATION UTILITIES
 * 
 * All provider verification checks MUST use these functions.
 * Do NOT use inline checks like:
 *   ❌ provider.verified || provider.verificationStatus === 'verified'
 * 
 * Instead use:
 *   ✅ isProviderVerified(provider)
 *   ✅ isProviderPublic(provider)
 * 
 * For UI badges, always use:
 *   ✅ <VerifiedBadge type="verified" />
 * 
 * @see src/components/trust/VerifiedBadge.tsx for UI component
 */

import type { VerificationStatus } from '@/types/provider';

/**
 * Canonical verification check - use this everywhere instead of inline checks
 * Handles both legacy 'verified' boolean and new 'verificationStatus' field
 */
export function isProviderVerified(provider: {
  verified?: boolean;
  verificationStatus?: VerificationStatus;
}): boolean {
  return provider.verified === true || provider.verificationStatus === 'verified';
}

/**
 * Check if provider is publicly visible
 * A provider is public only if they are verified AND have isPublic set to true
 */
export function isProviderPublic(provider: {
  isPublic?: boolean;
  verificationStatus?: VerificationStatus;
}): boolean {
  return provider.isPublic === true && provider.verificationStatus === 'verified';
}

/**
 * Get verification status display info
 */
export function getVerificationDisplayInfo(status?: VerificationStatus): {
  key: 'verified' | 'pending' | 'rejected' | 'none';
  colorClass: string;
} {
  switch (status) {
    case 'verified':
      return { key: 'verified', colorClass: 'text-primary' };
    case 'pending':
      return { key: 'pending', colorClass: 'text-amber-500' };
    case 'rejected':
      return { key: 'rejected', colorClass: 'text-destructive' };
    default:
      return { key: 'none', colorClass: 'text-muted-foreground' };
  }
}
