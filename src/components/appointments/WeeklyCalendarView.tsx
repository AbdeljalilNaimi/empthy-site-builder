import { useState, useMemo } from 'react';
import { format, addDays, isSameDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealtimeAvailability, type AvailabilitySlot } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';

interface WeeklyCalendarViewProps {
  providerId: string;
  schedule?: Record<string, { open: string; close: string; closed?: boolean } | undefined>;
  onSlotSelect: (date: Date, time: string) => void;
  selectedSlot?: { date: Date; time: string } | null;
  patientAppointmentTimes?: string[]; // ISO strings of patient's own bookings
}

export function WeeklyCalendarView({
  providerId,
  schedule,
  onSlotSelect,
  selectedSlot,
  patientAppointmentTimes = [],
}: WeeklyCalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const start = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 6 }); // Saturday start for Algeria
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      if (d.getDay() !== 5) days.push(d); // skip Friday (off day in Algeria)
    }
    return days;
  }, [weekOffset]);

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Semaine préc.
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {format(weekDays[0], 'd MMM', { locale: fr })} — {format(weekDays[weekDays.length - 1], 'd MMM yyyy', { locale: fr })}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(weekOffset + 1)} disabled={weekOffset >= 3}>
          Semaine suiv.
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {weekDays.map((day) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            providerId={providerId}
            schedule={schedule}
            onSlotSelect={onSlotSelect}
            selectedSlot={selectedSlot}
            patientAppointmentTimes={patientAppointmentTimes}
          />
        ))}
      </div>
    </div>
  );
}

function DayColumn({
  date,
  providerId,
  schedule,
  onSlotSelect,
  selectedSlot,
  patientAppointmentTimes,
}: {
  date: Date;
  providerId: string;
  schedule?: Record<string, { open: string; close: string; closed?: boolean } | undefined>;
  onSlotSelect: (date: Date, time: string) => void;
  selectedSlot?: { date: Date; time: string } | null;
  patientAppointmentTimes?: string[];
}) {
  const { slots, loading } = useRealtimeAvailability(providerId, date, schedule);
  const isDateToday = isSameDay(date, new Date());
  const isPast = date < new Date() && !isDateToday;

  return (
    <div className={cn('rounded-xl border p-3 min-h-[200px]', isDateToday && 'border-primary/50 bg-primary/5')}>
      {/* Day header */}
      <div className="text-center mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          {format(date, 'EEE', { locale: fr })}
        </p>
        <p className={cn('text-lg font-bold', isDateToday && 'text-primary')}>
          {format(date, 'd')}
        </p>
      </div>

      {/* Slots */}
      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 rounded-lg" />
          ))}
        </div>
      ) : isPast ? (
        <p className="text-xs text-muted-foreground text-center mt-4">Passé</p>
      ) : slots.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center mt-4">Fermé</p>
      ) : (
        <div className="space-y-1">
          {slots.map((slot) => {
            const isSelected = selectedSlot && isSameDay(selectedSlot.date, date) && selectedSlot.time === slot.time;
            const isOwnBooking = patientAppointmentTimes?.some((t) => {
              try {
                const d = new Date(t);
                return isSameDay(d, date) && format(d, 'HH:mm') === slot.time;
              } catch { return false; }
            });

            return (
              <button
                key={slot.time}
                disabled={slot.status !== 'available'}
                onClick={() => onSlotSelect(date, slot.time)}
                className={cn(
                  'w-full text-xs py-1.5 rounded-lg font-medium transition-all',
                  slot.status === 'available' && !isSelected && 'border border-border hover:border-primary/50 hover:bg-primary/5',
                  isSelected && 'bg-primary text-primary-foreground',
                  slot.status === 'booked' && !isOwnBooking && 'bg-muted text-muted-foreground/50 cursor-not-allowed line-through',
                  slot.status === 'past' && 'bg-muted/50 text-muted-foreground/30 cursor-not-allowed',
                  isOwnBooking && 'bg-primary/20 text-primary border-primary/30 border cursor-default'
                )}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
