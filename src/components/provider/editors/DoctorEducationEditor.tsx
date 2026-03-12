import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GraduationCap, Save, Loader2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { CityHealthProvider } from '@/data/providers';

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function DoctorEducationEditor({ provider, onSave }: Props) {
  const [medicalSchool, setMedicalSchool] = useState(provider.medicalSchool || '');
  const [graduationYear, setGraduationYear] = useState(provider.graduationYear ?? null);
  const [yearsOfExperience, setYearsOfExperience] = useState(provider.yearsOfExperience ?? null);
  const [ordreMedecins, setOrdreMedecins] = useState(provider.ordreMedecinsNumber || '');
  const [trainedAbroad, setTrainedAbroad] = useState(provider.trainedAbroad ?? false);
  const [trainingCountry, setTrainingCountry] = useState(provider.trainingCountry || '');
  const [secondarySpecialty, setSecondarySpecialty] = useState(provider.secondarySpecialty || '');
  const [homeVisitZone, setHomeVisitZone] = useState(provider.homeVisitZone || '');
  const [teleconsultation, setTeleconsultation] = useState(provider.teleconsultationPlatform || '');
  const [womenOnly, setWomenOnly] = useState(provider.womenOnlyPractice ?? false);
  const [patientTypes, setPatientTypes] = useState<string[]>(provider.patientTypes || []);
  const [saving, setSaving] = useState(false);

  const togglePatientType = (type: string) => {
    setPatientTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        medicalSchool,
        graduationYear,
        yearsOfExperience,
        ordreMedecinsNumber: ordreMedecins,
        trainedAbroad,
        trainingCountry: trainedAbroad ? trainingCountry : '',
        secondarySpecialty,
        homeVisitZone,
        teleconsultationPlatform: teleconsultation,
        womenOnlyPractice: womenOnly,
        patientTypes,
      } as any);
      toast.success('Formation et credentials mises à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Formation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">École / Faculté de médecine</Label>
              <Input placeholder="Ex: Faculté de Médecine d'Oran" value={medicalSchool} onChange={(e) => setMedicalSchool(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Année de diplôme</Label>
                <Input type="number" placeholder="Ex: 2015" value={graduationYear ?? ''} onChange={(e) => setGraduationYear(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <Label className="mb-1.5 block">Années d'expérience</Label>
                <Input type="number" placeholder="Ex: 10" value={yearsOfExperience ?? ''} onChange={(e) => setYearsOfExperience(e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">N° Ordre des Médecins</Label>
              <Input placeholder="Ex: 12345/SBA" value={ordreMedecins} onChange={(e) => setOrdreMedecins(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Formé à l'étranger</Label>
              <Switch checked={trainedAbroad} onCheckedChange={setTrainedAbroad} />
            </div>
            {trainedAbroad && (
              <div>
                <Label className="mb-1.5 block">Pays de formation</Label>
                <Input placeholder="Ex: France" value={trainingCountry} onChange={(e) => setTrainingCountry(e.target.value)} />
              </div>
            )}
            <div>
              <Label className="mb-1.5 block">Spécialité secondaire</Label>
              <Input placeholder="Ex: Médecine du sport" value={secondarySpecialty} onChange={(e) => setSecondarySpecialty(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Practice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paramètres du cabinet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Zone de visite à domicile</Label>
              <Input placeholder="Ex: Centre-ville, Cité Benzerdjeb..." value={homeVisitZone} onChange={(e) => setHomeVisitZone(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Plateforme de téléconsultation</Label>
              <Input placeholder="Ex: WhatsApp, Zoom, CityHealth..." value={teleconsultation} onChange={(e) => setTeleconsultation(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Cabinet réservé aux femmes</Label>
              <Switch checked={womenOnly} onCheckedChange={setWomenOnly} />
            </div>
            <div>
              <Label className="mb-2 block">Patients acceptés</Label>
              <div className="flex flex-wrap gap-2">
                {['Adultes', 'Enfants', 'Nourrissons', 'Femmes enceintes', 'Personnes âgées', 'Sportifs'].map(type => (
                  <Badge
                    key={type}
                    variant={patientTypes.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => togglePatientType(type)}
                  >
                    {type}
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
