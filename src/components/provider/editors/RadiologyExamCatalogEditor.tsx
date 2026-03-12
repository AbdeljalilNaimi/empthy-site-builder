import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScanLine, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CityHealthProvider } from '@/data/providers';

interface RadiologyExamItem {
  id: string;
  name: string;
  imagingType: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaround: string;
  prescriptionRequired: boolean;
  preparationInstructions: string;
  cnasCovered: boolean;
}

const IMAGING_TYPES = ['Radiographie', 'Échographie', 'Scanner (TDM)', 'IRM', 'Mammographie', 'Panoramique dentaire', 'Doppler', 'Scintigraphie', 'Autre'];

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function RadiologyExamCatalogEditor({ provider, onSave }: Props) {
  const [catalog, setCatalog] = useState<RadiologyExamItem[]>(provider.radiologyExamCatalog || []);
  const [accreditations, setAccreditations] = useState<string[]>(provider.radiologyAccreditations || []);
  const [resultMethods, setResultMethods] = useState<string[]>(provider.radiologyResultDeliveryMethods || []);
  const [appointmentRequired, setAppointmentRequired] = useState(provider.radiologyAppointmentRequired ?? false);
  const [radiologistOnSite, setRadiologistOnSite] = useState(provider.radiologistOnSite ?? false);
  const [newAccreditation, setNewAccreditation] = useState('');
  const [saving, setSaving] = useState(false);

  const addExam = () => {
    setCatalog(prev => [...prev, {
      id: crypto.randomUUID(),
      name: '',
      imagingType: 'Radiographie',
      priceMin: null,
      priceMax: null,
      turnaround: '',
      prescriptionRequired: true,
      preparationInstructions: '',
      cnasCovered: false,
    }]);
  };

  const updateExam = (id: string, field: keyof RadiologyExamItem, value: any) => {
    setCatalog(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeExam = (id: string) => {
    setCatalog(prev => prev.filter(t => t.id !== id));
  };

  const toggleResultMethod = (method: string) => {
    setResultMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        radiologyExamCatalog: catalog.filter(t => t.name.trim()),
        radiologyAccreditations: accreditations,
        radiologyResultDeliveryMethods: resultMethods,
        radiologyAppointmentRequired: appointmentRequired,
        radiologistOnSite,
      } as any);
      toast.success('Catalogue d\'examens mis à jour');
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
                <ScanLine className="h-5 w-5 text-primary" />
                Catalogue des Examens d'Imagerie
              </CardTitle>
              <CardDescription>{catalog.length} examen(s) configuré(s)</CardDescription>
            </div>
            <Button onClick={addExam} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {catalog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ScanLine className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun examen configuré</p>
              <p className="text-xs mt-1">Cliquez sur "Ajouter" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {catalog.map((exam) => (
                <div key={exam.id} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input placeholder="Nom de l'examen (ex: Radio thorax, IRM cérébrale...)" value={exam.name} onChange={(e) => updateExam(exam.id, 'name', e.target.value)} className="flex-1" />
                    <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeExam(exam.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Select value={exam.imagingType} onValueChange={(v) => updateExam(exam.id, 'imagingType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {IMAGING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Prix min (DA)" value={exam.priceMin ?? ''} onChange={(e) => updateExam(exam.id, 'priceMin', e.target.value ? Number(e.target.value) : null)} />
                    <Input type="number" placeholder="Prix max (DA)" value={exam.priceMax ?? ''} onChange={(e) => updateExam(exam.id, 'priceMax', e.target.value ? Number(e.target.value) : null)} />
                    <Input placeholder="Délai (ex: 1h, 24h)" value={exam.turnaround} onChange={(e) => updateExam(exam.id, 'turnaround', e.target.value)} />
                  </div>
                  <Textarea placeholder="Instructions de préparation (ex: Être à jeun, apporter les anciens clichés...)" value={exam.preparationInstructions} onChange={(e) => updateExam(exam.id, 'preparationInstructions', e.target.value)} rows={2} />
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={exam.prescriptionRequired} onCheckedChange={(v) => updateExam(exam.id, 'prescriptionRequired', v)} />
                      Ordonnance requise
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={exam.cnasCovered} onCheckedChange={(v) => updateExam(exam.id, 'cnasCovered', v)} />
                      Couvert CNAS
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
          <CardHeader><CardTitle className="text-base">Paramètres du centre</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Rendez-vous obligatoire</Label>
              <Switch checked={appointmentRequired} onCheckedChange={setAppointmentRequired} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Radiologue sur place</Label>
              <Switch checked={radiologistOnSite} onCheckedChange={setRadiologistOnSite} />
            </div>
            <div>
              <Label className="mb-1.5 block">Remise des résultats</Label>
              <div className="flex flex-wrap gap-2">
                {['Sur place', 'CD/DVD', 'Email', 'Plateforme PACS', 'Téléphone'].map(m => (
                  <Badge key={m} variant={resultMethods.includes(m) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleResultMethod(m)}>
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Accréditations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
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
