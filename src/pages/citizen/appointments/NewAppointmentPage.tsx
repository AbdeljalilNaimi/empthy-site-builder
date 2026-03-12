import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProvider } from '@/hooks/useProviders';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtimePatientAppointments } from '@/hooks/useAppointments';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WeeklyCalendarView } from '@/components/appointments/WeeklyCalendarView';
import { BookingSlidePanel } from '@/components/appointments/BookingSlidePanel';

export default function NewAppointmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const providerId = searchParams.get('providerId');
  const { t } = useLanguage();

  if (!providerId) {
    return (
      <div className="container-wide section-spacing-sm">
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold text-lg">{t('appointments', 'noProvider')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('appointments', 'noProvider')}
          </p>
          <Button asChild className="mt-4">
            <Link to="/search">{t('appointments', 'searchProvider')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <BookingFlow providerId={providerId} navigate={navigate} />;
}

function BookingFlow({
  providerId,
  navigate,
}: {
  providerId: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { data: provider, isLoading: providerLoading } = useProvider(providerId);
  const { t } = useLanguage();
  const { appointments: myAppointments } = useRealtimePatientAppointments();

  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const patientAppointmentTimes = useMemo(
    () => myAppointments.filter(a => a.providerId === providerId && a.status !== 'cancelled').map(a => a.dateTime),
    [myAppointments, providerId]
  );

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    setPanelOpen(true);
  };

  if (providerLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-wide section-spacing-sm max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1 rtl-flip" />
        {t('common', 'back')}
      </Button>

      <h1 className="text-2xl font-bold mb-1">{t('appointments', 'bookAppointment')}</h1>
      <p className="text-muted-foreground mb-6">
        {provider?.name} — {provider?.specialty || provider?.type}
      </p>

      <WeeklyCalendarView
        providerId={providerId}
        schedule={provider?.schedule as any}
        onSlotSelect={handleSlotSelect}
        selectedSlot={selectedSlot}
        patientAppointmentTimes={patientAppointmentTimes}
      />

      <BookingSlidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        provider={provider ? {
          id: provider.id,
          name: provider.name,
          specialty: provider.specialty,
          type: provider.type,
          photo: (provider as any).photos?.[0],
          city: provider.city,
        } : null}
        selectedDate={selectedSlot?.date || null}
        selectedTime={selectedSlot?.time || null}
        onSuccess={() => {
          setSelectedSlot(null);
          navigate('/citizen/appointments');
        }}
      />
    </div>
  );
}
