import { useState, useMemo, useEffect } from 'react';
import { format, isSameDay, parseISO, isPast, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CalendarDays, Clock, Phone, Users, AlertCircle, Loader2,
  CheckCircle2, XCircle, Timer, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATUS_STYLES: Record<Appointment['status'], { label: string; bg: string; text: string }> = {
  pending: { label: 'En attente', bg: 'bg-amber-500/20', text: 'text-amber-700' },
  confirmed: { label: 'Confirmé', bg: 'bg-emerald-500/20', text: 'text-emerald-700' },
  cancelled: { label: 'Annulé', bg: 'bg-red-500/20', text: 'text-red-700' },
  completed: { label: 'Terminé', bg: 'bg-blue-500/20', text: 'text-blue-700' },
};

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export function AdminAppointmentsOverview() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Real-time subscription to all appointments
  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('dateTime', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const appts: Appointment[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          providerId: d.providerId,
          providerName: d.providerName,
          patientName: d.patientName,
          patientPhone: d.patientPhone,
          patientEmail: d.patientEmail,
          patientId: d.patientId,
          dateTime: d.dateTime?.toDate?.()?.toISOString() || d.dateTime,
          status: d.status || 'pending',
          notes: d.notes,
          createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt,
          updatedAt: d.updatedAt?.toDate?.()?.toISOString() || d.updatedAt,
        };
      });
      setAllAppointments(appts);
      setLoading(false);
    }, () => { setLoading(false); });
    return () => unsub();
  }, []);

  // Get appointments for selected date
  const dayAppointments = useMemo(() => {
    return allAppointments.filter((a) => {
      try { return isSameDay(parseISO(a.dateTime), selectedDate); } catch { return false; }
    });
  }, [allAppointments, selectedDate]);

  // Get unique providers for the day
  const providers = useMemo(() => {
    const map = new Map<string, string>();
    dayAppointments.forEach((a) => map.set(a.providerId, a.providerName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [dayAppointments]);

  // Build grid data: provider -> time -> appointment
  const grid = useMemo(() => {
    const map: Record<string, Record<string, Appointment>> = {};
    dayAppointments.forEach((a) => {
      const time = format(parseISO(a.dateTime), 'HH:mm');
      if (!map[a.providerId]) map[a.providerId] = {};
      map[a.providerId][time] = a;
    });
    return map;
  }, [dayAppointments]);

  // Stats
  const stats = useMemo(() => ({
    total: allAppointments.length,
    today: allAppointments.filter(a => { try { return isSameDay(parseISO(a.dateTime), new Date()); } catch { return false; } }).length,
    pending: allAppointments.filter(a => a.status === 'pending').length,
    providers: new Set(allAppointments.map(a => a.providerId)).size,
  }), [allAppointments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total RDV', value: stats.total, icon: CalendarDays, color: 'text-primary' },
          { label: "Aujourd'hui", value: stats.today, icon: Clock, color: 'text-emerald-500' },
          { label: 'En attente', value: stats.pending, icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Praticiens', value: stats.providers, icon: Users, color: 'text-blue-500' },
        ].map((c) => (
          <Card key={c.label} className="rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{c.label}</p>
                  <p className="text-3xl font-bold mt-1">{c.value}</p>
                </div>
                <c.icon className={cn('h-5 w-5 mt-1', c.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date nav + grid */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Calendar */}
        <Card className="rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              locale={fr}
              className="rounded-md pointer-events-auto mx-auto"
            />
          </CardContent>
        </Card>

        {/* Multi-doctor grid */}
        <Card className="rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </h3>
              <Badge variant="outline">{dayAppointments.length} rendez-vous</Badge>
            </div>

            {providers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">Aucun rendez-vous ce jour</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground w-20">Heure</th>
                      {providers.map((p) => (
                        <th key={p.id} className="text-left p-3 font-medium min-w-[180px]">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((time) => {
                      const hasAny = providers.some((p) => grid[p.id]?.[time]);
                      if (!hasAny) return null; // Only show rows with appointments
                      return (
                        <tr key={time} className="border-b hover:bg-muted/20">
                          <td className="p-3 text-muted-foreground font-mono text-xs">{time}</td>
                          {providers.map((p) => {
                            const apt = grid[p.id]?.[time];
                            if (!apt) return <td key={p.id} className="p-2" />;
                            const st = STATUS_STYLES[apt.status];
                            return (
                              <td key={p.id} className="p-2">
                                <button
                                  onClick={() => { setSelectedAppointment(apt); setDetailOpen(true); }}
                                  className={cn(
                                    'w-full text-left rounded-lg p-2.5 transition-colors border',
                                    st.bg, 'hover:opacity-80'
                                  )}
                                >
                                  <p className={cn('text-xs font-semibold', st.text)}>{apt.patientName}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{st.label}</p>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-[380px]">
          <SheetHeader>
            <SheetTitle>Détails du rendez-vous</SheetTitle>
          </SheetHeader>
          {selectedAppointment && (
            <div className="space-y-5 mt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedAppointment.patientName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedAppointment.patientName}</p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {selectedAppointment.patientPhone}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{format(parseISO(selectedAppointment.dateTime), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(parseISO(selectedAppointment.dateTime), 'HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAppointment.providerName}</span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}

              <Badge
                variant="outline"
                className={cn(
                  STATUS_STYLES[selectedAppointment.status].bg,
                  STATUS_STYLES[selectedAppointment.status].text
                )}
              >
                {STATUS_STYLES[selectedAppointment.status].label}
              </Badge>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
