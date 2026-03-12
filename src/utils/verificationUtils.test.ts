import { describe, it, expect } from 'vitest';
import {
  isProviderVerified,
  isProviderPublic,
  getVerificationDisplayInfo,
} from './verificationUtils';

describe('verificationUtils', () => {
  describe('isProviderVerified', () => {
    // Legacy 'verified' boolean field
    it('returns true when verified is true', () => {
      expect(isProviderVerified({ verified: true })).toBe(true);
    });

    it('returns false when verified is false', () => {
      expect(isProviderVerified({ verified: false })).toBe(false);
    });

    it('returns false when verified is undefined', () => {
      expect(isProviderVerified({})).toBe(false);
    });

    // New 'verificationStatus' field
    it('returns true when verificationStatus is "verified"', () => {
      expect(isProviderVerified({ verificationStatus: 'verified' })).toBe(true);
    });

    it('returns false when verificationStatus is "pending"', () => {
      expect(isProviderVerified({ verificationStatus: 'pending' })).toBe(false);
    });

    it('returns false when verificationStatus is "rejected"', () => {
      expect(isProviderVerified({ verificationStatus: 'rejected' })).toBe(false);
    });

    // Combined scenarios (legacy + new field)
    it('returns true when both verified=true and verificationStatus="verified"', () => {
      expect(isProviderVerified({ verified: true, verificationStatus: 'verified' })).toBe(true);
    });

    it('returns true when verified=true but verificationStatus="pending" (legacy takes precedence)', () => {
      expect(isProviderVerified({ verified: true, verificationStatus: 'pending' })).toBe(true);
    });

    it('returns true when verified=false but verificationStatus="verified" (new field takes precedence)', () => {
      expect(isProviderVerified({ verified: false, verificationStatus: 'verified' })).toBe(true);
    });

    it('returns false when verified=false and verificationStatus="pending"', () => {
      expect(isProviderVerified({ verified: false, verificationStatus: 'pending' })).toBe(false);
    });

    // Edge cases
    it('handles null-ish values gracefully', () => {
      expect(isProviderVerified({ verified: undefined, verificationStatus: undefined })).toBe(false);
    });

    it('handles empty object', () => {
      expect(isProviderVerified({})).toBe(false);
    });
  });

  describe('isProviderPublic', () => {
    // Basic cases
    it('returns true when isPublic=true and verificationStatus="verified"', () => {
      expect(isProviderPublic({ isPublic: true, verificationStatus: 'verified' })).toBe(true);
    });

    it('returns false when isPublic=true but verificationStatus="pending"', () => {
      expect(isProviderPublic({ isPublic: true, verificationStatus: 'pending' })).toBe(false);
    });

    it('returns false when isPublic=true but verificationStatus="rejected"', () => {
      expect(isProviderPublic({ isPublic: true, verificationStatus: 'rejected' })).toBe(false);
    });

    it('returns false when isPublic=false and verificationStatus="verified"', () => {
      expect(isProviderPublic({ isPublic: false, verificationStatus: 'verified' })).toBe(false);
    });

    it('returns false when isPublic=false and verificationStatus="pending"', () => {
      expect(isProviderPublic({ isPublic: false, verificationStatus: 'pending' })).toBe(false);
    });

    // Missing field cases
    it('returns false when isPublic is undefined', () => {
      expect(isProviderPublic({ verificationStatus: 'verified' })).toBe(false);
    });

    it('returns false when verificationStatus is undefined', () => {
      expect(isProviderPublic({ isPublic: true })).toBe(false);
    });

    it('returns false when both fields are undefined', () => {
      expect(isProviderPublic({})).toBe(false);
    });

    // Edge cases
    it('handles empty object', () => {
      expect(isProviderPublic({})).toBe(false);
    });
  });

  describe('getVerificationDisplayInfo', () => {
    it('returns verified info for "verified" status', () => {
      const result = getVerificationDisplayInfo('verified');
      expect(result.key).toBe('verified');
      expect(result.colorClass).toBe('text-primary');
    });

    it('returns pending info for "pending" status', () => {
      const result = getVerificationDisplayInfo('pending');
      expect(result.key).toBe('pending');
      expect(result.colorClass).toBe('text-amber-500');
    });

    it('returns rejected info for "rejected" status', () => {
      const result = getVerificationDisplayInfo('rejected');
      expect(result.key).toBe('rejected');
      expect(result.colorClass).toBe('text-destructive');
    });

    it('returns none info for undefined status', () => {
      const result = getVerificationDisplayInfo(undefined);
      expect(result.key).toBe('none');
      expect(result.colorClass).toBe('text-muted-foreground');
    });

    it('returns none info when called without arguments', () => {
      const result = getVerificationDisplayInfo();
      expect(result.key).toBe('none');
      expect(result.colorClass).toBe('text-muted-foreground');
    });
  });
});
