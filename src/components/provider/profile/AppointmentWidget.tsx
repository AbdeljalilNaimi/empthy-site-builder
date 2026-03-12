import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRealtimeAvailability } from '@/hooks/useAppointments';

interface AppointmentWidgetProps {
  providerId: string;
  providerName: string;
  schedule?: Record<string, { open: string; close: string; closed?: boolean } | undefined>;
  onBookSlot: (date: string, time: string) => void;
  onViewMore: () => void;
}

export function AppointmentWidget({ providerId, providerName, schedule, onBookSlot, onViewMore }: AppointmentWidgetProps) {
  const today = new Date();
  
  // Generate next 5 non-Sunday days
  const upcomingDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; days.length < 3; i++) {
      const d = addDays(today, i);
      if (d.getDay() !== 0) days.push(d);
    }
    return days;
  }, []);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const activeDate = upcomingDays[selectedDayIdx];

  const { slots, loading } = useRealtimeAvailability(providerId, activeDate, schedule);

  const availableSlots = slots.filter(s => s.status === 'available').slice(0, 4);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Chargement des créneaux...</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4 text-primary" />
        <span>Prochains créneaux disponibles</span>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2">
        {upcomingDays.map((date, idx) => {
          const isActive = idx === selectedDayIdx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-xs",
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              )}
            >
              <span className="font-medium uppercase">
                {format(date, 'EEE', { locale: fr })}
              </span>
              <span className={cn("text-lg font-bold", isActive ? "text-primary" : "text-foreground")}>
                {format(date, 'd')}
              </span>
              <span>{format(date, 'MMM', { locale: fr })}</span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {availableSlots.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {availableSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => onBookSlot(format(activeDate, 'yyyy-MM-dd'), slot.time)}
            >
              <Clock className="h-3 w-3" />
              {slot.time}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Aucun créneau disponible ce jour
        </p>
      )}

      {/* View more */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full gap-1 text-xs text-muted-foreground hover:text-primary"
        onClick={onViewMore}
      >
        Voir plus de créneaux
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
