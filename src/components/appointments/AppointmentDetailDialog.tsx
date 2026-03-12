import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDays, Clock, FileText, MessageSquare, AlertTriangle, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge';
import { AppointmentNotesThread } from '@/components/appointments/AppointmentNotesThread';
import { Appointment } from '@/types/appointments';

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'patient' | 'provider';
  noteTemplates?: string[];
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  currentUserId,
  currentUserName,
  currentUserRole,
  noteTemplates = [],
}: AppointmentDetailDialogProps) {
  if (!appointment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5 text-primary" />
            Détails du rendez-vous
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-3 grid grid-cols-2 rounded-lg">
            <TabsTrigger value="details" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Person info */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {currentUserRole === 'patient' ? appointment.providerName : appointment.patientName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUserRole === 'patient' ? 'Praticien' : 'Patient'}
                </p>
              </div>
            </div>

            {/* Date/Time */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Date
                </span>
                <span className="font-medium text-sm">
                  {format(new Date(appointment.dateTime), 'EEEE d MMMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Heure
                </span>
                <Badge variant="secondary" className="font-mono">
                  {format(new Date(appointment.dateTime), 'HH:mm')}
                </Badge>
              </div>
            </div>

            {/* Status & Urgency */}
            <div className="flex items-center gap-2">
              <AppointmentStatusBadge status={appointment.status} />
              {appointment.urgency === 'urgent' && (
                <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3" /> Urgent
                </Badge>
              )}
            </div>

            {/* Visit reason */}
            {appointment.notes && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Motif de la visite
                </p>
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                  {appointment.notes}
                </p>
              </div>
            )}

            {/* Reschedule history */}
            {appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Historique des reprogrammations</p>
                <div className="space-y-2">
                  {appointment.rescheduleHistory.map((entry, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5 space-y-0.5">
                      <p>Par <span className="font-medium text-foreground">{entry.by}</span></p>
                      <p>De: {format(new Date(entry.from), 'dd/MM/yyyy HH:mm')}</p>
                      <p>À: {format(new Date(entry.to), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="flex-1 flex flex-col min-h-0">
            <AppointmentNotesThread
              appointment={appointment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserRole={currentUserRole}
              templates={noteTemplates}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
