// Types for OCR verification system

export interface VerificationData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  registrationNumber?: string;
  date?: string;
  facilityName?: string;
}

export interface FieldVerification {
  found: boolean;
  similarity: number;
  expectedValue: string;
  matchedWord?: string;
}

export interface VerificationResult {
  success: boolean;
  overallScore: number;
  fields: {
    firstName?: FieldVerification;
    lastName?: FieldVerification;
    fullName?: FieldVerification;
    registrationNumber?: FieldVerification;
    date?: FieldVerification;
    facilityName?: FieldVerification;
  };
  rawText: string;
  cleanedText: string;
  processedAt: Date;
  processingTimeMs: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
  statusText: string;
}

export interface DocumentVerificationRecord {
  fileName: string;
  fileType: 'pdf' | 'image';
  verificationResult: VerificationResult | null;
  uploadedAt: Date;
  verifiedAt?: Date;
}
