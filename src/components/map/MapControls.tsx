import { useMemo, useState, useCallback } from 'react';
import { 
  LocateFixed, 
  Maximize2, 
  Minimize2, 
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapContext, MapMode } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { MapChatWidget } from './MapChatWidget';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MapControlsProps {
  mode: MapMode;
}

export const MapControls = ({ mode }: MapControlsProps) => {
  const { 
    locateUser, 
    isFullscreen, 
    toggleFullscreen,
    geolocation,
    isRTL,
    sidebarProviders,
    flyTo,
    setSelectedProvider,
  } = useMapContext();
  const { language } = useLanguage();
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  const t = useMemo(() => ({
    fr: {
      locate: 'Ma position',
      fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter plein écran',
      assistant: 'Assistant IA'
    },
    ar: {
      locate: 'موقعي',
      fullscreen: 'ملء الشاشة',
      exitFullscreen: 'الخروج من ملء الشاشة',
      assistant: 'المساعد الذكي'
    },
    en: {
      locate: 'My location',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      assistant: 'AI Assistant'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;

  const handleFlyToProvider = useCallback((id: string) => {
    const provider = sidebarProviders.find(p => p.id === id);
    if (provider) {
      flyTo(provider.lat, provider.lng, 16);
      setSelectedProvider(provider);
    }
  }, [sidebarProviders, flyTo, setSelectedProvider]);
  
  return (
    <>
      {/* Floating action buttons - grouped pill */}
      <div className={cn(
        "absolute bottom-6 z-[1000] flex flex-col gap-1.5",
        isRTL ? "left-6" : "right-6"
      )}>
        <div className="flex flex-col bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/40 p-1.5 ring-1 ring-black/[0.04] dark:ring-white/[0.04]">
          {/* Fullscreen toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl hover:bg-accent transition-all duration-200"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? "right" : "left"} className="text-xs">
              {isFullscreen ? tx.exitFullscreen : tx.fullscreen}
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="h-px bg-border/40 mx-2" />

          {/* Geolocation button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl hover:bg-accent transition-all duration-200"
                onClick={locateUser}
                disabled={geolocation.loading}
              >
                <LocateFixed className={cn("h-4 w-4 text-primary", geolocation.loading && "animate-pulse")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? "right" : "left"} className="text-xs">
              {tx.locate}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* AI Assistant button - separate for emphasis */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "h-12 w-12 rounded-2xl shadow-xl transition-all duration-200",
                isBotOpen 
                  ? "bg-primary hover:bg-primary/90 scale-95" 
                  : "bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-2xl"
              )}
              onClick={() => setIsBotOpen(prev => !prev)}
            >
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isRTL ? "right" : "left"} className="text-xs">
            {tx.assistant}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* MapChatWidget */}
      <MapChatWidget
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        providers={sidebarProviders}
        onFlyToProvider={handleFlyToProvider}
        language={language}
      />
    </>
  );
};
