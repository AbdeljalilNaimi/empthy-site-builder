import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Phone, Bell, Calendar, Truck, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ProviderDocument } from '@/types/provider';

interface PharmacySettingsEditorProps {
  provider: Record<string, any>;
  onSave: (updates: Record<string, any>) => Promise<void>;
}

export function PharmacySettingsEditor({ provider, onSave }: PharmacySettingsEditorProps) {
  const [saving, setSaving] = useState(false);
  
  // Garde fields
  const [dutyPhone, setDutyPhone] = useState(provider.pharmacyDutyPhone || '');
  const [nightBell, setNightBell] = useState(provider.pharmacyNightBell || false);
  const [gardeSchedule, setGardeSchedule] = useState<Array<{ id: string; startDate: string; endDate: string; note: string }>>(
    provider.pharmacyGardeSchedule || []
  );
  const [stockInfo, setStockInfo] = useState(provider.pharmacyStockInfo || '');

  // Delivery fields
  const [deliveryAvailable, setDeliveryAvailable] = useState(provider.pharmacyDeliveryAvailable || false);
  const [deliveryZone, setDeliveryZone] = useState(provider.pharmacyDeliveryZone || '');
  const [deliveryFee, setDeliveryFee] = useState(provider.pharmacyDeliveryFee || '');
  const [deliveryHours, setDeliveryHours] = useState(provider.pharmacyDeliveryHours || '');

  const addGardePeriod = () => {
    setGardeSchedule(prev => [...prev, {
      id: crypto.randomUUID(),
      startDate: '',
      endDate: '',
      note: '',
    }]);
  };

  const updateGardePeriod = (id: string, field: string, value: string) => {
    setGardeSchedule(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const removeGardePeriod = (id: string) => {
    setGardeSchedule(prev => prev.filter(g => g.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        pharmacyDutyPhone: dutyPhone || undefined,
        pharmacyNightBell: nightBell,
        pharmacyGardeSchedule: gardeSchedule.filter(g => g.startDate && g.endDate),
        pharmacyStockInfo: stockInfo || undefined,
        pharmacyDeliveryAvailable: deliveryAvailable,
        pharmacyDeliveryZone: deliveryAvailable ? deliveryZone || undefined : undefined,
        pharmacyDeliveryFee: deliveryAvailable ? deliveryFee || undefined : undefined,
        pharmacyDeliveryHours: deliveryAvailable ? deliveryHours || undefined : undefined,
      });
      toast.success('Paramètres pharmacie sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Garde & Night Bell */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Téléphone & Cloche de Nuit
          </CardTitle>
          <CardDescription>Contact de garde et accessibilité nocturne</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dutyPhone">Téléphone de garde</Label>
              <Input
                id="dutyPhone"
                placeholder="0555 XX XX XX"
                value={dutyPhone}
                onChange={e => setDutyPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Numéro affiché quand la pharmacie est de garde</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Cloche de nuit
                </Label>
                <p className="text-xs text-muted-foreground">Les patients peuvent sonner la nuit</p>
              </div>
              <Switch checked={nightBell} onCheckedChange={setNightBell} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockInfo">Info stock / disponibilité</Label>
            <Textarea
              id="stockInfo"
              placeholder="Ex: Vaccins grippe disponibles, Insuline en stock..."
              value={stockInfo}
              onChange={e => setStockInfo(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Planning de Garde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Planning de Garde
          </CardTitle>
          <CardDescription>Programmez vos périodes de garde à l'avance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gardeSchedule.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune période de garde planifiée</p>
          ) : (
            <div className="space-y-3">
              {gardeSchedule.map((period) => (
                <div key={period.id} className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Début</Label>
                    <Input
                      type="date"
                      value={period.startDate}
                      onChange={e => updateGardePeriod(period.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Fin</Label>
                    <Input
                      type="date"
                      value={period.endDate}
                      onChange={e => updateGardePeriod(period.id, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="flex-[2] space-y-1">
                    <Label className="text-xs">Note</Label>
                    <Input
                      placeholder="Ex: Garde de nuit uniquement"
                      value={period.note}
                      onChange={e => updateGardePeriod(period.id, 'note', e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 self-end text-destructive" onClick={() => removeGardePeriod(period.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full gap-2" onClick={addGardePeriod}>
            <Plus className="h-4 w-4" /> Ajouter une période de garde
          </Button>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Livraison à Domicile
          </CardTitle>
          <CardDescription>Configurez votre service de livraison</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Livraison disponible</Label>
              <p className="text-xs text-muted-foreground">Proposez la livraison de médicaments</p>
            </div>
            <Switch checked={deliveryAvailable} onCheckedChange={setDeliveryAvailable} />
          </div>
          {deliveryAvailable && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryZone">Zone de livraison</Label>
                <Input
                  id="deliveryZone"
                  placeholder="Ex: Centre-ville, rayon 5km"
                  value={deliveryZone}
                  onChange={e => setDeliveryZone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Frais de livraison</Label>
                <Input
                  id="deliveryFee"
                  placeholder="Ex: 200 DA, Gratuit > 2000 DA"
                  value={deliveryFee}
                  onChange={e => setDeliveryFee(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryHours">Horaires de livraison</Label>
                <Input
                  id="deliveryHours"
                  placeholder="Ex: 9h-17h"
                  value={deliveryHours}
                  onChange={e => setDeliveryHours(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
