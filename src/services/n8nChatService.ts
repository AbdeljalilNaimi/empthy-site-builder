import { z } from 'zod';
import { auth } from '@/lib/firebase';

// N8N webhook URL from environment variable
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

// Input validation schema
const messageInputSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  sessionId: z.string().min(1, 'Session ID required'),
});

interface N8nResponse {
  output?: string;
  response?: string;
  text?: string;
  message?: string;
  sessionId?: string;
}

/**
 * Get the current user's Firebase auth token for authenticated API calls
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Send a message to the n8n AI chat webhook
 * Now includes authentication and input validation
 */
export async function sendN8nMessage({
  message,
  sessionId,
}: {
  message: string;
  sessionId: string;
}): Promise<{ response: string; sessionId: string }> {
  // Validate inputs
  const validationResult = messageInputSchema.safeParse({ message, sessionId });
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors[0]?.message || 'Invalid input');
  }

  // Check if N8N is configured
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N service not configured. Please set VITE_N8N_WEBHOOK_URL.');
  }

  // Get auth token for authenticated requests
  const authToken = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if user is authenticated
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const resp = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      chatInput: validationResult.data.message,
      sessionId: validationResult.data.sessionId,
    }),
  });
  
  if (!resp.ok) {
    if (resp.status === 401) {
      throw new Error('Veuillez vous connecter pour utiliser le chat.');
    }
    if (resp.status === 429) {
      throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.');
    }
    throw new Error('Erreur de connexion au service IA');
  }
  
  const data: N8nResponse = await resp.json();
  
  // Handle various possible response formats from n8n
  const responseText = data.output || data.response || data.text || data.message || 'Désolé, je n\'ai pas pu traiter votre demande.';
  
  return {
    response: responseText,
    sessionId: data.sessionId || sessionId,
  };
}
