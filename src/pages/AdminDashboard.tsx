import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/services/auditLogService';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminAnalyticsCharts } from '@/components/admin/AdminAnalyticsCharts';
import { UserManagement } from '@/components/admin/UserManagement';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { VerificationQueue } from '@/components/admin/VerificationQueue';
import { AdsModeration } from '@/components/admin/AdsModeration';
import { AdminNotificationsPanel } from '@/components/admin/AdminNotificationsPanel';
import { ProviderDetailDialog } from '@/components/admin/ProviderDetailDialog';
import { AdminDocUpload } from '@/components/admin/AdminDocUpload';
import { ReportsModerationPanel } from '@/components/admin/ReportsModerationPanel';
import { ApiManagementPanel } from '@/components/admin/ApiManagementPanel';
import { ContactMessagesPanel } from '@/components/admin/ContactMessagesPanel';
import { AdminReviewsPanel } from '@/components/admin/AdminReviewsPanel';
import { notificationService } from '@/services/notificationService';

import { useAllProviders, useUpdateVerification } from '@/hooks/useProviders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Search, Mail } from 'lucide-react';
import { CityHealthProvider } from '@/data/providers';

type ProviderStatusFilter = 'all' | 'pending' | 'verified' | 'rejected';

const TAB_TITLES: Record<string, string> = {
  overview: 'Tableau de bord',
  inscriptions: 'Inscriptions',
  verifications: 'Vérifications',
  ads: 'Annonces',
  users: 'Utilisateurs',
  contact: 'Messages de contact',
  reviews: 'Gestion des avis',
  analytics: 'Analytiques',
  audit: 'Journal d\'audit',
  reports: 'Signalements',
  settings: 'Configuration',
  documentation: 'Documentation IA',
  api: 'Gestion API',
};

const STATUS_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
  verified: { label: 'Vérifié', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-800' },
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<CityHealthProvider | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProviderStatusFilter>('all');

  const { data: allProviders = [], isLoading: loadingAll, isError: errorAll } = useAllProviders();
  const updateVerification = useUpdateVerification();

  const handleApprove = async (id: string) => {
    const provider = allProviders.find(p => p.id === id);
    try {
      await updateVerification.mutateAsync({ providerId: id, status: 'verified', isPublic: true });
      try {
        await logAdminAction(user?.uid || 'unknown', user?.email || 'unknown', 'provider_approved', id, 'provider', { providerName: provider?.name });
      } catch (e) { console.warn('Audit log failed:', e); }
      if (provider) {
        notificationService.sendVerificationNotification({ type: 'verification_approved', providerEmail: provider.email || provider.phone, providerName: provider.name });
      }
      toast({ title: "Profil approuvé", description: "Le professionnel est maintenant visible dans les recherches." });
      setSelectedProvider(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible d'approuver ce profil.", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    const provider = allProviders.find(p => p.id === id);
    const reason = 'Documents non conformes ou informations incomplètes';
    try {
      await updateVerification.mutateAsync({ providerId: id, status: 'rejected', isPublic: false });
      try {
        await logAdminAction(user?.uid || 'unknown', user?.email || 'unknown', 'provider_rejected', id, 'provider', { providerName: provider?.name }, reason);
      } catch (e) { console.warn('Audit log failed:', e); }
      if (provider) {
        notificationService.sendVerificationNotification({ type: 'verification_rejected', providerEmail: provider.email || provider.phone, providerName: provider.name, reason });
      }
      toast({ title: "Profil rejeté", description: "Le professionnel ne sera pas visible dans les recherches.", variant: "destructive" });
      setSelectedProvider(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de rejeter ce profil.", variant: "destructive" });
    }
  };

  // Filter providers by status and search
  const filteredProviders = allProviders.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: allProviders.length,
    pending: allProviders.filter(p => p.verificationStatus === 'pending').length,
    verified: allProviders.filter(p => p.verificationStatus === 'verified').length,
    rejected: allProviders.filter(p => p.verificationStatus === 'rejected').length,
  };

  if (loadingAll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dataWarningBanner = errorAll ? (
    <Card className="border-destructive/50 mb-6">
      <CardContent className="flex items-center gap-3 py-4">
        <Loader2 className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Erreur de chargement des données</p>
          <p className="text-sm text-muted-foreground">
            Impossible de charger les prestataires depuis Firestore. Vérifiez les règles de sécurité et les permissions admin.
          </p>
        </div>
      </CardContent>
    </Card>
  ) : null;

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <AdminOverview onTabChange={setCurrentTab} />;
      
      case 'inscriptions':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tous les prestataires</CardTitle>
                    <CardDescription>
                      {allProviders.length} prestataires au total — {statusCounts.pending} en attente
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProviderStatusFilter)} className="mt-3">
                  <TabsList>
                    <TabsTrigger value="all">Tous ({statusCounts.all})</TabsTrigger>
                    <TabsTrigger value="pending">En attente ({statusCounts.pending})</TabsTrigger>
                    <TabsTrigger value="verified">Vérifiés ({statusCounts.verified})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejetés ({statusCounts.rejected})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professionnel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                          Aucun prestataire trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProviders.map((provider) => {
                        const status = provider.verificationStatus || 'pending';
                        const badgeConfig = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.pending;
                        const isPending = status === 'pending';
                        
                        return (
                          <TableRow key={provider.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {provider.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{provider.name}</p>
                                  <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{provider.type}</Badge>
                            </TableCell>
                            <TableCell>{provider.city}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {provider.phone || provider.email || '—'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={badgeConfig.className}>
                                {badgeConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedProvider(provider)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {isPending && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleApprove(provider.id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleReject(provider.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'verifications':
        return <VerificationQueue />;
      
      case 'ads':
        return (
          <div className="space-y-6">
            <AdsModeration />
            <AdminNotificationsPanel />
          </div>
        );
      
      case 'users':
        return <UserManagement />;
      
      case 'contact':
        return <ContactMessagesPanel />;
      
      case 'reviews':
        return <AdminReviewsPanel />;
      
      case 'analytics':
        return <AdminAnalyticsCharts />;
      
      case 'audit':
        return <AuditLogViewer />;
      
      case 'reports':
        return <ReportsModerationPanel />;
      
      case 'settings':
        return <SettingsPanel />;
      
      case 'documentation':
        return <AdminDocUpload />;
      
      case 'api':
        return <ApiManagementPanel />;
      
      default:
        return <AdminOverview onTabChange={setCurrentTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          title={TAB_TITLES[currentTab] || 'Tableau de bord'} 
        />
        <main className="flex-1 p-5 overflow-auto">
          {dataWarningBanner}
          {renderTabContent()}
        </main>
      </div>
      <ProviderDetailDialog
        provider={selectedProvider}
        open={!!selectedProvider}
        onOpenChange={(open) => !open && setSelectedProvider(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={updateVerification.isPending}
      />
    </div>
  );
}
