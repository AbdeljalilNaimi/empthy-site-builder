import { auth } from '@/lib/firebase';

// AI Chat Function URL from environment variable
const CHAT_FUNCTION_URL = import.meta.env.VITE_AI_CHAT_FUNCTION_URL || '';

type Message = { role: "user" | "assistant"; content: string };

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

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}) {
  try {
    // Get auth token for authenticated requests
    const authToken = await getAuthToken();
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Add authorization header if user is authenticated
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const resp = await fetch(CHAT_FUNCTION_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      if (resp.status === 401) {
        throw new Error("Veuillez vous connecter pour utiliser le chat IA.");
      }
      if (resp.status === 429) {
        throw new Error("Trop de requêtes. Veuillez réessayer dans quelques instants.");
      }
      if (resp.status === 402) {
        throw new Error("Service temporairement indisponible. Veuillez réessayer plus tard.");
      }
      throw new Error("Erreur lors de la connexion au service IA");
    }

    if (!resp.body) throw new Error("Pas de réponse du service");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore partial leftovers */ }
      }
    }

    onDone();
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
}
