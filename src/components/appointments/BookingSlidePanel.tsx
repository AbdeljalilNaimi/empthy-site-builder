import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface BookingSlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: {
    id: string;
    name: string;
    specialty?: string;
    type?: string;
    photo?: string;
    city?: string;
  } | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSuccess?: () => void;
}

export function BookingSlidePanel({
  open,
  onOpenChange,
  provider,
  selectedDate,
  selectedTime,
  onSuccess,
}: BookingSlidePanelProps) {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const createMutation = useCreateAppointment();

  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [notes, setNotes] = useState('');

  const canSubmit = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 8 && selectedDate && selectedTime;

  const handleSubmit = () => {
    if (!canSubmit || !provider || !selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':');
    const dt = new Date(selectedDate);
    dt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    createMutation.mutate(
      {
        providerId: provider.id,
        providerName: provider.name,
        patientName: name.trim(),
        patientPhone: phone.replace(/\s/g, ''),
        dateTime: dt.toISOString(),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Rendez-vous confirmé avec succès !');
          onOpenChange(false);
          setNotes('');
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Erreur lors de la réservation');
        },
      }
    );
  };

  const content = (
    <div className="space-y-6 p-1">
      {/* Provider Info */}
      {provider && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
          <Avatar className="h-14 w-14">
            <AvatarImage src={provider.photo} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {provider.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{provider.name}</h4>
            <p className="text-sm text-muted-foreground">{provider.specialty || provider.type}</p>
            {provider.city && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                {provider.city}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected slot */}
      {selectedDate && selectedTime && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 flex-1">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selectedTime}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nom complet *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom complet" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Téléphone *</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05 50 00 00 00" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Motif de la consultation</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Décrivez brièvement le motif de votre visite..."
            rows={3}
          />
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || createMutation.isPending}
        className="w-full h-12 rounded-lg text-base font-semibold"
        size="lg"
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Réservation en cours...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmer le rendez-vous
          </>
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader>
            <DrawerTitle>Réserver un rendez-vous</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Réserver un rendez-vous</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
