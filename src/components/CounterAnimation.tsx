import { useEffect, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface CounterAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const CounterAnimation = ({ end, duration = 2000, suffix = '', className }: CounterAnimationProps) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useScrollReveal();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          
          const startTime = Date.now();
          const startValue = 0;
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (end - startValue) * easeOutCubic);
            
            setCount(currentValue);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [end, duration, hasStarted, ref]);

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  );
};

export default CounterAnimation;