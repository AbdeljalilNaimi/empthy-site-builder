import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Appointment } from '@/types/appointments';

const statusStyles: Record<Appointment['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-700 border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
};

interface AppointmentStatusBadgeProps {
  status: Appointment['status'];
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const { t } = useLanguage();
  
  const labels: Record<Appointment['status'], string> = {
    pending: t('appointments', 'pending'),
    confirmed: t('appointments', 'confirmed'),
    cancelled: t('appointments', 'cancelled'),
    completed: t('appointments', 'completed'),
  };

  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {labels[status]}
    </Badge>
  );
}
