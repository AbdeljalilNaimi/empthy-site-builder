import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Key, RefreshCw, XCircle, Plus, ArrowLeft, LogOut, UserCircle, Code2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  generateApiKey,
  getApiKeys,
  deactivateApiKey,
  regenerateApiKey,
  getTodayUsage,
  getKeyUsage,
  type ApiKey,
  type ApiUsage,
} from '@/services/apiKeyService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeveloperDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [developerUser, setDeveloperUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newRawKey, setNewRawKey] = useState('');
  const [todayUsage, setTodayUsage] = useState<Record<string, number>>({});
  const [usageCharts, setUsageCharts] = useState<Record<string, { date: string; requests: number }[]>>({});

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      // Handle email confirmation redirect (token exchange via URL hash)
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=email'))) {
        // Supabase client auto-exchanges tokens from the URL hash
        await supabase.auth.getSession();
        // Clean the URL hash
        window.history.replaceState(null, '', window.location.pathname);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setDeveloperUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        navigate('/developers/login', { replace: true });
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setDeveloperUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        navigate('/developers/login', { replace: true });
      }
    });

    syncSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!developerUser) return;
    loadKeys(developerUser.id);
  }, [developerUser]);

  const loadKeys = async (developerId: string) => {
    setLoading(true);
    try {
      const apiKeys = await getApiKeys(developerId);
      setKeys(apiKeys);

      // Load usage for each key
      const usageMap: Record<string, number> = {};
      const chartMap: Record<string, { date: string; requests: number }[]> = {};
      for (const k of apiKeys) {
        usageMap[k.id] = await getTodayUsage(k.id);
        const usage = await getKeyUsage(k.id);
        // Aggregate by date
        const byDate: Record<string, number> = {};
        usage.forEach((u: ApiUsage) => {
          byDate[u.date] = (byDate[u.date] || 0) + u.request_count;
        });
        chartMap[k.id] = Object.entries(byDate).map(([date, requests]) => ({
          date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          requests,
        }));
      }
      setTodayUsage(usageMap);
      setUsageCharts(chartMap);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger vos clés API.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!developerUser?.id || !appName.trim()) return;
    setCreating(true);
    try {
      const { rawKey } = await generateApiKey(developerUser.id, appName, appDesc);
      setNewRawKey(rawKey);
      setShowNewKeyModal(true);
      setAppName('');
      setAppDesc('');
      await loadKeys(developerUser.id);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de créer la clé.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!developerUser?.id) return;
    try {
      await deactivateApiKey(id);
      toast({ title: 'Clé désactivée' });
      await loadKeys(developerUser.id);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleRegenerate = async (id: string) => {
    if (!developerUser?.id) return;
    try {
      const { rawKey } = await regenerateApiKey(id);
      setNewRawKey(rawKey);
      setShowNewKeyModal(true);
      await loadKeys(developerUser.id);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copié !', description: 'Clé copiée dans le presse-papier.' });
  };

  if (authLoading) return null;
  if (!developerUser) return null;

  return (
    <>
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/developers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 mr-auto">
            <Code2 className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tableau de bord Développeur</h1>
              <p className="text-muted-foreground text-sm">Gérez vos clés API CityHealth</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/developers/profile')}>
            <UserCircle className="h-4 w-4 mr-1" /> Profil
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate('/developers/login'); }}>
            <LogOut className="h-4 w-4 mr-1" /> Déconnexion
          </Button>
        </div>

        {/* Create new key */}
        {keys.length === 0 && !loading && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Enregistrer une application
              </CardTitle>
              <CardDescription>Créez votre première clé API pour commencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Nom de l'application"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optionnel)"
                value={appDesc}
                onChange={(e) => setAppDesc(e.target.value)}
                rows={2}
              />
              <Button onClick={handleCreate} disabled={creating || !appName.trim()}>
                {creating ? 'Génération...' : 'Générer la clé API'}
              </Button>
            </CardContent>
          </Card>
        )}

        {keys.length > 0 && (
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              onClick={() => {
                const name = prompt('Nom de l\'application :');
                if (name) {
                  setAppName(name);
                  setAppDesc('');
                  setTimeout(handleCreate, 0);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Nouvelle clé
            </Button>
          </div>
        )}

        {/* API Keys list */}
        {keys.map((k) => (
          <Card key={k.id} className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {k.app_name || 'Application'}
                  </CardTitle>
                  <CardDescription>{k.app_description}</CardDescription>
                </div>
                <Badge variant={k.is_active ? 'default' : 'destructive'}>
                  {k.is_active ? 'Active' : 'Désactivée'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key suffix display */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                <code>{k.key_suffix}</code>
              </div>

              {/* Usage progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Utilisation aujourd'hui</span>
                  <span className="font-medium">{todayUsage[k.id] || 0} / {k.rate_limit_per_day}</span>
                </div>
                <Progress value={((todayUsage[k.id] || 0) / k.rate_limit_per_day) * 100} className="h-2" />
              </div>

              {/* Plan */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Plan :</span>
                <Badge variant="outline" className="capitalize">{k.plan}</Badge>
              </div>

              {/* 7-day chart */}
              {usageCharts[k.id]?.length > 0 && (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageCharts[k.id]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleRegenerate(k.id)}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Régénérer
                </Button>
                {k.is_active && (
                  <Button size="sm" variant="destructive" onClick={() => handleDeactivate(k.id)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Désactiver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* New Key Modal */}
        <Dialog open={showNewKeyModal} onOpenChange={setShowNewKeyModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🔑 Votre nouvelle clé API</DialogTitle>
              <DialogDescription className="text-destructive font-medium">
                ⚠️ Cette clé ne sera affichée qu'une seule fois. Copiez-la maintenant !
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">{newRawKey}</div>
            <Button onClick={() => copyToClipboard(newRawKey)}>
              <Copy className="h-4 w-4 mr-2" /> Copier la clé
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    <Footer />
    </>
  );
}
