import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Siren, ArrowRight, Clock, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const EmergencyBanner = () => {
  const { t } = useLanguage();

  const quickActions = [
    { icon: Phone, label: t('homepage', 'call'), href: 'tel:115' },
    { icon: MapPin, label: t('homepage', 'locate'), href: '/map/emergency' },
  ];
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/map/emergency"
            className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
            </div>

            {/* Animated pulse ring */}
            <div className="absolute top-6 left-6">
              <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-red-500/20" />
            </div>

            <div className="relative p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                {/* Left content */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Icon container with glow */}
                  <motion.div 
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-lg" />
                    <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                      <Siren className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>

                  {/* Text content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('homepage', 'emergencyTitle')}
                      </h3>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {t('homepage', 'operational')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t('homepage', 'estimatedWait')} : &lt; 5 min
                      </span>
                      <span className="hidden md:flex items-center gap-1.5">
                        <span className="text-xs">•</span>
                        24h/7j
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right content - Actions */}
                <div className="flex items-center gap-3">
                  {/* Quick action buttons */}
                  <div className="hidden sm:flex items-center gap-2">
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = action.href;
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Mobile status badge */}
                  <span className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {t('homepage', 'operational')}
                  </span>

                  {/* Arrow indicator */}
                  <motion.div
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 border border-border group-hover:bg-foreground group-hover:border-foreground transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-background transition-colors" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
