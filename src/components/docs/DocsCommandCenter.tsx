import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2, BookOpen, ArrowRight, Command, Shield, AlertTriangle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SUGGESTED_QUESTIONS = [
  { text: "Comment fonctionne la vérification des prestataires ?", category: "Vérification" },
  { text: "Comment prendre rendez-vous ?", category: "Rendez-vous" },
  { text: "Quels sont les services disponibles ?", category: "Services" },
  { text: "Comment contacter le support ?", category: "Support" },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface DocsCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsCommandCenter = ({ isOpen, onClose }: DocsCommandCenterProps) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfAvailable, setPdfAvailable] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // PDF pre-check
  useEffect(() => {
    if (!isOpen) return;
    const checkPdf = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/pdfs/official_documentation.pdf`, { method: 'HEAD' });
        setPdfAvailable(res.ok);
      } catch {
        setPdfAvailable(false);
      }
    };
    checkPdf();
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(async (questionText?: string) => {
    const text = questionText || query.trim();
    if (!text || isLoading || pdfAvailable === false) return;

    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/chat-with-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: 'official_documentation',
          userMessage: text,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.error === 'NO_PDF') {
        setPdfAvailable(false);
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "📄 La documentation officielle n'est pas encore disponible. Veuillez réessayer plus tard.",
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || "Désolé, je n'ai pas pu générer de réponse.",
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({ title: "Erreur", description: "Impossible de contacter l'assistant.", variant: "destructive" });
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "❌ Une erreur est survenue. Veuillez réessayer.",
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, pdfAvailable, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-[10%] z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Centre de Commande IA</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-500" />
                      Documentation officielle
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-xs text-muted-foreground hover:text-foreground">
                      Effacer
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Input */}
              <div className="relative border-b border-border/50">
                <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={pdfAvailable === false ? "Documentation indisponible..." : "Posez une question sur la documentation..."}
                  className="h-14 border-0 bg-transparent pl-12 pr-28 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isLoading || pdfAvailable === false}
                />
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <kbd className="hidden rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground sm:inline-block">ESC</kbd>
                  <Button size="sm" onClick={() => handleSubmit()} disabled={!query.trim() || isLoading || pdfAvailable === false} className="h-8">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] min-h-[200px]">
                {pdfAvailable === false ? (
                  <div className="p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Info className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="text-sm font-medium">Documentation en cours de mise à jour</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      L'assistant IA sera disponible dès que l'administration aura publié la documentation officielle.
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-4">
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Questions suggérées</p>
                    <div className="grid gap-2">
                      {SUGGESTED_QUESTIONS.map((item, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSubmit(item.text)}
                          disabled={isLoading}
                          className="group flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 text-left text-sm transition-all hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50"
                        >
                          <div className="flex flex-col">
                            <span className="text-muted-foreground group-hover:text-foreground">{item.text}</span>
                            <span className="text-[10px] text-muted-foreground/60">{item.category}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        </motion.button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Command className="h-3 w-3" /><span>+</span>
                      <kbd className="rounded bg-muted px-1.5 py-0.5">K</kbd>
                      <span>pour ouvrir rapidement</span>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh]">
                    <div ref={scrollRef} className="space-y-4 p-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex gap-3", message.role === 'user' ? "justify-end" : "justify-start")}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                              <Sparkles className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                          <div className={cn(
                            "max-w-[80%] rounded-xl px-4 py-3",
                            message.role === 'user'
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 border border-border/50"
                          )}>
                            {message.role === 'assistant' ? (
                              <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-foreground">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                          {message.role === 'user' && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <span className="text-xs font-medium">Vous</span>
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {isLoading && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 px-4 py-3">
                            <div className="flex gap-1">
                              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                            </div>
                            <span className="text-xs text-muted-foreground">Recherche dans la documentation...</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border/50 bg-muted/30 px-4 py-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    Réponses basées sur la documentation officielle
                  </span>
                  <BookOpen className="h-3 w-3" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
