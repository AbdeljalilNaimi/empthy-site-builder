import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Stethoscope, Search, Plus, X, Accessibility, Languages,
  Ambulance, Building2, Video, Home, BedDouble, HeartPulse, Scissors,
  FlaskConical, ClipboardList, Clock, Truck, ShieldCheck, Shield, Pill, Droplets, AlertTriangle,
  ShoppingBag, RefreshCw, Wrench, Package, Upload, FileText, Loader2, Trash2,
  Phone, Landmark, Baby, Users, Heart, Car, GraduationCap, Globe, UserCheck, RadioTower, Calendar, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ProviderFormData, 
  SERVICE_CATEGORIES, 
  MEDICAL_SPECIALTIES, 
  EQUIPMENT_OPTIONS, 
  ACCESSIBILITY_OPTIONS,
  LANGUAGES_OPTIONS,
  CONSULTATION_TYPES,
  ANALYSIS_TYPES,
  INSURANCE_OPTIONS,
  PHARMACY_SERVICES,
  BLOOD_TYPES,
  EQUIPMENT_BUSINESS_TYPES,
  MATERNITY_SERVICES,
  SURGERY_TYPES,
  PAYMENT_METHODS,
  PATIENT_TYPES,
  TELECONSULTATION_PLATFORMS,
  LAB_RESULT_DELIVERY_METHODS,
  LAB_TURNAROUND_OPTIONS,
  LAB_ACCREDITATIONS,
  IMAGING_TYPES,
  RADIOLOGY_ACCREDITATIONS,
  EQUIPMENT_PRODUCT_CATEGORIES,
  COMMON_EQUIPMENT_BRANDS,
  EQUIPMENT_STOCK_STATUS_LABELS,
  getTypeSpecificFields,
  type LabTest,
  type RadiologyExam,
  type EquipmentProduct
} from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TypeSpecificFields } from './TypeSpecificFields';
import { supabase } from '@/integrations/supabase/client';

interface Step4Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step4Services({ formData, updateFormData, onNext, onPrev }: Step4Props) {
  const [searchService, setSearchService] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [catalogUploading, setCatalogUploading] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('');
  const [newDoctorDays, setNewDoctorDays] = useState('');
  const [newDoctorPhone, setNewDoctorPhone] = useState('');
  const [newEquipmentProductName, setNewEquipmentProductName] = useState('');
  const [newEquipmentProductCategory, setNewEquipmentProductCategory] = useState('');

  const addEquipmentProduct = () => {
    if (!newEquipmentProductName.trim()) return;
    const product: EquipmentProduct = {
      id: `eq_${Date.now()}`,
      name: newEquipmentProductName.trim(),
      category: newEquipmentProductCategory || EQUIPMENT_PRODUCT_CATEGORIES[0],
      salePrice: null,
      rentalPricePerDay: null,
      availableFor: 'sale',
      prescriptionRequired: false,
      cnasReimbursable: false,
      stockStatus: 'in_stock',
      brand: '',
    };
    updateFormData({ equipmentCatalog: [...(formData.equipmentCatalog || []), product] });
    setNewEquipmentProductName('');
  };

  const updateEquipmentProduct = (id: string, updates: Partial<EquipmentProduct>) => {
    const catalog = (formData.equipmentCatalog || []).map(p => p.id === id ? { ...p, ...updates } : p);
    updateFormData({ equipmentCatalog: catalog });
  };

  const removeEquipmentProduct = (id: string) => {
    updateFormData({ equipmentCatalog: (formData.equipmentCatalog || []).filter(p => p.id !== id) });
  };

  const handleCatalogUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, catalog: 'Seuls les fichiers PDF sont acceptés' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, catalog: 'Le fichier ne doit pas dépasser 10 Mo' }));
      return;
    }
    setCatalogUploading(true);
    setErrors(prev => { const { catalog, ...rest } = prev; return rest; });
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `catalogs/${fileName}`;
      const { error } = await supabase.storage.from('provider-catalogs').upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('provider-catalogs').getPublicUrl(filePath);
      updateFormData({ catalogPdfUrl: urlData.publicUrl });
    } catch (err: any) {
      setErrors(prev => ({ ...prev, catalog: err.message || 'Erreur lors du téléchargement' }));
    } finally {
      setCatalogUploading(false);
    }
  }, [updateFormData]);

  const handleRemoveCatalog = useCallback(() => {
    updateFormData({ catalogPdfUrl: '' });
  }, [updateFormData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.serviceCategories.length === 0) {
      newErrors.serviceCategories = 'Sélectionnez au moins une catégorie de service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const toggleArrayItem = (field: 'serviceCategories' | 'specialties' | 'equipment' | 'accessibilityFeatures' | 'languages' | 'consultationTypes' | 'analysisTypes' | 'pharmacyServices' | 'insuranceAccepted' | 'equipmentBusinessTypes' | 'maternityServices' | 'surgeriesOffered' | 'paymentMethods' | 'patientTypes' | 'labResultDeliveryMethods' | 'labAccreditations' | 'radiologyResultDeliveryMethods' | 'radiologyAccreditations' | 'equipmentBrands', item: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateFormData({ [field]: updated });
  };

  const isLab = formData.providerType === 'lab';

  // Lab test catalog management
  const [newTestName, setNewTestName] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('');
  const [searchTest, setSearchTest] = useState('');

  const addLabTest = () => {
    if (!newTestName.trim()) return;
    const newTest: LabTest = {
      id: `test_${Date.now()}`,
      name: newTestName.trim(),
      category: newTestCategory || formData.analysisTypes[0] || 'Biologie médicale',
      priceMin: null,
      priceMax: null,
      turnaround: '24h',
      prescriptionRequired: true,
      fastingRequired: false,
      cnasCovered: false,
    };
    updateFormData({ labTestCatalog: [...(formData.labTestCatalog || []), newTest] });
    setNewTestName('');
  };

  const updateLabTest = (id: string, updates: Partial<LabTest>) => {
    const catalog = (formData.labTestCatalog || []).map(t => t.id === id ? { ...t, ...updates } : t);
    updateFormData({ labTestCatalog: catalog });
  };

  const removeLabTest = (id: string) => {
    updateFormData({ labTestCatalog: (formData.labTestCatalog || []).filter(t => t.id !== id) });
  };

  const filteredLabTests = (formData.labTestCatalog || []).filter(t =>
    t.name.toLowerCase().includes(searchTest.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTest.toLowerCase())
  );

  const isRadiology = formData.providerType === 'radiology_center';

  // Radiology exam catalog management
  const [newExamName, setNewExamName] = useState('');
  const [newExamImagingType, setNewExamImagingType] = useState('');
  const [searchExam, setSearchExam] = useState('');

  const addRadiologyExam = () => {
    if (!newExamName.trim()) return;
    const newExam: RadiologyExam = {
      id: `exam_${Date.now()}`,
      name: newExamName.trim(),
      imagingType: newExamImagingType || (formData.imagingTypes?.[0]) || 'Radiographie standard',
      priceMin: null,
      priceMax: null,
      turnaround: '24h',
      prescriptionRequired: true,
      preparationInstructions: '',
      cnasCovered: false,
    };
    updateFormData({ radiologyExamCatalog: [...(formData.radiologyExamCatalog || []), newExam] });
    setNewExamName('');
  };

  const updateRadiologyExam = (id: string, updates: Partial<RadiologyExam>) => {
    const catalog = (formData.radiologyExamCatalog || []).map(e => e.id === id ? { ...e, ...updates } : e);
    updateFormData({ radiologyExamCatalog: catalog });
  };

  const removeRadiologyExam = (id: string) => {
    updateFormData({ radiologyExamCatalog: (formData.radiologyExamCatalog || []).filter(e => e.id !== id) });
  };

  const filteredRadiologyExams = (formData.radiologyExamCatalog || []).filter(e =>
    e.name.toLowerCase().includes(searchExam.toLowerCase()) ||
    e.imagingType.toLowerCase().includes(searchExam.toLowerCase())
  );

  const isPharmacy = formData.providerType === 'pharmacy';
  const isBloodCabin = formData.providerType === 'blood_cabin';
  const isEquipment = formData.providerType === 'medical_equipment';
  const isClinic = formData.providerType === 'clinic';
  const isDoctor = formData.providerType === 'doctor';
  const isCareProvider = formData.providerCategory === 'care';
  const isDiagnosisProvider = formData.providerCategory === 'diagnosis';
  const isInfrastructureType = ['clinic', 'hospital', 'birth_hospital'].includes(formData.providerType);
  const CONSULTATION_ICONS = { Building2, Video, Home } as const;

  const addDoctor = () => {
    if (newDoctorName.trim() && newDoctorSpecialty.trim()) {
      const roster = formData.doctorRoster || [];
      updateFormData({ doctorRoster: [...roster, { 
        name: newDoctorName.trim(), 
        specialty: newDoctorSpecialty.trim(),
        consultationDays: newDoctorDays.trim() || undefined,
        phone: newDoctorPhone.trim() || undefined,
      }] });
      setNewDoctorName('');
      setNewDoctorSpecialty('');
      setNewDoctorDays('');
      setNewDoctorPhone('');
    }
  };

  const removeDoctor = (index: number) => {
    const roster = formData.doctorRoster || [];
    updateFormData({ doctorRoster: roster.filter((_, i) => i !== index) });
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !formData.departments.includes(newDepartment.trim())) {
      updateFormData({ departments: [...formData.departments, newDepartment.trim()] });
      setNewDepartment('');
    }
  };

  const removeDepartment = (dept: string) => {
    updateFormData({ departments: formData.departments.filter(d => d !== dept) });
  };

  const filteredServices = SERVICE_CATEGORIES.filter(s =>
    s.toLowerCase().includes(searchService.toLowerCase())
  );

  const filteredSpecialties = MEDICAL_SPECIALTIES.filter(s =>
    s.toLowerCase().includes(searchSpecialty.toLowerCase())
  );

  // Dynamic service tags based on provider type
  const getTypeSpecificServices = () => {
    switch (formData.providerType) {
      case 'radiology_center':
        return ['Radiographie standard', 'Scanner (CT)', 'IRM', 'Échographie', 'Mammographie', 'Panoramique dentaire'];
      case 'pharmacy':
        return ['Programme médicaments gratuits', 'Garde de nuit', 'Livraison à domicile', 'Préparations magistrales', 'Parapharmacie', 'Conseils nutritionnels'];
      case 'blood_cabin':
        return ['Don de sang', 'Don de plasma', 'Don de plaquettes', 'Groupage sanguin', 'Tests de compatibilité'];
      case 'lab':
        return ['Analyses sanguines', 'Analyses urinaires', 'Biopsie', 'Tests PCR', 'Sérologie', 'Bilan hormonal'];
      case 'medical_equipment':
        return ['Vente matériel', 'Location matériel', 'Réparation', 'Livraison', 'Installation à domicile'];
      default:
        return [];
    }
  };

  const typeSpecificServices = getTypeSpecificServices();
  const hasTypeSpecificFields = Object.keys(getTypeSpecificFields(formData.providerType)).length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Services & Spécialisations
          </h2>
        </div>
        <p className="text-muted-foreground">
          Décrivez précisément vos services pour une meilleure visibilité
        </p>
      </div>

      {/* Type-Specific Fields (Blood Cabin, Radiology, Equipment) */}
      {hasTypeSpecificFields && (
        <TypeSpecificFields formData={formData} updateFormData={updateFormData} />
      )}

      {/* Dynamic Service Tags for specific provider types */}
      {typeSpecificServices.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Services spécifiques à votre activité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {typeSpecificServices.map((service) => (
                <Badge
                  key={service}
                  variant={formData.serviceCategories.includes(service) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleArrayItem('serviceCategories', service)}
                >
                  {service}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Catégories de services
            <span className="text-sm font-normal text-muted-foreground">
              {formData.serviceCategories.length} sélectionnée(s)
            </span>
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service..."
              className="pl-10"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredServices.map((service) => (
              <div
                key={service}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  formData.serviceCategories.includes(service)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                )}
                onClick={() => toggleArrayItem('serviceCategories', service)}
              >
                <Checkbox
                  checked={formData.serviceCategories.includes(service)}
                  onCheckedChange={() => toggleArrayItem('serviceCategories', service)}
                />
                <Label className="text-sm cursor-pointer">{service}</Label>
              </div>
            ))}
          </div>
          {errors.serviceCategories && (
            <p className="text-sm text-destructive mt-2">{errors.serviceCategories}</p>
          )}
        </CardContent>
      </Card>

      {/* Medical Specialties */}
      {(formData.providerType === 'doctor' || formData.providerType === 'clinic' || formData.providerType === 'hospital') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Spécialités médicales
              <span className="text-sm font-normal text-muted-foreground">
                {formData.specialties.length} sélectionnée(s)
              </span>
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une spécialité..."
                className="pl-10"
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredSpecialties.map((specialty) => (
                <div
                  key={specialty}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    formData.specialties.includes(specialty)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('specialties', specialty)}
                >
                  <Checkbox
                    checked={formData.specialties.includes(specialty)}
                    onCheckedChange={() => toggleArrayItem('specialties', specialty)}
                  />
                  <Label className="text-sm cursor-pointer">{specialty}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgences 24/7 Toggle — care providers only (hidden for clinics) */}
      {isCareProvider && !isClinic && !isDoctor && (
        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Ambulance className="h-5 w-5" />
              Service d'urgences 24/7
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Activez si votre établissement dispose d'un service d'urgences permanent
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/10 bg-destructive/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <Ambulance className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <Label className="font-medium">Urgences 24/7</Label>
                  <p className="text-xs text-muted-foreground">Service d'urgences disponible en permanence</p>
                </div>
              </div>
              <Switch
                checked={formData.emergencyCapable}
                onCheckedChange={(checked) => updateFormData({ emergencyCapable: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Infrastructure — clinics/hospitals/maternity only (NOT doctors) */}
      {isCareProvider && isInfrastructureType && !isDoctor && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Infrastructures
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Informations sur les capacités de votre établissement
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  Nombre de lits
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ex: 120"
                  value={formData.numberOfBeds ?? ''}
                  onChange={(e) => updateFormData({ numberOfBeds: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  Blocs opératoires
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ex: 4"
                  value={formData.operatingBlocks ?? ''}
                  onChange={(e) => updateFormData({ operatingBlocks: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-5 w-5 text-destructive" />
                <div>
                  <Label className="font-medium">Service de réanimation</Label>
                  <p className="text-xs text-muted-foreground">Disponibilité d'un service de réanimation</p>
                </div>
              </div>
              <Switch
                checked={formData.hasReanimation}
                onCheckedChange={(checked) => updateFormData({ hasReanimation: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hospital-Specific: Multiple Phone Numbers */}
      {formData.providerType === 'hospital' && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Numéros de téléphone de l'hôpital
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Renseignez les différents numéros de contact de votre établissement
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Réception
                </Label>
                <Input
                  type="tel"
                  placeholder="Ex: 048 54 00 01"
                  value={formData.receptionPhone || ''}
                  onChange={(e) => updateFormData({ receptionPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-destructive">
                  <Ambulance className="h-4 w-4" />
                  Urgences / Ambulance
                </Label>
                <Input
                  type="tel"
                  placeholder="Ex: 048 54 00 02"
                  value={formData.ambulancePhone || ''}
                  onChange={(e) => updateFormData({ ambulancePhone: e.target.value })}
                  className="border-destructive/30 focus-visible:ring-destructive/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Administration
                </Label>
                <Input
                  type="tel"
                  placeholder="Ex: 048 54 00 03"
                  value={formData.adminPhone || ''}
                  onChange={(e) => updateFormData({ adminPhone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== HOSPITAL-SPECIFIC SECTIONS ========== */}

      {/* Hospital: Wait Time Estimator */}
      {formData.providerType === 'hospital' && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Temps d'attente estimé
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Indiquez le temps d'attente moyen aux urgences (mis à jour régulièrement via votre dashboard)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Temps d'attente (minutes)
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ex: 30"
                  value={formData.waitTimeMinutes ?? ''}
                  onChange={(e) => updateFormData({ 
                    waitTimeMinutes: e.target.value ? Number(e.target.value) : null,
                    waitTimeUpdatedAt: e.target.value ? new Date().toISOString() : null
                  })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ⏱️ Cette valeur sera affichée sur votre profil public si elle a été mise à jour dans les 4 dernières heures
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hospital: Department Schedule Management */}
      {formData.providerType === 'hospital' && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Horaires par département
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configurez les horaires d'ouverture pour chaque département de l'hôpital
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.departments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Ajoutez d'abord des départements ci-dessus pour configurer leurs horaires
              </p>
            ) : (
              <div className="space-y-3">
                {formData.departments.map((dept) => {
                  const schedule = formData.departmentSchedules?.[dept] || { open: '08:00', close: '17:00' };
                  return (
                    <div key={dept} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <span className="text-sm font-medium flex-1 min-w-0 truncate">{dept}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={schedule.open}
                          onChange={(e) => updateFormData({
                            departmentSchedules: {
                              ...formData.departmentSchedules,
                              [dept]: { ...schedule, open: e.target.value }
                            }
                          })}
                          className="w-28 h-8 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">—</span>
                        <Input
                          type="time"
                          value={schedule.close}
                          onChange={(e) => updateFormData({
                            departmentSchedules: {
                              ...formData.departmentSchedules,
                              [dept]: { ...schedule, close: e.target.value }
                            }
                          })}
                          className="w-28 h-8 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hospital: Landmark Description */}
      {formData.providerType === 'hospital' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Point de repère
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Décrivez un repère visuel pour aider les patients à trouver votre établissement
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: En face du parc central, à côté de la mosquée El-Feth"
              value={formData.landmarkDescription || ''}
              onChange={(e) => updateFormData({ landmarkDescription: e.target.value })}
              rows={2}
            />
          </CardContent>
        </Card>
      )}

      {/* ========== MATERNITY-SPECIFIC SECTIONS ========== */}
      {formData.providerType === 'birth_hospital' && (
        <>
          {/* Maternity Services Multi-Select */}
          <Card className="border-pink-200 dark:border-pink-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-pink-700 dark:text-pink-400">
                  <Baby className="h-5 w-5" />
                  Services de maternité
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {formData.maternityServices.length} sélectionné(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {MATERNITY_SERVICES.map((service) => (
                  <Badge
                    key={service}
                    variant={formData.maternityServices.includes(service) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      formData.maternityServices.includes(service) 
                        ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
                        : "border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-400"
                    )}
                    onClick={() => toggleArrayItem('maternityServices', service)}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Maternity Emergency Phone */}
          <Card className="border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Phone className="h-5 w-5" />
                Ligne d'urgence maternité
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Numéro dédié pour les urgences obstétricales
              </p>
            </CardHeader>
            <CardContent>
              <Input
                type="tel"
                placeholder="Ex: 048 55 00 01"
                value={formData.maternityEmergencyPhone || ''}
                onChange={(e) => updateFormData({ maternityEmergencyPhone: e.target.value })}
                className="border-destructive/30 focus-visible:ring-destructive/50"
              />
            </CardContent>
          </Card>

          {/* Delivery Rooms + NICU */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Baby className="h-5 w-5 text-pink-600" />
                Infrastructure maternité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Baby className="h-4 w-4 text-muted-foreground" />
                  Nombre de salles d'accouchement
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ex: 6"
                  value={formData.deliveryRooms ?? ''}
                  onChange={(e) => updateFormData({ deliveryRooms: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <HeartPulse className="h-5 w-5 text-destructive" />
                  <div>
                    <Label className="font-medium">Réanimation néonatale (NICU)</Label>
                    <p className="text-xs text-muted-foreground">Unité de soins intensifs pour nouveau-nés</p>
                  </div>
                </div>
                <Switch
                  checked={formData.hasNICU}
                  onCheckedChange={(checked) => updateFormData({ hasNICU: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Female Staff + Pediatrician */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-600" />
                Personnel spécialisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-pink-50 dark:bg-pink-900/10">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <div>
                    <Label className="font-medium">Personnel féminin uniquement</Label>
                    <p className="text-xs text-muted-foreground">Option personnel exclusivement féminin disponible</p>
                  </div>
                </div>
                <Switch
                  checked={formData.femaleStaffOnly}
                  onCheckedChange={(checked) => updateFormData({ femaleStaffOnly: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Pédiatre sur place</Label>
                    <p className="text-xs text-muted-foreground">Pédiatre disponible en permanence</p>
                  </div>
                </div>
                <Switch
                  checked={formData.pediatricianOnSite}
                  onCheckedChange={(checked) => updateFormData({ pediatricianOnSite: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Visiting Hours */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Politique de visites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ex: Tous les jours de 14h00 à 17h00. Un seul accompagnant autorisé."
                value={formData.visitingHoursPolicy || ''}
                onChange={(e) => updateFormData({ visitingHoursPolicy: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Décrivez les horaires et règles de visite pour les accompagnants
              </p>
            </CardContent>
          </Card>

          {/* Insurance Section for Maternity */}
          <Card className="border-pink-200 dark:border-pink-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-pink-700 dark:text-pink-400">
                  <ShieldCheck className="h-5 w-5" />
                  Assurances acceptées
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {(formData.insuranceAccepted || []).length} sélectionnée(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_OPTIONS.map((insurance) => (
                  <Badge
                    key={insurance}
                    variant={(formData.insuranceAccepted || []).includes(insurance) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      (formData.insuranceAccepted || []).includes(insurance)
                        ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
                        : "border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-400"
                    )}
                    onClick={() => toggleArrayItem('insuranceAccepted', insurance)}
                  >
                    {insurance}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ========== CLINIC-SPECIFIC SECTIONS ========== */}
      {isClinic && (
        <>
          {/* Consultation Rooms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Salles de consultation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Nombre de salles de consultation
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ex: 8"
                  value={formData.consultationRooms ?? ''}
                  onChange={(e) => updateFormData({ consultationRooms: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Surgeries Offered */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Scissors className="h-5 w-5" />
                  Chirurgies proposées
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {(formData.surgeriesOffered || []).length} sélectionnée(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SURGERY_TYPES.map((surgery) => (
                  <Badge
                    key={surgery}
                    variant={(formData.surgeriesOffered || []).includes(surgery) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      (formData.surgeriesOffered || []).includes(surgery)
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                        : "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                    )}
                    onClick={() => toggleArrayItem('surgeriesOffered', surgery)}
                  >
                    {surgery}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Médecins affiliés
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Listez les médecins qui exercent dans votre clinique
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nom du médecin *"
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                  />
                  <Input
                    placeholder="Spécialité *"
                    value={newDoctorSpecialty}
                    onChange={(e) => setNewDoctorSpecialty(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Jours de consultation (ex: Lun, Mer, Ven)"
                    value={newDoctorDays}
                    onChange={(e) => setNewDoctorDays(e.target.value)}
                  />
                  <Input
                    type="tel"
                    placeholder="Téléphone (optionnel)"
                    value={newDoctorPhone}
                    onChange={(e) => setNewDoctorPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDoctor())}
                  />
                </div>
                <Button type="button" onClick={addDoctor} disabled={!newDoctorName.trim() || !newDoctorSpecialty.trim()} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un médecin
                </Button>
              </div>
              <div className="space-y-2">
                {(formData.doctorRoster || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{doc.name}</span>
                        <Badge variant="outline" className="text-xs">{doc.specialty}</Badge>
                      </div>
                      {(doc.consultationDays || doc.phone) && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {doc.consultationDays && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {doc.consultationDays}
                            </span>
                          )}
                          {doc.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {doc.phone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => removeDoctor(idx)} className="hover:text-destructive ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {(formData.doctorRoster || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun médecin ajouté</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Moyens de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                      (formData.paymentMethods || []).includes(method)
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-muted"
                    )}
                    onClick={() => toggleArrayItem('paymentMethods', method)}
                  >
                    <Checkbox
                      checked={(formData.paymentMethods || []).includes(method)}
                      onCheckedChange={() => toggleArrayItem('paymentMethods', method)}
                    />
                    <Label className="text-sm cursor-pointer">{method}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parking Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Car className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <Label className="font-medium">Parking disponible</Label>
                    <p className="text-xs text-muted-foreground">La clinique dispose d'un parking</p>
                  </div>
                </div>
                <Switch
                  checked={formData.parkingAvailable || false}
                  onCheckedChange={(checked) => updateFormData({ parkingAvailable: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance Section for Clinics */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                  Assurances acceptées
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {(formData.insuranceAccepted || []).length} sélectionnée(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_OPTIONS.map((insurance) => (
                  <Badge
                    key={insurance}
                    variant={(formData.insuranceAccepted || []).includes(insurance) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      (formData.insuranceAccepted || []).includes(insurance)
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                        : "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                    )}
                    onClick={() => toggleArrayItem('insuranceAccepted', insurance)}
                  >
                    {insurance}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consultation Fee */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Tarif de consultation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fourchette de prix indicative pour une consultation
              </p>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Ex: 2000 - 5000 DA"
                value={formData.consultationFee || ''}
                onChange={(e) => updateFormData({ consultationFee: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Consultation Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Types de consultation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {CONSULTATION_TYPES.map((type) => {
                  const Icon = CONSULTATION_ICONS[type.icon as keyof typeof CONSULTATION_ICONS] || Building2;
                  const isSelected = (formData.consultationTypes || []).includes(type.key);
                  return (
                    <div
                      key={type.key}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-transparent hover:bg-muted"
                      )}
                      onClick={() => toggleArrayItem('consultationTypes', type.key)}
                    >
                      <Icon className={cn("h-6 w-6 mb-2", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-sm font-medium text-center">{type.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ========== DOCTOR-SPECIFIC SECTIONS ========== */}
      {isDoctor && (
        <>
          {/* Education & Experience */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" />
                Formation & Expérience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Université / École de médecine</Label>
                <Input
                  placeholder="Ex: Université Djillali Liabès - Sidi Bel Abbès"
                  value={formData.medicalSchool || ''}
                  onChange={(e) => updateFormData({ medicalSchool: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Année de diplôme</Label>
                  <Input
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    placeholder="Ex: 2008"
                    value={formData.graduationYear ?? ''}
                    onChange={(e) => updateFormData({ graduationYear: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Années d'expérience</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ex: 17"
                    value={formData.yearsOfExperience ?? ''}
                    onChange={(e) => updateFormData({ yearsOfExperience: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ordre des Médecins */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Numéro Ordre des Médecins
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ce numéro sera lié à votre badge de vérification
              </p>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Ex: OM-22-4567"
                value={formData.ordreMedecinsNumber || ''}
                onChange={(e) => updateFormData({ ordreMedecinsNumber: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Trained Abroad */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label className="font-medium">Formé à l'étranger</Label>
                    <p className="text-xs text-muted-foreground">Avez-vous suivi une formation médicale hors d'Algérie ?</p>
                  </div>
                </div>
                <Switch
                  checked={formData.trainedAbroad || false}
                  onCheckedChange={(checked) => updateFormData({ trainedAbroad: checked })}
                />
              </div>
              {formData.trainedAbroad && (
                <div className="space-y-2">
                  <Label>Pays de formation</Label>
                  <Input
                    placeholder="Ex: France"
                    value={formData.trainingCountry || ''}
                    onChange={(e) => updateFormData({ trainingCountry: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secondary Specialty */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Spécialité secondaire
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Optionnel — si vous avez une sous-spécialité
              </p>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.secondarySpecialty || ''}
                onValueChange={(value) => updateFormData({ secondarySpecialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une spécialité secondaire" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICAL_SPECIALTIES.filter(s => !formData.specialties.includes(s)).map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Home Visit Zone (visible when homeVisitAvailable is true) */}
          {formData.homeVisitAvailable && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Zone de visite à domicile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Centre-ville SBA, Hai Othmania, Hai El Badr"
                  value={formData.homeVisitZone || ''}
                  onChange={(e) => updateFormData({ homeVisitZone: e.target.value })}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Décrivez les quartiers/zones que vous couvrez pour les visites à domicile
                </p>
              </CardContent>
            </Card>
          )}

          {/* Teleconsultation Platform (visible when teleconsultation is in consultationTypes) */}
          {formData.consultationTypes.includes('teleconsultation') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Plateforme de téléconsultation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.teleconsultationPlatform || ''}
                  onValueChange={(value) => updateFormData({ teleconsultationPlatform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir la plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    {TELECONSULTATION_PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Patient Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Types de patients acceptés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PATIENT_TYPES.map((pt) => (
                  <Badge
                    key={pt}
                    variant={(formData.patientTypes || []).includes(pt) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleArrayItem('patientTypes', pt)}
                  >
                    {pt}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Women-only practice */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/40">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <Label className="font-medium">Cabinet réservé aux femmes</Label>
                    <p className="text-xs text-muted-foreground">Consultations exclusivement féminines</p>
                  </div>
                </div>
                <Switch
                  checked={formData.womenOnlyPractice || false}
                  onCheckedChange={(checked) => updateFormData({ womenOnlyPractice: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Consultation Fee for Doctors */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Shield className="h-5 w-5" />
                Tarif de consultation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Prix indicatif d'une consultation standard
              </p>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Ex: 2000 DA"
                value={formData.consultationFee || ''}
                onChange={(e) => updateFormData({ consultationFee: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Insurance Section for Doctors */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <ShieldCheck className="h-5 w-5" />
                  Assurances acceptées
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {(formData.insuranceAccepted || []).length} sélectionnée(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_OPTIONS.map((insurance) => (
                  <Badge
                    key={insurance}
                    variant={(formData.insuranceAccepted || []).includes(insurance) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      (formData.insuranceAccepted || []).includes(insurance)
                        ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        : "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                    )}
                    onClick={() => toggleArrayItem('insuranceAccepted', insurance)}
                  >
                    {insurance}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Consultation Type — all care providers */}
      {isCareProvider && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Type de consultation</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les modes de consultation proposés
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {CONSULTATION_TYPES.map((ct) => {
                const IconComponent = CONSULTATION_ICONS[ct.icon as keyof typeof CONSULTATION_ICONS];
                const isSelected = formData.consultationTypes.includes(ct.key);
                return (
                  <div
                    key={ct.key}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleArrayItem('consultationTypes', ct.key)}
                  >
                    <div className={cn(
                      "p-3 rounded-full transition-colors",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}>
                      <IconComponent className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <span className={cn("text-sm font-medium text-center", isSelected ? "text-primary" : "text-foreground")}>
                      {ct.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== DIAGNOSIS-SPECIFIC SECTIONS ========== */}

      {/* Analysis Types checklist — lab only */}
      {isDiagnosisProvider && formData.providerType === 'lab' && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-purple-600" />
                Types d'analyses
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {formData.analysisTypes.length} sélectionné(s)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ANALYSIS_TYPES.map((analysis) => (
                <div
                  key={analysis}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    formData.analysisTypes.includes(analysis)
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('analysisTypes', analysis)}
                >
                  <Checkbox
                    checked={formData.analysisTypes.includes(analysis)}
                    onCheckedChange={() => toggleArrayItem('analysisTypes', analysis)}
                  />
                  <Label className="text-sm cursor-pointer">{analysis}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Options — all diagnosis providers */}
      {isDiagnosisProvider && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Options du diagnostic
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Services complémentaires proposés par votre établissement
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Home Collection toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="font-medium">Prélèvement à domicile</Label>
                  <p className="text-xs text-muted-foreground">Proposez des prélèvements directement chez le patient</p>
                </div>
              </div>
              <Switch
                checked={formData.homeCollection}
                onCheckedChange={(checked) => updateFormData({ homeCollection: checked })}
              />
            </div>

            {/* Online Results toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="font-medium">Résultats en ligne</Label>
                  <p className="text-xs text-muted-foreground">Les patients peuvent consulter leurs résultats en ligne</p>
                </div>
              </div>
              <Switch
                checked={formData.onlineResults}
                onCheckedChange={(checked) => updateFormData({ onlineResults: checked })}
              />
            </div>

            {/* Turnaround time input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Délai moyen des résultats (heures)
              </Label>
              <Input
                type="number"
                min={1}
                placeholder="Ex: 24"
                value={formData.turnaroundHours ?? ''}
                onChange={(e) => updateFormData({ turnaroundHours: e.target.value ? Number(e.target.value) : null })}
              />
              <p className="text-xs text-muted-foreground">Temps moyen avant la disponibilité des résultats</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== LAB-SPECIFIC SECTIONS ========== */}

      {/* Test Catalog Manager — lab only */}
      {isLab && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <FlaskConical className="h-5 w-5" />
                Catalogue d'analyses
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {(formData.labTestCatalog || []).length} analyse(s)
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ajoutez vos analyses avec tarifs, délais et exigences
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add test form */}
            <div className="flex gap-2">
              <Input
                placeholder="Nom de l'analyse (ex: NFS, Glycémie...)"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLabTest())}
              />
              <Select value={newTestCategory} onValueChange={setNewTestCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {ANALYSIS_TYPES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addLabTest} disabled={!newTestName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            {(formData.labTestCatalog || []).length > 3 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une analyse..."
                  className="pl-10"
                  value={searchTest}
                  onChange={(e) => setSearchTest(e.target.value)}
                />
              </div>
            )}

            {/* Test list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredLabTests.map((test) => (
                <div key={test.id} className="p-3 rounded-lg border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">{test.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{test.category}</Badge>
                    </div>
                    <button type="button" onClick={() => removeLabTest(test.id)} className="hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Prix min (DA)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="200"
                        value={test.priceMin ?? ''}
                        onChange={(e) => updateLabTest(test.id, { priceMin: e.target.value ? Number(e.target.value) : null })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix max (DA)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="500"
                        value={test.priceMax ?? ''}
                        onChange={(e) => updateLabTest(test.id, { priceMax: e.target.value ? Number(e.target.value) : null })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Délai</Label>
                      <Select
                        value={test.turnaround}
                        onValueChange={(v) => updateLabTest(test.id, { turnaround: v as LabTest['turnaround'] })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LAB_TURNAROUND_OPTIONS.map(opt => (
                            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox
                        checked={test.prescriptionRequired}
                        onCheckedChange={(c) => updateLabTest(test.id, { prescriptionRequired: !!c })}
                      />
                      Ordonnance requise
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox
                        checked={test.fastingRequired}
                        onCheckedChange={(c) => updateLabTest(test.id, { fastingRequired: !!c })}
                      />
                      À jeun
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox
                        checked={test.cnasCovered}
                        onCheckedChange={(c) => updateLabTest(test.id, { cnasCovered: !!c })}
                      />
                      Couvert CNAS
                    </label>
                  </div>
                </div>
              ))}
              {(formData.labTestCatalog || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune analyse ajoutée. Commencez à remplir votre catalogue.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Delivery Methods — lab only */}
      {isLab && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-purple-600" />
              Méthodes de remise des résultats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LAB_RESULT_DELIVERY_METHODS.map((method) => (
                <Badge
                  key={method}
                  variant={(formData.labResultDeliveryMethods || []).includes(method) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleArrayItem('labResultDeliveryMethods', method)}
                >
                  {method}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Required — lab only */}
      {isLab && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <Label className="font-medium">Rendez-vous obligatoire</Label>
                  <p className="text-xs text-muted-foreground">Désactivez si le laboratoire accepte les sans rendez-vous</p>
                </div>
              </div>
              <Switch
                checked={formData.labAppointmentRequired}
                onCheckedChange={(checked) => updateFormData({ labAppointmentRequired: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Home Collection Details — lab only (shown when homeCollection is true) */}
      {isLab && formData.homeCollection && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Détails du prélèvement à domicile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Zone de couverture</Label>
              <Textarea
                placeholder="Ex: Centre-ville SBA, Hai El Badr, Sidi Djillali..."
                value={formData.homeCollectionZone || ''}
                onChange={(e) => updateFormData({ homeCollectionZone: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Frais de déplacement (DA)</Label>
              <Input
                placeholder="Ex: 500 DA ou Gratuit"
                value={formData.homeCollectionFee || ''}
                onChange={(e) => updateFormData({ homeCollectionFee: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accreditations — lab only */}
      {isLab && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              Accréditations & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LAB_ACCREDITATIONS.map((accr) => (
                <Badge
                  key={accr}
                  variant={(formData.labAccreditations || []).includes(accr) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    (formData.labAccreditations || []).includes(accr)
                      ? "bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
                      : "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400"
                  )}
                  onClick={() => toggleArrayItem('labAccreditations', accr)}
                >
                  {accr}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fasting Info Note — lab only */}
      {isLab && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Informations sur le jeûne
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Instructions générales affichées sur votre profil
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Pour les bilans sanguins, un jeûne de 12 heures est recommandé. Eau autorisée. Arrivez tôt le matin pour un prélèvement optimal."
              value={formData.labFastingInfoNote || ''}
              onChange={(e) => updateFormData({ labFastingInfoNote: e.target.value })}
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Insurance — lab only */}
      {isLab && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Assurances acceptées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INSURANCE_OPTIONS.map((insurance) => (
                <div
                  key={insurance}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    (formData.insuranceAccepted || []).includes(insurance)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('insuranceAccepted', insurance)}
                >
                  <Checkbox
                    checked={(formData.insuranceAccepted || []).includes(insurance)}
                    onCheckedChange={() => toggleArrayItem('insuranceAccepted', insurance)}
                  />
                  <Label className="text-sm cursor-pointer">{insurance}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== RADIOLOGY-SPECIFIC SECTIONS ========== */}

      {/* Exam Catalog Manager — radiology only */}
      {isRadiology && (
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <RadioTower className="h-5 w-5" />
                Catalogue d'examens
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {(formData.radiologyExamCatalog || []).length} examen(s)
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ajoutez vos examens d'imagerie avec tarifs, délais et préparations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add exam form */}
            <div className="flex gap-2">
              <Input
                placeholder="Nom de l'examen (ex: Radio thorax, IRM genou...)"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRadiologyExam())}
              />
              <Select value={newExamImagingType} onValueChange={setNewExamImagingType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Type imagerie" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGING_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addRadiologyExam} disabled={!newExamName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            {(formData.radiologyExamCatalog || []).length > 3 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un examen..."
                  className="pl-10"
                  value={searchExam}
                  onChange={(e) => setSearchExam(e.target.value)}
                />
              </div>
            )}

            {/* Exam list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredRadiologyExams.map((exam) => (
                <div key={exam.id} className="p-3 rounded-lg border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">{exam.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{exam.imagingType}</Badge>
                    </div>
                    <button type="button" onClick={() => removeRadiologyExam(exam.id)} className="hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Prix min (DA)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="2000"
                        value={exam.priceMin ?? ''}
                        onChange={(e) => updateRadiologyExam(exam.id, { priceMin: e.target.value ? Number(e.target.value) : null })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix max (DA)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="8000"
                        value={exam.priceMax ?? ''}
                        onChange={(e) => updateRadiologyExam(exam.id, { priceMax: e.target.value ? Number(e.target.value) : null })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Délai</Label>
                      <Select
                        value={exam.turnaround}
                        onValueChange={(v) => updateRadiologyExam(exam.id, { turnaround: v as RadiologyExam['turnaround'] })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LAB_TURNAROUND_OPTIONS.map(opt => (
                            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox
                        checked={exam.prescriptionRequired}
                        onCheckedChange={(c) => updateRadiologyExam(exam.id, { prescriptionRequired: !!c })}
                      />
                      Ordonnance requise
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox
                        checked={exam.cnasCovered}
                        onCheckedChange={(c) => updateRadiologyExam(exam.id, { cnasCovered: !!c })}
                      />
                      Couvert CNAS
                    </label>
                  </div>
                  {/* Preparation Instructions */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Instructions de préparation</Label>
                    <Textarea
                      placeholder="Ex: Vessie pleine, à jeun depuis 6h..."
                      value={exam.preparationInstructions || ''}
                      onChange={(e) => updateRadiologyExam(exam.id, { preparationInstructions: e.target.value })}
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
              {(formData.radiologyExamCatalog || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun examen ajouté. Commencez à remplir votre catalogue.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radiologist On-Site Toggle — radiology only */}
      {isRadiology && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <Label className="font-medium">Radiologue sur place</Label>
                  <p className="text-xs text-muted-foreground">Les comptes-rendus sont signés sur place par un radiologue</p>
                </div>
              </div>
              <Switch
                checked={formData.radiologistOnSite}
                onCheckedChange={(checked) => updateFormData({ radiologistOnSite: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Required — radiology only */}
      {isRadiology && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <Label className="font-medium">Rendez-vous obligatoire</Label>
                  <p className="text-xs text-muted-foreground">La plupart des examens d'imagerie nécessitent un rendez-vous</p>
                </div>
              </div>
              <Switch
                checked={formData.radiologyAppointmentRequired}
                onCheckedChange={(checked) => updateFormData({ radiologyAppointmentRequired: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Delivery Methods — radiology only */}
      {isRadiology && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Méthodes de remise des résultats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LAB_RESULT_DELIVERY_METHODS.map((method) => (
                <Badge
                  key={method}
                  variant={(formData.radiologyResultDeliveryMethods || []).includes(method) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleArrayItem('radiologyResultDeliveryMethods', method)}
                >
                  {method}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accreditations — radiology only */}
      {isRadiology && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Accréditations & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {RADIOLOGY_ACCREDITATIONS.map((accr) => (
                <Badge
                  key={accr}
                  variant={(formData.radiologyAccreditations || []).includes(accr) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    (formData.radiologyAccreditations || []).includes(accr)
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      : "border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400"
                  )}
                  onClick={() => toggleArrayItem('radiologyAccreditations', accr)}
                >
                  {accr}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insurance — radiology only */}
      {isRadiology && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Assurances acceptées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INSURANCE_OPTIONS.map((insurance) => (
                <div
                  key={insurance}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    (formData.insuranceAccepted || []).includes(insurance)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('insuranceAccepted', insurance)}
                >
                  <Checkbox
                    checked={(formData.insuranceAccepted || []).includes(insurance)}
                    onCheckedChange={() => toggleArrayItem('insuranceAccepted', insurance)}
                  />
                  <Label className="text-sm cursor-pointer">{insurance}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== PHARMACY-SPECIFIC SECTIONS ========== */}

      {/* Pharmacie de Garde toggle */}
      {isPharmacy && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              Pharmacie de Garde
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Activez lorsque votre pharmacie est de garde (service de nuit/week-end)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Pill className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <Label className="font-semibold text-emerald-700 dark:text-emerald-400">Pharmacie de Garde</Label>
                  <p className="text-xs text-muted-foreground">Service de nuit et week-end actif</p>
                </div>
              </div>
              <Switch
                checked={formData.isPharmacieDeGarde}
                onCheckedChange={(checked) => updateFormData({ isPharmacieDeGarde: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assurances acceptées — pharmacy */}
      {isPharmacy && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Assurances acceptées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INSURANCE_OPTIONS.map((insurance) => (
                <div
                  key={insurance}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    (formData.insuranceAccepted || []).includes(insurance)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('insuranceAccepted', insurance)}
                >
                  <Checkbox
                    checked={(formData.insuranceAccepted || []).includes(insurance)}
                    onCheckedChange={() => toggleArrayItem('insuranceAccepted', insurance)}
                  />
                  <Label className="text-sm cursor-pointer">{insurance}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services de la pharmacie */}
      {isPharmacy && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Services de la pharmacie
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {formData.pharmacyServices.length} sélectionné(s)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PHARMACY_SERVICES.map((service) => (
                <div
                  key={service}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    formData.pharmacyServices.includes(service)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('pharmacyServices', service)}
                >
                  <Checkbox
                    checked={formData.pharmacyServices.includes(service)}
                    onCheckedChange={() => toggleArrayItem('pharmacyServices', service)}
                  />
                  <Label className="text-sm cursor-pointer">{service}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pharmacy Garde Schedule — upcoming duty periods */}
      {isPharmacy && formData.isPharmacieDeGarde && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Calendar className="h-5 w-5" />
              Planning de garde
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Indiquez vos prochaines périodes de garde
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newSlot = {
                  id: `garde_${Date.now()}`,
                  startDate: '',
                  endDate: '',
                  note: '',
                };
                updateFormData({
                  pharmacyGardeSchedule: [...(formData.pharmacyGardeSchedule || []), newSlot]
                });
              }}
              className="w-full gap-2 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            >
              <Plus className="h-4 w-4" />
              Ajouter une période de garde
            </Button>

            {(formData.pharmacyGardeSchedule || []).map((slot, idx) => (
              <div key={slot.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Garde #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => updateFormData({
                      pharmacyGardeSchedule: (formData.pharmacyGardeSchedule || []).filter(s => s.id !== slot.id)
                    })}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Date de début</Label>
                    <Input
                      type="date"
                      value={slot.startDate}
                      onChange={(e) => {
                        const updated = (formData.pharmacyGardeSchedule || []).map(s =>
                          s.id === slot.id ? { ...s, startDate: e.target.value } : s
                        );
                        updateFormData({ pharmacyGardeSchedule: updated });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date de fin</Label>
                    <Input
                      type="date"
                      value={slot.endDate}
                      onChange={(e) => {
                        const updated = (formData.pharmacyGardeSchedule || []).map(s =>
                          s.id === slot.id ? { ...s, endDate: e.target.value } : s
                        );
                        updateFormData({ pharmacyGardeSchedule: updated });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Note (optionnel)</Label>
                  <Input
                    placeholder="Ex: Garde de nuit uniquement"
                    value={slot.note}
                    onChange={(e) => {
                      const updated = (formData.pharmacyGardeSchedule || []).map(s =>
                        s.id === slot.id ? { ...s, note: e.target.value } : s
                      );
                      updateFormData({ pharmacyGardeSchedule: updated });
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pharmacy Duty Phone & Night Bell */}
      {isPharmacy && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-600" />
              Contact de garde & Sonnette de nuit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Téléphone de garde
              </Label>
              <Input
                placeholder="Ex: 0555 12 34 56"
                value={formData.pharmacyDutyPhone || ''}
                onChange={(e) => updateFormData({ pharmacyDutyPhone: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Numéro affiché pendant les périodes de garde</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <Label className="font-medium">Sonnette de nuit</Label>
                  <p className="text-xs text-muted-foreground">Une sonnette est disponible pour les urgences nocturnes</p>
                </div>
              </div>
              <Switch
                checked={formData.pharmacyNightBell || false}
                onCheckedChange={(checked) => updateFormData({ pharmacyNightBell: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pharmacy Home Delivery */}
      {isPharmacy && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Livraison à domicile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="font-medium">Livraison disponible</Label>
                  <p className="text-xs text-muted-foreground">Proposez la livraison de médicaments à domicile</p>
                </div>
              </div>
              <Switch
                checked={formData.pharmacyDeliveryAvailable || false}
                onCheckedChange={(checked) => updateFormData({ pharmacyDeliveryAvailable: checked })}
              />
            </div>

            {formData.pharmacyDeliveryAvailable && (
              <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label className="text-sm">Zone de livraison</Label>
                  <Input
                    placeholder="Ex: Sidi Bel Abbès centre, Hai Othmania, Hai El Badr"
                    value={formData.pharmacyDeliveryZone || ''}
                    onChange={(e) => updateFormData({ pharmacyDeliveryZone: e.target.value })}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Frais de livraison</Label>
                    <Input
                      placeholder="Ex: 200 DA ou Gratuit"
                      value={formData.pharmacyDeliveryFee || ''}
                      onChange={(e) => updateFormData({ pharmacyDeliveryFee: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Horaires de livraison</Label>
                    <Input
                      placeholder="Ex: 9h-18h, 7j/7"
                      value={formData.pharmacyDeliveryHours || ''}
                      onChange={(e) => updateFormData({ pharmacyDeliveryHours: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pharmacy Stock Info */}
      {isPharmacy && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Informations sur le stock
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Informations sur la disponibilité des médicaments (optionnel)
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Large stock de médicaments génériques et de marque. Spécialisé en dermocosmétique et parapharmacie. Commande sur demande sous 24-48h."
              value={formData.pharmacyStockInfo || ''}
              onChange={(e) => updateFormData({ pharmacyStockInfo: e.target.value })}
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* ========== BLOOD BANK ENHANCED SECTIONS ========== */}

      {/* Per-blood-type stock level dashboard */}
      {isBloodCabin && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <Droplets className="h-5 w-5" />
              Niveaux de stock par groupe sanguin
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Indiquez le niveau de stock pour chaque groupe sanguin
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BLOOD_TYPES.map((bloodType) => {
                const level = formData.bloodStockLevels?.[bloodType] || 'normal';
                return (
                  <div key={bloodType} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <span className="font-bold text-lg text-red-600 dark:text-red-400 min-w-[3rem]">{bloodType}</span>
                    <div className="flex gap-1.5">
                      {(['critical', 'low', 'normal'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateFormData({
                            bloodStockLevels: { ...formData.bloodStockLevels, [bloodType]: status }
                          })}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            level === status
                              ? status === 'critical'
                                ? "bg-red-500 text-white shadow-sm"
                                : status === 'low'
                                  ? "bg-orange-500 text-white shadow-sm"
                                  : "bg-emerald-500 text-white shadow-sm"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          {status === 'critical' ? 'Critique' : status === 'low' ? 'Faible' : 'Normal'}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerte Urgence — blood cabin */}
      {isBloodCabin && (
        <Card className="border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Alerte Urgence
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Diffuser un besoin urgent pour un groupe sanguin spécifique
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-800 bg-background">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/40">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <Label className="font-medium">Besoin urgent actif</Label>
                  <p className="text-xs text-muted-foreground">Alerte visible par les donneurs potentiels</p>
                </div>
              </div>
              <Switch
                checked={formData.urgentNeed || false}
                onCheckedChange={(checked) => updateFormData({ urgentNeed: checked })}
              />
            </div>
            {formData.urgentNeed && (
              <div className="space-y-2">
                <Label>Groupe sanguin recherché</Label>
                <Select
                  value={formData.urgentBloodType}
                  onValueChange={(value) => updateFormData({ urgentBloodType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un groupe sanguin" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== BLOOD CABIN ENHANCED SECTIONS ========== */}

      {/* Walk-in Toggle */}
      {isBloodCabin && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <Label className="font-medium">Don sans rendez-vous</Label>
                  <p className="text-xs text-muted-foreground">Les donneurs peuvent venir sans rendez-vous</p>
                </div>
              </div>
              <Switch
                checked={formData.bloodCabinWalkInAllowed}
                onCheckedChange={(checked) => updateFormData({ bloodCabinWalkInAllowed: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donation Campaign Manager */}
      {isBloodCabin && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <Calendar className="h-5 w-5" />
              Campagnes de don à venir
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Planifiez et annoncez vos campagnes de collecte de sang
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const campaign = {
                  id: `campaign_${Date.now()}`,
                  title: '',
                  date: '',
                  location: '',
                  description: '',
                };
                updateFormData({ donationCampaigns: [...(formData.donationCampaigns || []), campaign] });
              }}
              className="w-full gap-2 border-dashed border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Plus className="h-4 w-4" />
              Ajouter une campagne
            </Button>

            {(formData.donationCampaigns || []).map((campaign, idx) => (
              <div key={campaign.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Campagne #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => updateFormData({
                      donationCampaigns: formData.donationCampaigns.filter(c => c.id !== campaign.id)
                    })}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Titre</Label>
                    <Input
                      placeholder="Ex: Collecte Ramadan 2025"
                      value={campaign.title}
                      onChange={(e) => {
                        const updated = formData.donationCampaigns.map(c =>
                          c.id === campaign.id ? { ...c, title: e.target.value } : c
                        );
                        updateFormData({ donationCampaigns: updated });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={campaign.date}
                      onChange={(e) => {
                        const updated = formData.donationCampaigns.map(c =>
                          c.id === campaign.id ? { ...c, date: e.target.value } : c
                        );
                        updateFormData({ donationCampaigns: updated });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Lieu</Label>
                  <Input
                    placeholder="Ex: Place de la Mairie, Centre-ville SBA"
                    value={campaign.location}
                    onChange={(e) => {
                      const updated = formData.donationCampaigns.map(c =>
                        c.id === campaign.id ? { ...c, location: e.target.value } : c
                      );
                      updateFormData({ donationCampaigns: updated });
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Décrivez la campagne (horaires, conditions, etc.)"
                    value={campaign.description}
                    onChange={(e) => {
                      const updated = formData.donationCampaigns.map(c =>
                        c.id === campaign.id ? { ...c, description: e.target.value } : c
                      );
                      updateFormData({ donationCampaigns: updated });
                    }}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Mobile Donation Unit Schedule */}
      {isBloodCabin && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <Truck className="h-5 w-5" />
              Unités mobiles de collecte
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Si vous disposez d'unités mobiles qui se déplacent dans d'autres lieux
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const unit = {
                  id: `unit_${Date.now()}`,
                  name: '',
                  schedule: '',
                  area: '',
                };
                updateFormData({ mobileDonationUnits: [...(formData.mobileDonationUnits || []), unit] });
              }}
              className="w-full gap-2 border-dashed border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Plus className="h-4 w-4" />
              Ajouter une unité mobile
            </Button>

            {(formData.mobileDonationUnits || []).map((unit, idx) => (
              <div key={unit.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Unité #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => updateFormData({
                      mobileDonationUnits: formData.mobileDonationUnits.filter(u => u.id !== unit.id)
                    })}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nom de l'unité</Label>
                    <Input
                      placeholder="Ex: Unité Mobile Nord"
                      value={unit.name}
                      onChange={(e) => {
                        const updated = formData.mobileDonationUnits.map(u =>
                          u.id === unit.id ? { ...u, name: e.target.value } : u
                        );
                        updateFormData({ mobileDonationUnits: updated });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Zone couverte</Label>
                    <Input
                      placeholder="Ex: Hai Othmania, Hai El Badr"
                      value={unit.area}
                      onChange={(e) => {
                        const updated = formData.mobileDonationUnits.map(u =>
                          u.id === unit.id ? { ...u, area: e.target.value } : u
                        );
                        updateFormData({ mobileDonationUnits: updated });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Planning</Label>
                  <Input
                    placeholder="Ex: Lundi & Mercredi — 9h à 15h"
                    value={unit.schedule}
                    onChange={(e) => {
                      const updated = formData.mobileDonationUnits.map(u =>
                        u.id === unit.id ? { ...u, schedule: e.target.value } : u
                      );
                      updateFormData({ mobileDonationUnits: updated });
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Preparation Guidelines */}
      {isBloodCabin && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ClipboardList className="h-5 w-5" />
              Consignes de préparation pour les donneurs
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Informations importantes que les donneurs doivent connaître avant de venir
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Buvez beaucoup d'eau la veille. Ne venez pas à jeun. Prévoyez 30 à 45 minutes. Apportez votre carte d'identité..."
              value={formData.donationPreparationGuidelines || ''}
              onChange={(e) => updateFormData({ donationPreparationGuidelines: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Donation Stats */}
      {isBloodCabin && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <Heart className="h-5 w-5" />
              Statistiques de don
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Délai minimum entre dons (jours)
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="56"
                  value={formData.minDaysBetweenDonations ?? ''}
                  onChange={(e) => updateFormData({ minDaysBetweenDonations: e.target.value ? Number(e.target.value) : null })}
                />
                <p className="text-xs text-muted-foreground">Standard: 56 jours pour le sang total</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  Total de dons reçus
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ex: 1250"
                  value={formData.totalDonationsReceived ?? ''}
                  onChange={(e) => updateFormData({ totalDonationsReceived: e.target.value ? Number(e.target.value) : null })}
                />
                <p className="text-xs text-muted-foreground">Affiché sur votre profil comme preuve sociale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Equipment Business Type selector */}
      {isEquipment && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Type d'activité
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les types d'activité que vous proposez
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {EQUIPMENT_BUSINESS_TYPES.map((bt) => {
                const icons = { ShoppingBag, RefreshCw, Wrench } as Record<string, typeof ShoppingBag>;
                const IconComp = icons[bt.icon] || Package;
                const isSelected = (formData.equipmentBusinessTypes || []).includes(bt.key);
                return (
                  <div
                    key={bt.key}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleArrayItem('equipmentBusinessTypes', bt.key)}
                  >
                    <div className={cn(
                      "p-3 rounded-full transition-colors",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}>
                      <IconComp className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <span className={cn("text-sm font-medium text-center", isSelected ? "text-primary" : "text-foreground")}>
                      {bt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Livraison et Installation toggle */}
      {isEquipment && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Livraison et Installation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="font-medium">Livraison et Installation</Label>
                  <p className="text-xs text-muted-foreground">Proposez la livraison et l'installation à domicile</p>
                </div>
              </div>
              <Switch
                checked={formData.installationAvailable}
                onCheckedChange={(checked) => updateFormData({ installationAvailable: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Catalog Upload — equipment only */}
      {isEquipment && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Catalogue PDF
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Téléchargez votre catalogue de produits au format PDF (max 10 Mo)
            </p>
          </CardHeader>
          <CardContent>
            {formData.catalogPdfUrl ? (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-full bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Catalogue téléchargé</p>
                    <a href={formData.catalogPdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      Voir le fichier
                    </a>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRemoveCatalog} className="shrink-0">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <label className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5",
                catalogUploading && "pointer-events-none opacity-60"
              )}>
                {catalogUploading ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">{catalogUploading ? 'Téléchargement en cours...' : 'Cliquez pour télécharger'}</p>
                  <p className="text-xs text-muted-foreground">PDF uniquement, 10 Mo max</p>
                </div>
                <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleCatalogUpload} disabled={catalogUploading} />
              </label>
            )}
            {errors.catalog && (
              <p className="text-sm text-destructive mt-2">{errors.catalog}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Product Catalog Manager */}
      {isEquipment && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Catalogue de produits
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ajoutez vos produits avec prix de vente/location, disponibilité CNAS et stock
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nom du produit (ex: Fauteuil roulant pliable)"
                value={newEquipmentProductName}
                onChange={(e) => setNewEquipmentProductName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEquipmentProduct(); } }}
              />
              <Select value={newEquipmentProductCategory} onValueChange={setNewEquipmentProductCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_PRODUCT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addEquipmentProduct} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {(formData.equipmentCatalog || []).length > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {(formData.equipmentCatalog || []).map((product, idx) => (
                  <div key={product.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-sm">{product.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{product.category}</Badge>
                      </div>
                      <button type="button" onClick={() => removeEquipmentProduct(product.id)} className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Disponible en</Label>
                        <Select
                          value={product.availableFor}
                          onValueChange={(v) => updateEquipmentProduct(product.id, { availableFor: v as any })}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sale">Vente uniquement</SelectItem>
                            <SelectItem value="rental">Location uniquement</SelectItem>
                            <SelectItem value="both">Vente & Location</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(product.availableFor === 'sale' || product.availableFor === 'both') && (
                        <div className="space-y-1">
                          <Label className="text-xs">Prix vente (DA)</Label>
                          <Input type="number" min={0} placeholder="Ex: 45000" className="h-8 text-xs"
                            value={product.salePrice ?? ''} onChange={(e) => updateEquipmentProduct(product.id, { salePrice: e.target.value ? Number(e.target.value) : null })} />
                        </div>
                      )}
                      {(product.availableFor === 'rental' || product.availableFor === 'both') && (
                        <div className="space-y-1">
                          <Label className="text-xs">Prix location/jour (DA)</Label>
                          <Input type="number" min={0} placeholder="Ex: 1500" className="h-8 text-xs"
                            value={product.rentalPricePerDay ?? ''} onChange={(e) => updateEquipmentProduct(product.id, { rentalPricePerDay: e.target.value ? Number(e.target.value) : null })} />
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Marque</Label>
                        <Input placeholder="Ex: Invacare" className="h-8 text-xs" value={product.brand}
                          onChange={(e) => updateEquipmentProduct(product.id, { brand: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Stock</Label>
                        <Select value={product.stockStatus} onValueChange={(v) => updateEquipmentProduct(product.id, { stockStatus: v as any })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(EQUIPMENT_STOCK_STATUS_LABELS).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-4 pb-1">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Checkbox checked={product.prescriptionRequired} onCheckedChange={(c) => updateEquipmentProduct(product.id, { prescriptionRequired: !!c })} />
                          <span>Ordonnance</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Checkbox checked={product.cnasReimbursable} onCheckedChange={(c) => updateEquipmentProduct(product.id, { cnasReimbursable: !!c })} />
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">CNAS</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(formData.equipmentCatalog || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun produit ajouté. Ajoutez vos produits pour qu'ils soient visibles sur votre profil.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Brands */}
      {isEquipment && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Marques distribuées
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les marques que vous distribuez (les citoyens recherchent souvent par marque)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COMMON_EQUIPMENT_BRANDS.map(brand => (
                <Badge
                  key={brand}
                  variant={(formData.equipmentBrands || []).includes(brand) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleArrayItem('equipmentBrands', brand)}
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance & Technical Support */}
      {isEquipment && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Maintenance & Support technique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="font-medium">Service maintenance / réparation</Label>
                  <p className="text-xs text-muted-foreground">Pour les équipements que vous avez vendus</p>
                </div>
              </div>
              <Switch checked={formData.maintenanceServiceAvailable} onCheckedChange={(c) => updateFormData({ maintenanceServiceAvailable: c })} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="font-medium">Assistance technique par téléphone</Label>
                  <p className="text-xs text-muted-foreground">Guidage téléphonique pour l'utilisation des appareils</p>
                </div>
              </div>
              <Switch checked={formData.technicalSupportAvailable} onCheckedChange={(c) => updateFormData({ technicalSupportAvailable: c })} />
            </div>
            {formData.technicalSupportAvailable && (
              <div className="space-y-2 pl-12">
                <Label className="text-sm">Numéro de support technique</Label>
                <Input placeholder="Ex: 0550 123 456" value={formData.technicalSupportPhone}
                  onChange={(e) => updateFormData({ technicalSupportPhone: e.target.value })} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Zone & Fee — equipment specific */}
      {isEquipment && formData.installationAvailable && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Zone de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zone couverte</Label>
                <Input placeholder="Ex: Sidi Bel Abbès et environs (30 km)" value={formData.equipmentDeliveryZone}
                  onChange={(e) => updateFormData({ equipmentDeliveryZone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Frais de livraison</Label>
                <Input placeholder="Ex: 500 DA / Gratuit à partir de 20000 DA" value={formData.equipmentDeliveryFee}
                  onChange={(e) => updateFormData({ equipmentDeliveryFee: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Départements / Services</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ajoutez les départements de votre établissement
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Ex: Service de cardiologie"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
            />
            <Button type="button" onClick={addDepartment}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.departments.map((dept) => (
              <Badge key={dept} variant="secondary" className="px-3 py-1">
                {dept}
                <button
                  type="button"
                  onClick={() => removeDepartment(dept)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {formData.departments.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun département ajouté</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Équipements disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <div
                key={equipment}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  formData.equipment.includes(equipment)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                )}
                onClick={() => toggleArrayItem('equipment', equipment)}
              >
                <Checkbox
                  checked={formData.equipment.includes(equipment)}
                  onCheckedChange={() => toggleArrayItem('equipment', equipment)}
                />
                <Label className="text-sm cursor-pointer">{equipment}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ACCESSIBILITY_OPTIONS.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  formData.accessibilityFeatures.includes(option)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                )}
                onClick={() => toggleArrayItem('accessibilityFeatures', option)}
              >
                <Checkbox
                  checked={formData.accessibilityFeatures.includes(option)}
                  onCheckedChange={() => toggleArrayItem('accessibilityFeatures', option)}
                />
                <Label className="text-sm cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Langues parlées par le personnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES_OPTIONS.map((lang) => (
              <div
                key={lang.code}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full border cursor-pointer transition-colors",
                  formData.languages.includes(lang.code)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
                onClick={() => toggleArrayItem('languages', lang.code)}
              >
                <span className="text-sm font-medium">{lang.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button onClick={handleSubmit}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
