import { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  Shield,
  Bell,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getSettings,
  updateSettings,
  resetToDefaults,
  type PlatformSettings,
} from '@/services/platformSettingsService';

function ToggleSetting({ label, description, checked, onCheckedChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="space-y-0.5 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SectionBlock({ title, description, icon, children }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 ml-6">{description}</p>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

export function SettingsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les paramètres', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings || !user) return;
    setSaving(true);
    try {
      await updateSettings(settings, user.uid, user.email || '');
      setHasChanges(false);
      toast({ title: 'Paramètres sauvegardés' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    try {
      await resetToDefaults(user.uid, user.email || '');
      await loadSettings();
      setHasChanges(false);
      toast({ title: 'Paramètres réinitialisés' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border p-5">
            <Skeleton className="h-4 w-36 mb-3" />
            <Skeleton className="h-9 w-full mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Unsaved changes bar */}
      {hasChanges && (
        <div className="sticky top-0 z-10 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Modifications non sauvegardées</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={loadSettings}>
              Annuler
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Sauvegarder
            </Button>
          </div>
        </div>
      )}

      {/* General */}
      <SectionBlock
        title="Général"
        description="Informations de base de la plateforme"
        icon={<Globe className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="grid gap-4 sm:grid-cols-2 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nom de la plateforme</Label>
            <Input
              value={settings.platformName}
              onChange={(e) => handleUpdateSetting('platformName', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email de support</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                type="email"
                className="h-9 text-sm pl-8"
                value={settings.supportEmail}
                onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Numéro d'urgence</Label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                className="h-9 text-sm pl-8"
                value={settings.emergencyNumber}
                onChange={(e) => handleUpdateSetting('emergencyNumber', e.target.value)}
              />
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Inscription & Vérification */}
      <SectionBlock
        title="Inscription & Vérification"
        description="Paramètres pour l'inscription des prestataires"
        icon={<Shield className="h-4 w-4 text-muted-foreground" />}
      >
        <ToggleSetting
          label="Vérification documentaire obligatoire"
          description="Les prestataires doivent soumettre des documents"
          checked={settings.requireDocumentVerification}
          onCheckedChange={(v) => handleUpdateSetting('requireDocumentVerification', v)}
        />
        <Separator />
        <ToggleSetting
          label="Approbation automatique"
          description="Approuver automatiquement les nouveaux prestataires"
          checked={settings.autoApproveNewProviders}
          onCheckedChange={(v) => handleUpdateSetting('autoApproveNewProviders', v)}
        />
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2 py-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Taille max. documents (MB)</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={settings.maxDocumentSizeMb}
              onChange={(e) => handleUpdateSetting('maxDocumentSizeMb', parseInt(e.target.value))}
              className="h-9 text-sm w-24"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max. photos par prestataire</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.maxPhotosPerProvider}
              onChange={(e) => handleUpdateSetting('maxPhotosPerProvider', parseInt(e.target.value))}
              className="h-9 text-sm w-24"
            />
          </div>
        </div>
      </SectionBlock>

      {/* Fonctionnalités */}
      <SectionBlock
        title="Fonctionnalités"
        description="Activer ou désactiver les modules"
        icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
      >
        {[
          { key: 'enableAIChat' as const, label: 'Assistant IA', desc: 'Chatbot d\'assistance santé' },
          { key: 'enableMedicalAds' as const, label: 'Annonces médicales', desc: 'Publication d\'annonces par les prestataires' },
          { key: 'enableBloodDonation' as const, label: 'Don de sang', desc: 'Module de recherche de donneurs' },
          { key: 'enableEmergencyModule' as const, label: 'Module Urgences', desc: 'Services d\'urgence' },
          { key: 'enableReviewSystem' as const, label: 'Système d\'avis', desc: 'Avis des utilisateurs' },
          { key: 'reviewModerationEnabled' as const, label: 'Modération des avis', desc: 'Approbation avant publication' },
        ].map((item, i, arr) => (
          <div key={item.key}>
            <ToggleSetting
              label={item.label}
              description={item.desc}
              checked={settings[item.key] as boolean}
              onCheckedChange={(v) => handleUpdateSetting(item.key, v)}
            />
            {i < arr.length - 1 && <Separator />}
          </div>
        ))}
      </SectionBlock>

      {/* Notifications */}
      <SectionBlock
        title="Notifications"
        description="Configuration des emails et alertes"
        icon={<Bell className="h-4 w-4 text-muted-foreground" />}
      >
        {[
          { key: 'sendEmailOnRegistration' as const, label: 'Email à l\'inscription', desc: 'Confirmation aux nouveaux inscrits' },
          { key: 'sendEmailOnApproval' as const, label: 'Email à l\'approbation', desc: 'Notifier les prestataires approuvés' },
          { key: 'sendEmailOnRejection' as const, label: 'Email au rejet', desc: 'Notifier en cas de rejet' },
          { key: 'adminNotifyOnNewRegistration' as const, label: 'Alerte inscription', desc: 'Notifier les admins' },
          { key: 'adminNotifyOnVerificationRequest' as const, label: 'Alerte vérification', desc: 'Notifier les admins des demandes' },
        ].map((item, i, arr) => (
          <div key={item.key}>
            <ToggleSetting
              label={item.label}
              description={item.desc}
              checked={settings[item.key] as boolean}
              onCheckedChange={(v) => handleUpdateSetting(item.key, v)}
            />
            {i < arr.length - 1 && <Separator />}
          </div>
        ))}
      </SectionBlock>

      {/* Danger Zone */}
      <div className="rounded-lg border border-destructive/20 bg-card">
        <div className="px-5 py-3.5 border-b border-destructive/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive/60" />
            <p className="text-sm font-semibold text-destructive/80">Zone dangereuse</p>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Réinitialiser les paramètres</p>
              <p className="text-xs text-muted-foreground mt-0.5">Restaurer les valeurs par défaut</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/20 hover:bg-destructive/5">
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  Réinitialiser
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base">Réinitialiser les paramètres ?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Tous les paramètres seront restaurés à leurs valeurs par défaut. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs h-8">Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8">
                    Réinitialiser
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
