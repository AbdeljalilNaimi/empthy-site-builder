import { CheckCircle2, Shield, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface VerifiedBadgeProps {
  type?: 'verified' | 'premium' | 'certified';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const VerifiedBadge = ({ 
  type = 'verified', 
  size = 'md',
  showTooltip = true 
}: VerifiedBadgeProps) => {
  const { t } = useLanguage();
  
  const configs = {
    verified: {
      icon: CheckCircle2,
      labelKey: 'verified' as const,
      tooltipKey: 'verifiedTooltip' as const,
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      dotClass: 'bg-emerald-500',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
    premium: {
      icon: Shield,
      labelKey: 'premium' as const,
      tooltipKey: 'premiumTooltip' as const,
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
      textClass: 'text-amber-700 dark:text-amber-400',
      borderClass: 'border-amber-200 dark:border-amber-800',
      dotClass: 'bg-amber-500',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    certified: {
      icon: Award,
      labelKey: 'certified' as const,
      tooltipKey: 'certifiedTooltip' as const,
      bgClass: 'bg-blue-50 dark:bg-blue-950/40',
      textClass: 'text-blue-700 dark:text-blue-400',
      borderClass: 'border-blue-200 dark:border-blue-800',
      dotClass: 'bg-blue-500',
      iconClass: 'text-blue-600 dark:text-blue-400',
    }
  };

  const config = configs[type];
  const Icon = config.icon;
  
  const label = t('verification', config.labelKey);
  const tooltip = t('verification', config.tooltipKey);
  
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-1.5'
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  const badge = (
    <div 
      className={`
        inline-flex items-center rounded-full border font-semibold tracking-wide uppercase
        ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses[size]}
        shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.03] cursor-default
      `}
    >
      <span className={`${dotSizes[size]} rounded-full ${config.dotClass} animate-pulse flex-shrink-0`} />
      <Icon size={iconSizes[size]} className={`${config.iconClass} flex-shrink-0`} />
      <span className="leading-none">{label}</span>
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">
            {badge}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs text-sm font-medium shadow-lg"
          sideOffset={6}
        >
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
