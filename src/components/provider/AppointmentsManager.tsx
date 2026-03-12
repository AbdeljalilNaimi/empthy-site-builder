import { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, isPast, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  CalendarDays,
  List,
  Grid3X3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useRealtimeProviderAppointments, 
  useConfirmAppointment, 
  useCompleteAppointment, 
  useCancelAppointment 
} from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface AppointmentsManagerProps {
  providerId: string;
  providerUserId: string;
  providerName: string;
  isVerified: boolean;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    variant: 'secondary' as const,
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmé',
    variant: 'default' as const,
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-500',
  },
  cancelled: {
    label: 'Annulé',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500',
  },
  completed: {
    label: 'Terminé',
    variant: 'outline' as const,
    icon: CheckCircle2,
    color: 'text-blue-500',
    bg: 'bg-blue-500',
  },
};

function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return 'Demain';
  return format(date, 'EEEE d MMMM', { locale: fr });
}

function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm', { locale: fr });
}

export function AppointmentsManager({ providerId, providerUserId, providerName, isVerified }: AppointmentsManagerProps) {
  const { toast } = useToast();
  const { appointments, loading } = useRealtimeProviderAppointments(providerUserId);
  const confirmMutation = useConfirmAppointment();
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Filter appointments by status
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  // Get upcoming appointments (pending + confirmed, sorted by date)
  const upcomingAppointments = [...pendingAppointments, ...confirmedAppointments]
    .filter(apt => !isPast(parseISO(apt.dateTime)))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  // Get dates with appointments for calendar highlighting
  const datesWithAppointments = useMemo(() => {
    const dateMap = new Map<string, number>();
    appointments.forEach(apt => {
      if (apt.status !== 'cancelled') {
        const dateKey = apt.dateTime.split('T')[0];
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      }
    });
    return dateMap;
  }, [appointments]);

  // Filter appointments by selected date
  const filteredByDate = useMemo(() => {
    if (!selectedDate) return upcomingAppointments;
    return appointments.filter(apt => {
      try {
        return isSameDay(parseISO(apt.dateTime), selectedDate);
      } catch {
        return false;
      }
    });
  }, [appointments, selectedDate, upcomingAppointments]);

  // Stats for header
  const stats = useMemo(() => ({
    total: appointments.length,
    pending: pendingAppointments.length,
    confirmed: confirmedAppointments.length,
    completed: completedAppointments.length,
  }), [appointments, pendingAppointments, confirmedAppointments, completedAppointments]);

  const handleConfirm = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      await confirmMutation.mutateAsync(appointmentId);
      toast({
        title: 'Rendez-vous confirmé',
        description: 'Le patient sera notifié de la confirmation.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de confirmer le rendez-vous.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      await completeMutation.mutateAsync(appointmentId);
      toast({
        title: 'Rendez-vous terminé',
        description: 'Le rendez-vous a été marqué comme terminé.',
      });
      setDetailsOpen(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer le rendez-vous.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      await cancelMutation.mutateAsync(appointmentId);
      toast({
        title: 'Rendez-vous annulé',
        description: 'Le rendez-vous a été annulé.',
      });
      setDetailsOpen(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler le rendez-vous.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gestion des rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fonctionnalité verrouillée</h3>
            <p className="text-muted-foreground max-w-md">
              La gestion des rendez-vous sera disponible après la validation de votre compte.
              Complétez votre profil et soumettez vos documents pour la vérification.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;
    const isActionLoading = actionLoading === appointment.id;
    const appointmentPassed = isPast(parseISO(appointment.dateTime));

    return (
      <div 
        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => openDetails(appointment)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {appointment.patientName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium">{appointment.patientName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{formatDateLabel(appointment.dateTime)}</span>
                <Clock className="h-3.5 w-3.5 ml-2" />
                <span>{formatTime(appointment.dateTime)}</span>
              </div>
              {appointment.patientPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{appointment.patientPhone}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className={cn('h-3 w-3', status.color)} />
              {status.label}
            </Badge>
            
            {appointment.status === 'pending' && !appointmentPassed && (
              <Button 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); handleConfirm(appointment.id); }}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Confirmer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{stats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Terminés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Gestion des rendez-vous
              </CardTitle>
              <CardDescription>
                {selectedDate 
                  ? `${filteredByDate.length} rendez-vous le ${format(selectedDate, 'd MMMM', { locale: fr })}`
                  : `${appointments.length} rendez-vous au total • ${upcomingAppointments.length} à venir`
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedDate && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
                  Tous les RDV
                </Button>
              )}
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'calendar' ? (
            <div className="flex gap-6">
              {/* Calendar View */}
              <div className="shrink-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={fr}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    hasAppointments: (date) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      return datesWithAppointments.has(dateKey);
                    },
                  }}
                  modifiersStyles={{
                    hasAppointments: {
                      fontWeight: 'bold',
                    },
                  }}
                  components={{
                    DayContent: ({ date }) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      const count = datesWithAppointments.get(dateKey);
                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {date.getDate()}
                          {count && count > 0 && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </div>
              
              {/* Appointments List for selected date */}
              <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto">
                {filteredByDate.length > 0 ? (
                  filteredByDate.map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>
                      {selectedDate 
                        ? 'Aucun rendez-vous ce jour' 
                        : 'Aucun rendez-vous à venir'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming" className="relative">
                  À venir
                  {upcomingAppointments.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {upcomingAppointments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  En attente
                  {pendingAppointments.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-amber-500/20 text-amber-600">
                      {pendingAppointments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">Terminés</TabsTrigger>
                <TabsTrigger value="cancelled">Annulés</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-3">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun rendez-vous à venir</p>
                  </div>
                ) : (
                  upcomingAppointments.map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun rendez-vous en attente de confirmation</p>
                  </div>
                ) : (
                  pendingAppointments.map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3">
                {completedAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun rendez-vous terminé</p>
                  </div>
                ) : (
                  completedAppointments.map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-3">
                {cancelledAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun rendez-vous annulé</p>
                  </div>
                ) : (
                  cancelledAppointments.map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
            <DialogDescription>
              {selectedAppointment && formatDateLabel(selectedAppointment.dateTime)} à {selectedAppointment && formatTime(selectedAppointment.dateTime)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant={statusConfig[selectedAppointment.status].variant}
                  className="text-sm px-4 py-1"
                >
                  {statusConfig[selectedAppointment.status].label}
                </Badge>
              </div>
              
              {/* Patient Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedAppointment.patientName}</span>
                </div>
                {selectedAppointment.patientPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedAppointment.patientPhone}`} className="text-primary hover:underline">
                      {selectedAppointment.patientPhone}
                    </a>
                  </div>
                )}
                {selectedAppointment.patientEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedAppointment.patientEmail}`} className="text-primary hover:underline">
                      {selectedAppointment.patientEmail}
                    </a>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Notes du patient
                  </div>
                  <Textarea 
                    value={selectedAppointment.notes} 
                    readOnly 
                    className="resize-none bg-muted/30"
                    rows={3}
                  />
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Créé le {format(parseISO(selectedAppointment.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {selectedAppointment?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleCancel(selectedAppointment.id)}
                  disabled={actionLoading === selectedAppointment.id}
                  className="w-full sm:w-auto"
                >
                  {actionLoading === selectedAppointment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleConfirm(selectedAppointment.id)}
                  disabled={actionLoading === selectedAppointment.id}
                  className="w-full sm:w-auto"
                >
                  {actionLoading === selectedAppointment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmer
                    </>
                  )}
                </Button>
              </>
            )}
            {selectedAppointment?.status === 'confirmed' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleCancel(selectedAppointment.id)}
                  disabled={actionLoading === selectedAppointment.id}
                  className="w-full sm:w-auto"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleComplete(selectedAppointment.id)}
                  disabled={actionLoading === selectedAppointment.id}
                  className="w-full sm:w-auto"
                >
                  {actionLoading === selectedAppointment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marquer terminé
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
