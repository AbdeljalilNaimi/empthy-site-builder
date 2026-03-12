import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Settings,
  User,
  Building2,
  Megaphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getRecentAuditLogs, type AuditLogEntry, type AuditAction } from '@/services/auditLogService';

const ACTION_LABELS: Record<AuditAction, string> = {
  provider_approved: 'Prestataire approuvé',
  provider_rejected: 'Prestataire rejeté',
  provider_edited: 'Prestataire modifié',
  provider_deleted: 'Prestataire supprimé',
  ad_approved: 'Annonce approuvée',
  ad_rejected: 'Annonce rejetée',
  user_role_changed: 'Rôle utilisateur modifié',
  settings_changed: 'Paramètres modifiés',
};

const ACTION_ICONS: Record<AuditAction, React.ReactNode> = {
  provider_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  provider_rejected: <XCircle className="h-4 w-4 text-red-500" />,
  provider_edited: <Edit className="h-4 w-4 text-blue-500" />,
  provider_deleted: <Trash2 className="h-4 w-4 text-red-500" />,
  ad_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  ad_rejected: <XCircle className="h-4 w-4 text-red-500" />,
  user_role_changed: <User className="h-4 w-4 text-purple-500" />,
  settings_changed: <Settings className="h-4 w-4 text-amber-500" />,
};

const ACTION_COLORS: Record<AuditAction, string> = {
  provider_approved: 'card-status-success',
  provider_rejected: 'card-status-error',
  provider_edited: 'card-status-info',
  provider_deleted: 'card-status-error',
  ad_approved: 'card-status-success',
  ad_rejected: 'card-status-error',
  user_role_changed: 'bg-purple-100 text-purple-800',
  settings_changed: 'card-status-warning',
};

const TARGET_ICONS: Record<string, React.ReactNode> = {
  provider: <Building2 className="h-4 w-4" />,
  ad: <Megaphone className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
};

export function AuditLogViewer() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getRecentAuditLogs(200);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !log.adminEmail.toLowerCase().includes(search) &&
        !log.targetId.toLowerCase().includes(search) &&
        !(log.reason?.toLowerCase().includes(search))
      ) {
        return false;
      }
    }

    // Action filter
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }

    // Target type filter
    if (targetTypeFilter !== 'all' && log.targetType !== targetTypeFilter) {
      return false;
    }

    // Date range filter
    if (dateRange.from && log.timestamp?.toDate) {
      const logDate = log.timestamp.toDate();
      if (logDate < dateRange.from) return false;
      if (dateRange.to && logDate > dateRange.to) return false;
    }

    return true;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Admin', 'Action', 'Type Cible', 'ID Cible', 'Raison', 'Détails'];
    const rows = filteredLogs.map((log) => [
      log.timestamp?.toDate ? format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
      log.adminEmail,
      ACTION_LABELS[log.action],
      log.targetType,
      log.targetId,
      log.reason || '',
      log.details ? JSON.stringify(log.details) : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setTargetTypeFilter('all');
    setDateRange({});
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Journal d'Audit
              </CardTitle>
              <CardDescription>
                Historique des actions administratives sur la plateforme
              </CardDescription>
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par admin, cible..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Target Type Filter */}
            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="provider">Prestataires</SelectItem>
                <SelectItem value="ad">Annonces</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
                <SelectItem value="settings">Paramètres</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  {dateRange.from
                    ? `${format(dateRange.from, 'dd/MM/yyyy')}${dateRange.to ? ` - ${format(dateRange.to, 'dd/MM/yyyy')}` : ''}`
                    : 'Période'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(searchTerm || actionFilter !== 'all' || targetTypeFilter !== 'all' || dateRange.from) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Raison</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    Aucune entrée trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {log.timestamp?.toDate
                        ? format(log.timestamp.toDate(), 'dd MMM yyyy HH:mm', { locale: fr })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{log.adminEmail}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ACTION_ICONS[log.action]}
                        <Badge className={ACTION_COLORS[log.action]}>
                          {ACTION_LABELS[log.action]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {TARGET_ICONS[log.targetType]}
                        <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                          {log.targetId.length > 20
                            ? `${log.targetId.slice(0, 8)}...${log.targetId.slice(-8)}`
                            : log.targetId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      {log.reason ? (
                        <span className="text-sm text-muted-foreground truncate block">
                          {log.reason}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination info */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Affichage de {filteredLogs.length} entrées sur {logs.length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
