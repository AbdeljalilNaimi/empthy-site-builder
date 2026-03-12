import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DocsSidebar } from './DocsSidebar';
import { DocsContent } from './DocsContent';
import { DocsFloatingChat } from './DocsFloatingChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/hooks/useLanguage';

export const DocsLayout = () => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleOpenChat = useCallback(() => setChatOpen(true), []);

  // Cmd+K shortcut to open floating chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpenChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenChat]);

  const homeLabel = language === 'ar' ? 'الرئيسية' : language === 'en' ? 'Home' : 'Accueil';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-border/50 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4 md:gap-6">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open documentation menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={language === 'ar' ? 'right' : 'left'} className="p-0 w-80">
                  <DocsSidebar className="h-full" onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
            )}

            <Link 
              to="/" 
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm hidden sm:inline">{homeLabel}</span>
            </Link>

            <div className="h-6 w-px bg-border hidden md:block" />

            <Link to="/docs" className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25"
              >
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg">Documentation</h1>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    v1.0
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">CityHealth</p>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {isMobile && (
              <Badge variant="outline" className="text-[10px]">v1.0</Badge>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild aria-label="Open homepage in new tab">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex flex-1">
        {!isMobile && (
          <DocsSidebar className="sticky top-16 h-[calc(100vh-4rem)]" />
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <DocsContent />
        </div>
      </div>

      {/* Floating AI Chat Widget */}
      <DocsFloatingChat isOpen={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
};
