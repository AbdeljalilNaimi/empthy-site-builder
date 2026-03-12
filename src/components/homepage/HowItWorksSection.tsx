import { Search, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: '01',
      icon: Search,
      title: t('homepage', 'step1Title'),
      description: t('homepage', 'step1Desc'),
    },
    {
      number: '02',
      icon: CalendarCheck,
      title: t('homepage', 'step2Title'),
      description: t('homepage', 'step2Desc'),
    },
    {
      number: '03',
      icon: CheckCircle2,
      title: t('homepage', 'step3Title'),
      description: t('homepage', 'step3Desc'),
    },
  ];
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-background border-y border-border relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      
      <div className="container mx-auto max-w-5xl relative">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-full mb-4">
            {t('homepage', 'simpleEfficient')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {t('homepage', 'howItWorks')}
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {t('homepage', 'threeSteps')}
          </p>
        </motion.div>

        {/* Steps - Horizontal Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4"
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div 
                key={step.number} 
                variants={stepVariants}
                className="flex-1 flex flex-col items-center text-center relative group"
              >
                {/* Animated Connector Line (hidden on mobile, visible between items on desktop) */}
                {index < steps.length - 1 && (
                  <svg 
                    className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] overflow-visible"
                    style={{ width: 'calc(100% - 40px)' }}
                  >
                    <motion.line
                      x1="0"
                      y1="1"
                      x2="100%"
                      y2="1"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="6 6"
                      className="text-border"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.3 }}
                    />
                    {/* Animated dot on the line */}
                    <motion.circle
                      r="3"
                      fill="currentColor"
                      className="text-foreground"
                      initial={{ cx: 0 }}
                      whileInView={{ cx: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.8 + index * 0.3, ease: "easeInOut" }}
                    />
                  </svg>
                )}

                {/* Icon Container with glow effect */}
                <motion.div 
                  className="relative mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Outer glow ring on hover */}
                  <div className="absolute inset-0 rounded-full bg-foreground/5 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Main circle */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-foreground flex items-center justify-center bg-background shadow-[0_0_0_4px_rgba(0,0,0,0.02)] group-hover:shadow-[0_0_0_8px_rgba(0,0,0,0.04)] transition-shadow duration-300">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" strokeWidth={1.5} />
                    </motion.div>
                  </div>
                  
                  {/* Step Number Badge */}
                  <motion.span 
                    className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-foreground text-background text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.number}
                  </motion.span>
                </motion.div>

                {/* Content */}
                <div className="space-y-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                    {t('homepage', 'step')} {index + 1}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[280px] sm:max-w-[220px]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
