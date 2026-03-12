import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { 
  Eye, Phone, Heart, TrendingUp, TrendingDown, Calendar,
  Download, RefreshCw, Loader2, Mail, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getProviderStats, 
  getDailyStats,
  type ProviderStats, 
  type DailyStats 
} from '@/services/providerAnalyticsService';

interface AnalyticsChartsProps {
  providerId: string;
  providerUserId?: string;
  className?: string;
}

export function AnalyticsCharts({ providerId, providerUserId, className }: AnalyticsChartsProps) {
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  const analyticsId = providerUserId || providerId;

  useEffect(() => {
    loadStats();
  }, [analyticsId, period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [providerStats, daily] = await Promise.all([
        getProviderStats(analyticsId, parseInt(period)),
        getDailyStats(analyticsId, parseInt(period)),
      ]);
      setStats(providerStats);
      setDailyStats(daily);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  // Pie chart data for contact types
  const contactPieData = stats ? [
    { name: 'Téléphone', value: stats.phoneClicks, color: 'hsl(var(--primary))' },
    { name: 'Email', value: stats.emailClicks, color: 'hsl(var(--chart-2))' },
    { name: 'WhatsApp', value: stats.whatsappClicks, color: 'hsl(142 76% 36%)' },
  ].filter(d => d.value > 0) : [];

  // Stats cards config
  const statsCards = stats ? [
    {
      title: 'Vues du profil',
      value: stats.profileViews,
      trend: stats.profileViewsTrend,
      icon: Eye,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Appels reçus',
      value: stats.phoneClicks,
      trend: stats.phoneClicksTrend,
      icon: Phone,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Ajouts favoris',
      value: stats.favoritesCount,
      trend: stats.favoritesTrend,
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Demandes RDV',
      value: stats.appointmentRequests,
      trend: 0,
      icon: Calendar,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ] : [];

  const TrendBadge = ({ trend }: { trend: number }) => (
    <Badge 
      variant="secondary" 
      className={cn(
        "text-xs",
        trend > 0 && "bg-green-500/10 text-green-600",
        trend < 0 && "bg-red-500/10 text-red-600",
        trend === 0 && "bg-muted text-muted-foreground"
      )}
    >
      {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : 
       trend < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
      {trend > 0 ? '+' : ''}{trend}%
    </Badge>
  );

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistiques</h2>
          <p className="text-muted-foreground">Performances de votre profil</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: '7' | '30' | '90') => setPeriod(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <TrendBadge trend={card.trend} />
                </div>
                <div className={cn("p-3 rounded-full", card.bg)}>
                  <card.icon className={cn("h-6 w-6", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des vues</CardTitle>
            <CardDescription>Vues du profil sur la période sélectionnée</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(label) => formatDate(label as string)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Vues"
                    stroke="hsl(var(--primary))"
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contact Clicks Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts par jour</CardTitle>
            <CardDescription>Clics sur les moyens de contact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    labelFormatter={(label) => formatDate(label as string)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="contacts" 
                    name="Contacts"
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contact Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des contacts</CardTitle>
            <CardDescription>Par type de contact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {contactPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contactPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contactPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Aucune donnée de contact</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorites Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des favoris</CardTitle>
          <CardDescription>Nombre d'ajouts aux favoris par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  labelFormatter={(label) => formatDate(label as string)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="favorites"
                  name="Favoris"
                  stroke="hsl(0 72% 51%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(0 72% 51%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ad Performance (if applicable) */}
      {stats && stats.adViews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance des annonces</CardTitle>
            <CardDescription>Vues et clics sur vos annonces publicitaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{stats.adViews}</p>
                <p className="text-sm text-muted-foreground">Impressions</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{stats.adClicks}</p>
                <p className="text-sm text-muted-foreground">Clics</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{stats.adCTR}%</p>
                <p className="text-sm text-muted-foreground">Taux de clic</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
