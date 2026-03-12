import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown, 
  Home,
  Clock,
  BookOpen,
  Users,
  Stethoscope,
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableOfContents } from './TableOfContents';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { docsStructure, findDocPage, getAllDocPages } from '@/data/docsStructure';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

// Sanitize HTML to prevent XSS
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'code', 'em', 'b', 'i', 'span'],
    ALLOWED_ATTR: ['class']
  });
};

// Simple markdown-like renderer for our doc content
const renderContent = (content: string) => {
  const lines = content.trim().split('\n');
  const elements: JSX.Element[] = [];
  
  const processLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-4xl font-bold mb-6 text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      const title = line.slice(3);
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h2 
          key={index} 
          className="text-2xl font-semibold mt-10 mb-4 text-foreground flex items-center gap-2 group scroll-mt-24" 
          id={id}
        >
          <span className="w-1 h-6 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          {title}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      const title = line.slice(4);
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return (
        <h3 key={index} className="text-xl font-medium mt-8 mb-3 text-foreground scroll-mt-24" id={id}>
          {title}
        </h3>
      );
    }
    
    // Lists
    if (line.startsWith('- ')) {
      const content = line.slice(2);
      const parsed = content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      return (
        <li 
          key={index} 
          className="ml-6 mb-2 text-muted-foreground list-disc marker:text-primary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed) }}
        />
      );
    }
    
    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      const content = numberedMatch[2];
      const parsed = content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      return (
        <li 
          key={index} 
          className="ml-6 mb-2 text-muted-foreground list-decimal marker:text-primary marker:font-semibold"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed) }}
        />
      );
    }
    
    // Warning/Info blocks
    if (line.startsWith('⚠️') || line.startsWith('⚡') || line.startsWith('✅') || line.startsWith('🎯') || line.startsWith('🤝') || line.startsWith('📍') || line.startsWith('🔍') || line.startsWith('👨‍⚕️') || line.startsWith('📱') || line.startsWith('🆘') || line.startsWith('🤖')) {
      return (
        <div key={index} className="my-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-foreground font-medium">{line}</p>
        </div>
      );
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <br key={index} />;
    }
    
    // Regular paragraph
    const parsed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">$1</code>');
    
    return (
      <p 
        key={index} 
        className="mb-4 text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed) }}
      />
    );
  };
  
  // Process tables separately
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      const rows = tableLines.filter(l => !l.includes('---'));
      if (rows.length > 0) {
        const headers = rows[0].split('|').filter(c => c.trim());
        const dataRows = rows.slice(1).map(r => r.split('|').filter(c => c.trim()));
        
        elements.push(
          <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {headers.map((h, hi) => (
                    <th key={hi} className="text-left p-4 font-semibold text-foreground">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-4 text-muted-foreground">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }
    
    elements.push(processLine(line, i));
    i++;
  }
  
  return elements;
};

// Estimate reading time
const estimateReadingTime = (content: string): number => {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const DocsContent = () => {
  const { sectionId, pageId } = useParams();
  const { language } = useLanguage();
  
  const allPages = getAllDocPages();
  const currentPage = sectionId && pageId ? findDocPage(sectionId, pageId) : null;
  const currentSection = docsStructure.find(s => s.id === sectionId);
  
  // Find prev/next pages
  const currentIndex = allPages.findIndex(p => p.sectionId === sectionId && p.id === pageId);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  const t = {
    docTitle: language === 'ar' ? 'وثائق CityHealth' : language === 'en' ? 'CityHealth Documentation' : 'Documentation CityHealth',
    docSubtitle: language === 'ar'
      ? 'كل ما تحتاج معرفته لاستخدام CityHealth بفعالية'
      : language === 'en'
      ? 'Everything you need to know to use CityHealth effectively'
      : 'Tout ce que vous devez savoir pour utiliser CityHealth efficacement',
    articles: 'Articles',
    sections: 'Sections',
    languages: language === 'ar' ? 'لغات' : language === 'en' ? 'Languages' : 'Langues',
    quickStart: language === 'ar' ? 'البدء السريع' : language === 'en' ? 'Quick Start' : 'Démarrage rapide',
    forCitizens: language === 'ar' ? 'للمواطنين' : language === 'en' ? 'For Citizens' : 'Pour les Citoyens',
    forProfessionals: language === 'ar' ? 'للمهنيين' : language === 'en' ? 'For Professionals' : 'Pour les Professionnels',
    firstSteps: language === 'ar' ? 'الخطوات الأولى' : language === 'en' ? 'First Steps' : 'Premiers pas',
    needHelp: language === 'ar' ? 'هل تحتاج مساعدة؟' : language === 'en' ? 'Need help?' : 'Besoin d\'aide ?',
    helpDesc: language === 'ar'
      ? 'مساعدنا الذكي متاح 24/7 للإجابة على أسئلتك.'
      : language === 'en'
      ? 'Our AI assistant is available 24/7 to answer your questions.'
      : 'Notre assistant IA est disponible 24/7 pour répondre à vos questions.',
    helpHint: language === 'ar'
      ? 'استخدم الاختصار ⌘K أو زر « اسأل الذكاء الاصطناعي » في الشريط العلوي.'
      : language === 'en'
      ? 'Use the shortcut ⌘K or the "Ask AI" button in the header.'
      : 'Utilisez le raccourci ⌘K ou le bouton « Demandez à l\'IA » dans le header.',
    docs: 'Docs',
    readingTime: (min: number) => language === 'ar' ? `${min} دقيقة قراءة` : language === 'en' ? `${min} min read` : `${min} min de lecture`,
    previous: language === 'ar' ? 'السابق' : language === 'en' ? 'Previous' : 'Précédent',
    next: language === 'ar' ? 'التالي' : language === 'en' ? 'Next' : 'Suivant',
    helpful: language === 'ar' ? 'هل كانت هذه المقالة مفيدة؟' : language === 'en' ? 'Was this article helpful?' : 'Cet article vous a-t-il été utile ?',
    yes: language === 'ar' ? 'نعم' : language === 'en' ? 'Yes' : 'Oui',
    no: language === 'ar' ? 'لا' : language === 'en' ? 'No' : 'Non',
    articleWord: (count: number) => language === 'ar' ? `${count} مقال` : language === 'en' ? `${count} article${count > 1 ? 's' : ''}` : `${count} article${count > 1 ? 's' : ''}`,
  };

  // Welcome page when no section/page selected
  if (!currentPage) {
    const totalArticles = allPages.length;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/60 mb-8 shadow-xl shadow-primary/30"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpen className="h-12 w-12 text-primary-foreground" />
                </motion.div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                {t.docTitle}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                {t.docSubtitle}
              </motion.p>
            </div>

            {/* Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 p-6 rounded-2xl bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border/50"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-bold text-primary">{totalArticles}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t.articles}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-bold text-primary">{docsStructure.length}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t.sections}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-bold text-primary">3</p>
                </div>
                <p className="text-sm text-muted-foreground">{t.languages}</p>
              </div>
            </motion.div>

            {/* Quick Start */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t.quickStart}
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Users, label: t.forCitizens, to: '/docs/citizens/search-provider' },
                  { icon: Stethoscope, label: t.forProfessionals, to: '/docs/providers/registration' },
                  { icon: BookOpen, label: t.firstSteps, to: '/docs/getting-started/first-steps' },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Sections Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {docsStructure.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={`/docs/${section.id}/${section.pages[0]?.id}`}
                    className="group relative block p-6 rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className={cn(
                      "relative p-3 rounded-xl w-fit mb-4 bg-gradient-to-br from-background to-muted shadow-sm",
                      section.color
                    )}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    
                    <h3 className="relative font-bold text-lg mb-2 group-hover:text-primary transition-colors flex items-center gap-1">
                      {section.title}
                      <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    
                    <p className="relative text-sm text-muted-foreground mb-4 line-clamp-2">
                      {section.description}
                    </p>
                    
                    <Badge variant="secondary" className="relative">
                      {t.articleWord(section.pages.length)}
                    </Badge>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center"
            >
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.needHelp}</h3>
              <p className="text-muted-foreground mb-4">{t.helpDesc}</p>
              <p className="text-sm text-muted-foreground">{t.helpHint}</p>
            </motion.div>
          </div>
        </ScrollArea>
      </motion.div>
    );
  }

  const readingTime = estimateReadingTime(currentPage.content);

  return (
    <motion.div
      key={`${sectionId}-${pageId}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex"
    >
      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 md:p-8 lg:p-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link 
              to="/docs" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>{t.docs}</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              to={`/docs/${sectionId}/${currentSection?.pages[0]?.id}`}
              className="hover:text-foreground transition-colors"
            >
              {currentSection?.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate">{currentPage.title}</span>
          </nav>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{t.readingTime(readingTime)}</span>
            </div>
            {currentPage.tags && currentPage.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentPage.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <article className="prose prose-slate dark:prose-invert max-w-none">
            {renderContent(currentPage.content)}
          </article>

          <Separator className="my-10" />

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {prevPage ? (
              <Link
                to={`/docs/${prevPage.sectionId}/${prevPage.id}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all flex-1"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                <div>
                  <p className="text-xs text-muted-foreground">{t.previous}</p>
                  <p className="font-medium group-hover:text-primary transition-colors">{prevPage.title}</p>
                </div>
              </Link>
            ) : <div className="flex-1" />}
            
            {nextPage ? (
              <Link
                to={`/docs/${nextPage.sectionId}/${nextPage.id}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all flex-1 justify-end text-right"
              >
                <div>
                  <p className="text-xs text-muted-foreground">{t.next}</p>
                  <p className="font-medium group-hover:text-primary transition-colors">{nextPage.title}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ) : <div className="flex-1" />}
          </div>

          {/* Feedback */}
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 text-center">
            <p className="font-medium mb-4">{t.helpful}</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" className="gap-2 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-600">
                <ThumbsUp className="h-4 w-4" />
                {t.yes}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600">
                <ThumbsDown className="h-4 w-4" />
                {t.no}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Table of Contents - Right side */}
      <TableOfContents content={currentPage.content} className="p-6" />
    </motion.div>
  );
};
