import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Phone, MapPin, Plus, Trash2, Save, Loader2, Ambulance, Clock, Bed } from 'lucide-react';
import { toast } from 'sonner';
import type { CityHealthProvider } from '@/data/providers';

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function HospitalSettingsEditor({ provider, onSave }: Props) {
  const [ambulancePhone, setAmbulancePhone] = useState(provider.ambulancePhone || '');
  const [receptionPhone, setReceptionPhone] = useState(provider.receptionPhone || '');
  const [adminPhone, setAdminPhone] = useState(provider.adminPhone || '');
  const [landmarkDescription, setLandmarkDescription] = useState(provider.landmarkDescription || '');
  const [numberOfBeds, setNumberOfBeds] = useState<number | ''>(provider.numberOfBeds ?? '');
  const [hasReanimation, setHasReanimation] = useState(provider.hasReanimation ?? false);
  const [operatingBlocks, setOperatingBlocks] = useState<number | ''>(provider.operatingBlocks ?? '');
  const [emergencyCapable, setEmergencyCapable] = useState(provider.emergencyCapable ?? false);
  const [departments, setDepartments] = useState<string[]>(provider.departments || []);
  const [newDept, setNewDept] = useState('');
  const [departmentSchedules, setDepartmentSchedules] = useState<Record<string, { open: string; close: string }>>(
    provider.departmentSchedules || {}
  );
  const [saving, setSaving] = useState(false);

  const addDepartment = () => {
    if (newDept.trim() && !departments.includes(newDept.trim())) {
      setDepartments(prev => [...prev, newDept.trim()]);
      setNewDept('');
    }
  };

  const removeDepartment = (dept: string) => {
    setDepartments(prev => prev.filter(d => d !== dept));
    const updated = { ...departmentSchedules };
    delete updated[dept];
    setDepartmentSchedules(updated);
  };

  const updateDeptSchedule = (dept: string, field: 'open' | 'close', value: string) => {
    setDepartmentSchedules(prev => ({
      ...prev,
      [dept]: { open: prev[dept]?.open || '08:00', close: prev[dept]?.close || '17:00', [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ambulancePhone,
        receptionPhone,
        adminPhone,
        landmarkDescription,
        numberOfBeds: numberOfBeds === '' ? null : Number(numberOfBeds),
        hasReanimation,
        operatingBlocks: operatingBlocks === '' ? null : Number(operatingBlocks),
        emergencyCapable,
        departments,
        departmentSchedules,
      } as any);
      toast.success('Paramètres hôpital mis à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phone Lines */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-destructive" />
            Lignes téléphoniques
          </CardTitle>
          <CardDescription>Numéros de contact spécifiques de l'hôpital</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 flex items-center gap-1.5">
                <Ambulance className="h-3.5 w-3.5 text-destructive" />
                Urgences / Ambulance
              </Label>
              <Input placeholder="Ex: 048 XX XX XX" value={ambulancePhone} onChange={(e) => setAmbulancePhone(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Réception</Label>
              <Input placeholder="Ex: 048 XX XX XX" value={receptionPhone} onChange={(e) => setReceptionPhone(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Administration</Label>
              <Input placeholder="Ex: 048 XX XX XX" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Infrastructure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Nombre de lits</Label>
              <Input type="number" min={0} placeholder="Ex: 200" value={numberOfBeds} onChange={(e) => setNumberOfBeds(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div>
              <Label className="mb-1.5 block">Blocs opératoires</Label>
              <Input type="number" min={0} placeholder="Ex: 5" value={operatingBlocks} onChange={(e) => setOperatingBlocks(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Service de réanimation</Label>
              <Switch checked={hasReanimation} onCheckedChange={setHasReanimation} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Capacité d'urgence</Label>
              <Switch checked={emergencyCapable} onCheckedChange={setEmergencyCapable} />
            </div>
          </CardContent>
        </Card>

        {/* Landmark */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Repère de localisation
            </CardTitle>
            <CardDescription>Aidez les patients à trouver l'hôpital facilement</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: En face du stade 24 février, à côté de la mosquée El Feth"
              value={landmarkDescription}
              onChange={(e) => setLandmarkDescription(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Departments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Départements & Services
          </CardTitle>
          <CardDescription>Gérez les départements et leurs horaires d'ouverture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un département (ex: Cardiologie, Pédiatrie...)"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addDepartment(); }}
            />
            <Button size="sm" variant="outline" onClick={addDepartment}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {departments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun département configuré</p>
            </div>
          ) : (
            <div className="space-y-2">
              {departments.map((dept) => {
                const sched = departmentSchedules[dept];
                return (
                  <div key={dept} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <span className="font-medium text-sm flex-1 min-w-[120px]">{dept}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="time"
                        className="w-28 h-8"
                        value={sched?.open || '08:00'}
                        onChange={(e) => updateDeptSchedule(dept, 'open', e.target.value)}
                      />
                      <span className="text-muted-foreground text-xs">à</span>
                      <Input
                        type="time"
                        className="w-28 h-8"
                        value={sched?.close || '17:00'}
                        onChange={(e) => updateDeptSchedule(dept, 'close', e.target.value)}
                      />
                    </div>
                    <Button size="icon" variant="ghost" className="text-destructive shrink-0 h-8 w-8" onClick={() => removeDepartment(dept)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
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
