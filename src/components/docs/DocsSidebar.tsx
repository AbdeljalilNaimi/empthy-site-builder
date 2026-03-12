import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { docsStructure, searchDocs } from '@/data/docsStructure';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface DocsSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const DocsSidebar = ({ className, onNavigate }: DocsSidebarProps) => {
  const { sectionId, pageId } = useParams();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchResults = searchQuery.length >= 2 ? searchDocs(searchQuery) : [];
  const showSearchResults = searchQuery.length >= 2;

  const handleNavigation = () => {
    onNavigate?.();
  };

  const t = {
    searchPlaceholder: language === 'ar' ? 'بحث...' : language === 'en' ? 'Search...' : 'Rechercher...',
    results: (count: number) => language === 'ar'
      ? `${count} نتيجة`
      : language === 'en'
      ? `${count} result${count !== 1 ? 's' : ''}`
      : `${count} résultat${count !== 1 ? 's' : ''}`,
    noResults: language === 'ar' ? 'لم يتم العثور على نتائج' : language === 'en' ? 'No results found' : 'Aucun résultat trouvé',
    support: 'Support',
    app: 'App',
    docTitle: language === 'ar' ? 'وثائق CityHealth' : language === 'en' ? 'CityHealth Documentation' : 'Documentation CityHealth',
    lastUpdate: language === 'ar' ? 'آخر تحديث: يناير 2026' : language === 'en' ? 'Last updated: January 2026' : 'Dernière mise à jour : Janvier 2026',
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-72 border-r border-border/50 bg-gradient-to-b from-card/80 to-card/50 backdrop-blur-sm flex flex-col",
        className
      )}
    >
      {/* Search */}
      <div className="p-4 border-b border-border/50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-transparent focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Search Results */}
          {showSearchResults ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                <Search className="h-3 w-3" />
                {t.results(searchResults.length)}
              </p>
              {searchResults.map((result) => (
                <Link
                  key={`${result.sectionId}-${result.id}`}
                  to={`/docs/${result.sectionId}/${result.id}`}
                  onClick={() => {
                    setSearchQuery('');
                    handleNavigation();
                  }}
                  className="block p-3 rounded-lg bg-background/50 hover:bg-accent/50 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.sectionTitle}
                  </p>
                </Link>
              ))}
              {searchResults.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t.noResults}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Navigation Tree */
            <Accordion
              type="multiple"
              defaultValue={sectionId ? [sectionId] : ['getting-started']}
              className="space-y-2"
            >
              {docsStructure.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-none"
                >
                  <AccordionTrigger className="py-2 px-3 rounded-lg hover:bg-accent/50 hover:no-underline [&[data-state=open]]:bg-accent/30 transition-all">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "p-1.5 rounded-lg bg-gradient-to-br from-background to-muted shadow-sm",
                        section.color
                      )}>
                        <section.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-left flex-1">
                        {section.title}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0 bg-muted/80"
                      >
                        {section.pages.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <ul className="space-y-1 ml-4 pl-4 border-l-2 border-border/50">
                      {section.pages.map((page) => {
                        const isActive = sectionId === section.id && pageId === page.id;
                        return (
                          <li key={page.id}>
                            <Link
                              to={`/docs/${section.id}/${page.id}`}
                              onClick={handleNavigation}
                              className={cn(
                                "relative flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all",
                                "hover:bg-accent/50 hover:translate-x-1",
                                "before:absolute before:-left-[18px] before:top-1/2 before:-translate-y-1/2",
                                "before:w-2 before:h-2 before:rounded-full before:border-2",
                                "before:transition-all",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium before:bg-primary before:border-primary shadow-sm"
                                  : "text-muted-foreground hover:text-foreground before:bg-background before:border-border hover:before:border-primary/50"
                              )}
                            >
                              {page.icon && (
                                <page.icon className={cn(
                                  "h-3.5 w-3.5 shrink-0",
                                  isActive ? "text-primary" : "text-muted-foreground"
                                )} />
                              )}
                              <span className="truncate">{page.title}</span>
                              {isActive && (
                                <ChevronRight className="h-3 w-3 ml-auto shrink-0" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {/* Quick links */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
            <Link to="/contact">
              {t.support}
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8 gap-1" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              {t.app} <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
        
        {/* Version info */}
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">
            {t.docTitle}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {t.lastUpdate}
          </p>
        </div>
      </div>
    </motion.aside>
  );
};
