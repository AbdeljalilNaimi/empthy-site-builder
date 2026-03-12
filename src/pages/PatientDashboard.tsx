import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, Clock, Star, CheckCircle, XCircle, AlertCircle,
  Download, FileText, Loader2, Bell, BellOff, Trash2, ExternalLink,
  Search, Map, Siren, Bot, Droplets, Users, Megaphone, BookOpen,
  User, Heart, CalendarCheck, Gift, MessageSquare, Package
} from 'lucide-react';
import { AppointmentDetailDialog } from '@/components/appointments/AppointmentDetailDialog';
import { useProfileScore } from '@/hooks/useProfileScore';
import { ProfileCompletionWidget } from '@/components/patient/ProfileCompletionWidget';
import { getEmergencyCard, EmergencyHealthCard } from '@/services/emergencyCardService';
import { useRealtimePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { usePatientSupabaseReviews } from '@/hooks/useSupabaseReviews';
import { useFavorites } from '@/hooks/useFavorites';
import { useMyOffers } from '@/hooks/useProvide';
import { PostAppointmentReviewWidget } from '@/components/appointments/PostAppointmentReviewWidget';
import { DashboardEmptyState } from '@/components/citizen/DashboardEmptyState';
import { PatientReviewsManager } from '@/components/patient/PatientReviewsManager';
import { Appointment } from '@/types/appointments';
import { PROVIDE_STATUS_KEYS } from '@/types/provide';
import { toast } from 'sonner';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';
import { format } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import jsPDF from 'jspdf';

// Provider data for favorites display
import { providers as allProviders } from '@/data/providers';

const PatientDashboard = () => {
  const { profile, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [emergencyCard, setEmergencyCard] = useState<EmergencyHealthCard | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user?.uid) {
      getEmergencyCard(user.uid).then(setEmergencyCard).catch(console.error);
    }
  }, [user?.uid]);

  const scoreData = useProfileScore(profile, emergencyCard);
  const { appointments, loading: appointmentsLoading } = useRealtimePatientAppointments();
  const { mutate: cancelAppointmentMutation, isPending: isCancelling } = useCancelAppointment();
  const { data: reviews = [], isLoading: reviewsLoading } = usePatientSupabaseReviews(user?.uid);
  const { data: favoriteIds = [] } = useFavorites();
  const { offers, loading: offersLoading } = useMyOffers();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useAppointmentNotifications(appointments);

  const locales: Record<string, typeof fr> = { fr, ar, en: enUS };
  const d = t('citizenDashboard' as any, 'greeting' as any) !== 'citizenDashboard.greeting'
    ? (key: string) => t('citizenDashboard' as any, key as any)
    : (key: string) => key;

  const handleCancelAppointment = (id: string) => {
    cancelAppointmentMutation(id, {
      onSuccess: () => toast.success(t('appointments', 'cancelSuccess')),
      onError: () => toast.error(t('appointments', 'cancelError')),
    });
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastAppointments = appointments
    .filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const filteredPastAppointments = historyFilter === 'all'
    ? pastAppointments
    : pastAppointments.filter(apt => apt.status === historyFilter);

  const favoriteProviders = allProviders.filter(p => favoriteIds.includes(p.id));

  const getStatusBadge = (status: Appointment['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, label: t('appointments', 'pending') },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: t('appointments', 'confirmed') },
      cancelled: { variant: 'destructive' as const, icon: XCircle, label: t('appointments', 'cancelled') },
      completed: { variant: 'outline' as const, icon: CheckCircle, label: t('appointments', 'completed') },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const locale = locales[language] || fr;

    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text(`${t('appointments', 'myDashboard')} - CityHealth`, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t('appointments', 'exportPDF')} ${format(new Date(), 'PPP', { locale })}`, pageWidth / 2, 28, { align: 'center' });

    let yPosition = 45;

    if (upcomingAppointments.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(t('appointments', 'upcoming'), 14, yPosition);
      yPosition += 10;
      upcomingAppointments.forEach((apt) => {
        if (yPosition > 270) { doc.addPage(); yPosition = 20; }
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`• ${apt.providerName}`, 14, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`  ${t('appointments', 'date')}: ${format(new Date(apt.dateTime), 'PPP p', { locale })}`, 14, yPosition);
        yPosition += 5;
        if (apt.notes) { doc.text(`  Notes: ${apt.notes}`, 14, yPosition); yPosition += 5; }
        yPosition += 5;
      });
    }

    if (pastAppointments.length > 0) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(t('appointments', 'history'), 14, yPosition);
      yPosition += 10;
      pastAppointments.slice(0, 10).forEach((apt) => {
        if (yPosition > 270) { doc.addPage(); yPosition = 20; }
        doc.setFontSize(12);
        doc.setTextColor(apt.status === 'cancelled' ? 150 : 0);
        doc.text(`• ${apt.providerName} (${apt.status === 'completed' ? t('appointments', 'completed') : t('appointments', 'cancelled')})`, 14, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`  ${t('appointments', 'date')}: ${format(new Date(apt.dateTime), 'PPP', { locale })}`, 14, yPosition);
        yPosition += 8;
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('CityHealth - Sidi Bel Abbès', pageWidth / 2, 290, { align: 'center' });
    doc.save(`rendez-vous-cityhealth-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success(t('appointments', 'exportPDF'));
  };

  const quickServices = [
    { label: d('searchProvider'), description: d('searchProviderDesc'), icon: Search, href: '/search', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: d('interactiveMap'), description: d('interactiveMapDesc'), icon: Map, href: '/map/providers', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: d('emergencies'), description: d('emergenciesDesc'), icon: Siren, href: '/emergency', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { label: d('aiAssistant'), description: d('aiAssistantDesc'), icon: Bot, href: '/medical-assistant', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
    { label: d('bloodDonation'), description: d('bloodDonationDesc'), icon: Droplets, href: '/blood-donation', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
    { label: d('communityHub'), description: d('communityHubDesc'), icon: Users, href: '/community', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
    { label: d('medicalAds'), description: d('medicalAdsDesc'), icon: Megaphone, href: '/annonces', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: d('medicalResearch'), description: d('medicalResearchDesc'), icon: BookOpen, href: '/research', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { label: d('myProfile'), description: d('myProfileDesc'), icon: User, href: '/profile', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
    { label: d('myFavorites'), description: d('myFavoritesDesc'), icon: Heart, href: '/favorites', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { label: d('appointments'), description: d('appointmentsDesc'), icon: CalendarCheck, href: '/citizen/appointments', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
    { label: d('freeGiving'), description: d('freeGivingDesc'), icon: Gift, href: '/citizen/provide', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  ];

  const greeting = new Date().getHours() < 18 ? d('greeting') : (language === 'ar' ? 'مساء الخير' : language === 'en' ? 'Good evening' : 'Bonsoir');
  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: locales[language] || fr });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                {greeting}, {profile?.full_name?.split(' ')[0] || 'Patient'} 👋
              </h1>
              <p className="text-muted-foreground capitalize">{today}</p>
            </div>
            {appointments.length > 0 && (
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                <FileText className="h-4 w-4" />
                {t('appointments', 'exportPDF')}
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <ProfileCompletionWidget scoreData={scoreData} compact onNavigateTab={() => navigate('/profile')} />
            {[
              { label: t('appointments', 'upcomingCount'), value: upcomingAppointments.length, icon: Calendar, iconBg: 'bg-blue-100 text-blue-600', accent: upcomingAppointments.length > 0 ? 'border-l-4 border-l-blue-500' : '' },
              { label: t('appointments', 'totalCount'), value: appointments.length, icon: Clock, iconBg: 'bg-emerald-100 text-emerald-600', accent: '' },
              { label: t('appointments', 'reviewsGiven'), value: reviews.length, icon: Star, iconBg: 'bg-amber-100 text-amber-600', accent: '' },
            ].map((stat) => (
              <Card key={stat.label} className={`hover-lift overflow-hidden ${stat.accent}`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ====== MAIN TABBED HUB ====== */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="w-full bg-muted/50 p-1 rounded-xl flex flex-wrap gap-1">
              {([
                { value: 'upcoming', label: d('tabUpcoming'), icon: Calendar, badge: upcomingAppointments.length || undefined },
                { value: 'history', label: d('tabHistory'), icon: Clock, badge: undefined },
                { value: 'notifications', label: d('tabNotifications'), icon: Bell, badge: unreadCount || undefined },
                { value: 'offers', label: d('tabOffers'), icon: Package, badge: offers.length || undefined },
                { value: 'reviews', label: d('tabReviews'), icon: Star, badge: reviews.length || undefined },
                { value: 'favorites', label: d('tabFavorites'), icon: Heart, badge: favoriteProviders.length || undefined },
              ]).map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm gap-1.5 px-2 sm:px-3 relative flex-1 min-w-[80px]"
                >
                  <tab.icon className="h-4 w-4 shrink-0 hidden sm:block" />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge != null && tab.badge > 0 && (
                    <span className={cn(
                      "text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center",
                      tab.value === 'notifications' ? "bg-destructive text-destructive-foreground" : "bg-muted-foreground/20 text-foreground"
                    )}>
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Tab: Upcoming Appointments ── */}
            <TabsContent value="upcoming" className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <DashboardEmptyState
                  icon={Calendar}
                  title={d('emptyUpcoming')}
                  hint={d('emptyUpcomingHint')}
                  ctaLabel={d('findDoctor')}
                  ctaHref="/search"
                />
              ) : (
                upcomingAppointments.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-md transition-all group cursor-pointer" onClick={() => setSelectedAppointment(apt)}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="shrink-0 h-11 w-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/provider/${apt.providerId.replace(/^provider_/, '')}`}
                              className="font-semibold text-base hover:text-primary transition-colors inline-flex items-center gap-1.5 group/link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="truncate">{apt.providerName}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(apt.dateTime), 'PPP', { locale: locales[language] })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {format(new Date(apt.dateTime), 'p', { locale: locales[language] })}
                              </span>
                            </div>
                            {apt.notes && <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">{apt.notes}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {getStatusBadge(apt.status)}
                          {apt.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                              onClick={(e) => { e.stopPropagation(); handleCancelAppointment(apt.id); }}
                              disabled={isCancelling}
                            >
                              {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><XCircle className="h-3.5 w-3.5 mr-1" />{t('appointments', 'cancel')}</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* ── Tab: History ── */}
            <TabsContent value="history" className="space-y-3">
              {pastAppointments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {([
                    { value: 'all' as const, label: d('allFilter'), count: pastAppointments.length },
                    { value: 'completed' as const, label: d('completedFilter'), count: pastAppointments.filter(a => a.status === 'completed').length },
                    { value: 'cancelled' as const, label: d('cancelledFilter'), count: pastAppointments.filter(a => a.status === 'cancelled').length },
                    { value: 'confirmed' as const, label: d('confirmedFilter'), count: pastAppointments.filter(a => a.status === 'confirmed').length },
                    { value: 'pending' as const, label: d('pendingFilter'), count: pastAppointments.filter(a => a.status === 'pending').length },
                  ]).filter(f => f.value === 'all' || f.count > 0).map((filter) => (
                    <Button
                      key={filter.value}
                      variant={historyFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs rounded-full gap-1.5"
                      onClick={() => setHistoryFilter(filter.value)}
                    >
                      {filter.label}
                      <span className={cn(
                        "text-[10px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center",
                        historyFilter === filter.value ? "bg-primary-foreground/20" : "bg-muted"
                      )}>
                        {filter.count}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
              {filteredPastAppointments.length === 0 ? (
                <DashboardEmptyState
                  icon={Clock}
                  title={pastAppointments.length === 0 ? d('emptyHistory') : d('noFilterResults')}
                />
              ) : (
                filteredPastAppointments.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedAppointment(apt)}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="shrink-0 h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/provider/${apt.providerId.replace(/^provider_/, '')}`}
                              className="font-medium hover:text-primary transition-colors inline-flex items-center gap-1.5 group/link"
                            >
                              <span className="truncate">{apt.providerName}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </Link>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(apt.dateTime), 'PPP', { locale: locales[language] })}
                            </p>
                            {apt.notes && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{apt.notes}</p>}
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* ── Tab: Notifications ── */}
            <TabsContent value="notifications" className="space-y-3">
              {notifications.length > 0 && (
                <div className="flex justify-end gap-2 mb-1">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5 h-8 text-xs">
                      <BellOff className="h-3.5 w-3.5" />
                      {d('markAllRead')}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                    {d('clearNotifs')}
                  </Button>
                </div>
              )}
              {notifications.length === 0 ? (
                <DashboardEmptyState
                  icon={Bell}
                  title={d('emptyNotifications')}
                  hint={d('emptyNotificationsHint')}
                />
              ) : (
                notifications.map((notif) => {
                  const statusLabels: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
                    confirmed: { label: d('confirmedFilter'), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    cancelled: { label: d('cancelledFilter'), icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
                    completed: { label: d('completedFilter'), icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
                    pending: { label: d('pendingFilter'), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
                  };
                  const newInfo = statusLabels[notif.newStatus] || statusLabels.pending;
                  const StatusIcon = newInfo.icon;
                  return (
                    <Card
                      key={notif.id}
                      className={cn("transition-all cursor-pointer hover:shadow-md", !notif.read ? 'border-primary/30 bg-primary/5' : '')}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("shrink-0 h-10 w-10 rounded-xl flex items-center justify-center", newInfo.bg, newInfo.color)}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {d('rdvWith')} <span className="font-semibold">{notif.providerName}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {statusLabels[notif.oldStatus]?.label || notif.oldStatus} → <span className={cn("font-semibold", newInfo.color)}>{newInfo.label}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {format(new Date(notif.timestamp), 'dd/MM HH:mm', { locale: locales[language] })}
                            </span>
                            {!notif.read && <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* ── Tab: My Offers / Entraide ── */}
            <TabsContent value="offers" className="space-y-3">
              {offers.length === 0 ? (
                <DashboardEmptyState
                  icon={Package}
                  title={d('emptyOffers')}
                  hint={d('emptyOffersHint')}
                  ctaLabel={d('createOffer')}
                  ctaHref="/citizen/provide/new"
                />
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button asChild size="sm" className="gap-1.5">
                      <Link to="/citizen/provide/new">
                        <Gift className="h-4 w-4" />
                        {d('createOffer')}
                      </Link>
                    </Button>
                  </div>
                  {offers.map((offer) => {
                    const statusKey = PROVIDE_STATUS_KEYS[offer.status];
                    const statusColors: Record<string, string> = {
                      available: 'bg-emerald-100 text-emerald-700',
                      reserved: 'bg-amber-100 text-amber-700',
                      taken: 'bg-muted text-muted-foreground',
                    };
                    return (
                      <Card key={offer.id} className="hover:shadow-sm transition-all">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-3 min-w-0 flex-1">
                              <div className="shrink-0 h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Gift className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{offer.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{offer.description}</p>
                                {offer.location?.label && (
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Map className="h-3 w-3" /> {offer.location.label}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <Badge className={cn("text-xs", statusColors[offer.status] || 'bg-muted')}>
                                {t('offers', statusKey as any)}
                              </Badge>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate(`/citizen/provide/edit/${offer.id}`)}>
                                  {t('common', 'edit')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </TabsContent>

            {/* ── Tab: My Reviews ── */}
            <TabsContent value="reviews" className="space-y-3">
              <PatientReviewsManager reviews={reviews} userId={user?.uid || ''} />
            </TabsContent>

            {/* ── Tab: Favorites ── */}
            <TabsContent value="favorites" className="space-y-3">
              {favoriteProviders.length === 0 ? (
                <DashboardEmptyState
                  icon={Heart}
                  title={d('emptyFavorites')}
                  hint={d('emptyFavoritesHint')}
                  ctaLabel={d('browseProviders')}
                  ctaHref="/search"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {favoriteProviders.map((provider) => (
                    <Card key={provider.id} className="hover:shadow-md transition-all group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          {provider.image && provider.image !== '/placeholder.svg' ? (
                              <img src={provider.image} alt={provider.name} className="h-12 w-12 rounded-xl object-cover" />
                            ) : (
                              <User className="h-6 w-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{provider.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{provider.specialty || provider.type}</p>
                            {provider.city && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Map className="h-3 w-3" /> {provider.city}
                              </p>
                            )}
                          </div>
                          <Heart className="h-4 w-4 text-pink-500 fill-pink-500 shrink-0" />
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 text-xs h-8">
                            <Link to={`/provider/${provider.id}`}>
                              {d('viewProvider')}
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1 text-xs h-8">
                            <Link to={`/provider/${provider.id}`}>
                              <CalendarCheck className="h-3.5 w-3.5 mr-1" />
                              {d('bookAgain')}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Browser Extension Banner */}
          <div className="mt-10">
            <a
              href="https://drive.google.com/file/d/1TzuMuHPs8EsYVSXA03Olya1h8RX31PWm/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">
                  {language === 'ar' ? 'حمّل إضافة CityHealth للمتصفح' : language === 'en' ? 'Download CityHealth Browser Extension' : 'Téléchargez l\'extension CityHealth'}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {language === 'ar' ? 'وصول سريع لخدمات الصحة من متصفحك' : language === 'en' ? 'Quick access to health services from your browser' : 'Accès rapide aux services de santé depuis votre navigateur'}
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
            </a>
          </div>

          {/* Quick Services Scrolling Marquee */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">{d('quickAccess')}</h2>
            <div className="overflow-hidden relative group">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              <div className="flex gap-3 w-max animate-marquee group-hover:[animation-play-state:paused]">
                {[...quickServices, ...quickServices, ...quickServices].map((service, i) => (
                  <Link
                    key={`${service.href}-${i}`}
                    to={service.href}
                    className="shrink-0 w-[180px] p-3.5 rounded-xl border border-border/50 bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 group/card"
                  >
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-2 group-hover/card:scale-110 transition-transform", service.color)}>
                      <service.icon className="h-4 w-4" />
                    </div>
                    <p className="font-medium text-sm text-foreground truncate !text-sm !leading-tight">{service.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 !text-xs !leading-snug">{service.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onOpenChange={(open) => { if (!open) setSelectedAppointment(null); }}
        currentUserId={user?.uid || ''}
        currentUserName={profile?.full_name || ''}
        currentUserRole="patient"
      />

      <PostAppointmentReviewWidget appointments={appointments} />
      <Footer />
    </>
  );
};

export default PatientDashboard;
