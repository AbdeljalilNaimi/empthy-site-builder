import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FlaskConical, Plus, Trash2, Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CityHealthProvider } from '@/data/providers';

interface LabTestItem {
  id: string;
  name: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaround: string;
  prescriptionRequired: boolean;
  fastingRequired: boolean;
  cnasCovered: boolean;
}

const LAB_CATEGORIES = ['Hématologie', 'Biochimie', 'Sérologie', 'Bactériologie', 'Parasitologie', 'Hormonologie', 'Immunologie', 'Génétique', 'Autre'];

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function LabTestCatalogEditor({ provider, onSave }: Props) {
  const [catalog, setCatalog] = useState<LabTestItem[]>(provider.labTestCatalog || []);
  const [accreditations, setAccreditations] = useState<string[]>(provider.labAccreditations || []);
  const [resultMethods, setResultMethods] = useState<string[]>(provider.labResultDeliveryMethods || []);
  const [appointmentRequired, setAppointmentRequired] = useState(provider.labAppointmentRequired ?? false);
  const [fastingNote, setFastingNote] = useState(provider.labFastingInfoNote || '');
  const [homeZone, setHomeZone] = useState(provider.homeCollectionZone || '');
  const [homeFee, setHomeFee] = useState(provider.homeCollectionFee || '');
  const [newAccreditation, setNewAccreditation] = useState('');
  const [saving, setSaving] = useState(false);

  const addTest = () => {
    setCatalog(prev => [...prev, {
      id: crypto.randomUUID(),
      name: '',
      category: 'Hématologie',
      priceMin: null,
      priceMax: null,
      turnaround: '',
      prescriptionRequired: true,
      fastingRequired: false,
      cnasCovered: false,
    }]);
  };

  const updateTest = (id: string, field: keyof LabTestItem, value: any) => {
    setCatalog(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTest = (id: string) => {
    setCatalog(prev => prev.filter(t => t.id !== id));
  };

  const toggleResultMethod = (method: string) => {
    setResultMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        labTestCatalog: catalog.filter(t => t.name.trim()),
        labAccreditations: accreditations,
        labResultDeliveryMethods: resultMethods,
        labAppointmentRequired: appointmentRequired,
        labFastingInfoNote: fastingNote,
        homeCollectionZone: homeZone,
        homeCollectionFee: homeFee,
      } as any);
      toast.success('Catalogue de tests mis à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Catalog */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Catalogue des Analyses
              </CardTitle>
              <CardDescription>{catalog.length} analyse(s) configurée(s)</CardDescription>
            </div>
            <Button onClick={addTest} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {catalog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucune analyse configurée</p>
              <p className="text-xs mt-1">Cliquez sur "Ajouter" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {catalog.map((test) => (
                <div key={test.id} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      placeholder="Nom de l'analyse (ex: NFS, Glycémie...)"
                      value={test.name}
                      onChange={(e) => updateTest(test.id, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeTest(test.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Select value={test.category} onValueChange={(v) => updateTest(test.id, 'category', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LAB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Prix min (DA)" value={test.priceMin ?? ''} onChange={(e) => updateTest(test.id, 'priceMin', e.target.value ? Number(e.target.value) : null)} />
                    <Input type="number" placeholder="Prix max (DA)" value={test.priceMax ?? ''} onChange={(e) => updateTest(test.id, 'priceMax', e.target.value ? Number(e.target.value) : null)} />
                    <Input placeholder="Délai (ex: 24h, 48h)" value={test.turnaround} onChange={(e) => updateTest(test.id, 'turnaround', e.target.value)} />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={test.prescriptionRequired} onCheckedChange={(v) => updateTest(test.id, 'prescriptionRequired', v)} />
                      Ordonnance requise
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={test.fastingRequired} onCheckedChange={(v) => updateTest(test.id, 'fastingRequired', v)} />
                      À jeun
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={test.cnasCovered} onCheckedChange={(v) => updateTest(test.id, 'cnasCovered', v)} />
                      Couvert CNAS
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paramètres du laboratoire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Rendez-vous obligatoire</Label>
              <Switch checked={appointmentRequired} onCheckedChange={setAppointmentRequired} />
            </div>
            <div>
              <Label className="mb-1.5 block">Méthodes de remise des résultats</Label>
              <div className="flex flex-wrap gap-2">
                {['Sur place', 'Email', 'SMS', 'Plateforme en ligne', 'Téléphone'].map(m => (
                  <Badge
                    key={m}
                    variant={resultMethods.includes(m) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleResultMethod(m)}
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Note sur le jeûne</Label>
              <Textarea placeholder="Ex: Présentez-vous à jeun de 12h pour les bilans sanguins..." value={fastingNote} onChange={(e) => setFastingNote(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prélèvement à domicile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Zone couverte</Label>
              <Input placeholder="Ex: Centre-ville, Cité Djillali..." value={homeZone} onChange={(e) => setHomeZone(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Frais de déplacement</Label>
              <Input placeholder="Ex: 500 DA, Gratuit..." value={homeFee} onChange={(e) => setHomeFee(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Accréditations</Label>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Ajouter une accréditation..." value={newAccreditation} onChange={(e) => setNewAccreditation(e.target.value)} onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAccreditation.trim()) {
                    setAccreditations(prev => [...prev, newAccreditation.trim()]);
                    setNewAccreditation('');
                  }
                }} />
                <Button size="sm" variant="outline" onClick={() => {
                  if (newAccreditation.trim()) {
                    setAccreditations(prev => [...prev, newAccreditation.trim()]);
                    setNewAccreditation('');
                  }
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {accreditations.map((a, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setAccreditations(prev => prev.filter((_, idx) => idx !== i))}>
                    {a} <Trash2 className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
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
