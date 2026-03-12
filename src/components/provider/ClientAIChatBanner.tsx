import { Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientAIChatBannerProps {
  onOpenChat: () => void;
}

export const ClientAIChatBanner = ({ onOpenChat }: ClientAIChatBannerProps) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
        <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
          Assistant IA disponible
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
          Vous cherchez une information précise ? Posez votre question directement à notre assistant intelligent.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenChat}
          className="gap-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ouvrir le chat
        </Button>
      </div>
    </div>
  );
};

export default ClientAIChatBanner;
