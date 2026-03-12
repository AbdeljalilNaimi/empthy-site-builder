import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, User, FileText, X, Mail, AlertTriangle, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import type { Appointment } from '@/types/appointments';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
  showActions?: boolean;
  /** Show createdAt date and reschedule history (for history views) */
  showHistory?: boolean;
}

export function AppointmentCard({ appointment, onCancel, isCancelling, showActions = true, showHistory = false }: AppointmentCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const date = new Date(appointment.dateTime);
  const canCancel = showActions && (appointment.status === 'pending' || appointment.status === 'confirmed');
  const isUrgent = appointment.urgency === 'urgent';
  const hasRescheduleHistory = showHistory && appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0;

  return (
    <Card className="glass-card">
      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Date block */}
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary shrink-0">
          <div className="text-center leading-tight">
            <span className="block text-lg font-bold">{format(date, 'd')}</span>
            <span className="block text-[10px] uppercase font-medium">{format(date, 'MMM', { locale: fr })}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">{appointment.providerName}</span>
            <AppointmentStatusBadge status={appointment.status} />
            {isUrgent ? (
              <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgent
              </Badge>
            ) : appointment.urgency === 'routine' ? (
              <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                Routine
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(date, 'HH:mm')}
            </span>
          </div>
          {appointment.patientEmail && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3 shrink-0" />
              {appointment.patientEmail}
            </p>
          )}
          {appointment.notes && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <FileText className="h-3 w-3 shrink-0" />
              {appointment.notes}
            </p>
          )}
          {/* History metadata */}
          {showHistory && appointment.createdAt && (
            <p className="text-[11px] text-muted-foreground/70">
              Pris le {format(new Date(appointment.createdAt), 'd MMMM yyyy', { locale: fr })}
            </p>
          )}
          {hasRescheduleHistory && (
            <div>
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="text-[11px] text-primary flex items-center gap-1 hover:underline"
              >
                <History className="h-3 w-3" />
                {appointment.rescheduleHistory!.length} reprogrammation{appointment.rescheduleHistory!.length > 1 ? 's' : ''}
                {historyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {historyOpen && (
                <div className="mt-1.5 space-y-1">
                  {appointment.rescheduleHistory!.map((entry, idx) => (
                    <div key={idx} className="text-[11px] text-muted-foreground bg-muted/40 rounded-md px-2.5 py-1.5">
                      <span className="font-medium text-foreground">{entry.by}</span> — de{' '}
                      {format(new Date(entry.from), 'dd/MM/yyyy HH:mm')} → {format(new Date(entry.to), 'dd/MM/yyyy HH:mm')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancel action */}
        {canCancel && onCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isCancelling} className="shrink-0 text-destructive hover:text-destructive">
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler ce rendez-vous ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Votre rendez-vous avec {appointment.providerName} le{' '}
                  {format(date, 'EEEE d MMMM à HH:mm', { locale: fr })} sera annulé.
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Non, garder</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(appointment.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Oui, annuler
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
