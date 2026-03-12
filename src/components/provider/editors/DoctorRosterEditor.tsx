import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CityHealthProvider } from '@/data/providers';

interface RosterDoctor {
  name: string;
  specialty: string;
}

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function DoctorRosterEditor({ provider, onSave }: Props) {
  const [roster, setRoster] = useState<RosterDoctor[]>(provider.doctorRoster || []);
  const [surgeries, setSurgeries] = useState<string[]>(provider.surgeriesOffered || []);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(provider.paymentMethods || []);
  const [parkingAvailable, setParkingAvailable] = useState(provider.parkingAvailable ?? false);
  const [consultationRooms, setConsultationRooms] = useState(provider.consultationRooms ?? null);
  const [newSurgery, setNewSurgery] = useState('');
  const [saving, setSaving] = useState(false);

  const addDoctor = () => {
    setRoster(prev => [...prev, { name: '', specialty: '' }]);
  };

  const updateDoctor = (idx: number, field: keyof RosterDoctor, value: string) => {
    setRoster(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const removeDoctor = (idx: number) => {
    setRoster(prev => prev.filter((_, i) => i !== idx));
  };

  const togglePayment = (method: string) => {
    setPaymentMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        doctorRoster: roster.filter(d => d.name.trim()),
        surgeriesOffered: surgeries,
        paymentMethods,
        parkingAvailable,
        consultationRooms,
      } as any);
      toast.success('Informations de la clinique mises à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Doctor Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Médecins Affiliés
              </CardTitle>
              <CardDescription>{roster.length} médecin(s)</CardDescription>
            </div>
            <Button onClick={addDoctor} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roster.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun médecin ajouté</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roster.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <Input placeholder="Nom complet (Dr. ...)" value={doc.name} onChange={(e) => updateDoctor(idx, 'name', e.target.value)} className="flex-1" />
                  <Input placeholder="Spécialité" value={doc.specialty} onChange={(e) => updateDoctor(idx, 'specialty', e.target.value)} className="flex-1" />
                  <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeDoctor(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Surgeries */}
        <Card>
          <CardHeader><CardTitle className="text-base">Chirurgies proposées</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Ajouter une chirurgie..." value={newSurgery} onChange={(e) => setNewSurgery(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && newSurgery.trim()) {
                  setSurgeries(prev => [...prev, newSurgery.trim()]);
                  setNewSurgery('');
                }
              }} />
              <Button size="sm" variant="outline" onClick={() => {
                if (newSurgery.trim()) {
                  setSurgeries(prev => [...prev, newSurgery.trim()]);
                  setNewSurgery('');
                }
              }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {surgeries.map((s, i) => (
                <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSurgeries(prev => prev.filter((_, idx) => idx !== i))}>
                  {s} <Trash2 className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment & Facilities */}
        <Card>
          <CardHeader><CardTitle className="text-base">Paiement & Infrastructure</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Moyens de paiement</p>
              <div className="flex flex-wrap gap-2">
                {['Espèces', 'Carte bancaire', 'Chèque', 'Virement', 'Carte Chifa'].map(m => (
                  <Badge key={m} variant={paymentMethods.includes(m) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => togglePayment(m)}>
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">🅿️ Parking disponible</span>
              <Badge variant={parkingAvailable ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setParkingAvailable(v => !v)}>
                {parkingAvailable ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Salles de consultation</p>
              <Input type="number" placeholder="Nombre de salles" value={consultationRooms ?? ''} onChange={(e) => setConsultationRooms(e.target.value ? Number(e.target.value) : null)} className="w-32" />
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
