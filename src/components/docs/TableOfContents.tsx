import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

// Extract headings from markdown content
const extractHeadings = (content: string): TocItem[] => {
  const lines = content.split('\n');
  const headings: TocItem[] = [];
  
  lines.forEach((line) => {
    // Match ## and ### headings (skip # as it's the title)
    const h2Match = line.match(/^## (.+)/);
    const h3Match = line.match(/^### (.+)/);
    
    if (h2Match) {
      const title = h2Match[1].trim();
      headings.push({
        id: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        title,
        level: 2,
      });
    } else if (h3Match) {
      const title = h3Match[1].trim();
      headings.push({
        id: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        title,
        level: 3,
      });
    }
  });
  
  return headings;
};

export const TableOfContents = ({ content, className }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('');
  const headings = extractHeadings(content);
  
  useEffect(() => {
    if (headings.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );
    
    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);
  
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  
  if (headings.length < 2) {
    return null;
  }
  
  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        "w-56 shrink-0 hidden xl:block",
        className
      )}
    >
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-foreground">
          <List className="h-4 w-4 text-primary" />
          <span>Sur cette page</span>
        </div>
        
        <ul className="space-y-1 border-l-2 border-border/50">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            
            return (
              <li key={`${heading.id}-${index}`}>
                <button
                  onClick={() => handleClick(heading.id)}
                  className={cn(
                    "block w-full text-left text-sm py-1.5 transition-all duration-200",
                    "border-l-2 -ml-[2px]",
                    heading.level === 2 ? "pl-4" : "pl-6",
                    isActive
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <span className="line-clamp-2">{heading.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
        
        {/* Progress indicator */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progression</span>
            <span>{headings.findIndex(h => h.id === activeId) + 1}/{headings.length}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
