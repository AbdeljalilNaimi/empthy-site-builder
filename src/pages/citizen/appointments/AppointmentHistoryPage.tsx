import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History, Search, ArrowLeft, CalendarDays, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { useRealtimePatientAppointments } from '@/hooks/useAppointments';
import LoadingSpinner from '@/components/LoadingSpinner';

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function AppointmentHistoryPage() {
  const { appointments, loading } = useRealtimePatientAppointments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  // Available months from data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    appointments.forEach((a) => {
      try {
        const d = parseISO(a.dateTime);
        months.add(`${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`);
      } catch { /* skip */ }
    });
    return Array.from(months).sort().reverse();
  }, [appointments]);

  // Filtered & sorted appointments
  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        // Search by provider name
        if (search && !a.providerName.toLowerCase().includes(search.toLowerCase())) return false;
        // Status filter
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        // Month filter
        if (monthFilter !== 'all') {
          try {
            const d = parseISO(a.dateTime);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            if (key !== monthFilter) return false;
          } catch { return false; }
        }
        return true;
      })
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [appointments, search, statusFilter, monthFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    return { total, completed, cancelled };
  }, [appointments]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-wide section-spacing-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/citizen/appointments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Historique complet
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Tous vos rendez-vous médicaux, passés et présents
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Terminés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
              <p className="text-xs text-muted-foreground">Annulés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par praticien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
            <SelectItem value="cancelled">Annulés</SelectItem>
            <SelectItem value="confirmed">Confirmés</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les périodes</SelectItem>
            {availableMonths.map((m) => {
              const [year, month] = m.split('-');
              return (
                <SelectItem key={m} value={m}>
                  {MONTHS_FR[parseInt(month)]} {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {(search || statusFilter !== 'all' || monthFilter !== 'all') && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Appointment list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-semibold">Aucun rendez-vous trouvé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search || statusFilter !== 'all' || monthFilter !== 'all'
                  ? 'Essayez de modifier vos filtres.'
                  : "Vous n'avez pas encore de rendez-vous."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((a) => (
            <AppointmentCard key={a.id} appointment={a} showActions={false} showHistory />
          ))
        )}
      </div>
    </div>
  );
}
