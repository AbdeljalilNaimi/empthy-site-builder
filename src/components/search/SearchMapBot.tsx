import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import type { CityHealthProvider } from '@/data/providers';

interface MapBotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SearchMapBotProps {
  isOpen: boolean;
  onClose: () => void;
  providers: CityHealthProvider[];
  onFlyToProvider: (id: string) => void;
  language?: string;
}

// Parse [FLY:id] tags from bot response and extract plain text + fly commands
function parseResponse(content: string): { text: string; flyIds: string[] } {
  const flyIds: string[] = [];
  const text = content.replace(/\[FLY:([^\]]+)\]/g, (_, id) => {
    flyIds.push(id.trim());
    return '';
  }).trim();
  return { text, flyIds };
}

export const SearchMapBot = ({ isOpen, onClose, providers, onFlyToProvider, language = 'fr' }: SearchMapBotProps) => {
  const [messages, setMessages] = useState<MapBotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const txMap = {
    fr: {
      title: 'MapBot',
      subtitle: 'Assistant médical IA',
      placeholder: 'Posez votre question...',
      send: 'Envoyer',
      welcome: `Bonjour ! Je suis MapBot. Je connais les ${providers.length} prestataires affichés sur la carte. Comment puis-je vous aider ?`,
      error: 'Désolé, une erreur s\'est produite. Réessayez.',
      suggestions: ['Médecin le plus proche', 'Urgences 24h', 'Meilleure note']
    },
    ar: {
      title: 'MapBot',
      subtitle: 'المساعد الطبي الذكي',
      placeholder: 'اطرح سؤالك...',
      send: 'إرسال',
      welcome: `مرحباً! أنا MapBot. أعرف ${providers.length} مزوداً معروضاً على الخريطة. كيف يمكنني مساعدتك؟`,
      error: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
      suggestions: ['أقرب طبيب', 'طوارئ 24 ساعة', 'أعلى تقييم']
    },
    en: {
      title: 'MapBot',
      subtitle: 'AI Medical Assistant',
      placeholder: 'Ask your question...',
      send: 'Send',
      welcome: `Hello! I'm MapBot. I know the ${providers.length} providers shown on the map. How can I help you?`,
      error: 'Sorry, an error occurred. Please try again.',
      suggestions: ['Nearest doctor', '24h Emergency', 'Best rated']
    }
  };

  const tx = txMap[language as 'fr' | 'ar' | 'en'] || txMap.fr;

  const hasUserMessages = messages.some(m => m.role === 'user');

  // Initialize welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: tx.welcome
      }]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const systemPrompt = `Tu es MapBot, un assistant médical intelligent intégré à la carte de recherche de prestataires de santé à Sidi Bel Abbès (Algérie).
Tu as accès à la liste complète des prestataires actuellement affichés sur la carte. Tu aides les utilisateurs à trouver le bon prestataire.

PRESTATAIRES DISPONIBLES (${providers.length} au total):
${providers.map(p => `- ID:${p.id} | ${p.name} (${p.specialty || p.type}) | ${p.address} | Note: ${p.rating}/5${p.emergency ? ' | URGENCES 24/7' : ''}${p.distance ? ` | ${p.distance}km` : ''}`).join('\n')}

INSTRUCTIONS IMPORTANTES:
- Quand tu recommandes un prestataire spécifique, inclus le tag [FLY:ID_DU_PRESTATAIRE] pour centrer la carte dessus.
- Exemple: "Je vous recommande Dr. Benali [FLY:provider-123] qui est cardiologue..."
- Réponds TOUJOURS dans la langue de l'utilisateur (FR/AR/EN).
- Sois concis, utile et professionnel.
- Ne pas inventer de prestataires qui ne sont pas dans la liste.
- Si la liste est vide, dis à l'utilisateur d'élargir ses critères de recherche.`;

  const sendSuggestion = useCallback((suggestion: string) => {
    setInput(suggestion);
    // Use a short timeout to let state update before sending
    setTimeout(() => {
      const userMsg: MapBotMessage = { id: Date.now().toString(), role: 'user', content: suggestion };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      const history = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.role,
        content: m.content
      }));

      supabase.functions.invoke('map-bot', {
        body: {
          messages: [...history, { role: 'user', content: suggestion }],
          systemPrompt,
          model: 'google/gemini-3-flash-preview'
        }
      }).then(({ data, error }) => {
        if (error) throw error;
        const rawContent = data?.content || data?.message || tx.error;
        const { text, flyIds } = parseResponse(rawContent);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: text || rawContent
        }]);
        flyIds.forEach(id => {
          if (providers.find(p => p.id === id)) onFlyToProvider(id);
        });
      }).catch(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: tx.error
        }]);
      }).finally(() => setIsLoading(false));
    }, 0);
  }, [messages, systemPrompt, providers, onFlyToProvider, tx.error]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: MapBotMessage = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('map-bot', {
        body: {
          messages: [
            ...history,
            { role: 'user', content: userMsg.content }
          ],
          systemPrompt,
          model: 'google/gemini-3-flash-preview'
        }
      });

      if (error) throw error;

      const rawContent = data?.content || data?.message || tx.error;
      const { text, flyIds } = parseResponse(rawContent);

      const assistantMsg: MapBotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text || rawContent
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Execute fly commands
      flyIds.forEach(id => {
        const provider = providers.find(p => p.id === id);
        if (provider) {
          onFlyToProvider(id);
        }
      });
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: tx.error
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, systemPrompt, providers, onFlyToProvider, tx.error]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-24 right-6 z-[500] w-80 rounded-2xl shadow-2xl border border-border/60 bg-card/95 backdrop-blur-sm flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100% - 120px)', height: 420 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-primary text-primary-foreground flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{tx.title}</p>
              <p className="text-xs opacity-80">{tx.subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              onClick={onClose}
            >
              <X size={14} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-primary" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions — shown only before any user message */}
          {!hasUserMessages && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-1.5 px-3 pb-2"
            >
              {tx.suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => sendSuggestion(s)}
                  className="px-2.5 py-1 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-150 font-medium"
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border/50 flex gap-2 flex-shrink-0">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tx.placeholder}
              className="h-9 text-xs rounded-full bg-muted border-0 focus-visible:ring-1"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-full flex-shrink-0"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              <Send size={14} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
