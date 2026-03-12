import React, { useState, useMemo } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarIcon, Clock, Mail, Phone as PhoneIcon, User, CheckCircle, 
  Loader2, AlertCircle, CalendarDays, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useCreateAppointment, useRealtimeAvailability, type AvailabilitySlot } from '@/hooks/useAppointments';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useProvider } from '@/hooks/useProviders';
import { providerAnalytics } from '@/services/providerAnalyticsService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  providerName: string;
  providerId: string;
}

// Algerian phone number validation (05XX XX XX XX, 06XX XX XX XX, 07XX XX XX XX)
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 10);
  
  if (limited.length <= 2) return limited;
  if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
  if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
  if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`;
  return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
};

const validatePhoneNumber = (value: string, t: (key: string) => string): { valid: boolean; error?: string } => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return { valid: false, error: t('booking.phoneRequired') };
  }
  
  if (digits.length < 10) {
    return { valid: false, error: t('booking.phoneDigits') };
  }
  
  if (!/^0[5-7]/.test(digits)) {
    return { valid: false, error: t('booking.phonePrefix') };
  }
  
  return { valid: true };
};

// Quick date selector component
const QuickDateSelector: React.FC<{
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
  t: (key: string) => string;
  language: string;
}> = ({ selectedDate, onSelectDate, t, language }) => {
  const today = new Date();
  const quickDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    return dates.slice(0, 5); // Show 5 days
  }, []);

  const locale = language === 'ar' ? ar : language === 'en' ? enUS : fr;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {quickDates.map((date, idx) => {
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        
        return (
          <button
            key={idx}
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex flex-col items-center min-w-[70px] p-3 rounded-xl border-2 transition-all",
              isSelected 
                ? "border-primary bg-primary text-primary-foreground" 
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            <span className="text-xs font-medium uppercase">
              {isToday ? t('filters.today') : format(date, 'EEE', { locale })}
            </span>
            <span className="text-2xl font-bold">{format(date, 'd')}</span>
            <span className="text-xs opacity-70">{format(date, 'MMM', { locale })}</span>
          </button>
        );
      })}
    </div>
  );
};

// Time slot grid component
const TimeSlotGrid: React.FC<{
  slots: AvailabilitySlot[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  loading: boolean;
  t: (key: string) => string;
}> = ({ slots, selectedTime, onSelectTime, loading, t }) => {
  // Group slots by period
  const morningSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour < 12;
  });
  
  const afternoonSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour >= 12;
  });

  const availableCount = slots.filter(s => s.status === 'available').length;
  const bookedCount = slots.filter(s => s.status === 'booked').length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-xl">
        <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{t('provider.closed')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('search.tryDifferentFilters')}
        </p>
      </div>
    );
  }

  const renderSlotButton = (slot: AvailabilitySlot) => {
    const isSelected = selectedTime === slot.time;
    const isAvailable = slot.status === 'available';
    const isBooked = slot.status === 'booked';
    const isPast = slot.status === 'past';

    return (
      <button
        key={slot.time}
        onClick={() => isAvailable && onSelectTime(slot.time)}
        disabled={!isAvailable}
        className={cn(
          "relative py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
          isSelected && isAvailable && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
          isAvailable && !isSelected && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
          isBooked && "bg-red-100 text-red-400 cursor-not-allowed line-through opacity-60",
          isPast && "bg-muted text-muted-foreground cursor-not-allowed opacity-40"
        )}
      >
        {slot.time}
        {isBooked && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Availability summary */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">{availableCount} {t('providers.availableNow')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">{bookedCount} {t('provider.closed')}</span>
        </div>
      </div>

      {/* Morning slots */}
      {morningSlots.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <span>☀️</span> {t('appointments.morning')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {morningSlots.map(renderSlotButton)}
          </div>
        </div>
      )}

      {/* Afternoon slots */}
      {afternoonSlots.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <span>🌤️</span> {t('appointments.afternoon')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {afternoonSlots.map(renderSlotButton)}
          </div>
        </div>
      )}
    </div>
  );
};

export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange, providerName, providerId }) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [step, setStep] = useState<'details' | 'datetime' | 'confirm'>('details');
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { sendNotification } = useNotifications();
  const createAppointmentMutation = useCreateAppointment();

  // Fetch provider data to get their schedule
  const { data: provider } = useProvider(providerId);
  
  // Get real-time availability for selected date
  const { slots, loading: slotsLoading } = useRealtimeAvailability(
    providerId,
    selectedDate,
    provider?.schedule as Record<string, { open: string; close: string; closed?: boolean } | undefined> | undefined
  );

  const locale = language === 'ar' ? ar : language === 'en' ? enUS : fr;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    if (phoneError) setPhoneError(null);
  };

  const handlePhoneBlur = () => {
    const validation = validatePhoneNumber(phone, t);
    if (!validation.valid) {
      setPhoneError(validation.error || null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setShowFullCalendar(false);
  };

  const canProceed = () => {
    if (step === 'details') {
      const phoneValidation = validatePhoneNumber(phone, t);
      return name && phoneValidation.valid && notes.trim().length >= 3;
    }
    if (step === 'datetime') return selectedDate && selectedTime;
    return true;
  };

  const handleNext = () => {
    if (step === 'details') {
      const phoneValidation = validatePhoneNumber(phone, t);
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error || null);
        return;
      }
      setStep('datetime');
    } else if (step === 'datetime') {
      setStep('confirm');
    } else {
      confirm();
    }
  };

  const confirm = () => {
    if (!selectedDate || !selectedTime || !name || !phone) return;
    
    const [hours, minutes] = selectedTime.split(':');
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    createAppointmentMutation.mutate(
      {
        providerId,
        providerName,
        patientName: name,
        patientPhone: phone.replace(/\s/g, ''),
        patientEmail: email || undefined,
        dateTime: appointmentDate.toISOString(),
        notes: notes || undefined,
        urgency,
      },
      {
        onSuccess: () => {
          // Track appointment request
          const providerUserId = providerId.replace(/^provider_/, '');
          providerAnalytics.trackAppointmentRequest(providerId, user?.uid, providerUserId);
          
          sendNotification({
            userId: user?.uid || 'anonymous',
            type: 'appointment',
            title: t('provider.bookAppointment'),
            body: `${providerName} - ${format(appointmentDate, 'EEEE d MMMM à HH:mm', { locale })}`,
            link: '/appointments',
          });

          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">{t('common.success')}!</p>
                <p className="text-sm">{t('provider.bookAppointment')}</p>
              </div>
            </div>
          );
          
          // Reset form
          setStep('details');
          setSelectedDate(undefined);
          setSelectedTime('');
          setName('');
          setPhone('');
          setPhoneError(null);
          setEmail('');
          setNotes('');
          setUrgency('routine');
          onOpenChange(false);
        },
        onError: (error: any) => {
          console.error('Booking submission error:', error);
          toast.error(error?.message || 'Erreur lors de la réservation. Vérifiez que les règles Firestore sont déployées.');
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {t('provider.bookAppointment')}
          </DialogTitle>
          <DialogDescription>{providerName}</DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[
            { label: t('booking.information'), value: 'details' }, 
            { label: t('booking.dateTime'), value: 'datetime' }, 
            { label: t('booking.confirmation'), value: 'confirm' }
          ].map((item, idx) => {
            const stepOrder = ['details', 'datetime', 'confirm'];
            const currentIdx = stepOrder.indexOf(step);
            const isCompleted = currentIdx > idx;
            const isCurrent = currentIdx === idx;
            
            return (
              <div key={item.value} className="flex items-center flex-1">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                  isCurrent ? "border-primary text-primary" : "border-muted text-muted-foreground"
                )}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">{item.label}</span>
                {idx < 2 && <div className={cn("flex-1 h-0.5 mx-2", isCompleted ? "bg-primary" : "bg-muted")} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Patient Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {t('auth.patient')} *
              </label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Ahmed Benali" 
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-primary" />
                  {t('provider.callNow')} *
                </label>
                <Input 
                  value={phone} 
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="05 50 00 00 00"
                  className={cn(phoneError && "border-destructive focus-visible:ring-destructive")}
                />
                {phoneError ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {phoneError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Format: 05XX XX XX XX
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {t('auth.email')} ({t('appointments.notesOptional').split('(')[1]?.replace(')', '') || 'optional'})
                </label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="votre@email.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('booking.notes')} *
              </label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Décrivez la raison de votre visite..."
                rows={3}
                className="resize-none"
              />
              {notes.trim().length > 0 && notes.trim().length < 3 && (
                <p className="text-xs text-destructive">Minimum 3 caractères</p>
              )}
            </div>

            {/* Urgency selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Type de visite
              </label>
              <RadioGroup value={urgency} onValueChange={(v) => setUrgency(v as 'routine' | 'urgent')} className="flex gap-3">
                <label className={cn(
                  "flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                  urgency === 'routine' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}>
                  <RadioGroupItem value="routine" />
                  <div>
                    <p className="text-sm font-medium">Visite de routine</p>
                    <p className="text-xs text-muted-foreground">Consultation normale</p>
                  </div>
                </label>
                <label className={cn(
                  "flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                  urgency === 'urgent' ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-border hover:border-red-500/50"
                )}>
                  <RadioGroupItem value="urgent" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Urgent</p>
                    <p className="text-xs text-muted-foreground">Besoin rapide</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection - Enhanced */}
        {step === 'datetime' && (
          <div className="space-y-6">
            {/* Quick Date Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {t('booking.selectDate')}
                </label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFullCalendar(!showFullCalendar)}
                  className="text-xs"
                >
                  {showFullCalendar ? t('booking.quickDates') : t('booking.moreDates')}
                  {showFullCalendar ? <ChevronLeft className="h-3 w-3 ml-1 rtl-flip" /> : <ChevronRight className="h-3 w-3 ml-1 rtl-flip" />}
                </Button>
              </div>

              {showFullCalendar ? (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleDateSelect(date)}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-xl border pointer-events-auto"
                  locale={locale}
                />
              ) : (
                <QuickDateSelector
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  t={t}
                  language={language}
                />
              )}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {t('booking.slotsFor')} {format(selectedDate, 'd MMMM', { locale })}
                </label>
                
                <TimeSlotGrid
                  slots={slots}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  loading={slotsLoading}
                  t={t}
                />

                {/* Real-time indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {t('booking.realTimeUpdate')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 space-y-4 border border-primary/20">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                {t('booking.summary')}
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-muted-foreground">{t('booking.practitioner')}</span>
                  <span className="font-medium">{providerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-muted-foreground">{t('booking.patient')}</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-muted-foreground">{t('booking.date')}</span>
                  <span className="font-medium">
                    {selectedDate && format(selectedDate, 'EEEE d MMMM yyyy', { locale })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-muted-foreground">{t('booking.time')}</span>
                  <Badge variant="secondary" className="font-mono">{selectedTime}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-primary/10">
                  <span className="text-muted-foreground">{t('booking.contact')}</span>
                  <span className="font-medium">{phone}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-primary/10">
                  <span className="text-muted-foreground">Type</span>
                  {urgency === 'urgent' ? (
                    <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 gap-1">
                      <AlertTriangle className="h-3 w-3" /> Urgent
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Routine</Badge>
                  )}
                </div>
                {email && (
                  <div className="flex justify-between py-2 border-t border-primary/10">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{email}</span>
                  </div>
                )}
                {notes && (
                  <div className="pt-3 mt-2 border-t border-primary/10">
                    <span className="text-muted-foreground">{t('booking.notes')}:</span>
                    <p className="mt-1 bg-background/50 rounded-lg p-2">{notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                <span className="text-lg">📧</span>
                <span>
                  {t('booking.confirmationEmail')}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              if (step === 'details') {
                onOpenChange(false);
              } else {
                setStep(step === 'datetime' ? 'details' : 'datetime');
              }
            }}
            disabled={createAppointmentMutation.isPending}
          >
            {step === 'details' ? t('common.cancel') : t('common.back')}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed() || createAppointmentMutation.isPending}
            className="min-w-[140px]"
          >
            {createAppointmentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('booking.reserving')}
              </>
            ) : (
              step === 'confirm' ? t('common.confirm') : t('common.next')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};