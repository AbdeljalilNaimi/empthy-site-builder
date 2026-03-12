import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle, Flag, Megaphone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BaseReport {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter_id: string;
}

interface ProviderReport extends BaseReport {
  provider_id: string;
}

interface AdReport extends BaseReport {
  ad_id: string;
}

interface CommunityReport extends BaseReport {
  post_id: string | null;
  comment_id: string | null;
}

type StatusFilter = 'all' | 'pending' | 'resolved' | 'dismissed';
type ReportCategory = 'providers' | 'ads' | 'community';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  resolved: { label: 'Traité', variant: 'default' },
  dismissed: { label: 'Rejeté', variant: 'outline' },
};

function ReportTable({ 
  reports, 
  isLoading, 
  filter, 
  onUpdateStatus,
  isPending,
  columns,
}: { 
  reports: BaseReport[];
  isLoading: boolean;
  filter: StatusFilter;
  onUpdateStatus: (id: string, status: string) => void;
  isPending: boolean;
  columns: { key: string; label: string; render: (r: any) => React.ReactNode }[];
}) {
  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p>Aucun signalement trouvé</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
          <TableHead>Raison</TableHead>
          <TableHead>Détails</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map(report => {
          const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
          return (
            <TableRow key={report.id}>
              {columns.map(col => (
                <TableCell key={col.key}>{col.render(report)}</TableCell>
              ))}
              <TableCell className="text-sm">{report.reason}</TableCell>
              <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground">
                {report.details || '—'}
              </TableCell>
              <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(report.created_at), 'dd MMM yyyy', { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                {report.status === 'pending' && (
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onUpdateStatus(report.id, 'resolved')} disabled={isPending}>
                      <CheckCircle className="h-4 w-4 mr-1" />Traité
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10"
                      onClick={() => onUpdateStatus(report.id, 'dismissed')} disabled={isPending}>
                      <XCircle className="h-4 w-4 mr-1" />Rejeter
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function ReportsModerationPanel() {
  const [category, setCategory] = useState<ReportCategory>('providers');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Provider reports
  const { data: providerReports = [], isLoading: loadingProviders } = useQuery({
    queryKey: ['admin-provider-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('provider_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProviderReport[];
    },
  });

  // Ad reports
  const { data: adReports = [], isLoading: loadingAds } = useQuery({
    queryKey: ['admin-ad-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ad_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AdReport[];
    },
  });

  // Community reports
  const { data: communityReports = [], isLoading: loadingCommunity } = useQuery({
    queryKey: ['admin-community-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('community_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CommunityReport[];
    },
  });

  const updateProviderReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('provider_reports').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-provider-reports'] }); toast({ title: 'Statut mis à jour' }); },
    onError: () => { toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' }); },
  });

  const updateAdReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('ad_reports').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-ad-reports'] }); toast({ title: 'Statut mis à jour' }); },
    onError: () => { toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' }); },
  });

  const updateCommunityReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('community_reports').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-community-reports'] }); toast({ title: 'Statut mis à jour' }); },
    onError: () => { toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' }); },
  });

  const pendingCounts = {
    providers: providerReports.filter(r => r.status === 'pending').length,
    ads: adReports.filter(r => r.status === 'pending').length,
    community: communityReports.filter(r => r.status === 'pending').length,
  };

  const totalPending = pendingCounts.providers + pendingCounts.ads + pendingCounts.community;

  const currentReports = category === 'providers' ? providerReports : category === 'ads' ? adReports : communityReports;
  const counts = {
    all: currentReports.length,
    pending: currentReports.filter(r => r.status === 'pending').length,
    resolved: currentReports.filter(r => r.status === 'resolved').length,
    dismissed: currentReports.filter(r => r.status === 'dismissed').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-destructive" />
          <div>
            <CardTitle>Modération des signalements</CardTitle>
            <CardDescription>{totalPending} signalement(s) en attente au total</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category tabs */}
        <Tabs value={category} onValueChange={(v) => { setCategory(v as ReportCategory); setFilter('all'); }}>
          <TabsList>
            <TabsTrigger value="providers" className="gap-2">
              <Flag className="h-4 w-4" />
              Profils {pendingCounts.providers > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{pendingCounts.providers}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Annonces {pendingCounts.ads > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{pendingCounts.ads}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Communauté {pendingCounts.community > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{pendingCounts.community}</Badge>}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status filter */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">Tous ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({counts.pending})</TabsTrigger>
            <TabsTrigger value="resolved">Traités ({counts.resolved})</TabsTrigger>
            <TabsTrigger value="dismissed">Rejetés ({counts.dismissed})</TabsTrigger>
          </TabsList>
        </Tabs>

        {category === 'providers' && (
          <ReportTable
            reports={providerReports}
            isLoading={loadingProviders}
            filter={filter}
            onUpdateStatus={(id, status) => updateProviderReport.mutate({ id, status })}
            isPending={updateProviderReport.isPending}
            columns={[
              { key: 'provider_id', label: 'Provider ID', render: (r: ProviderReport) => <span className="font-mono text-xs max-w-[120px] truncate block">{r.provider_id}</span> },
              { key: 'reporter_id', label: 'Reporter ID', render: (r: ProviderReport) => <span className="font-mono text-xs max-w-[120px] truncate block">{r.reporter_id}</span> },
            ]}
          />
        )}

        {category === 'ads' && (
          <ReportTable
            reports={adReports}
            isLoading={loadingAds}
            filter={filter}
            onUpdateStatus={(id, status) => updateAdReport.mutate({ id, status })}
            isPending={updateAdReport.isPending}
            columns={[
              { key: 'ad_id', label: 'Annonce ID', render: (r: AdReport) => <span className="font-mono text-xs max-w-[120px] truncate block">{r.ad_id}</span> },
              { key: 'reporter_id', label: 'Reporter ID', render: (r: AdReport) => <span className="font-mono text-xs max-w-[120px] truncate block">{r.reporter_id}</span> },
            ]}
          />
        )}

        {category === 'community' && (
          <ReportTable
            reports={communityReports}
            isLoading={loadingCommunity}
            filter={filter}
            onUpdateStatus={(id, status) => updateCommunityReport.mutate({ id, status })}
            isPending={updateCommunityReport.isPending}
            columns={[
              { key: 'target', label: 'Cible', render: (r: CommunityReport) => (
                <span className="font-mono text-xs">
                  {r.post_id ? `Post: ${r.post_id.slice(0, 8)}...` : r.comment_id ? `Comment: ${r.comment_id.slice(0, 8)}...` : '—'}
                </span>
              )},
              { key: 'reporter_id', label: 'Reporter ID', render: (r: CommunityReport) => <span className="font-mono text-xs max-w-[120px] truncate block">{r.reporter_id}</span> },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
