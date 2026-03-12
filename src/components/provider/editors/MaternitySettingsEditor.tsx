import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Baby, Phone, Plus, Trash2, Save, Loader2, Users, Clock, Heart } from 'lucide-react';
import { toast } from 'sonner';
import type { CityHealthProvider } from '@/data/providers';

const MATERNITY_SERVICE_OPTIONS = [
  'Accouchement naturel',
  'Césarienne',
  'Suivi de grossesse',
  'Échographie obstétricale',
  'Préparation à l\'accouchement',
  'Monitoring fœtal',
  'Consultation post-partum',
  'Allaitement maternel',
  'PMA / FIV',
  'Gynécologie',
  'Vaccination nouveau-né',
];

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function MaternitySettingsEditor({ provider, onSave }: Props) {
  const [maternityEmergencyPhone, setMaternityEmergencyPhone] = useState(provider.maternityEmergencyPhone || '');
  const [deliveryRooms, setDeliveryRooms] = useState<number | ''>(provider.deliveryRooms ?? '');
  const [maternityServices, setMaternityServices] = useState<string[]>(provider.maternityServices || []);
  const [femaleStaffOnly, setFemaleStaffOnly] = useState(provider.femaleStaffOnly ?? false);
  const [pediatricianOnSite, setPediatricianOnSite] = useState(provider.pediatricianOnSite ?? false);
  const [hasNICU, setHasNICU] = useState(provider.hasNICU ?? false);
  const [visitingHoursPolicy, setVisitingHoursPolicy] = useState(provider.visitingHoursPolicy || '');
  const [customService, setCustomService] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleService = (service: string) => {
    setMaternityServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const addCustomService = () => {
    if (customService.trim() && !maternityServices.includes(customService.trim())) {
      setMaternityServices(prev => [...prev, customService.trim()]);
      setCustomService('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        maternityEmergencyPhone,
        deliveryRooms: deliveryRooms === '' ? null : Number(deliveryRooms),
        maternityServices,
        femaleStaffOnly,
        pediatricianOnSite,
        hasNICU,
        visitingHoursPolicy,
      } as any);
      toast.success('Paramètres maternité mis à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Phone + Delivery Rooms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-pink-200 dark:border-pink-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-600">
              <Phone className="h-5 w-5" />
              Urgence maternité
            </CardTitle>
            <CardDescription>Ligne directe pour les urgences obstétricales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Numéro d'urgence maternité</Label>
              <Input
                placeholder="Ex: 048 XX XX XX"
                value={maternityEmergencyPhone}
                onChange={(e) => setMaternityEmergencyPhone(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Nombre de salles d'accouchement</Label>
              <Input
                type="number"
                min={0}
                placeholder="Ex: 4"
                value={deliveryRooms}
                onChange={(e) => setDeliveryRooms(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personnel & NICU */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-600" />
              Personnel & Équipements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label className="font-medium">👩‍⚕️ Personnel féminin uniquement</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Équipe médicale exclusivement féminine</p>
              </div>
              <Switch checked={femaleStaffOnly} onCheckedChange={setFemaleStaffOnly} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label className="font-medium">👶 Pédiatre sur place</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Pédiatre disponible en permanence</p>
              </div>
              <Switch checked={pediatricianOnSite} onCheckedChange={setPediatricianOnSite} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20">
              <div>
                <Label className="font-medium">🏥 NICU (Réa. néonatale)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Unité de soins intensifs néonatals</p>
              </div>
              <Switch checked={hasNICU} onCheckedChange={setHasNICU} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maternity Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Services de maternité
          </CardTitle>
          <CardDescription>Sélectionnez les services proposés par votre maternité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {MATERNITY_SERVICE_OPTIONS.map((service) => (
              <Badge
                key={service}
                variant={maternityServices.includes(service) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => toggleService(service)}
              >
                {maternityServices.includes(service) ? '✓ ' : ''}{service}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Service personnalisé..."
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustomService(); }}
            />
            <Button size="sm" variant="outline" onClick={addCustomService}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Show custom services (ones not in the predefined list) */}
          {maternityServices.filter(s => !MATERNITY_SERVICE_OPTIONS.includes(s)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {maternityServices.filter(s => !MATERNITY_SERVICE_OPTIONS.includes(s)).map((s, i) => (
                <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleService(s)}>
                  {s} <Trash2 className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visiting Hours Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Politique de visites
          </CardTitle>
          <CardDescription>Horaires et règles de visite pour les accompagnants</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Tous les jours de 14h00 à 17h00. Un seul accompagnant autorisé par chambre. Pas de visites les jours de césarienne."
            value={visitingHoursPolicy}
            onChange={(e) => setVisitingHoursPolicy(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer tout
        </Button>
      </div>
    </div>
  );
}
