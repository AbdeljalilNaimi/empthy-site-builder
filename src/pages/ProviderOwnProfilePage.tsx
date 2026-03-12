import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Loader2, User, Phone, Shield, Stethoscope, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useProvider } from '@/contexts/ProviderContext';
import { useToast } from '@/hooks/use-toast';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

const VERIFICATION_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  verified: { label: 'Vérifié', variant: 'default' },
  pending: { label: 'En attente', variant: 'secondary' },
  rejected: { label: 'Rejeté', variant: 'destructive' },
};

export default function ProviderOwnProfilePage() {
  const { user } = useAuth();
  const { provider, isLoading, updateProviderData, isSaving, refetch } = useProvider();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    description: '',
    specialty: '',
  });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        phone: provider.phone || '',
        description: provider.description || '',
        specialty: provider.specialty || '',
      });
    }
  }, [provider]);

  const handleSaveProfile = async () => {
    if (!provider) return;
    try {
      await updateProviderData({
        name: formData.name,
        phone: formData.phone,
        description: formData.description,
        specialty: formData.specialty,
      });
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été sauvegardées' });
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !provider?.id) return;
    
    setUploadingAvatar(true);
    try {
      const storageRef = ref(storage, `providers/${provider.id}/image/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProviderData({ image: downloadURL });
      toast({ title: 'Photo mise à jour' });
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Erreur', description: 'Impossible de télécharger la photo', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    
    if (passwordData.new.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caractères', variant: 'destructive' });
      return;
    }
    
    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, passwordData.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.new);
      setPasswordData({ current: '', new: '', confirm: '' });
      toast({ title: 'Mot de passe modifié' });
    } catch (error: any) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        toast({ title: 'Erreur', description: 'Mot de passe actuel incorrect', variant: 'destructive' });
      } else {
        toast({ title: 'Erreur', description: 'Impossible de changer le mot de passe', variant: 'destructive' });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const verificationStatus = provider?.verificationStatus || 'pending';
  const statusInfo = VERIFICATION_STATUS_LABELS[verificationStatus] || VERIFICATION_STATUS_LABELS.pending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6 max-w-4xl mx-auto">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profil non trouvé</h2>
            <p className="text-muted-foreground mb-4">Aucun profil praticien associé à ce compte.</p>
            <Button onClick={() => navigate('/provider/register')}>
              Créer un profil praticien
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/provider/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Mon Profil Praticien</h1>
            <p className="text-sm text-muted-foreground">Gérez vos informations professionnelles</p>
          </div>
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            {verificationStatus === 'verified' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {statusInfo.label}
          </Badge>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={provider.image} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    <Stethoscope className="h-10 w-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold">{provider.name}</h2>
                <p className="text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                  <Stethoscope className="h-4 w-4" />
                  {provider.specialty || provider.type}
                </p>
                {provider.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-1">
                    <MapPin className="h-3 w-3" />
                    {provider.address}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate('/provider/dashboard')}>
                Tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" /> 
              Informations Professionnelles
            </CardTitle>
            <CardDescription>
              Ces informations sont affichées sur votre profil public
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom / Établissement</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
                  placeholder="Dr. Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label>Spécialité</Label>
                <Input 
                  value={formData.specialty} 
                  onChange={e => setFormData(p => ({ ...p, specialty: e.target.value }))} 
                  placeholder="Médecine générale"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone professionnel</Label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} 
                placeholder="+213 XXX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} 
                rows={4}
                placeholder="Décrivez votre pratique, vos services et votre expérience..."
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder les modifications
            </Button>
          </CardContent>
        </Card>

        {/* Account Info (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> 
              Informations du Compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Type de praticien</Label>
                <Input value={provider.type} disabled className="bg-muted capitalize" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Statut de vérification</Label>
                <div className="flex items-center gap-2 h-10 px-3 bg-muted rounded-md">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Visibilité</Label>
                <div className="flex items-center gap-2 h-10 px-3 bg-muted rounded-md">
                  <Badge variant={provider.isPublic ? 'default' : 'secondary'}>
                    {provider.isPublic ? 'Public' : 'Privé'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> 
              Sécurité
            </CardTitle>
            <CardDescription>Modifier votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Mot de passe actuel</Label>
                <Input 
                  type="password" 
                  value={passwordData.current} 
                  onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input 
                  type="password" 
                  value={passwordData.new} 
                  onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer</Label>
                <Input 
                  type="password" 
                  value={passwordData.confirm} 
                  onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))} 
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleChangePassword} 
              disabled={!passwordData.current || !passwordData.new || changingPassword}
            >
              {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
