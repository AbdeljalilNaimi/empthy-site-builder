import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Bot, User, X, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Comment fonctionne la recherche de prestataires ?",
  "Comment s'inscrire en tant que fournisseur de soins ?",
  "Comment utiliser la carte interactive ?",
  "Quelles sont les fonctionnalités de l'assistant IA ?",
];

interface DocsFloatingChatProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DocsFloatingChat = ({ isOpen: controlledOpen, onOpenChange }: DocsFloatingChatProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = useCallback((v: boolean) => {
    onOpenChange ? onOpenChange(v) : setInternalOpen(v);
  }, [onOpenChange]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiAvailable, setIsAiAvailable] = useState(true);
  const [isCheckingPdf, setIsCheckingPdf] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabaseUrl = SUPABASE_URL;

  // Pre-check PDF existence
  useEffect(() => {
    const checkPdf = async () => {
      setIsCheckingPdf(true);
      try {
        const resp = await fetch(`${supabaseUrl}/storage/v1/object/public/pdfs/official_documentation.pdf`, { method: 'HEAD' });
        if (!resp.ok) setIsAiAvailable(false);
      } catch {
        setIsAiAvailable(false);
      } finally {
        setIsCheckingPdf(false);
      }
    };
    checkPdf();
  }, [supabaseUrl]);

  // Welcome tooltip timer
  useEffect(() => {
    if (tooltipDismissed || isOpen) return;
    const showTimer = setTimeout(() => setShowTooltip(true), 2000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 10000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [tooltipDismissed, isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed) {
      toast.warning("Veuillez écrire un message avant de l'envoyer.");
      return;
    }
    if (isLoading || !isAiAvailable) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/chat-with-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: 'official_documentation', userMessage: trimmed }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        if (data?.error === 'NO_PDF') { setIsAiAvailable(false); return; }
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' }]);
        return;
      }
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.reply || "Désolé, je n'ai pas pu répondre." }]);
    } catch {
      toast.error("Problème de connexion. Impossible de joindre l'assistant IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
    setTooltipDismissed(true);
  };

  return (
    <>
      {/* Welcome Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-[5.5rem] right-6 z-50 max-w-[280px]"
          >
            <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-xl text-sm text-foreground relative">
              <button
                onClick={() => { setShowTooltip(false); setTooltipDismissed(true); }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="h-3 w-3" />
              </button>
              <p>👋 Une question sur CityHealth ? L'assistant IA du Centre d'Aide est là pour vous guider !</p>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-b border-r border-border rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center",
          "bg-primary text-primary-foreground",
          "transition-colors duration-200",
          isOpen && "bg-muted text-foreground"
        )}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className={cn(
              "fixed z-50 flex flex-col",
              "bottom-24 right-6 w-[360px] sm:w-[400px] h-[520px]",
              "max-sm:inset-x-4 max-sm:right-auto max-sm:w-auto max-sm:bottom-20 max-sm:h-[70vh]",
              "bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">Assistant IA – Centre d'Aide</p>
                <p className="text-xs opacity-80">Documentation officielle</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {isCheckingPdf ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Vérification de l'assistant IA…</p>
                  </div>
                </div>
              ) : !isAiAvailable ? (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center max-w-xs">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      L'assistant IA de la documentation n'est pas encore disponible.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="flex flex-col gap-3 py-2">
                      <p className="text-sm text-muted-foreground text-center">
                        Posez une question ou choisissez un sujet :
                      </p>
                      <div className="grid gap-2">
                        {SUGGESTED_QUESTIONS.map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="text-left text-sm px-3 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted hover:border-primary/30 transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2 max-w-[85%]',
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                      )}
                    >
                      <div className={cn(
                        'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                        msg.role === 'user' ? 'bg-primary/20' : 'bg-secondary/20'
                      )}>
                        {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-primary" /> : <Bot className="h-3.5 w-3.5 text-secondary-foreground" />}
                      </div>
                      <div className={cn(
                        'rounded-xl px-3 py-2 text-sm',
                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        {msg.role === 'assistant' ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              ul: ({ children }) => <ul className="pl-4 space-y-1 list-disc mb-2 last:mb-0">{children}</ul>,
                              ol: ({ children }) => <ol className="pl-4 space-y-1 list-decimal mb-2 last:mb-0">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              code: ({ children }) => <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs">{children}</code>,
                            }}
                          >{msg.content}</ReactMarkdown>
                        ) : msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-secondary/20">
                        <Bot className="h-3.5 w-3.5 text-secondary-foreground" />
                      </div>
                      <div className="rounded-xl px-3 py-2 text-sm bg-muted flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        L'assistant réfléchit...
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex items-center gap-2 shrink-0 bg-muted/30">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAiAvailable ? "Posez une question sur la documentation..." : "Assistant IA indisponible"}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                disabled={isLoading || !isAiAvailable || isCheckingPdf}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || !isAiAvailable || isCheckingPdf}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DocsFloatingChat;
