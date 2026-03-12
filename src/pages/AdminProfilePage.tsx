import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Loader2, User, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAdminProfile, updateAdminProfile, uploadAdminAvatar, changeAdminPassword, createAdminProfile, type AdminProfile } from '@/services/adminProfileService';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  moderator: 'Modérateur',
  support: 'Support',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-primary/10 text-primary',
  moderator: 'bg-amber-500/10 text-amber-600',
  support: 'bg-muted text-muted-foreground',
};

export default function AdminProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', bio: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data = await getAdminProfile(user.uid);
      if (!data) {
        data = await createAdminProfile(user.uid, user.email || '', 'moderator');
      }
      setProfile(data);
      setFormData({ fullName: data.fullName || '', phone: data.phone || '', bio: data.bio || '' });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await updateAdminProfile(user.uid, formData);
      toast({ title: 'Profil mis à jour' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadAdminAvatar(user.uid, file);
      setProfile(prev => prev ? { ...prev, avatarUrl: url } : null);
      toast({ title: 'Photo mise à jour' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de télécharger la photo', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      await changeAdminPassword(passwordData.current, passwordData.new);
      setPasswordData({ current: '', new: '', confirm: '' });
      toast({ title: 'Mot de passe modifié' });
    } catch {
      setPasswordError('Mot de passe actuel incorrect');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border px-6 h-14 flex items-center">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  const role = profile?.role || 'moderator';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center gap-3 h-14 px-6 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-sm font-semibold text-foreground">Profil administrateur</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Avatar & Identity */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 h-6 w-6 bg-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-foreground/80 transition-colors">
              <Camera className="h-3 w-3 text-background" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{profile?.fullName || 'Admin'}</h2>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
            <Badge variant="secondary" className={`mt-1.5 text-[10px] font-medium ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Personal Info */}
        <section>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Informations personnelles</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Modifier vos coordonnées et votre bio</p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nom complet</Label>
                <Input
                  value={formData.fullName}
                  onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="Votre nom"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="+213 ..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="text-sm resize-none"
                placeholder="Quelques mots sur vous..."
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="text-xs">
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
              Sauvegarder
            </Button>
          </div>
        </section>

        <Separator />

        {/* Security */}
        <section>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              Sécurité
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Modifier votre mot de passe</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mot de passe actuel</Label>
              <Input
                type="password"
                value={passwordData.current}
                onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))}
                className="h-9 text-sm max-w-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 max-w-sm sm:max-w-none">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Confirmer</Label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleChangePassword}
              disabled={!passwordData.current || !passwordData.new}
            >
              <KeyRound className="h-3.5 w-3.5 mr-1.5" />
              Changer le mot de passe
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
