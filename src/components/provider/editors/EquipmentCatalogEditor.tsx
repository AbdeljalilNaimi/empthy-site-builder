import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Package, Plus, Trash2, Save, Loader2, ShoppingBag, RefreshCw, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CityHealthProvider } from '@/data/providers';

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  salePrice: number | null;
  rentalPricePerDay: number | null;
  availableFor: string;
  prescriptionRequired: boolean;
  cnasReimbursable: boolean;
  stockStatus: string;
  brand: string;
}

const EQUIPMENT_CATEGORIES = ['Mobilité', 'Respiratoire', 'Hospitalisation', 'Diagnostic', 'Rééducation', 'Orthopédie', 'Incontinence', 'Perfusion', 'Autre'];
const STOCK_STATUSES = [
  { value: 'in_stock', label: 'En stock' },
  { value: 'low_stock', label: 'Stock faible' },
  { value: 'out_of_stock', label: 'Rupture' },
  { value: 'on_order', label: 'En commande' },
];

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function EquipmentCatalogEditor({ provider, onSave }: Props) {
  const [catalog, setCatalog] = useState<EquipmentItem[]>(provider.equipmentCatalog || []);
  const [brands, setBrands] = useState<string[]>(provider.equipmentBrands || []);
  const [maintenance, setMaintenance] = useState(provider.maintenanceServiceAvailable ?? false);
  const [techSupport, setTechSupport] = useState(provider.technicalSupportAvailable ?? false);
  const [techPhone, setTechPhone] = useState(provider.technicalSupportPhone || '');
  const [deliveryZone, setDeliveryZone] = useState(provider.equipmentDeliveryZone || '');
  const [deliveryFee, setDeliveryFee] = useState(provider.equipmentDeliveryFee || '');
  const [newBrand, setNewBrand] = useState('');
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setCatalog(prev => [...prev, {
      id: crypto.randomUUID(),
      name: '',
      category: 'Mobilité',
      salePrice: null,
      rentalPricePerDay: null,
      availableFor: 'sale_and_rental',
      prescriptionRequired: false,
      cnasReimbursable: false,
      stockStatus: 'in_stock',
      brand: '',
    }]);
  };

  const updateItem = (id: string, field: keyof EquipmentItem, value: any) => {
    setCatalog(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeItem = (id: string) => {
    setCatalog(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        equipmentCatalog: catalog.filter(t => t.name.trim()),
        equipmentBrands: brands,
        maintenanceServiceAvailable: maintenance,
        technicalSupportAvailable: techSupport,
        technicalSupportPhone: techPhone,
        equipmentDeliveryZone: deliveryZone,
        equipmentDeliveryFee: deliveryFee,
      } as any);
      toast.success('Catalogue d\'équipements mis à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Catalogue des Équipements
              </CardTitle>
              <CardDescription>{catalog.length} produit(s) configuré(s)</CardDescription>
            </div>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {catalog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun équipement configuré</p>
              <p className="text-xs mt-1">Cliquez sur "Ajouter" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {catalog.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input placeholder="Nom du produit (ex: Fauteuil roulant pliant)" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="flex-1" />
                    <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Select value={item.category} onValueChange={(v) => updateItem(item.id, 'category', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Marque" value={item.brand} onChange={(e) => updateItem(item.id, 'brand', e.target.value)} />
                    <Select value={item.availableFor} onValueChange={(v) => updateItem(item.id, 'availableFor', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Vente uniquement</SelectItem>
                        <SelectItem value="rental">Location uniquement</SelectItem>
                        <SelectItem value="sale_and_rental">Vente & Location</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={item.stockStatus} onValueChange={(v) => updateItem(item.id, 'stockStatus', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STOCK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(item.availableFor === 'sale' || item.availableFor === 'sale_and_rental') && (
                      <Input type="number" placeholder="Prix vente (DA)" value={item.salePrice ?? ''} onChange={(e) => updateItem(item.id, 'salePrice', e.target.value ? Number(e.target.value) : null)} />
                    )}
                    {(item.availableFor === 'rental' || item.availableFor === 'sale_and_rental') && (
                      <Input type="number" placeholder="Prix location/jour (DA)" value={item.rentalPricePerDay ?? ''} onChange={(e) => updateItem(item.id, 'rentalPricePerDay', e.target.value ? Number(e.target.value) : null)} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={item.prescriptionRequired} onCheckedChange={(v) => updateItem(item.id, 'prescriptionRequired', v)} />
                      Ordonnance requise
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={item.cnasReimbursable} onCheckedChange={(v) => updateItem(item.id, 'cnasReimbursable', v)} />
                      Remboursable CNAS
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Services</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Service de maintenance</Label>
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Support technique</Label>
              <Switch checked={techSupport} onCheckedChange={setTechSupport} />
            </div>
            {techSupport && (
              <div>
                <Label className="mb-1.5 block">Téléphone support technique</Label>
                <Input placeholder="Ex: 048 XX XX XX" value={techPhone} onChange={(e) => setTechPhone(e.target.value)} />
              </div>
            )}
            <div>
              <Label className="mb-1.5 block">Zone de livraison</Label>
              <Input placeholder="Ex: Sidi Bel Abbès et environs" value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Frais de livraison</Label>
              <Input placeholder="Ex: 1000 DA, Gratuit..." value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Marques distribuées</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Ajouter une marque..." value={newBrand} onChange={(e) => setNewBrand(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && newBrand.trim()) {
                  setBrands(prev => [...prev, newBrand.trim()]);
                  setNewBrand('');
                }
              }} />
              <Button size="sm" variant="outline" onClick={() => {
                if (newBrand.trim()) {
                  setBrands(prev => [...prev, newBrand.trim()]);
                  setNewBrand('');
                }
              }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b, i) => (
                <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setBrands(prev => prev.filter((_, idx) => idx !== i))}>
                  {b} <Trash2 className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer tout
        </Button>
      </div>
    </div>
  );
}
