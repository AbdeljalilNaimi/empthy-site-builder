import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import {
  Users,
  Building2,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  ArrowRight,
  ShieldX,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { getPlatformStats, type PlatformStats } from '@/services/platformAnalyticsService';
import { getRecentAuditLogs, type AuditLogEntry, type AuditAction } from '@/services/auditLogService';
import { isPermissionError } from '@/utils/errorHandling';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminOverviewProps {
  onTabChange: (tab: string) => void;
}

export function AdminOverview({ onTabChange }: AdminOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const { t, language } = useLanguage();

  const locale = language === 'ar' ? ar : language === 'en' ? enUS : fr;

  const ACTION_LABELS: Record<AuditAction, string> = {
    provider_approved: t('admin', 'providerApproved'),
    provider_rejected: t('admin', 'providerRejected'),
    provider_edited: t('admin', 'providerEdited'),
    provider_deleted: t('admin', 'providerDeleted'),
    ad_approved: t('admin', 'adApproved'),
    ad_rejected: t('admin', 'adRejected'),
    user_role_changed: t('admin', 'roleChanged'),
    settings_changed: t('admin', 'settingsChanged'),
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionError(false);
    try {
      const [platformStats, logs] = await Promise.all([
        getPlatformStats(),
        getRecentAuditLogs(5),
      ]);
      setStats(platformStats);
      setRecentLogs(logs);
    } catch (error) {
      console.error('Failed to load overview data:', error);
      if (isPermissionError(error)) {
        setPermissionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShieldX className="h-12 w-12 text-destructive/60 mb-3" />
          <h3 className="text-sm font-semibold mb-1">{t('admin', 'accessDenied')}</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm">
            {t('admin', 'accessDeniedDesc')}
          </p>
          <Button onClick={loadData} variant="outline" size="sm" className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1.5" />
            {t('admin', 'retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const verificationRate = stats?.totalProviders
    ? Math.round((stats.verifiedProviders / stats.totalProviders) * 100)
    : 0;

  const statCards = [
    { label: t('admin', 'totalProviders'), value: stats?.totalProviders || 0, icon: Building2, change: '+8%', positive: true },
    { label: t('admin', 'pendingLabel'), value: stats?.pendingProviders || 0, icon: Clock, change: null, positive: false },
    { label: t('admin', 'verified'), value: stats?.verifiedProviders || 0, icon: Shield, change: '+12%', positive: true },
    { label: t('admin', 'users'), value: stats?.totalCitizens || 0, icon: Users, change: '+15%', positive: true },
  ];

  const quickLinks = [
    { label: t('admin', 'pendingVerifications'), tab: 'verifications', count: stats?.pendingProviders || 0 },
    { label: t('admin', 'newRegistrations'), tab: 'inscriptions', count: null },
    { label: t('admin', 'adsToModerate'), tab: 'ads', count: null },
    { label: t('admin', 'viewAnalytics'), tab: 'analytics', count: null },
  ];

  const metricItems = [
    { label: t('admin', 'totalAppointments'), value: stats?.totalAppointments || 0 },
    { label: t('admin', 'appointmentsToday'), value: stats?.appointmentsToday || 0 },
    { label: t('admin', 'reviewsLabel'), value: stats?.totalReviews || 0 },
    { label: t('admin', 'averageRating'), value: stats?.averageRating?.toFixed(1) || '0.0' },
    { label: t('admin', 'newToday'), value: stats?.newUsersToday || 0 },
    { label: t('admin', 'admins'), value: stats?.totalAdmins || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold text-foreground leading-none">{stat.value}</span>
                {stat.change && (
                  <span className={`text-[10px] font-medium ${stat.positive ? 'text-green-600' : 'text-destructive'} leading-none mb-0.5`}>
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Actions rapides</p>
          </div>
          <div className="p-2 space-y-0.5">
            {quickLinks.map((link) => (
              <button
                key={link.tab}
                onClick={() => onTabChange(link.tab)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left hover:bg-muted/50 transition-colors group"
              >
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">{link.label}</span>
                {link.count !== null ? (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-muted">
                    {link.count}
                  </Badge>
                ) : (
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Progress */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{t('admin', 'verificationRate')}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t('admin', 'verificationProgress')}</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-foreground">{verificationRate}%</span>
              <p className="text-[11px] text-muted-foreground mt-1">
                {stats?.verifiedProviders} / {stats?.totalProviders} {t('admin', 'providers')}
              </p>
            </div>
            <Progress value={verificationRate} className="h-1.5" />
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: CheckCircle, value: stats?.verifiedProviders || 0, label: t('admin', 'verified'), color: 'text-green-600' },
                { icon: Clock, value: stats?.pendingProviders || 0, label: t('admin', 'pendingLabel'), color: 'text-amber-500' },
                { icon: AlertCircle, value: stats?.rejectedProviders || 0, label: t('admin', 'rejected'), color: 'text-destructive' },
              ].map((item) => (
                <div key={item.label} className="text-center p-2 rounded-md bg-muted/30">
                  <item.icon className={`h-3.5 w-3.5 ${item.color} mx-auto mb-1`} />
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{t('admin', 'recentActivity')}</p>
            <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-muted-foreground" onClick={() => onTabChange('audit')}>
              {t('admin', 'viewAll')}
            </Button>
          </div>
          <div className="p-3">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                {t('admin', 'noRecentActivity')}
              </p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      {log.action.includes('approved') ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : log.action.includes('rejected') ? (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      ) : (
                        <FileText className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {ACTION_LABELS[log.action]}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {log.adminEmail.split('@')[0]} •{' '}
                        {log.timestamp?.toDate
                          ? format(log.timestamp.toDate(), 'dd MMM HH:mm', { locale })
                          : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">{t('admin', 'platformHealth')}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t('admin', 'keyMetrics')}</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {metricItems.map((item) => (
              <div key={item.label} className="text-center p-3 rounded-md bg-muted/30">
                <p className="text-lg font-semibold text-foreground">{item.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
