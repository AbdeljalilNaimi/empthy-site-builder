import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Key, Activity, FileText, Search } from 'lucide-react';
import { getAllApiKeys, getGlobalUsageStats, getAllLogs, type ApiKey } from '@/services/apiKeyService';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--secondary))', '#10b981', '#f59e0b'];

export function ApiManagementPanel() {
  const [subTab, setSubTab] = useState('keys');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usageData, setUsageData] = useState<{ date: string; requests: number }[]>([]);
  const [endpointStats, setEndpointStats] = useState<{ name: string; value: number }[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apiKeys, usage, allLogs] = await Promise.all([
        getAllApiKeys(),
        getGlobalUsageStats(),
        getAllLogs(200),
      ]);
      setKeys(apiKeys);
      setLogs(allLogs);

      // Aggregate usage by date
      const byDate: Record<string, number> = {};
      const byEndpoint: Record<string, number> = {};
      usage.forEach((u: any) => {
        byDate[u.date] = (byDate[u.date] || 0) + u.request_count;
        byEndpoint[u.endpoint] = (byEndpoint[u.endpoint] || 0) + u.request_count;
      });
      setUsageData(
        Object.entries(byDate).map(([date, requests]) => ({
          date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          requests,
        }))
      );
      setEndpointStats(
        Object.entries(byEndpoint)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );
    } catch (err) {
      console.error('Failed to load API data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      !logSearch ||
      l.endpoint?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.method?.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="keys" className="gap-1"><Key className="h-3.5 w-3.5" /> Clés API</TabsTrigger>
          <TabsTrigger value="usage" className="gap-1"><Activity className="h-3.5 w-3.5" /> Statistiques</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1"><FileText className="h-3.5 w-3.5" /> Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <CardTitle>Clés API ({keys.length})</CardTitle>
              <CardDescription>Liste de toutes les clés API des développeurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Développeur</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Clé</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Limite</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créée le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Aucune clé API enregistrée
                      </TableCell>
                    </TableRow>
                  ) : (
                    keys.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-mono text-xs">{k.developer_id.slice(0, 8)}...</TableCell>
                        <TableCell>{k.app_name || '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{k.key_suffix}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{k.plan}</Badge></TableCell>
                        <TableCell>{k.rate_limit_per_day}/jour</TableCell>
                        <TableCell>
                          <Badge variant={k.is_active ? 'default' : 'destructive'}>
                            {k.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(k.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requêtes (7 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Endpoints les plus utilisés</CardTitle>
              </CardHeader>
              <CardContent>
                {endpointStats.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={endpointStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {endpointStats.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Aucune donnée</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logs API récents</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrer par endpoint..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Temps (ms)</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.endpoint}</TableCell>
                      <TableCell><Badge variant="outline">{l.method}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={l.status_code < 400 ? 'default' : 'destructive'}>{l.status_code}</Badge>
                      </TableCell>
                      <TableCell>{l.response_time_ms || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(l.created_at).toLocaleString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
