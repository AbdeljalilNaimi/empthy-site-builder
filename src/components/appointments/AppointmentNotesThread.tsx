import { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, Lock, MessageSquare, Bot, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAppointmentNotes, useAddNote } from '@/hooks/useAppointmentNotes';
import { useNotifications } from '@/hooks/useNotifications';
import { Appointment } from '@/types/appointments';
import { AppointmentNote } from '@/types/appointmentNotes';
import { toast } from 'sonner';

interface AppointmentNotesThreadProps {
  appointment: Appointment;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'patient' | 'provider';
  templates?: string[];
}

const MAX_NOTES = 10;

export function AppointmentNotesThread({
  appointment,
  currentUserId,
  currentUserName,
  currentUserRole,
  templates = [],
}: AppointmentNotesThreadProps) {
  const { sendNotification } = useNotifications(currentUserId);

  const onNewNote = useCallback((note: AppointmentNote) => {
    if (note.senderId === currentUserId) return;

    const preview = note.content.length > 60 ? note.content.substring(0, 60) + '…' : note.content;
    const senderLabel = note.senderRole === 'provider' ? `Dr. ${note.senderName}` : note.senderName;

    toast.info(`💬 ${senderLabel}`, { description: preview });

    sendNotification({
      userId: currentUserId,
      type: 'message',
      title: `Nouveau message de ${senderLabel}`,
      body: preview,
      link: '/citizen/dashboard',
    });
  }, [currentUserId, sendNotification]);

  const { notes, loading } = useAppointmentNotes(appointment.id, onNewNote);
  const { addNote, isPending } = useAddNote();
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isPatient = currentUserRole === 'patient';
  const isDisabled = isPatient
    ? appointment.status !== 'pending'
    : (appointment.status === 'completed' || appointment.status === 'cancelled');
  const isMaxReached = notes.length >= MAX_NOTES;
  const canWrite = !isDisabled && !isMaxReached;

  const handleSend = async () => {
    const text = content.trim();
    if (!text || !canWrite || isPending) return;
    try {
      setContent('');
      await addNote(appointment.id, {
        senderName: currentUserName,
        senderRole: currentUserRole,
        senderId: currentUserId,
        content: text,
      });
      inputRef.current?.focus();
    } catch (e: any) {
      setContent(text);
      toast.error(e?.message || 'Erreur lors de l\'envoi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {isDisabled && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b text-sm text-muted-foreground rounded-t-lg">
          <Lock className="h-4 w-4 shrink-0" />
          {isPatient
            ? 'Notes disponibles uniquement pour les rendez-vous en attente'
            : `Fil en lecture seule (${appointment.status === 'completed' ? 'terminé' : 'annulé'})`}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {notes.length}/{MAX_NOTES} notes
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {/* Patient guidance when thread is empty */}
          {notes.length === 0 && isPatient && !isDisabled && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent/30 border border-accent/50 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>
                Vous pouvez envoyer un message au praticien ici. Les notes sont disponibles tant que le rendez-vous est en attente.
              </span>
            </div>
          )}

          {notes.length === 0 && !(isPatient && !isDisabled) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune note pour ce rendez-vous
            </div>
          )}

          {notes.map((note) => {
            const isOwn = note.senderId === currentUserId;
            return (
              <div
                key={note.id}
                className={cn(
                  'rounded-xl p-3 max-w-[85%] space-y-1',
                  isOwn
                    ? 'ml-auto bg-primary/10 border border-primary/20'
                    : 'mr-auto bg-muted/50 border border-border'
                )}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold">{note.senderName}</span>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                    {note.senderRole === 'patient' ? 'Patient' : 'Praticien'}
                  </Badge>
                  {note.isAutoGenerated && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-0.5">
                      <Bot className="h-3 w-3" /> Auto
                    </Badge>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(note.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {canWrite && (
        <div className="border-t p-3 space-y-2">
          {currentUserRole === 'provider' && templates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] rounded-full"
                  onClick={() => { setContent(tpl); inputRef.current?.focus(); }}
                >
                  {tpl.length > 40 ? tpl.substring(0, 40) + '…' : tpl}
                </Button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSend();
                }
              }}
              placeholder="Écrire un message..."
              className="text-sm"
              disabled={isPending}
              maxLength={1000}
              autoComplete="off"
            />
            <Button
              type="button"
              size="icon"
              className="shrink-0 h-10 w-10"
              disabled={!content.trim() || isPending}
              onClick={handleSend}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {isMaxReached && !isDisabled && (
        <div className="border-t px-4 py-2.5 text-sm text-muted-foreground text-center bg-muted/30">
          Maximum de notes atteint ({MAX_NOTES}/{MAX_NOTES})
        </div>
      )}
    </div>
  );
}
