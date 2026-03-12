import { motion } from 'framer-motion';
import { LucideIcon, Sparkles } from 'lucide-react';

interface QuickStat {
  icon: LucideIcon;
  value: string;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
}

interface SectionHeaderProps {
  badge: string;
  badgeIcon?: LucideIcon;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  subtitleHighlights?: { text: string; className?: string }[];
  quickStats?: QuickStat[];
  showDecorator?: boolean;
  centered?: boolean;
  className?: string;
}

export const SectionHeader = ({
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  title,
  titleHighlight,
  subtitle,
  subtitleHighlights = [],
  quickStats = [],
  showDecorator = true,
  centered = true,
  className = '',
}: SectionHeaderProps) => {
  // Parse subtitle with highlights
  const renderSubtitle = () => {
    if (subtitleHighlights.length === 0) {
      return subtitle;
    }

    let result = subtitle;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    subtitleHighlights.forEach((highlight, i) => {
      const index = result.indexOf(highlight.text, lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          elements.push(result.slice(lastIndex, index));
        }
        elements.push(
          <span key={i} className={highlight.className || 'font-semibold text-foreground'}>
            {highlight.text}
          </span>
        );
        lastIndex = index + highlight.text.length;
      }
    });

    if (lastIndex < result.length) {
      elements.push(result.slice(lastIndex));
    }

    return elements.length > 0 ? elements : subtitle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${centered ? 'text-center' : ''} mb-16 relative ${className}`}
    >
      {/* Breathing Background Glow */}
      {showDecorator && centered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-80 h-80 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 blur-3xl"
          />
        </div>
      )}

      {/* Animated Badge */}
      <motion.span 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full 
          bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 
          border border-primary/20 backdrop-blur-sm
          text-primary text-sm font-semibold mb-8 relative overflow-hidden"
      >
        {/* Shimmer Effect */}
        <motion.div 
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse relative z-10" />
        <BadgeIcon className="h-4 w-4 relative z-10" />
        <span className="relative z-10">{badge}</span>
      </motion.span>

      {/* Main Title */}
      <motion.h2 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative"
      >
        {titleHighlight ? (
          <>
            <span className="text-foreground">{title} </span>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {titleHighlight}
            </span>
          </>
        ) : (
          <span className="text-foreground">{title}</span>
        )}
      </motion.h2>

      {/* Subtitle */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative max-w-3xl mx-auto"
      >
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          {renderSubtitle()}
        </p>
        
        {/* Decorative Line */}
        {showDecorator && (
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`h-1 w-24 ${centered ? 'mx-auto' : ''} mt-8 rounded-full bg-gradient-to-r from-primary to-accent origin-center`}
          />
        )}
      </motion.div>

      {/* Quick Stats Mini-Bar */}
      {quickStats.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10"
        >
          {quickStats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2 text-muted-foreground">
                {index > 0 && (
                  <div className="h-8 w-px bg-border hidden sm:block mr-4 md:mr-6" />
                )}
                <div className={`p-2 rounded-full ${stat.iconBgColor || 'bg-primary/10'}`}>
                  <StatIcon className={`h-5 w-5 ${stat.iconColor || 'text-primary'}`} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-foreground text-lg">{stat.value}</span>
                  <span className="text-sm ml-1">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SectionHeader;
