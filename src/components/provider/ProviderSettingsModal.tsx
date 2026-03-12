import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  User, Bell, Shield, Trash2, Loader2, Mail, Lock, 
  Eye, EyeOff, Globe, MessageSquare, Phone, Check 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  reauthenticateWithCredential, 
  updatePassword, 
  EmailAuthProvider 
} from 'firebase/auth';

interface ProviderSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerEmail?: string;
  providerSettings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    appointmentReminders?: boolean;
    marketingEmails?: boolean;
    showPhoneOnProfile?: boolean;
    showEmailOnProfile?: boolean;
    allowReviews?: boolean;
    language?: 'fr' | 'ar' | 'en';
  };
  onSaveSettings?: (settings: Record<string, unknown>) => Promise<void>;
}

export function ProviderSettingsModal({
  open,
  onOpenChange,
  providerEmail = '',
  providerSettings = {},
  onSaveSettings,
}: ProviderSettingsModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Account state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(providerSettings.emailNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(providerSettings.smsNotifications ?? false);
  const [appointmentReminders, setAppointmentReminders] = useState(providerSettings.appointmentReminders ?? true);
  const [marketingEmails, setMarketingEmails] = useState(providerSettings.marketingEmails ?? false);
  
  // Privacy settings
  const [showPhoneOnProfile, setShowPhoneOnProfile] = useState(providerSettings.showPhoneOnProfile ?? true);
  const [showEmailOnProfile, setShowEmailOnProfile] = useState(providerSettings.showEmailOnProfile ?? false);
  const [allowReviews, setAllowReviews] = useState(providerSettings.allowReviews ?? true);
  
  // Preferences
  const [language, setLanguage] = useState(providerSettings.language ?? 'fr');
  
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentPassword) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer votre mot de passe actuel.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }
      
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été mis à jour avec succès.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      let errorMessage = 'Impossible de modifier le mot de passe.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Le mot de passe actuel est incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le nouveau mot de passe est trop faible.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Veuillez vous reconnecter et réessayer.';
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      if (onSaveSettings) {
        await onSaveSettings({
          emailNotifications,
          smsNotifications,
          appointmentReminders,
          marketingEmails,
        });
      }
      toast({
        title: 'Préférences sauvegardées',
        description: 'Vos préférences de notification ont été mises à jour.',
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les préférences.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    try {
      if (onSaveSettings) {
        await onSaveSettings({
          showPhoneOnProfile,
          showEmailOnProfile,
          allowReviews,
        });
      }
      toast({
        title: 'Confidentialité mise à jour',
        description: 'Vos paramètres de confidentialité ont été sauvegardés.',
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      toast({
        title: 'Confirmation requise',
        description: 'Veuillez taper "SUPPRIMER" pour confirmer.',
        variant: 'destructive',
      });
      return;
    }
    
    // Account deletion logic would go here
    toast({
      title: 'Demande envoyée',
      description: 'Votre demande de suppression sera traitée sous 48h.',
    });
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Paramètres du compte</DialogTitle>
            <DialogDescription>
              Gérez votre compte, vos notifications et votre confidentialité.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="account" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account" className="gap-2">
                <User className="h-4 w-4" />
                Compte
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="h-4 w-4" />
                Confidentialité
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6 mt-6">
              {/* Email Section */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Adresse email</Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{providerEmail || user?.email || 'email@example.com'}</span>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Modifier
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contactez le support pour modifier votre email.
                </p>
              </div>

              <Separator />

              {/* Password Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Changer le mot de passe</Label>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm">Mot de passe actuel</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-sm">Nouveau mot de passe</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmNewPassword" className="text-sm">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleChangePassword}
                  disabled={!currentPassword || !newPassword || !confirmNewPassword || isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Changer le mot de passe
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Language Preference */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Langue préférée</Label>
                <Select value={language} onValueChange={(val) => setLanguage(val as 'fr' | 'ar' | 'en')}>
                  <SelectTrigger className="w-[200px]">
                    <Globe className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-destructive">Zone dangereuse</Label>
                <p className="text-sm text-muted-foreground">
                  La suppression de votre compte est irréversible. Toutes vos données seront perdues.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Notifications par email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications importantes par email.
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Notifications SMS
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les alertes urgentes par SMS.
                    </p>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Rappels de rendez-vous
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des rappels avant chaque rendez-vous.
                    </p>
                  </div>
                  <Switch
                    checked={appointmentReminders}
                    onCheckedChange={setAppointmentReminders}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Emails marketing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des offres et actualités de la plateforme.
                    </p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Sauvegarder les préférences
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Afficher le téléphone
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Votre numéro sera visible sur votre profil public.
                    </p>
                  </div>
                  <Switch
                    checked={showPhoneOnProfile}
                    onCheckedChange={setShowPhoneOnProfile}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Afficher l'email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Votre email sera visible sur votre profil public.
                    </p>
                  </div>
                  <Switch
                    checked={showEmailOnProfile}
                    onCheckedChange={setShowEmailOnProfile}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Autoriser les avis
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Les patients peuvent laisser des avis sur votre profil.
                    </p>
                  </div>
                  <Switch
                    checked={allowReviews}
                    onCheckedChange={setAllowReviews}
                  />
                </div>
              </div>

              <Button onClick={handleSavePrivacy} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Sauvegarder les paramètres
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Supprimer votre compte
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Cette action est <strong>irréversible</strong>. Toutes vos données, 
                rendez-vous, et informations de profil seront définitivement supprimées.
              </p>
              <div>
                <Label htmlFor="deleteConfirm" className="text-sm">
                  Tapez <strong>SUPPRIMER</strong> pour confirmer :
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'SUPPRIMER'}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
