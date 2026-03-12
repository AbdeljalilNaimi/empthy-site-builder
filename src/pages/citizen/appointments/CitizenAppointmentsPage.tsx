import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search, Clock, History, Archive, AlertTriangle, Filter, ArrowUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { PostAppointmentReviewWidget } from '@/components/appointments/PostAppointmentReviewWidget';
import { useRealtimePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function CitizenAppointmentsPage() {
  const { appointments, loading } = useRealtimePatientAppointments();
  const cancelMutation = useCancelAppointment();

  // Filter state for upcoming
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const now = useMemo(() => new Date(), []);

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => {
          const d = new Date(a.dateTime);
          return d >= now && (a.status === 'pending' || a.status === 'confirmed');
        })
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [appointments, now]
  );

  // Filtered upcoming
  const filteredUpcoming = useMemo(() => {
    const filtered = upcoming.filter((a) => {
      if (searchQuery && !a.providerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (urgencyFilter !== 'all' && (a.urgency || 'routine') !== urgencyFilter) return false;
      return true;
    });
    if (sortOrder === 'desc') return [...filtered].reverse();
    return filtered;
  }, [upcoming, searchQuery, statusFilter, urgencyFilter, sortOrder]);

  const past = useMemo(
    () =>
      appointments
        .filter((a) => {
          const d = new Date(a.dateTime);
          return d < now || a.status === 'completed' || a.status === 'cancelled';
        })
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    [appointments, now]
  );

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => toast.success('Rendez-vous annulé'),
      onError: () => toast.error('Erreur lors de l\'annulation'),
    });
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || urgencyFilter !== 'all';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-wide section-spacing-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Mes Rendez-vous
          </h1>
          <p className="text-muted-foreground mt-1">Gérez vos rendez-vous médicaux</p>
        </div>
        <Button asChild>
          <Link to="/search">
            <Search className="h-4 w-4 mr-2" />
            Prendre un RDV
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-1.5">
            <Clock className="h-4 w-4" />
            À venir ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-1.5">
            <History className="h-4 w-4" />
            Passés ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {/* Filters */}
          {upcoming.length > 0 && (
            <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un praticien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmés</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute urgence</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Plus proche d\'abord' : 'Plus loin d\'abord'}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tri : {sortOrder === 'asc' ? 'Plus proche d\'abord' : 'Plus loin d\'abord'}
            </p>
            </>
          )}

          {/* Results info */}
          {hasActiveFilters && upcoming.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredUpcoming.length} sur {upcoming.length} rendez-vous
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); setUrgencyFilter('all'); }}
              >
                Réinitialiser
              </Button>
            </div>
          )}

          <div className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-10 w-10 text-muted-foreground" />}
              title="Aucun rendez-vous à venir"
              description="Recherchez un professionnel de santé pour prendre rendez-vous."
              cta={
                <Button asChild variant="outline">
                  <Link to="/search">Chercher un praticien</Link>
                </Button>
              }
            />
          ) : filteredUpcoming.length === 0 ? (
            <EmptyState
              icon={<Search className="h-10 w-10 text-muted-foreground" />}
              title="Aucun résultat"
              description="Essayez de modifier vos filtres de recherche."
            />
          ) : (
            filteredUpcoming.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                onCancel={handleCancel}
                isCancelling={cancelMutation.isPending}
              />
            ))
          )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          <div className="flex justify-end mb-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/citizen/appointments/history">
                <Archive className="h-4 w-4 mr-2" />
                Voir tout l'historique
              </Link>
            </Button>
          </div>
          {past.length === 0 ? (
            <EmptyState
              icon={<History className="h-10 w-10 text-muted-foreground" />}
              title="Aucun rendez-vous passé"
              description="Vos rendez-vous terminés ou annulés apparaîtront ici."
            />
          ) : (
            past.map((a) => (
              <AppointmentCard key={a.id} appointment={a} showActions={false} />
            ))
          )}
        </TabsContent>
      </Tabs>
      <PostAppointmentReviewWidget appointments={appointments} />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
