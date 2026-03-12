import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, RefreshCw, TrendingUp, TrendingDown, Users, Building2, Star, Calendar, ShieldX } from 'lucide-react';
import {
  getPlatformStats,
  getDailyStats,
  getProvidersByType,
  getVerificationStats,
  type PlatformStats,
  type DailyStats,
  type ProviderTypeCount,
  type VerificationStats,
} from '@/services/platformAnalyticsService';
import { isPermissionError } from '@/utils/errorHandling';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {change > 0 ? '+' : ''}{change}% vs semaine dernière
                </span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsCharts() {
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [providerTypes, setProviderTypes] = useState<ProviderTypeCount[]>([]);
  const [verificationStats, setVerificationStats] = useState<VerificationStats[]>([]);

  const loadData = async () => {
    setLoading(true);
    setPermissionError(false);
    try {
      const [platformStats, daily, types, verification] = await Promise.all([
        getPlatformStats(),
        getDailyStats(parseInt(period)),
        getProvidersByType(),
        getVerificationStats(),
      ]);
      
      setStats(platformStats);
      setDailyStats(daily);
      setProviderTypes(types);
      setVerificationStats(verification);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      if (isPermissionError(error)) {
        setPermissionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const exportToCSV = () => {
    const csv = dailyStats.map(d => 
      `${d.date},${d.newUsers},${d.newProviders},${d.appointments},${d.pageViews}`
    ).join('\n');
    
    const blob = new Blob([`Date,Nouveaux Utilisateurs,Nouveaux Prestataires,Rendez-vous,Vues\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${period}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShieldX className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès refusé</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Vous n'avez pas les permissions nécessaires pour accéder aux analytiques. 
            Veuillez vous connecter avec un compte administrateur.
          </p>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as '7' | '30' | '90')}>
          <TabsList>
            <TabsTrigger value="7">7 jours</TabsTrigger>
            <TabsTrigger value="30">30 jours</TabsTrigger>
            <TabsTrigger value="90">90 jours</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Utilisateurs"
          value={stats?.totalCitizens || 0}
          change={12}
          trend="up"
          icon={<Users className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Prestataires"
          value={stats?.totalProviders || 0}
          change={8}
          trend="up"
          icon={<Building2 className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Note Moyenne"
          value={stats?.averageRating?.toFixed(1) || '0.0'}
          change={2}
          trend="up"
          icon={<Star className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Rendez-vous Aujourd'hui"
          value={stats?.appointmentsToday || 0}
          change={-5}
          trend="down"
          icon={<Calendar className="h-6 w-6 text-primary" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Croissance des Utilisateurs</CardTitle>
            <CardDescription>Nouveaux utilisateurs et prestataires par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(v) => new Date(v).toLocaleDateString('fr-FR')}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  name="Utilisateurs"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="newProviders" 
                  name="Prestataires"
                  stroke="hsl(142.1 76.2% 36.3%)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointments Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activité des Rendez-vous</CardTitle>
            <CardDescription>Rendez-vous pris par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(v) => new Date(v).toLocaleDateString('fr-FR')}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="appointments" 
                  name="Rendez-vous"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Types Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Prestataires par Type</CardTitle>
            <CardDescription>Distribution des types de prestataires</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  className="text-xs"
                  width={80}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Bar dataKey="count" name="Nombre">
                  {providerTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Verification Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Statut de Vérification</CardTitle>
            <CardDescription>Distribution des statuts de vérification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={verificationStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {verificationStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la Plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{stats?.verifiedProviders || 0}</p>
              <p className="text-xs text-muted-foreground">Vérifiés</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-amber-500">{stats?.pendingProviders || 0}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{stats?.rejectedProviders || 0}</p>
              <p className="text-xs text-muted-foreground">Rejetés</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalAppointments || 0}</p>
              <p className="text-xs text-muted-foreground">Total RDV</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
              <p className="text-xs text-muted-foreground">Avis</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats?.totalAdmins || 0}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
