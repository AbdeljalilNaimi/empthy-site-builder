import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, X, Save, ShieldCheck } from 'lucide-react';
import { EmergencyHealthCard, upsertEmergencyCard } from '@/services/emergencyCardService';
import { toast } from 'sonner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface EmergencyCardFormProps {
  userId: string;
  card: EmergencyHealthCard | null;
  onSaved: (card: EmergencyHealthCard) => void;
  onBloodGroupChange?: (bloodGroup: string) => void;
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={addTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button onClick={() => onChange(tags.filter(t => t !== tag))} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmergencyCardForm({ userId, card, onSaved, onBloodGroupChange }: EmergencyCardFormProps) {
  const [saving, setSaving] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(card?.blood_group || '');
  const [allergies, setAllergies] = useState<string[]>(card?.allergies || []);
  const [chronicConditions, setChronicConditions] = useState<string[]>(card?.chronic_conditions || []);
  const [medications, setMedications] = useState<string[]>(card?.current_medications || []);
  const [vaccinationHistory, setVaccinationHistory] = useState(card?.vaccination_history || '');
  const [contactName, setContactName] = useState(card?.emergency_contact_name || '');
  const [contactPhone, setContactPhone] = useState(card?.emergency_contact_phone || '');
  const [isPublic, setIsPublic] = useState(card?.is_public_for_emergencies || false);

  useEffect(() => {
    if (card) {
      setBloodGroup(card.blood_group || '');
      setAllergies(card.allergies || []);
      setChronicConditions(card.chronic_conditions || []);
      setMedications(card.current_medications || []);
      setVaccinationHistory(card.vaccination_history || '');
      setContactName(card.emergency_contact_name || '');
      setContactPhone(card.emergency_contact_phone || '');
      setIsPublic(card.is_public_for_emergencies || false);
    }
  }, [card]);

  const handleSave = async () => {
    if (!bloodGroup) {
      toast.error('Veuillez sélectionner votre groupe sanguin');
      return;
    }
    setSaving(true);
    try {
      const result = await upsertEmergencyCard(userId, {
        blood_group: bloodGroup,
        allergies,
        chronic_conditions: chronicConditions,
        current_medications: medications,
        vaccination_history: vaccinationHistory || null,
        emergency_contact_name: contactName || null,
        emergency_contact_phone: contactPhone || null,
        is_public_for_emergencies: isPublic,
      });
      if (result) {
        onSaved(result);
        if (result.blood_group && onBloodGroupChange) {
          onBloodGroupChange(result.blood_group);
        }
        toast.success('Carte d\'urgence sauvegardée');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-destructive" />
          Carte de Santé d'Urgence
        </CardTitle>
        <CardDescription>
          Renseignez vos informations médicales vitales. Ces données peuvent sauver des vies en cas d'urgence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Blood Group */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Groupe Sanguin *</Label>
          <Select value={bloodGroup} onValueChange={setBloodGroup}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Allergies */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Allergies</Label>
          <TagInput tags={allergies} onChange={setAllergies} placeholder="Ex: Pénicilline, Arachides..." />
        </div>

        <Separator />

        {/* Chronic Conditions */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Maladies Chroniques</Label>
          <TagInput tags={chronicConditions} onChange={setChronicConditions} placeholder="Ex: Diabète, Hypertension..." />
        </div>

        <Separator />

        {/* Medications */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Médicaments en cours</Label>
          <TagInput tags={medications} onChange={setMedications} placeholder="Ex: Metformine 500mg..." />
        </div>

        <Separator />

        {/* Vaccination History */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Historique Vaccinal</Label>
          <Textarea
            value={vaccinationHistory}
            onChange={(e) => setVaccinationHistory(e.target.value)}
            placeholder="Listez vos vaccinations récentes..."
            rows={3}
          />
        </div>

        <Separator />

        {/* Emergency Contact */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Contact d'Urgence</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nom du contact"
            />
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+213 XX XX XX XX"
            />
          </div>
        </div>

        <Separator />

        {/* Privacy Toggle */}
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Consentement de partage d'urgence</p>
              <p className="text-xs text-muted-foreground">
                En activant cette option, vos informations médicales vitales seront accessibles via un QR code scannable par les secouristes et médecins. 
                Seules les données essentielles (groupe sanguin, allergies, conditions, médicaments, contact d'urgence) seront visibles.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Label htmlFor="public-toggle" className="font-medium">Rendre accessible en urgence</Label>
            <Switch id="public-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder la carte'}
        </Button>
      </CardContent>
    </Card>
  );
}
