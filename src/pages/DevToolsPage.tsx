import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, Info, Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllProviders } from '@/services/firestoreProviderService';
import { CityHealthProvider } from '@/data/providers';

interface LogEntry {
  email: string;
  status: 'pending' | 'success' | 'skipped' | 'error';
  message: string;
}

const SBA_CENTER = { lat: 35.1975, lng: -0.6300 };

const TEST_ACCOUNTS = [
  {
    email: 'medecin@test.com',
    fullName: 'Dr. Karim Benali',
    providerData: {
      name: 'Cabinet Dr. Benali - Cardiologie',
      facilityNameFr: 'Cabinet Dr. Benali - Cardiologie',
      facilityNameAr: 'عيادة د. بنعلي - أمراض القلب',
      type: 'doctor',
      providerCategory: 'care',
      specialty: 'Cardiologie',
      specialties: ['Cardiologie', 'Médecine interne'],
      secondarySpecialty: 'Médecine interne',
      emergencyCapable: true,
      is24_7: true,
      emergency: true,
      consultationTypes: ['Consultation générale', 'ECG', 'Échographie cardiaque'],
      consultationFee: 3000,
      homeVisitAvailable: true,
      homeVisitZone: 'Centre-ville SBA, Hai Othmania, Hai El Badr',
      services: ['Consultation', 'ECG', 'Échographie', 'Holter'],
      insurances: ['CNAS', 'CASNOS', 'CHIFA'],
      languages: ['fr', 'ar'],
      phone: '048 54 12 34',
      address: '12 Rue de la Liberté, Sidi Bel Abbès',
      city: 'Sidi Bel Abbès',
      area: 'Centre-ville',
      lat: SBA_CENTER.lat + 0.005,
      lng: SBA_CENTER.lng + 0.003,
      description: 'Cardiologue expérimenté avec plus de 15 ans de pratique. Spécialisé en cardiologie interventionnelle.',
      // Doctor-specific fields
      medicalSchool: 'Université Djillali Liabès - Sidi Bel Abbès',
      graduationYear: 2008,
      yearsOfExperience: 17,
      teleconsultationPlatform: 'WhatsApp Video',
      ordreMedecinsNumber: 'OM-22-4567',
      trainedAbroad: true,
      trainingCountry: 'France',
      womenOnlyPractice: false,
      patientTypes: ['Adultes', 'Enfants'],
      schedule: {
        samedi: { open: '08:00', close: '16:00' },
        dimanche: { open: '08:00', close: '16:00' },
        lundi: { open: '08:00', close: '16:00' },
        mardi: { open: '08:00', close: '16:00' },
        mercredi: { open: '08:00', close: '12:00' },
      },
    },
  },
  {
    email: 'labo@test.com',
    fullName: 'Laboratoire El Shifa',
    providerData: {
      name: 'Laboratoire El Shifa',
      facilityNameFr: 'Laboratoire El Shifa',
      facilityNameAr: 'مختبر الشفاء',
      type: 'lab',
      providerCategory: 'diagnosis',
      specialty: "Laboratoire d'Analyses",
      imagingTypes: ['IRM', 'Scanner', 'Radiographie'],
      analysisTypes: ['Hématologie', 'Biochimie', 'Sérologie', 'Bactériologie'],
      homeCollection: true,
      onlineResults: true,
      turnaroundHours: 24,
      services: ['Analyses sanguines', 'IRM', 'Scanner', 'Radiographie', 'Échographie'],
      insurances: ['CNAS', 'CHIFA'],
      languages: ['fr', 'ar'],
      phone: '048 55 67 89',
      address: '45 Boulevard Colonel Lotfi, Sidi Bel Abbès',
      city: 'Sidi Bel Abbès',
      area: 'Hai Othmania',
      lat: SBA_CENTER.lat - 0.004,
      lng: SBA_CENTER.lng + 0.006,
      description: "Laboratoire d'analyses médicales et centre d'imagerie équipé des dernières technologies.",
      schedule: {
        samedi: { open: '07:00', close: '18:00' },
        dimanche: { open: '07:00', close: '18:00' },
        lundi: { open: '07:00', close: '18:00' },
        mardi: { open: '07:00', close: '18:00' },
        mercredi: { open: '07:00', close: '18:00' },
        jeudi: { open: '07:00', close: '14:00' },
      },
    },
  },
  {
    email: 'pharma@test.com',
    fullName: 'Pharmacie Centrale',
    providerData: {
      name: 'Pharmacie Centrale El Amel',
      facilityNameFr: 'Pharmacie Centrale El Amel',
      facilityNameAr: 'صيدلية الأمل المركزية',
      type: 'pharmacy',
      providerCategory: 'specialized',
      specialty: 'Pharmacie',
      isPharmacieDeGarde: true,
      pharmacyServices: ['Livraison à domicile', 'Conseil pharmaceutique', 'Préparations magistrales', 'Matériel médical'],
      insurances: ['CHIFA', 'CNAS'],
      services: ['Médicaments', 'Parapharmacie', 'Matériel médical', 'Conseil'],
      languages: ['fr', 'ar'],
      phone: '048 56 78 90',
      address: '3 Place 1er Novembre, Sidi Bel Abbès',
      city: 'Sidi Bel Abbès',
      area: 'Centre-ville',
      lat: SBA_CENTER.lat + 0.002,
      lng: SBA_CENTER.lng - 0.004,
      description: 'Pharmacie de garde ouverte 24h/24. Large gamme de médicaments et parapharmacie.',
      is24_7: true,
      emergency: true,
      schedule: {
        samedi: { open: '00:00', close: '23:59' },
        dimanche: { open: '00:00', close: '23:59' },
        lundi: { open: '00:00', close: '23:59' },
        mardi: { open: '00:00', close: '23:59' },
        mercredi: { open: '00:00', close: '23:59' },
        jeudi: { open: '00:00', close: '23:59' },
        vendredi: { open: '00:00', close: '23:59' },
      },
    },
  },
  {
    email: 'sang@test.com',
    fullName: 'Centre de Transfusion Sanguine SBA',
    providerData: {
      name: 'Centre de Transfusion Sanguine',
      facilityNameFr: 'Centre de Transfusion Sanguine de SBA',
      facilityNameAr: 'مركز نقل الدم سيدي بلعباس',
      type: 'blood_cabin',
      providerCategory: 'specialized',
      specialty: 'Centre de Don de Sang',
      bloodStockLevels: {
        'O-': 'critical',
        'O+': 'low',
        'A+': 'normal',
        'A-': 'low',
        'B+': 'normal',
        'B-': 'high',
        'AB+': 'normal',
        'AB-': 'critical',
      },
      urgentNeed: true,
      urgentBloodType: 'O-',
      stockStatus: 'critical',
      bloodTypes: ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      services: ['Don de sang', 'Don de plaquettes', 'Analyses de compatibilité'],
      languages: ['fr', 'ar'],
      phone: '048 57 89 01',
      address: 'CHU de Sidi Bel Abbès, Service Hématologie',
      city: 'Sidi Bel Abbès',
      area: 'Cité Hospitalière',
      lat: SBA_CENTER.lat - 0.006,
      lng: SBA_CENTER.lng - 0.002,
      description: 'Centre de transfusion sanguine du CHU. Besoin urgent de donneurs O- et AB-.',
      emergency: true,
    },
  },
  {
    email: 'equipement@test.com',
    fullName: 'MedEquip Algérie',
    providerData: {
      name: 'MedEquip Algérie - Équipement Médical',
      facilityNameFr: 'MedEquip Algérie',
      facilityNameAr: 'ميد إكيب الجزائر',
      type: 'medical_equipment',
      providerCategory: 'specialized',
      specialty: 'Équipement Médical',
      equipmentBusinessTypes: ['sale', 'rental'],
      installationAvailable: true,
      deliveryAvailable: true,
      rentalAvailable: true,
      productCategories: ['Fauteuils roulants', 'Lits médicalisés', 'Oxygénothérapie', 'Appareils de mesure'],
      services: ['Vente', 'Location', 'Installation', 'Maintenance', 'Livraison'],
      languages: ['fr', 'ar'],
      phone: '048 58 90 12',
      address: '78 Route de Tlemcen, Sidi Bel Abbès',
      city: 'Sidi Bel Abbès',
      area: 'Zone industrielle',
      lat: SBA_CENTER.lat + 0.008,
      lng: SBA_CENTER.lng - 0.007,
      description: 'Vente et location de matériel médical professionnel et particulier. Livraison et installation sur toute la wilaya.',
      schedule: {
        samedi: { open: '08:30', close: '17:00' },
        dimanche: { open: '08:30', close: '17:00' },
        lundi: { open: '08:30', close: '17:00' },
        mardi: { open: '08:30', close: '17:00' },
        mercredi: { open: '08:30', close: '17:00' },
      },
    },
  },
  {
    email: 'hopital@test.com',
    fullName: 'CHU Sidi Bel Abbès',
    providerData: {
      name: 'CHU Hassani Abdelkader',
      facilityNameFr: 'CHU Hassani Abdelkader',
      facilityNameAr: 'المستشفى الجامعي حساني عبد القادر',
      type: 'hospital',
      providerCategory: 'care',
      specialty: 'Hôpital Universitaire',
      specialties: ['Cardiologie', 'Chirurgie générale', 'Pédiatrie', 'Neurologie', 'Gynécologie-Obstétrique'],
      departments: ['Cardiologie', 'Urgences', 'Chirurgie', 'Pédiatrie', 'Maternité', 'Radiologie'],
      emergencyCapable: true,
      is24_7: true,
      emergency: true,
      numberOfBeds: 450,
      hasReanimation: true,
      operatingBlocks: 8,
      consultationTypes: ['in_person'],
      insurances: ['CNAS', 'CASNOS', 'CHIFA'],
      languages: ['fr', 'ar'],
      phone: '048 54 00 00',
      ambulancePhone: '048 54 00 01',
      receptionPhone: '048 54 00 02',
      adminPhone: '048 54 00 03',
      waitTimeMinutes: 25,
      waitTimeUpdatedAt: new Date().toISOString(),
      departmentSchedules: {
        'Cardiologie': { open: '08:00', close: '16:00' },
        'Urgences': { open: '00:00', close: '23:59' },
        'Chirurgie': { open: '08:00', close: '16:00' },
        'Pédiatrie': { open: '08:00', close: '17:00' },
        'Maternité': { open: '00:00', close: '23:59' },
        'Radiologie': { open: '07:00', close: '18:00' },
      },
      landmarkDescription: 'En face du Stade 20 Août, à côté de la Mosquée El-Feth',
      accessibilityFeatures: ['Accès fauteuil roulant', 'Ascenseur', 'Parking handicapé'],
      address: '1 Boulevard de l\'Hôpital, Sidi Bel Abbès',
      city: 'Sidi Bel Abbès',
      area: 'Cité Hospitalière',
      lat: SBA_CENTER.lat - 0.003,
      lng: SBA_CENTER.lng + 0.001,
      description: 'Centre hospitalier universitaire offrant des soins spécialisés dans toutes les disciplines médicales. Urgences 24/7, bloc opératoire moderne et service de réanimation.',
      services: ['Urgences', 'Chirurgie', 'Hospitalisation', 'Consultations spécialisées', 'Radiologie', 'Laboratoire'],
      schedule: {
        samedi: { open: '00:00', close: '23:59' },
        dimanche: { open: '00:00', close: '23:59' },
        lundi: { open: '00:00', close: '23:59' },
        mardi: { open: '00:00', close: '23:59' },
        mercredi: { open: '00:00', close: '23:59' },
        jeudi: { open: '00:00', close: '23:59' },
        vendredi: { open: '00:00', close: '23:59' },
      },
    },
  },
  {
    email: 'maternite@test.com',
    fullName: 'Maternité Sidi Bel Abbès',
    providerData: {
      name: 'Maternité Sidi Bel Abbès',
      facilityNameFr: 'Maternité Sidi Bel Abbès',
      facilityNameAr: 'مستشفى الولادة سيدي بلعباس',
      type: 'birth_hospital',
      providerCategory: 'care',
      specialty: 'Maternité',
      emergencyCapable: true,
      is24_7: true,
      emergency: true,
      numberOfBeds: 80,
      hasReanimation: true,
      operatingBlocks: 2,
      deliveryRooms: 6,
      hasNICU: true,
      femaleStaffOnly: true,
      pediatricianOnSite: true,
      maternityEmergencyPhone: '048 55 00 01',
      visitingHoursPolicy: 'Tous les jours de 14h00 à 17h00. Un seul accompagnant autorisé.',
      maternityServices: [
        'Accouchement normal', 'Césarienne', 'Péridurale',
        'Réanimation néonatale (NICU)', 'Suivi prénatal', 'Suivi postnatal',
        'Échographie obstétricale', 'Préparation à la naissance', 'Allaitement - consultation'
      ],
      insurances: ['CNAS', 'CASNOS'],
      accessibilityFeatures: ['Accès fauteuil roulant', 'Ascenseur'],
      languages: ['fr', 'ar'],
      phone: '048 55 00 00',
      address: '25 Rue de la Maternité, Sidi Bel Abbès',
      city: 'Sidi Bel Abbès',
      area: 'Cité Hospitalière',
      lat: SBA_CENTER.lat - 0.005,
      lng: SBA_CENTER.lng + 0.004,
      landmarkDescription: 'À côté du CHU, en face de la cité des 200 logements',
      description: 'Maternité publique offrant des soins prénataux, accouchements et suivi postnatal. Personnel féminin, pédiatre sur place, NICU disponible.',
      services: ['Accouchement', 'Suivi prénatal', 'Suivi postnatal', 'Échographie', 'NICU'],
      schedule: {
        samedi: { open: '00:00', close: '23:59' },
        dimanche: { open: '00:00', close: '23:59' },
        lundi: { open: '00:00', close: '23:59' },
        mardi: { open: '00:00', close: '23:59' },
        mercredi: { open: '00:00', close: '23:59' },
        jeudi: { open: '00:00', close: '23:59' },
        vendredi: { open: '00:00', close: '23:59' },
      },
    },
  },
  {
    email: 'clinique@test.com',
    fullName: 'Clinique El Hayat',
    providerData: {
      name: 'Clinique El Hayat',
      facilityNameFr: 'Clinique El Hayat',
      facilityNameAr: 'عيادة الحياة',
      type: 'clinic',
      providerCategory: 'care',
      specialty: 'Clinique privée',
      specialties: ['Chirurgie générale', 'Orthopédie', 'Cardiologie'],
      numberOfBeds: 30,
      consultationRooms: 8,
      operatingBlocks: 3,
      hasReanimation: true,
      surgeriesOffered: ['Chirurgie générale', 'Chirurgie orthopédique', 'Endoscopie'],
      doctorRoster: [
        { name: 'Dr. Amina Khelifi', specialty: 'Chirurgie générale' },
        { name: 'Dr. Youcef Mansouri', specialty: 'Orthopédie' },
        { name: 'Dr. Fatima Zahra Bensalem', specialty: 'Cardiologie' },
      ],
      paymentMethods: ['Espèces', 'CCP/Baridi Mob', 'Tiers payant CNAS'],
      parkingAvailable: true,
      emergencyCapable: false,
      insurances: ['CNAS', 'CASNOS', 'Assurance privée'],
      accessibilityFeatures: ['Accès fauteuil roulant', 'Ascenseur', 'Parking handicapé'],
      languages: ['fr', 'ar'],
      phone: '048 56 12 34',
      address: '55 Boulevard de la République, Sidi Bel Abbès',
      city: 'Sidi Bel Abbès',
      area: 'Centre-ville',
      lat: SBA_CENTER.lat + 0.004,
      lng: SBA_CENTER.lng - 0.003,
      landmarkDescription: 'En face du Tribunal, à côté de la Banque BNA',
      description: 'Clinique privée multidisciplinaire offrant chirurgie programmée, consultations spécialisées et hospitalisation courte durée.',
      services: ['Chirurgie', 'Consultations spécialisées', 'Hospitalisation', 'Endoscopie'],
      schedule: {
        samedi: { open: '08:00', close: '18:00' },
        dimanche: { open: '08:00', close: '18:00' },
        lundi: { open: '08:00', close: '18:00' },
        mardi: { open: '08:00', close: '18:00' },
        mercredi: { open: '08:00', close: '18:00' },
        jeudi: { open: '08:00', close: '14:00' },
      },
    },
  },
];

const statusIcon = (status: LogEntry['status']) => {
  switch (status) {
    case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'skipped': return <Info className="h-4 w-4 text-blue-500" />;
    case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    default: return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }
};

export default function DevToolsPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (entry: LogEntry) => setLogs(prev => [...prev, entry]);
  const updateLog = (email: string, update: Partial<LogEntry>) =>
    setLogs(prev => prev.map(l => l.email === email ? { ...l, ...update } : l));

  const seedAccounts = async () => {
    setLoading(true);
    setLogs([]);

    for (const account of TEST_ACCOUNTS) {
      addLog({ email: account.email, status: 'pending', message: 'Création en cours...' });

      try {
        // 1. Create Firebase Auth user
        const cred = await createUserWithEmailAndPassword(auth, account.email, 'Test1234!');
        const uid = cred.user.uid;

        // 2. Write users/{uid}
        await setDoc(doc(db, 'users', uid), {
          userType: 'provider',
          email: account.email,
          createdAt: Timestamp.now(),
        });

        // 3. Write profiles/{uid}
        await setDoc(doc(db, 'profiles', uid), {
          full_name: account.fullName,
          email: account.email,
          avatar_url: null,
        });

        // 4. Write providers/{uid}
        await setDoc(doc(db, 'providers', uid), {
          ...account.providerData,
          userId: uid,
          verificationStatus: 'verified',
          isPublic: true,
          verified: true,
          accessible: true,
          isOpen: true,
          rating: 4.5,
          reviewsCount: 0,
          distance: 0,
          image: '/placeholder.svg',
          gallery: [],
          reviews: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        updateLog(account.email, { status: 'success', message: `Créé (UID: ${uid.slice(0, 8)}...)` });
        toast.success(`${account.fullName} créé avec succès`);

        // Sign out so we don't stay logged in as the last created user
        await auth.signOut();
      } catch (error: any) {
        if (error?.code === 'auth/email-already-in-use') {
          // Account exists — update Firestore data with latest fields
          try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const existingCred = await signInWithEmailAndPassword(auth, account.email, 'Test1234!');
            const existingUid = existingCred.user.uid;

            // Update providers/{uid} with latest data (merge to keep existing fields)
            const { setDoc: setDocMerge } = await import('firebase/firestore');
            await setDocMerge(doc(db, 'providers', existingUid), {
              ...account.providerData,
              userId: existingUid,
              verificationStatus: 'verified',
              isPublic: true,
              verified: true,
              accessible: true,
              isOpen: true,
              updatedAt: Timestamp.now(),
            }, { merge: true });

            await auth.signOut();
            updateLog(account.email, { status: 'success', message: `Mis à jour (UID: ${existingUid.slice(0, 8)}...)` });
            toast.success(`${account.email} mis à jour avec les derniers champs`);
          } catch (updateError: any) {
            updateLog(account.email, { status: 'skipped', message: `Existe déjà, mise à jour échouée: ${updateError.message}` });
            toast.info(`${account.email} existe déjà, mise à jour échouée`);
          }
        } else {
          updateLog(account.email, { status: 'error', message: error.message || 'Erreur inconnue' });
          toast.error(`Erreur: ${account.email} — ${error.message}`);
        }
      }
    }

    setLoading(false);
    toast.success('Seeding terminé !');
  };

  const [syncSecret, setSyncSecret] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ upserted: number; removed: number; errors: string[] } | null>(null);

  const mapToPublicFields = (p: CityHealthProvider) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    specialty: p.specialty || null,
    address: p.address || null,
    city: p.city || null,
    area: p.area || null,
    phone: p.phone || null,
    lat: p.lat || null,
    lng: p.lng || null,
    is_verified: true,
    is_24h: Boolean(p.is24_7 || p.emergency),
    is_open: p.isOpen !== false,
    rating: p.rating || 0,
    reviews_count: p.reviewsCount || 0,
    description: p.description || null,
    languages: p.languages || null,
    image_url: p.image || null,
    night_duty: false,
  });

  const syncToApi = async () => {
    if (!syncSecret.trim()) {
      toast.error('Veuillez entrer le secret de synchronisation.');
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      // Fetch all providers from Firestore
      const allProviders = await getAllProviders();
      
      // Filter verified only
      const verified = allProviders.filter(
        p => p.verificationStatus === 'verified' && p.isPublic
      );

      if (verified.length === 0) {
        toast.info('Aucun prestataire vérifié trouvé à synchroniser.');
        setSyncing(false);
        return;
      }

      // Map to safe public fields
      const publicData = verified.map(mapToPublicFields);

      // POST to sync-provider edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sync-secret': syncSecret,
        },
        body: JSON.stringify(publicData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Erreur: ${result.error || 'Échec de synchronisation'}`);
        setSyncResult({ upserted: 0, removed: 0, errors: [result.error] });
      } else {
        const { upserted, removed, errors } = result.data;
        setSyncResult({
          upserted: upserted?.length || 0,
          removed: removed?.length || 0,
          errors: errors || [],
        });
        toast.success(
          `✅ ${upserted?.length || 0} prestataire(s) synchronisé(s) vers l'API publique.`
        );
      }
    } catch (err: any) {
      toast.error(`Erreur réseau: ${err.message}`);
      setSyncResult({ upserted: 0, removed: 0, errors: [err.message] });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-2xl mx-auto space-y-6">
      {/* Existing Dev Tools Card */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <Badge variant="destructive">DEV ONLY</Badge>
          </div>
          <CardTitle className="text-xl">Outils de Développement</CardTitle>
          <p className="text-sm text-muted-foreground">
            Génère 8 comptes provider de test dans Firebase Auth + Firestore avec des données catégorie-spécifiques.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={seedAccounts} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Générer les 8 comptes de test
          </Button>

          {logs.length > 0 && (
            <div className="space-y-2 rounded-md border p-3 bg-muted/30">
              {logs.map(log => (
                <div key={log.email} className="flex items-center gap-2 text-sm">
                  {statusIcon(log.status)}
                  <span className="font-mono text-xs">{log.email}</span>
                  <span className="text-muted-foreground">— {log.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Sync Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="border-primary text-primary">API</Badge>
          </div>
          <CardTitle className="text-xl">Force Sync — API Publique</CardTitle>
          <p className="text-sm text-muted-foreground">
            Synchronisation manuelle immédiate des prestataires vérifiés de Firestore vers la table <code className="text-xs bg-muted px-1 rounded">providers_public</code>.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            ℹ️ Un cron Firebase automatique synchronise ces données toutes les 24h. Utilisez ce bouton uniquement pour forcer une mise à jour immédiate.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sync-secret">Secret de synchronisation</Label>
            <Input
              id="sync-secret"
              type="password"
              placeholder="Entrez le x-sync-secret..."
              value={syncSecret}
              onChange={(e) => setSyncSecret(e.target.value)}
            />
          </div>

          <Button onClick={syncToApi} disabled={syncing || !syncSecret.trim()} className="w-full">
            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {syncing ? 'Synchronisation en cours...' : '⚡ Force Sync — Synchroniser maintenant'}
          </Button>

          {syncResult && (
            <div className="rounded-md border p-3 bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span><strong>{syncResult.upserted}</strong> prestataire(s) synchronisé(s)</span>
              </div>
              {syncResult.removed > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span><strong>{syncResult.removed}</strong> retiré(s) (non vérifiés)</span>
                </div>
              )}
              {syncResult.errors.length > 0 && (
                <div className="space-y-1">
                  {syncResult.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle className="h-3 w-3" />
                      <span className="text-xs">{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
