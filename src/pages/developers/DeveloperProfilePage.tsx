import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Mail, Building2, Calendar, Shield, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

export default function DeveloperProfilePage() {
  const navigate = useNavigate();
  const [developerUser, setDeveloperUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setDeveloperUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        navigate('/developers/login', { replace: true });
      } else {
        setFullName(currentUser.user_metadata?.full_name || '');
        setCompany(currentUser.user_metadata?.company || '');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setDeveloperUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        navigate('/developers/login', { replace: true });
      }
    });

    syncSession();
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          company: company || null,
        },
      });
      if (error) throw error;
      toast.success('Profil mis à jour avec succès !');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Mot de passe modifié avec succès !');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Erreur lors du changement de mot de passe.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (authLoading || !developerUser) return null;

  const createdAt = developerUser.created_at
    ? new Date(developerUser.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/developers/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Mon profil</h1>
              <p className="text-muted-foreground text-sm">Gérez vos informations développeur</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/developers/login');
              }}
            >
              <LogOut className="h-4 w-4 mr-1" /> Déconnexion
            </Button>
          </div>

          {/* Account Info (read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" /> Informations du compte
              </CardTitle>
              <CardDescription>Ces informations ne peuvent pas être modifiées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{developerUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Membre depuis</p>
                  <p className="text-sm font-medium text-foreground">{createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type de compte</p>
                  <Badge variant="outline">Développeur</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" /> Informations personnelles
              </CardTitle>
              <CardDescription>Modifiez votre nom et votre entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Application / Entreprise</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Mon App Santé"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Changer le mot de passe</CardTitle>
              <CardDescription>Définissez un nouveau mot de passe pour votre compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword}
                variant="outline"
              >
                {changingPassword ? 'Modification...' : 'Modifier le mot de passe'}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Zone de danger</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/developers/login');
                }}
              >
                <LogOut className="h-4 w-4 mr-1" /> Se déconnecter de tous les appareils
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
