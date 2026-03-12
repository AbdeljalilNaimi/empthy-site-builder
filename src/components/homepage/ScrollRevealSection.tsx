import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { useScrollRevealEnhanced, revealVariants } from '@/hooks/useScrollReveal';

type AnimationType = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'blur';

interface ScrollRevealSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export const ScrollRevealSection = ({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  className = '',
  threshold = 0.1,
}: ScrollRevealSectionProps) => {
  const { ref, isVisible } = useScrollRevealEnhanced({ threshold });

  const variants: Variants = {
    hidden: revealVariants[animation].hidden,
    visible: {
      ...revealVariants[animation].visible,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered children reveal component
interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
}

export const StaggerReveal = ({
  children,
  className = '',
  staggerDelay = 0.1,
  threshold = 0.1,
}: StaggerRevealProps) => {
  const { ref, isVisible } = useScrollRevealEnhanced({ threshold });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger child
interface StaggerChildProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
}

export const StaggerChild = ({
  children,
  className = '',
  animation = 'fadeUp',
}: StaggerChildProps) => {
  const childVariants: Variants = {
    hidden: revealVariants[animation].hidden,
    visible: {
      ...revealVariants[animation].visible,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
};
