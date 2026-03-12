import { Stethoscope, Pill, FlaskConical, Building2, Baby, Syringe, ScanLine, Wrench } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ProviderType } from '@/data/providers';

const typeConfig: Record<string, { icon: typeof Stethoscope; bg: string; color: string }> = {
  doctor: { icon: Stethoscope, bg: 'bg-blue-100 dark:bg-blue-900/40', color: 'text-blue-600 dark:text-blue-400' },
  clinic: { icon: Building2, bg: 'bg-cyan-100 dark:bg-cyan-900/40', color: 'text-cyan-600 dark:text-cyan-400' },
  pharmacy: { icon: Pill, bg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-600 dark:text-emerald-400' },
  lab: { icon: FlaskConical, bg: 'bg-purple-100 dark:bg-purple-900/40', color: 'text-purple-600 dark:text-purple-400' },
  hospital: { icon: Building2, bg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-600 dark:text-red-400' },
  birth_hospital: { icon: Baby, bg: 'bg-pink-100 dark:bg-pink-900/40', color: 'text-pink-600 dark:text-pink-400' },
  blood_cabin: { icon: Syringe, bg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-600 dark:text-red-400' },
  radiology_center: { icon: ScanLine, bg: 'bg-indigo-100 dark:bg-indigo-900/40', color: 'text-indigo-600 dark:text-indigo-400' },
  medical_equipment: { icon: Wrench, bg: 'bg-gray-100 dark:bg-gray-800/40', color: 'text-gray-600 dark:text-gray-400' },
};

interface ProviderAvatarProps {
  image?: string | null;
  name: string;
  type?: ProviderType | string;
  className?: string;
  iconSize?: number;
}

export const ProviderAvatar = ({ image, name, type, className, iconSize = 16 }: ProviderAvatarProps) => {
  const hasImage = image && image !== '/placeholder.svg' && image !== '';
  const config = typeConfig[type || ''] || typeConfig.doctor;
  const Icon = config.icon;

  return (
    <Avatar className={cn('h-8 w-8', className)}>
      {hasImage && <AvatarImage src={image} alt={name} className="object-cover" />}
      <AvatarFallback className={cn(config.bg, 'border-0')}>
        <Icon size={iconSize} className={config.color} />
      </AvatarFallback>
    </Avatar>
  );
};
