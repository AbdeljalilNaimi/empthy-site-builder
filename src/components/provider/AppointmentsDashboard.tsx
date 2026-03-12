import { useState, useMemo, useEffect } from 'react';
import { format, isToday, isTomorrow, isPast, parseISO, isSameDay, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge';
import { AppointmentNotesThread } from '@/components/appointments/AppointmentNotesThread';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  CalendarDays,
  Clock,
  Phone,
  Mail,
  Users,
  AlertCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Timer,
  CalendarClock,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useRealtimeProviderAppointments,
  useConfirmAppointment,
  useCompleteAppointment,
  useCancelAppointment,
  useRescheduleAppointment,
  useRealtimeAvailability,
} from '@/hooks/useAppointments';
import { seedDemoAppointments } from '@/services/appointmentService';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface AppointmentsDashboardProps {
  providerId: string;
  providerUserId: string;
  providerName: string;
  isVerified: boolean;
}

// Working hours range
const HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

const HOUR_LABELS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export function AppointmentsDashboard({ providerId, providerUserId, providerName, isVerified }: AppointmentsDashboardProps) {
  const { toast } = useToast();
  const { appointments, loading } = useRealtimeProviderAppointments(providerUserId);
  const confirmMutation = useConfirmAppointment();
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const [weekOffset, setWeekOffset] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailApt, setDetailApt] = useState<Appointment | null>(null);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>();
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [seeding, setSeeding] = useState(false);
  const [newStatus, setNewStatus] = useState<Appointment['status'] | ''>('');
  const [noteTemplates, setNoteTemplates] = useState<string[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('all');

  // Load provider note templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const provDoc = await getDoc(doc(db, 'providers', providerId));
        if (provDoc.exists() && provDoc.data().noteTemplates) {
          setNoteTemplates(provDoc.data().noteTemplates);
        }
      } catch { /* ignore */ }
    };
    loadTemplates();
  }, [providerId]);

  // Real-time availability for reschedule picker
  const { slots: rescheduleSlots, loading: rescheduleSlotsLoading } = useRealtimeAvailability(
    rescheduleApt ? providerId : undefined,
    rescheduleDate
  );

  // Week days (Sat–Thu for Algeria, skip Friday)
  const weekDays = useMemo(() => {
    const start = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 6 });
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      if (d.getDay() !== 5) days.push(d); // skip Friday
    }
    return days;
  }, [weekOffset]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayAppts = appointments.filter(a => {
      try { return isSameDay(parseISO(a.dateTime), now) && a.status !== 'cancelled'; } catch { return false; }
    });
    const pending = appointments.filter(a => a.status === 'pending' && !isPast(parseISO(a.dateTime)));
    const upcoming = appointments
      .filter(a => !isPast(parseISO(a.dateTime)) && (a.status === 'confirmed' || a.status === 'pending'))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    const nextTime = upcoming[0] ? format(parseISO(upcoming[0].dateTime), 'HH:mm') : '—';
    return { today: todayAppts.length, pending: pending.length, total: appointments.length, nextTime };
  }, [appointments]);

  // Map appointments to grid: { 'YYYY-MM-DD': { 'HH:MM': Appointment[] } }
  const appointmentGrid = useMemo(() => {
    const grid: Record<string, Record<string, Appointment[]>> = {};
    appointments.forEach(apt => {
      if (apt.status === 'cancelled') return;
      try {
        const d = parseISO(apt.dateTime);
        const dayKey = format(d, 'yyyy-MM-dd');
        const timeKey = format(d, 'HH:mm');
        // Snap to nearest 30-min slot
        const hour = d.getHours();
        const min = d.getMinutes() < 30 ? '00' : '30';
        const slotKey = `${hour.toString().padStart(2, '0')}:${min}`;
        if (!grid[dayKey]) grid[dayKey] = {};
        if (!grid[dayKey][slotKey]) grid[dayKey][slotKey] = [];
        grid[dayKey][slotKey].push(apt);
      } catch { /* skip invalid */ }
    });
    return grid;
  }, [appointments]);

  const handleAction = async (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    setActionLoading(id);
    try {
      if (action === 'confirm') await confirmMutation.mutateAsync(id);
      if (action === 'cancel') await cancelMutation.mutateAsync(id);
      if (action === 'complete') await completeMutation.mutateAsync(id);
      toast({
        title: action === 'confirm' ? 'Rendez-vous confirmé' : action === 'cancel' ? 'Rendez-vous annulé' : 'Rendez-vous terminé',
      });
      if (detailApt?.id === id) setDetailApt(null);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (aptId: string, status: Appointment['status']) => {
    if (status === 'confirmed') await handleAction(aptId, 'confirm');
    else if (status === 'cancelled') await handleAction(aptId, 'cancel');
    else if (status === 'completed') await handleAction(aptId, 'complete');
  };

  const handleReschedule = async () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return;
    const [hours, minutes] = rescheduleTime.split(':');
    const newDate = new Date(rescheduleDate);
    newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setActionLoading(rescheduleApt.id);
    try {
      await rescheduleMutation.mutateAsync({
        id: rescheduleApt.id,
        newDateTime: newDate.toISOString(),
        rescheduledBy: providerName,
      });
      toast({ title: 'Rendez-vous reprogrammé et confirmé' });
      setRescheduleApt(null);
      setRescheduleDate(undefined);
      setRescheduleTime('');
      if (detailApt?.id === rescheduleApt.id) setDetailApt(null);
    } catch {
      toast({ title: 'Erreur lors de la reprogrammation', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  if (!isVerified) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Fonctionnalité verrouillée</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            La gestion des rendez-vous sera disponible après la validation de votre compte.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const summaryCards = [
    { label: "Aujourd'hui", value: stats.today, icon: CalendarDays, color: 'text-primary' },
    { label: 'En attente', value: stats.pending, icon: AlertCircle, color: 'text-amber-500' },
    { label: 'Total RDV', value: stats.total, icon: Users, color: 'text-emerald-500' },
    { label: 'Prochain', value: stats.nextTime, icon: Timer, color: 'text-blue-500' },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400';
      case 'confirmed': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400';
      case 'completed': return 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="rounded-xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={cn('h-5 w-5 mt-1', card.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs: Calendar + History */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
      {/* Week Navigation */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
              disabled={weekOffset === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Semaine préc.
            </Button>
            <h3 className="text-sm font-semibold text-foreground">
              {format(weekDays[0], 'd MMM', { locale: fr })} — {format(weekDays[weekDays.length - 1], 'd MMM yyyy', { locale: fr })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(weekOffset + 1)} disabled={weekOffset >= 4}>
              Semaine suiv.
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Empty state */}
          {appointments.length === 0 && weekOffset === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm mb-3">Aucun rendez-vous pour le moment</p>
              <Button
                variant="outline"
                size="sm"
                disabled={seeding}
                onClick={async () => {
                  setSeeding(true);
                  try {
                    await seedDemoAppointments(providerId, providerUserId, providerName);
                    toast({ title: '2 rendez-vous de test ajoutés' });
                  } catch (e: any) {
                    console.error('Seed error:', e);
                    toast({ title: e?.message || 'Erreur lors du seed', variant: 'destructive' });
                  } finally {
                    setSeeding(false);
                  }
                }}
              >
                {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Ajouter des données de test
              </Button>
            </div>
          )}

          {/* Calendar Grid */}
          {(appointments.length > 0 || weekOffset > 0) && (
            <ScrollArea className="w-full">
              <div className="min-w-[700px]">
                {/* Day Headers */}
                <div className="grid gap-0" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
                  <div className="h-12" /> {/* Empty corner */}
                  {weekDays.map((day) => {
                    const dayIsToday = isToday(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'h-12 flex flex-col items-center justify-center border-b border-l',
                          dayIsToday && 'bg-primary/5'
                        )}
                      >
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {format(day, 'EEE', { locale: fr })}
                        </span>
                        <span className={cn(
                          'text-sm font-bold',
                          dayIsToday && 'text-primary'
                        )}>
                          {format(day, 'd')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Time Rows */}
                {HOURS.map((hour, idx) => {
                  const isFullHour = hour.endsWith(':00');
                  return (
                    <div
                      key={hour}
                      className="grid gap-0"
                      style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}
                    >
                      {/* Hour label */}
                      <div className={cn(
                        'h-12 flex items-center justify-end pr-2 text-xs text-muted-foreground',
                        isFullHour ? 'font-medium' : 'opacity-50'
                      )}>
                        {isFullHour ? hour : ''}
                      </div>

                      {/* Day cells */}
                      {weekDays.map((day) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayIsToday = isToday(day);
                        const cellAppts = appointmentGrid[dayKey]?.[hour] || [];

                        return (
                          <div
                            key={`${dayKey}-${hour}`}
                            className={cn(
                              'h-12 border-b border-l relative',
                              isFullHour && 'border-b-border',
                              !isFullHour && 'border-b-border/30',
                              dayIsToday && 'bg-primary/[0.02]'
                            )}
                          >
                            {cellAppts.map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => setDetailApt(apt)}
                                className={cn(
                                  'absolute inset-x-0.5 inset-y-0.5 rounded-md border px-1.5 py-0.5 text-left transition-all hover:shadow-md hover:scale-[1.02] z-10 overflow-hidden',
                                  statusColor(apt.status)
                                )}
                              >
                                <div className="flex items-center gap-1 min-w-0">
                                  {apt.urgency === 'urgent' && (
                                    <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                  )}
                                  <span className="text-[11px] font-semibold truncate">
                                    {apt.patientName}
                                  </span>
                                </div>
                                <span className="text-[10px] opacity-70 truncate block">
                                  {format(parseISO(apt.dateTime), 'HH:mm')}
                                </span>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4 space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par patient..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmés</SelectItem>
                    <SelectItem value="completed">Terminés</SelectItem>
                    <SelectItem value="cancelled">Annulés</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={historyMonthFilter} onValueChange={setHistoryMonthFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    {(() => {
                      const months = new Set<string>();
                      appointments.forEach((a) => {
                        try {
                          const d = parseISO(a.dateTime);
                          months.add(`${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`);
                        } catch { /* skip */ }
                      });
                      const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
                      return Array.from(months).sort().reverse().map((m) => {
                        const [year, month] = m.split('-');
                        return <SelectItem key={m} value={m}>{MONTHS_FR[parseInt(month)]} {year}</SelectItem>;
                      });
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {(() => {
                const filtered = appointments
                  .filter((a) => {
                    if (historySearch && !a.patientName.toLowerCase().includes(historySearch.toLowerCase())) return false;
                    if (historyStatusFilter !== 'all' && a.status !== historyStatusFilter) return false;
                    if (historyMonthFilter !== 'all') {
                      try {
                        const d = parseISO(a.dateTime);
                        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
                        if (key !== historyMonthFilter) return false;
                      } catch { return false; }
                    }
                    return true;
                  })
                  .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <History className="h-10 w-10 mb-3 opacity-40" />
                      <p className="text-sm">Aucun rendez-vous trouvé</p>
                    </div>
                  );
                }

                return (
                  <ScrollArea className="max-h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Urgence</TableHead>
                          <TableHead>Motif</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((apt) => (
                          <TableRow
                            key={apt.id}
                            className="cursor-pointer"
                            onClick={() => setDetailApt(apt)}
                          >
                            <TableCell className="whitespace-nowrap text-sm">
                              {format(parseISO(apt.dateTime), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="font-medium">{apt.patientName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{apt.patientPhone}</TableCell>
                            <TableCell>
                              <AppointmentStatusBadge status={apt.status} />
                            </TableCell>
                            <TableCell>
                              {apt.urgency === 'urgent' ? (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Urgent
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Routine</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                              {apt.notes || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Panel (Sheet) */}
      <Sheet open={!!detailApt} onOpenChange={(open) => { if (!open) setDetailApt(null); }}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          {detailApt && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Détails du rendez-vous
                </SheetTitle>
              </SheetHeader>

              <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-6 mt-3 grid grid-cols-2 rounded-lg">
                  <TabsTrigger value="details" className="gap-1.5 text-xs">
                    <FileText className="h-3.5 w-3.5" /> Détails
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="gap-1.5 text-xs">
                    <MessageSquare className="h-3.5 w-3.5" /> Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                  {/* Patient */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {detailApt.patientName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{detailApt.patientName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{detailApt.patientPhone}</span>
                        {detailApt.patientEmail && (
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{detailApt.patientEmail}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date/Time */}
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Date</span>
                      <span className="font-medium text-sm">{format(parseISO(detailApt.dateTime), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" /> Heure</span>
                      <Badge variant="secondary" className="font-mono">{format(parseISO(detailApt.dateTime), 'HH:mm')}</Badge>
                    </div>
                  </div>

                  {/* Status & Urgency */}
                  <div className="flex items-center gap-2">
                    <AppointmentStatusBadge status={detailApt.status} />
                    {detailApt.urgency === 'urgent' ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-xs">
                        <AlertTriangle className="h-3 w-3" /> Urgent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                        Routine
                      </Badge>
                    )}
                  </div>

                  {/* Change Status */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Changer le statut</p>
                    <Select
                      value={detailApt.status}
                      onValueChange={(val) => handleStatusChange(detailApt.id, val as Appointment['status'])}
                      disabled={actionLoading === detailApt.id}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ En attente</SelectItem>
                        <SelectItem value="confirmed">✅ Confirmé</SelectItem>
                        <SelectItem value="completed">🏁 Terminé</SelectItem>
                        <SelectItem value="cancelled">❌ Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Visit reason */}
                  {detailApt.notes && (
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium flex items-center gap-1.5"><FileText className="h-4 w-4 text-muted-foreground" /> Motif de la visite</p>
                      <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{detailApt.notes}</p>
                    </div>
                  )}

                  {/* Reschedule history */}
                  {detailApt.rescheduleHistory && detailApt.rescheduleHistory.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1.5"><History className="h-4 w-4 text-muted-foreground" /> Historique</p>
                      <div className="space-y-2">
                        {detailApt.rescheduleHistory.map((entry, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5 space-y-0.5">
                            <p>Reprogrammé par <span className="font-medium text-foreground">{entry.by}</span></p>
                            <p>De: {format(parseISO(entry.from), 'dd/MM/yyyy HH:mm')}</p>
                            <p>À: {format(parseISO(entry.to), 'dd/MM/yyyy HH:mm')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    {!isPast(parseISO(detailApt.dateTime)) && detailApt.status !== 'cancelled' && detailApt.status !== 'completed' && (
                      <>
                        {detailApt.status === 'pending' && (
                          <Button
                            className="w-full gap-2"
                            variant="default"
                            onClick={() => handleAction(detailApt.id, 'confirm')}
                            disabled={actionLoading === detailApt.id}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Approuver
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => {
                            setRescheduleApt(detailApt);
                            setRescheduleDate(undefined);
                            setRescheduleTime('');
                          }}
                          disabled={actionLoading === detailApt.id}
                        >
                          <CalendarClock className="h-4 w-4" /> Reprogrammer
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-destructive hover:text-destructive"
                          onClick={() => handleAction(detailApt.id, 'cancel')}
                          disabled={actionLoading === detailApt.id}
                        >
                          <XCircle className="h-4 w-4" /> Annuler
                        </Button>
                      </>
                    )}
                    {detailApt.status === 'confirmed' && !isPast(parseISO(detailApt.dateTime)) && (
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleAction(detailApt.id, 'complete')}
                        disabled={actionLoading === detailApt.id}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Marquer comme terminé
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="flex-1 flex flex-col min-h-0">
                  <AppointmentNotesThread
                    appointment={detailApt}
                    currentUserId={providerUserId}
                    currentUserName={providerName}
                    currentUserRole="provider"
                    templates={noteTemplates}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reschedule Panel */}
      <Sheet open={!!rescheduleApt} onOpenChange={(open) => !open && setRescheduleApt(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {rescheduleApt && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Reprogrammer le rendez-vous
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <p className="text-sm text-muted-foreground">
                  Patient: <span className="font-medium text-foreground">{rescheduleApt.patientName}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Date actuelle: <span className="font-medium text-foreground">{format(parseISO(rescheduleApt.dateTime), 'EEEE d MMMM à HH:mm', { locale: fr })}</span>
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouvelle date</label>
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={(d) => { d && setRescheduleDate(d); setRescheduleTime(''); }}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    locale={fr}
                    className="rounded-xl border pointer-events-auto"
                  />
                </div>

                {rescheduleDate && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nouvelle heure</label>
                    {rescheduleSlotsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {rescheduleSlots.filter(s => s.status === 'available').map(slot => (
                          <Button
                            key={slot.time}
                            variant={rescheduleTime === slot.time ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => setRescheduleTime(slot.time)}
                          >
                            {slot.time}
                          </Button>
                        ))}
                        {rescheduleSlots.filter(s => s.status === 'available').length === 0 && (
                          <p className="col-span-4 text-sm text-muted-foreground text-center py-2">Aucun créneau disponible</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || actionLoading === rescheduleApt.id}
                >
                  {actionLoading === rescheduleApt.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarClock className="h-4 w-4" />
                  )}
                  Confirmer la reprogrammation
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
