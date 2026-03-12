// Centralized error handling utility for CityHealth
// Provides consistent error messages and logging

import { toast } from 'sonner';

export type FirebaseErrorCode = 
  | 'permission-denied'
  | 'not-found'
  | 'already-exists'
  | 'failed-precondition'
  | 'unauthenticated'
  | 'unavailable'
  | 'cancelled'
  | 'unknown'
  | 'network-request-failed'
  | 'auth/invalid-credential'
  | 'auth/email-already-in-use'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed';

interface ErrorMessages {
  fr: string;
  ar: string;
  en: string;
}

const ERROR_MESSAGES: Record<string, ErrorMessages> = {
  'permission-denied': {
    fr: 'Vous n\'avez pas la permission d\'effectuer cette action.',
    ar: 'ليس لديك إذن لتنفيذ هذا الإجراء.',
    en: 'You don\'t have permission to perform this action.',
  },
  'not-found': {
    fr: 'Les données demandées n\'existent pas.',
    ar: 'البيانات المطلوبة غير موجودة.',
    en: 'The requested data does not exist.',
  },
  'already-exists': {
    fr: 'Ces données existent déjà.',
    ar: 'هذه البيانات موجودة بالفعل.',
    en: 'This data already exists.',
  },
  'unauthenticated': {
    fr: 'Veuillez vous connecter pour continuer.',
    ar: 'يرجى تسجيل الدخول للمتابعة.',
    en: 'Please log in to continue.',
  },
  'unavailable': {
    fr: 'Le service est temporairement indisponible. Réessayez plus tard.',
    ar: 'الخدمة غير متاحة مؤقتًا. حاول مرة أخرى لاحقًا.',
    en: 'Service is temporarily unavailable. Please try again later.',
  },
  'network-request-failed': {
    fr: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
    ar: 'خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت.',
    en: 'Network connection error. Check your internet connection.',
  },
  'auth/invalid-credential': {
    fr: 'Email ou mot de passe incorrect.',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    en: 'Invalid email or password.',
  },
  'auth/email-already-in-use': {
    fr: 'Un compte existe déjà avec cet email.',
    ar: 'يوجد حساب بالفعل بهذا البريد الإلكتروني.',
    en: 'An account already exists with this email.',
  },
  'auth/user-not-found': {
    fr: 'Aucun compte trouvé avec cet email.',
    ar: 'لم يتم العثور على حساب بهذا البريد الإلكتروني.',
    en: 'No account found with this email.',
  },
  'auth/wrong-password': {
    fr: 'Mot de passe incorrect.',
    ar: 'كلمة المرور غير صحيحة.',
    en: 'Incorrect password.',
  },
  'auth/too-many-requests': {
    fr: 'Trop de tentatives. Réessayez dans quelques minutes.',
    ar: 'محاولات كثيرة جدًا. حاول مرة أخرى بعد بضع دقائق.',
    en: 'Too many attempts. Please try again in a few minutes.',
  },
  'auth/network-request-failed': {
    fr: 'Erreur de connexion. Vérifiez votre connexion internet.',
    ar: 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت.',
    en: 'Connection error. Check your internet connection.',
  },
  'default': {
    fr: 'Une erreur inattendue s\'est produite.',
    ar: 'حدث خطأ غير متوقع.',
    en: 'An unexpected error occurred.',
  },
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown, lang: 'fr' | 'ar' | 'en' = 'fr'): string {
  if (error instanceof Error) {
    // Check for Firebase error codes
    const errorCode = (error as any).code as string;
    
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode][lang];
    }
    
    // Check for network errors
    if (error.message.includes('network') || error.message.includes('Network')) {
      return ERROR_MESSAGES['network-request-failed'][lang];
    }
    
    // Check for permission errors
    if (error.message.includes('permission') || error.message.includes('Permission')) {
      return ERROR_MESSAGES['permission-denied'][lang];
    }
  }
  
  return ERROR_MESSAGES['default'][lang];
}

/**
 * Log error to console with context
 */
export function logError(error: unknown, context: string): void {
  console.error(`[CityHealth Error - ${context}]`, {
    error,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });
}

/**
 * Handle error with logging and toast notification
 */
export function handleError(
  error: unknown, 
  context: string, 
  options?: {
    showToast?: boolean;
    lang?: 'fr' | 'ar' | 'en';
    customMessage?: string;
  }
): void {
  const { showToast = true, lang = 'fr', customMessage } = options || {};
  
  // Log the error
  logError(error, context);
  
  // Show toast notification
  if (showToast) {
    const message = customMessage || getErrorMessage(error, lang);
    toast.error(message);
  }
}

/**
 * Wrapper for async Firebase operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  options?: {
    showToast?: boolean;
    lang?: 'fr' | 'ar' | 'en';
    fallback?: T;
  }
): Promise<T | undefined> {
  const { showToast = true, lang = 'fr', fallback } = options || {};
  
  try {
    return await operation();
  } catch (error) {
    handleError(error, context, { showToast, lang });
    return fallback;
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.message.includes('Failed to fetch') ||
      (error as any).code === 'unavailable' ||
      (error as any).code === 'auth/network-request-failed'
    );
  }
  return false;
}

/**
 * Check if error is an auth error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const code = (error as any).code as string;
    return code?.startsWith('auth/') || false;
  }
  return false;
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      (error as any).code === 'permission-denied' ||
      error.message.includes('permission') ||
      error.message.includes('Permission')
    );
  }
  return false;
}
