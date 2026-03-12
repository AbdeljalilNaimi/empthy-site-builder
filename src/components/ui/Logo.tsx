import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showOnlineIndicator?: boolean;
  className?: string;
  linkTo?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-8 h-8',
    icon: 'h-4 w-4',
    indicator: 'w-2 h-2',
    text: 'text-lg',
    subtext: 'text-[8px]',
  },
  md: {
    container: 'w-11 h-11',
    icon: 'h-6 w-6',
    indicator: 'w-3 h-3',
    text: 'text-xl',
    subtext: 'text-[10px]',
  },
  lg: {
    container: 'w-14 h-14',
    icon: 'h-8 w-8',
    indicator: 'w-3.5 h-3.5',
    text: 'text-2xl',
    subtext: 'text-xs',
  },
};

export const Logo = ({
  size = 'md',
  showText = true,
  showOnlineIndicator = true,
  className,
  linkTo = '/',
}: LogoProps) => {
  const config = sizeConfig[size];

  const content = (
    <div className={cn('flex items-center gap-3 group', className)}>
      {/* Logo Container with premium effects */}
      <div className="relative">
        {/* Animated external ring */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-primary/60 to-primary opacity-0 blur-md group-hover:opacity-75 transition-all duration-500" />

        {/* Main container */}
        <div
          className={cn(
            config.container,
            'relative bg-gradient-to-br from-primary via-primary/90 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/25 transition-all duration-300'
          )}
        >
          {/* Internal shine effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-transparent" />

          {/* Main icon */}
          <HeartPulse
            className={cn(
              config.icon,
              'text-primary-foreground drop-shadow-md relative z-10 group-hover:animate-heartbeat'
            )}
          />

          {/* Online indicator */}
          {showOnlineIndicator && (
            <span
              className={cn(
                config.indicator,
                'absolute -top-0.5 -right-0.5 bg-green-400 rounded-full border-2 border-background shadow-lg'
              )}
            >
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          )}
        </div>
      </div>

      {/* Logo text with premium typography */}
      {showText && (
        <div className="hidden sm:flex flex-col -space-y-0.5">
          <span className={cn(config.text, 'font-bold tracking-tight')}>
            <span className="text-foreground">City</span>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Health
            </span>
          </span>
          <span
            className={cn(
              config.subtext,
              'text-muted-foreground tracking-[0.2em] uppercase font-medium'
            )}
          >
            Sidi Bel Abbès
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} aria-label="CityHealth - Accueil">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
