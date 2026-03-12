import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProviderStats, ProviderStats } from '@/services/providerAnalyticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Eye, Phone, MapPin, TrendingUp, Calendar, Star, 
  Settings, BarChart3, Clock, Megaphone, Shield, Crown,
  AlertTriangle, XCircle, CheckCircle2, Loader2, Lock,
  Globe, Users, Search, RefreshCw, Save, LayoutDashboard,
  Image, Gift, FileText, Droplet, Bell, ClipboardList,
  Home as HomeIcon, Upload, Pill, ToggleLeft, Package, Truck, ShoppingBag,
  Ambulance, Building2, Baby, Scissors, FlaskConical, GraduationCap, ScanLine, BookOpen, ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { CircularProgress } from '@/components/ui/circular-progress';
import { calculateProfileCompletion } from '@/components/provider/ProfileProgressBar';
import { ProviderOnboardingChecklist, OnboardingWelcome, OnboardingCelebration } from '@/components/provider/onboarding';
import { EnhancedVerificationCenter, type VerificationStatus } from '@/components/provider/EnhancedVerificationCenter';
import { ProviderAdsManager } from '@/components/ads/ProviderAdsManager';
import { AppointmentsDashboard } from '@/components/provider/AppointmentsDashboard';
import { AnalyticsCharts } from '@/components/provider/AnalyticsCharts';
import { SensitiveFieldsEditor } from '@/components/provider/SensitiveFieldsEditor';
import { NonSensitiveFieldsEditor } from '@/components/provider/NonSensitiveFieldsEditor';
import { VerificationRevokedBanner } from '@/components/provider/VerificationRevokedBanner';
import { VerificationApprovalBanner, setApprovalNotification } from '@/components/provider/VerificationApprovalBanner';
import { ProviderSettingsModal } from '@/components/provider/ProviderSettingsModal';
import { useProvider } from '@/contexts/ProviderContext';
import { useUpdateProviderWithVerification } from '@/hooks/useProviders';
import { useProviderOnboarding } from '@/hooks/useProviderOnboarding';
import { useOnboardingCelebrations } from '@/hooks/useOnboardingCelebrations';
import type { WeeklySchedule, CityHealthProvider } from '@/data/providers';
import { cn } from '@/lib/utils';
import { useReviewStats } from '@/hooks/useReviews';
import { useUpcomingAppointmentsCount } from '@/hooks/useAppointments';
import { useNavigate } from 'react-router-dom';
import { OfferList } from '@/components/provide/OfferList';
import { subscribeToMyOffers, deleteOffer } from '@/services/provide/provideService';
import { ProvideOffer, ProvideCategory } from '@/types/provide';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProviderPDFUpload } from '@/components/provider/ProviderPDFUpload';
import { LabTestCatalogEditor } from '@/components/provider/editors/LabTestCatalogEditor';
import { RadiologyExamCatalogEditor } from '@/components/provider/editors/RadiologyExamCatalogEditor';
import { EquipmentCatalogEditor } from '@/components/provider/editors/EquipmentCatalogEditor';
import { DoctorRosterEditor } from '@/components/provider/editors/DoctorRosterEditor';
import { DoctorEducationEditor } from '@/components/provider/editors/DoctorEducationEditor';
import { HospitalSettingsEditor } from '@/components/provider/editors/HospitalSettingsEditor';
import { MaternitySettingsEditor } from '@/components/provider/editors/MaternitySettingsEditor';
import { PharmacySettingsEditor } from '@/components/provider/editors/PharmacySettingsEditor';
import { BroadcastEmergencyPanel } from '@/components/blood-emergency/BroadcastEmergencyPanel';
import { ActiveEmergenciesDashboard } from '@/components/blood-emergency/ActiveEmergenciesDashboard';
import { 
  BloodEmergency, BloodEmergencyResponse, 
  getEmergenciesByProvider, subscribeToResponses, BLOOD_TYPES 
} from '@/services/bloodEmergencyService';
import { supabase } from '@/integrations/supabase/client';
import { ProviderArticlesManager } from '@/components/research/ProviderArticlesManager';
import { SubscriptionCard } from '@/components/provider/SubscriptionCard';
import { ProviderReviewsPanel } from '@/components/provider/ProviderReviewsPanel';

const getWelcomeModalKey = (providerId: string) =>
  `provider_onboarding_welcome_seen_${providerId}`;

// Extended provider type with revocation fields
interface ExtendedProvider extends CityHealthProvider {
  verificationRevokedAt?: Date | string;
  verificationRevokedReason?: string;
}

export default function ProviderDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    provider: providerData, 
    isLoading, 
    isVerified, 
    isPending, 
    isRejected,
    verificationStatus: contextVerificationStatus,
    updateProviderData,
    isSaving,
    refetch 
  } = useProvider();
  
  const { mutateAsync: updateWithVerification, isPending: isVerificationSaving } = useUpdateProviderWithVerification();
  
  const { data: reviewStats } = useReviewStats(providerData?.id);
  const { data: appointmentsCount = 0 } = useUpcomingAppointmentsCount(user?.uid);
  
  // Analytics stats from Firestore
  const [analyticsStats, setAnalyticsStats] = useState<ProviderStats | null>(null);
  
  useEffect(() => {
    if (user?.uid) {
      getProviderStats(user.uid).then(setAnalyticsStats).catch(console.warn);
    }
  }, [user?.uid]);

  const stats = {
    profileViews: analyticsStats?.profileViews || 0,
    phoneClicks: analyticsStats?.phoneClicks || 0,
    appointments: appointmentsCount,
    rating: reviewStats?.averageRating || 0,
    reviewsCount: reviewStats?.totalReviews || 0,
    favoritesCount: analyticsStats?.favoritesCount || 0,
    totalContactClicks: analyticsStats?.totalContactClicks || 0,
  };

  // Sensitive fields state (legal/identity)
  const [sensitiveData, setSensitiveData] = useState({
    name: '',
    facilityNameFr: '',
    facilityNameAr: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    postalCode: '',
    lat: 35.1975,
    lng: -0.6300,
    legalRegistrationNumber: '',
    contactPersonName: '',
    contactPersonRole: '',
    providerType: '',
  });
  
  // Original sensitive data for comparison
  const [originalSensitiveData, setOriginalSensitiveData] = useState(sensitiveData);

  // Non-sensitive fields state (profile/customization)
  const [nonSensitiveData, setNonSensitiveData] = useState({
    description: '',
    specialty: '',
    schedule: null as WeeklySchedule | null,
    accessible: true,
    emergency: false,
    photos: [] as string[],
    services: [] as string[],
    specialties: [] as string[],
    insurances: [] as string[],
    accessibility: [] as string[],
    languages: ['fr', 'ar'] as string[],
    homeVisitAvailable: false,
    consultationFee: '',
    socialLinks: {} as { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; website?: string },
  });
  
  const [originalNonSensitiveData, setOriginalNonSensitiveData] = useState(nonSensitiveData);

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [previousStatus, setPreviousStatus] = useState<VerificationStatus | null>(null);
  
  // Track if verification was revoked
  const extendedProvider = providerData as ExtendedProvider | null;
  const wasVerificationRevoked = !!extendedProvider?.verificationRevokedReason && isPending;

  // Ref to the tabs for programmatic navigation
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Giving for Free state
  const GIVING_ELIGIBLE_TYPES = ['doctor', 'pharmacy', 'médecin généraliste', 'médecin spécialiste', 'pharmacie'];
  const isGivingEligible = GIVING_ELIGIBLE_TYPES.includes((providerData?.type || '').toLowerCase());
  const isBloodCabin = (providerData?.type || '').toLowerCase() === 'blood_cabin';
  const isDiagnosisProvider = ['lab', 'radiology_center']
    .includes((providerData?.type || '').toLowerCase());
  const isLab = (providerData?.type || '').toLowerCase() === 'lab';
  const isRadiology = (providerData?.type || '').toLowerCase() === 'radiology_center';
  const isPharmacy = (providerData?.type || '').toLowerCase() === 'pharmacy';
  const isEquipment = (providerData?.type || '').toLowerCase() === 'medical_equipment';
  const isCareProvider = ['doctor', 'clinic', 'hospital', 'birth_hospital']
    .includes((providerData?.type || '').toLowerCase());
  const isClinicOrHospital = ['clinic', 'hospital', 'birth_hospital']
    .includes((providerData?.type || '').toLowerCase());
  const isHospital = (providerData?.type || '').toLowerCase() === 'hospital';
  const isMaternity = (providerData?.type || '').toLowerCase() === 'birth_hospital';
  const isClinicOnly = (providerData?.type || '').toLowerCase() === 'clinic';
  const isDoctor = (providerData?.type || '').toLowerCase() === 'doctor';
  const [myOffers, setMyOffers] = useState<ProvideOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offerCategory, setOfferCategory] = useState<ProvideCategory | undefined>();
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);

  // ===== Quote Requests State (Equipment providers) =====
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  useEffect(() => {
    if (!isEquipment || !providerData?.id) return;
    setQuotesLoading(true);
    supabase
      .from('quote_requests')
      .select('*')
      .eq('provider_id', providerData.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setQuoteRequests(data);
        setQuotesLoading(false);
      });
  }, [isEquipment, providerData?.id]);

  const [isPharmacieDeGarde, setIsPharmacieDeGarde] = useState(false);
  const [pharmacyInsurances, setPharmacyInsurances] = useState<Record<string, boolean>>({
    'Carte Chifa': false,
    'CNAS': false,
    'CASNOS': false,
    'Mutuelle': false,
  });
  const [savingGarde, setSavingGarde] = useState(false);
  const [savingInsurance, setSavingInsurance] = useState<string | null>(null);

  // Initialize pharmacy state from provider data
  useEffect(() => {
    if (isPharmacy && providerData) {
      setIsPharmacieDeGarde(!!providerData.isPharmacieDeGarde);
      const existingInsurances = providerData.insurances || [];
      const insuranceState: Record<string, boolean> = {
        'Carte Chifa': existingInsurances.includes('Carte Chifa'),
        'CNAS': existingInsurances.includes('CNAS'),
        'CASNOS': existingInsurances.includes('CASNOS'),
        'Mutuelle': existingInsurances.includes('Mutuelle'),
      };
      setPharmacyInsurances(insuranceState);
    }
  }, [isPharmacy, providerData]);

  // Toggle Pharmacie de Garde
  const handleToggleGarde = async () => {
    setSavingGarde(true);
    const newValue = !isPharmacieDeGarde;
    setIsPharmacieDeGarde(newValue);
    try {
      await updateProviderData({ isPharmacieDeGarde: newValue } as any);
      sonnerToast.success(newValue ? '🟢 Pharmacie de Garde activée' : 'Pharmacie de Garde désactivée');
    } catch {
      setIsPharmacieDeGarde(!newValue);
      sonnerToast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingGarde(false);
    }
  };

  // Toggle insurance
  const handleToggleInsurance = async (name: string) => {
    setSavingInsurance(name);
    const newValue = !pharmacyInsurances[name];
    const updated = { ...pharmacyInsurances, [name]: newValue };
    setPharmacyInsurances(updated);
    try {
      const activeInsurances = Object.entries(updated).filter(([, v]) => v).map(([k]) => k);
      await updateProviderData({ insurances: activeInsurances } as any);
      sonnerToast.success(`${name} ${newValue ? 'activée' : 'désactivée'}`);
    } catch {
      setPharmacyInsurances(prev => ({ ...prev, [name]: !newValue }));
      sonnerToast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingInsurance(null);
    }
  };

  // ===== Blood Bank Dashboard State =====
  const [bloodStockLevels, setBloodStockLevels] = useState<Record<string, string>>({});
  const [savingStock, setSavingStock] = useState<string | null>(null);
  const [donorResponses, setDonorResponses] = useState<BloodEmergencyResponse[]>([]);
  const [activeEmergenciesCount, setActiveEmergenciesCount] = useState(0);
  const prevDonorCountRef = useRef<number | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  // Initialize blood stock levels from provider data
  useEffect(() => {
    if (isBloodCabin && providerData) {
      const existing = providerData.specificFeatures?.bloodStockLevels || providerData.bloodStockLevels || {};
      const defaults: Record<string, string> = {};
      BLOOD_TYPES.forEach(bt => { defaults[bt] = existing[bt] || 'normal'; });
      setBloodStockLevels(defaults);
    }
  }, [isBloodCabin, providerData]);

  // Play notification sound helper
  const playNotificationSound = useRef(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      // Two-tone chime
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* audio not available */ }
  }).current;

  // Fetch active emergencies and subscribe to responses for donors table
  useEffect(() => {
    if (!isBloodCabin || !providerData?.id) return;

    let unsubscribers: (() => void)[] = [];

    const loadEmergenciesAndResponses = async () => {
      try {
        const emergencies = await getEmergenciesByProvider(providerData.id);
        const active = emergencies.filter(e => e.status === 'active');
        setActiveEmergenciesCount(active.length);

        // Subscribe to responses for each active emergency
        const allResponses: Record<string, BloodEmergencyResponse[]> = {};
        active.forEach(emergency => {
          const unsub = subscribeToResponses(emergency.id, (responses) => {
            allResponses[emergency.id] = responses;
            const flat = Object.values(allResponses).flat();

            // Detect new donors and notify
            if (prevDonorCountRef.current !== null && flat.length > prevDonorCountRef.current) {
              const newCount = flat.length - prevDonorCountRef.current;
              const newest = responses[0];
              playNotificationSound();
              sonnerToast.success(
                `🩸 ${newCount > 1 ? `${newCount} nouveaux donneurs` : 'Nouveau donneur'} en route !`,
                {
                  description: newest?.citizen_name
                    ? `${newest.citizen_name} a répondu à votre alerte`
                    : 'Un donneur a répondu à votre alerte',
                  duration: 8000,
                }
              );
              // Also try browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🩸 Nouveau donneur en route !', {
                  body: newest?.citizen_name
                    ? `${newest.citizen_name} a répondu à votre alerte d'urgence sang`
                    : 'Un donneur a répondu à votre alerte',
                  icon: '/favicon.ico',
                });
              }
            }
            prevDonorCountRef.current = flat.length;

            setDonorResponses(flat);
          });
          unsubscribers.push(unsub);
        });

        if (active.length === 0) {
          setDonorResponses([]);
          prevDonorCountRef.current = 0;
        }
      } catch (err) {
        console.error('Failed to load blood emergencies:', err);
      }
    };

    loadEmergenciesAndResponses();
    return () => { unsubscribers.forEach(fn => fn()); };
  }, [isBloodCabin, providerData?.id, playNotificationSound]);

  // Handle stock level update
  const handleStockUpdate = async (bloodType: string, level: string) => {
    setSavingStock(bloodType);
    const updated = { ...bloodStockLevels, [bloodType]: level };
    setBloodStockLevels(updated);
    try {
      const existingFeatures = providerData?.specificFeatures || {};
      await updateProviderData({
        specificFeatures: { ...existingFeatures, bloodStockLevels: updated },
      } as any);
      sonnerToast.success(`Stock ${bloodType} mis à jour: ${level === 'critical' ? 'Critique' : level === 'low' ? 'Faible' : 'Normal'}`);
    } catch {
      sonnerToast.error('Erreur lors de la mise à jour du stock');
    } finally {
      setSavingStock(null);
    }
  };

  // Subscribe to provider's own offers
  useEffect(() => {
    if (!user?.uid || !isGivingEligible) {
      setMyOffers([]);
      setOffersLoading(false);
      return;
    }
    const unsub = subscribeToMyOffers(user.uid, (offers) => {
      setMyOffers(offers);
      setOffersLoading(false);
    });
    return () => unsub();
  }, [user?.uid, isGivingEligible]);

  const handleDeleteOffer = async (id: string) => {
    setDeletingOfferId(id);
    try {
      await deleteOffer(id);
      toast({ title: 'Offre supprimée', description: 'L\'offre a été supprimée avec succès.' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'offre.', variant: 'destructive' });
    } finally {
      setDeletingOfferId(null);
    }
  };

  const filteredOffers = offerCategory ? myOffers.filter(o => o.category === offerCategory) : myOffers;
  
  // Onboarding state for celebrations
  const onboardingState = useProviderOnboarding(providerData, contextVerificationStatus);
  
  // Celebration system
  const { currentCelebration, dismissCelebration } = useOnboardingCelebrations(
    onboardingState.milestones,
    providerData?.id
  );
  
  // Check for first visit - show welcome modal
  useEffect(() => {
    if (providerData && !isLoading) {
      const hasSeenWelcome = localStorage.getItem(getWelcomeModalKey(providerData.id));
      // Only show welcome if onboarding is not complete and user hasn't seen it
      if (!hasSeenWelcome && !onboardingState.isOnboardingComplete) {
        setShowWelcomeModal(true);
      }
    }
  }, [providerData, isLoading, onboardingState.isOnboardingComplete]);
  
  // Handle welcome modal close
  const handleWelcomeClose = () => {
    localStorage.setItem(getWelcomeModalKey(providerData?.id || 'unknown'), 'true');
    setShowWelcomeModal(false);
  };
  
  // Handle celebration continue - navigate to next logical step
  const handleCelebrationContinue = () => {
    dismissCelebration();
    if (currentCelebration === 'profile-complete') {
      navigateToTab('verification');
    } else if (currentCelebration === 'verified') {
      navigateToTab('overview');
    }
  };

  useEffect(() => {
    if (providerData) {
      const newStatus = 
        providerData.verificationStatus === 'verified' ? 'approved' :
        providerData.verificationStatus === 'rejected' ? 'rejected' :
        'pending';
      
      if (previousStatus !== null && previousStatus !== newStatus) {
        if (newStatus === 'approved') {
          sonnerToast.success('🎉 Félicitations ! Votre compte a été vérifié !', {
            description: 'Votre profil est maintenant visible dans les recherches publiques.',
            duration: 10000,
          });
          if (providerData.id) {
            setApprovalNotification(providerData.id, 'approved');
          }
        } else if (newStatus === 'rejected') {
          sonnerToast.error('Vérification refusée', {
            description: 'Veuillez vérifier vos documents et soumettre une nouvelle demande.',
            duration: 10000,
          });
          if (providerData.id) {
            setApprovalNotification(providerData.id, 'rejected');
          }
        }
      }
      
      setPreviousStatus(verificationStatus);
      setVerificationStatus(newStatus);
      
      // Populate sensitive fields
      const newSensitiveData = {
        name: providerData.name || '',
        facilityNameFr: providerData.facilityNameFr || '',
        facilityNameAr: providerData.facilityNameAr || '',
        phone: providerData.phone || '',
        email: providerData.email || '',
        address: providerData.address || '',
        city: providerData.city || '',
        area: providerData.area || '',
        postalCode: providerData.postalCode || '',
        lat: providerData.lat || 35.1975,
        lng: providerData.lng || -0.6300,
        legalRegistrationNumber: providerData.legalRegistrationNumber || '',
        contactPersonName: providerData.contactPersonName || '',
        contactPersonRole: providerData.contactPersonRole || '',
        providerType: providerData.type || '',
      };
      setSensitiveData(newSensitiveData);
      setOriginalSensitiveData(newSensitiveData);
      
      // Populate non-sensitive fields with fallback chains for legacy data
      const newNonSensitiveData = {
        description: providerData.description || '',
        specialty: providerData.specialty || '',
        schedule: providerData.schedule || null,
        accessible: providerData.accessible ?? true,
        emergency: providerData.emergency ?? providerData.is24_7 ?? false,
        // CANONICAL: gallery (fallback to galleryImages for legacy)
        photos: providerData.gallery || (providerData as any).galleryImages || [],
        // CANONICAL: services (fallback to serviceCategories for legacy)
        services: providerData.services || (providerData as any).serviceCategories || [],
        specialties: providerData.specialties || [],
        // CANONICAL: insurances (fallback to insuranceAccepted for legacy)
        insurances: providerData.insurances || providerData.insuranceAccepted || [],
        accessibility: providerData.accessibilityFeatures || [],
        languages: providerData.languages || ['fr', 'ar'],
        homeVisitAvailable: providerData.homeVisitAvailable ?? false,
        consultationFee: String(providerData.consultationFee || ''),
        socialLinks: providerData.socialLinks || {},
      };
      setNonSensitiveData(newNonSensitiveData);
      setOriginalNonSensitiveData(newNonSensitiveData);
    }
  }, [providerData]);

  // Calculate profile completion
  const hasSchedule = nonSensitiveData.schedule && Object.keys(nonSensitiveData.schedule).length > 0;
  const profileFields = calculateProfileCompletion({
    name: sensitiveData.name,
    type: providerData?.type || 'doctor',
    specialty: nonSensitiveData.specialty,
    email: sensitiveData.email,
    phone: sensitiveData.phone,
    address: sensitiveData.address,
    description: nonSensitiveData.description,
    schedule: hasSchedule ? 'configured' : '',
    license: sensitiveData.legalRegistrationNumber,
    photos: nonSensitiveData.photos,
    languages: providerData?.languages || ['fr', 'ar'],
    accessible: nonSensitiveData.accessible,
    emergency: nonSensitiveData.emergency,
  });
  const isProfileComplete = profileFields.filter(f => f.required && !f.completed).length === 0;
  const profileProgress = profileFields.length > 0 
    ? (profileFields.filter(f => f.completed).length / profileFields.length) * 100 
    : 0;

  // Check for unsaved changes in non-sensitive data
  const hasNonSensitiveChanges = JSON.stringify(nonSensitiveData) !== JSON.stringify(originalNonSensitiveData);

  // Handler for sensitive field changes
  const handleSensitiveChange = (field: keyof typeof sensitiveData, value: string | number) => {
    setSensitiveData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for non-sensitive field changes
  const handleNonSensitiveChange = <K extends keyof typeof nonSensitiveData>(
    field: K, 
    value: typeof nonSensitiveData[K]
  ) => {
    setNonSensitiveData(prev => ({ ...prev, [field]: value }));
  };

  // Save sensitive fields with verification check
  const handleSaveSensitive = async () => {
    if (!providerData?.id) return;
    
    try {
      const result = await updateWithVerification({
        providerId: providerData.id,
        updates: {
          name: sensitiveData.name,
          facilityNameFr: sensitiveData.facilityNameFr,
          facilityNameAr: sensitiveData.facilityNameAr,
          phone: sensitiveData.phone,
          email: sensitiveData.email,
          address: sensitiveData.address,
          city: sensitiveData.city,
          area: sensitiveData.area,
          postalCode: sensitiveData.postalCode,
          lat: sensitiveData.lat,
          lng: sensitiveData.lng,
          legalRegistrationNumber: sensitiveData.legalRegistrationNumber,
          contactPersonName: sensitiveData.contactPersonName,
          contactPersonRole: sensitiveData.contactPersonRole,
        },
        currentVerificationStatus: providerData.verificationStatus as 'pending' | 'verified' | 'rejected',
      });
      
      if (result.verificationRevoked) {
        sonnerToast.warning('Vérification révoquée', {
          description: `Votre statut vérifié a été révoqué suite à la modification de: ${result.modifiedSensitiveFields.join(', ')}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Informations légales mises à jour",
          description: "Vos modifications ont été enregistrées.",
        });
      }
      
      // Update original data to reflect saved state
      setOriginalSensitiveData(sensitiveData);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    }
  };

  // Save non-sensitive fields (no verification impact)
  // Uses CANONICAL field names for writes
  const handleSaveNonSensitive = async () => {
    try {
      await updateProviderData({
        description: nonSensitiveData.description,
        specialty: nonSensitiveData.specialty,
        schedule: nonSensitiveData.schedule,
        accessible: nonSensitiveData.accessible,
        emergency: nonSensitiveData.emergency,
        // CANONICAL field names for writes
        gallery: nonSensitiveData.photos,              // CANONICAL: 'gallery' not 'galleryImages'
        services: nonSensitiveData.services,           // CANONICAL: 'services' not 'serviceCategories'
        insurances: nonSensitiveData.insurances,       // CANONICAL: 'insurances' not 'insuranceAccepted'
        specialties: nonSensitiveData.specialties,
        accessibilityFeatures: nonSensitiveData.accessibility,
        languages: nonSensitiveData.languages as ('fr' | 'ar' | 'en')[],
        homeVisitAvailable: nonSensitiveData.homeVisitAvailable,
        consultationFee: nonSensitiveData.consultationFee ? Number(nonSensitiveData.consultationFee) : null,
        socialLinks: nonSensitiveData.socialLinks,
      });
      
      setOriginalNonSensitiveData(nonSensitiveData);
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualisation",
      description: "Données actualisées.",
    });
  };

  // Helper function to navigate to any tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
    // Scroll to tabs area for better UX
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const navigateToVerificationTab = () => {
    navigateToTab('verification');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Compute tab count for grid
  // Compute tab count: base tabs (overview, profile, verification) = 3
  // Then add type-specific tabs
  let tabCount = 3; // overview + profile + verification
  if (!isBloodCabin && !isDiagnosisProvider && !isPharmacy && !isEquipment) tabCount++; // appointments
  if (isEquipment) tabCount += 2; // catalog + quotes
  if (isPharmacy) tabCount++; // pharmacy
  if (isLab) tabCount++; // lab-catalog
  if (isRadiology) tabCount++; // radiology-catalog
  if (isDiagnosisProvider) tabCount += 3; // sampling + results + home
  if (isCareProvider) tabCount++; // patient-records
  if (isClinicOrHospital) tabCount++; // team
  if (isHospital) tabCount++; // hospital-settings
  if (isMaternity) tabCount++; // maternity-settings
  if (!isBloodCabin) tabCount++; // ads
  tabCount++; // publications
  if (isGivingEligible && !isBloodCabin) tabCount++; // giving
  if (isBloodCabin) tabCount++; // blood-emergency
  tabCount++; // analytics
  tabCount++; // reviews

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        {/* Verification Approval/Rejection Banner */}
        {providerData?.id && (
          <VerificationApprovalBanner providerId={providerData.id} />
        )}

        {/* Verification Revoked Banner */}
        {wasVerificationRevoked && (
          <VerificationRevokedBanner
            revokedReason={extendedProvider?.verificationRevokedReason}
            revokedAt={extendedProvider?.verificationRevokedAt}
            onGoToVerification={navigateToVerificationTab}
          />
        )}

        {/* Pending Verification Banner */}
        {isPending && !wasVerificationRevoked && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">Compte en attente de vérification</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-1">Complétez votre profil et téléchargez vos documents pour accélérer le processus.</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {[
                    { icon: CheckCircle2, label: 'Profil complété', done: profileProgress > 80 },
                    { icon: FileText, label: 'Documents envoyés', done: false },
                    { icon: Lock, label: 'Validation admin', done: false },
                  ].map(({ icon: Icon, label, done }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs">
                      <Icon className={cn("h-3.5 w-3.5", done ? "text-green-600" : "text-amber-500/50")} />
                      <span className={done ? "text-green-700 dark:text-green-400" : "text-amber-700/60 dark:text-amber-400/50"}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejected Banner */}
        {isRejected && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-sm text-destructive">Vérification refusée</p>
                <p className="text-xs text-destructive/70 mt-0.5">Corrigez vos documents et soumettez une nouvelle demande.</p>
              </div>
            </div>
          </div>
        )}

        {/* Verified Banner */}
        {isVerified && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-primary">Compte vérifié</p>
                <p className="text-xs text-primary/70 mt-0.5">Votre profil est visible publiquement avec accès complet.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar with upload */}
                <div className="relative group">
                  <Avatar className="h-16 w-16 ring-2 ring-border">
                    {providerData?.image && providerData.image !== '/placeholder.svg' && providerData.image !== '' ? (
                      <AvatarImage src={providerData.image} />
                    ) : nonSensitiveData.photos[0] ? (
                      <AvatarImage src={nonSensitiveData.photos[0]} />
                    ) : null}
                    <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">{sensitiveData.name?.substring(0, 2).toUpperCase() || 'PR'}</AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !providerData?.id) return;
                        try {
                          const { uploadProviderLogo } = await import('@/services/providerImageService');
                          const url = await uploadProviderLogo(providerData.id, file);
                          await updateProviderData({ image: url } as any);
                          sonnerToast.success('Logo mis à jour');
                        } catch {
                          sonnerToast.error('Erreur lors de l\'upload du logo');
                        }
                      }}
                    />
                  </label>
                </div>
                {/* Name & Status */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl font-bold tracking-tight">{sensitiveData.name || 'Nouveau Professionnel'}</h1>
                    {isVerified ? (
                      providerData?.planType === 'premium' ? (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 border-0 text-xs px-2 py-0.5">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium Vérifié
                        </Badge>
                      ) : (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 text-xs px-2 py-0.5">
                          <Shield className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )
                    ) : isPending ? (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 text-xs px-2 py-0.5">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs px-2 py-0.5">
                        <XCircle className="h-3 w-3 mr-1" />
                        Refusé
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{nonSensitiveData.specialty || 'Spécialité non définie'}</p>
                </div>
              </div>
              {/* Right side: progress + actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <CircularProgress 
                    value={profileProgress} 
                    size={42}
                    strokeWidth={3}
                    showValue={false}
                  >
                    {isProfileComplete ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <span className="text-[10px] font-bold text-foreground">{Math.round(profileProgress)}%</span>
                    )}
                  </CircularProgress>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Profil</span>
                </div>
                <div className="h-6 w-px bg-border" />
                <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowSettingsModal(true)} className="h-8">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Paramètres</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Only for verified */}
        {isVerified && (
          <div className={cn("grid gap-3", isBloodCabin ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-5")}>
            {/* Stat card helper */}
            {(() => {
              const StatCard = ({ value, label, icon: Icon, iconClassName }: { value: string | number; label: string; icon: any; iconClassName?: string }) => (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                        <Icon className={cn("h-4 w-4 text-primary", iconClassName)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-bold leading-tight">{value}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );

              const cards = [
                <StatCard key="views" value={stats.profileViews} label="Vues profil" icon={Eye} />,
              ];

              if (isBloodCabin) {
                cards.push(
                  <StatCard key="donors" value={donorResponses.filter(r => r.status === 'en_route').length} label="Donneurs en attente" icon={Users} />,
                  <StatCard key="alerts" value={activeEmergenciesCount} label="Alertes actives" icon={AlertTriangle} iconClassName="text-destructive" />,
                );
              } else if (isDiagnosisProvider) {
                cards.push(
                  <StatCard key="pending" value={12} label="En attente" icon={ClipboardList} />,
                  <StatCard key="sent" value={47} label="Résultats envoyés" icon={FileText} />,
                );
              } else if (isPharmacy) {
                cards.push(
                  <StatCard key="garde" value={isPharmacieDeGarde ? 'Active' : 'Inactive'} label="De Garde" icon={Pill} />,
                  <StatCard key="conv" value={Object.values(pharmacyInsurances).filter(Boolean).length} label="Conventions" icon={Shield} />,
                );
              } else if (isEquipment) {
                cards.push(
                  <StatCard key="products" value={24} label="Produits" icon={Package} />,
                  <StatCard key="quotes" value={quoteRequests.filter(q => q.status === 'nouveau').length} label="Demandes devis" icon={FileText} />,
                );
              } else {
                cards.push(
                  <StatCard key="calls" value={stats.phoneClicks} label="Appels" icon={Phone} />,
                  <StatCard key="appts" value={stats.appointments} label={isCareProvider ? "RDV Aujourd'hui" : "RDV"} icon={Calendar} />,
                );
              }

              cards.push(
                <StatCard key="rating" value={stats.rating || '-'} label={`${stats.reviewsCount} avis`} icon={Star} iconClassName="fill-primary" />,
              );

              if (!isBloodCabin) {
                cards.push(
                  <StatCard key="response" value="94%" label="Taux réponse" icon={BarChart3} />,
                );
              }

              return cards;
            })()}
          </div>
        )}

        {/* Locked Features Preview */}
        {isPending && (
          <Card className="border-dashed border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Disponible après vérification</span>
              </div>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                {[
                  { icon: Globe, label: 'Visibilité publique' },
                  { icon: Users, label: isBloodCabin ? 'Recevoir des donneurs' : 'Recevoir des RDV' },
                  { icon: isBloodCabin ? Droplet : Megaphone, label: isBloodCabin ? 'Alertes urgence' : 'Annonces' },
                  { icon: BarChart3, label: 'Statistiques' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-dashed border-border">
                    <Icon className="h-4 w-4 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground/70">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5" ref={tabsRef}>
          <TabsList className="flex w-full overflow-x-auto bg-muted/40 p-1 rounded-xl md:grid" style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}>
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="profile">
              <span className="hidden sm:inline">Profil</span>
              <span className="sm:hidden">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Vérification</span>
            </TabsTrigger>
            {!isBloodCabin && !isDiagnosisProvider && !isPharmacy && !isEquipment && (
              <TabsTrigger value="appointments" disabled={isPending}>
                <Calendar className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">RDV</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            {isEquipment && (
              <>
                <TabsTrigger value="equipment-catalog" disabled={isPending}>
                  <Package className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Catalogue</span>
                  {isPending && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
                <TabsTrigger value="quote-requests" disabled={isPending}>
                  <FileText className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Devis</span>
                  {isPending && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
              </>
            )}
            {isPharmacy && (
              <TabsTrigger value="pharmacy-garde" disabled={isPending}>
                <Pill className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Pharmacie</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            {isDiagnosisProvider && (
              <>
                {isLab && (
                  <TabsTrigger value="lab-catalog" disabled={isPending}>
                    <FlaskConical className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Catalogue</span>
                    {isPending && <Lock className="h-3 w-3 ml-1" />}
                  </TabsTrigger>
                )}
                {isRadiology && (
                  <TabsTrigger value="radiology-catalog" disabled={isPending}>
                    <ClipboardList className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Catalogue</span>
                    {isPending && <Lock className="h-3 w-3 ml-1" />}
                  </TabsTrigger>
                )}
                <TabsTrigger value="sampling-queue" disabled={isPending}>
                  <ClipboardList className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">File d'attente</span>
                  {isPending && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
                <TabsTrigger value="upload-results" disabled={isPending}>
                  <FileText className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Résultats</span>
                  {isPending && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
                <TabsTrigger value="home-requests" disabled={isPending}>
                  <HomeIcon className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Domicile</span>
                  {isPending && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
              </>
            )}
            {isCareProvider && (
              <TabsTrigger value="patient-records" disabled={isPending}>
                <FileText className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Dossiers</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            {isClinicOrHospital && (
              <TabsTrigger value="team" disabled={isPending}>
                <Users className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Équipe</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            {isHospital && (
              <TabsTrigger value="hospital-settings" disabled={isPending}>
                <Building2 className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Hôpital</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            {isMaternity && (
              <TabsTrigger value="maternity-settings" disabled={isPending}>
                <Baby className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Maternité</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            {!isBloodCabin && (
              <TabsTrigger value="ads" disabled={isPending}>
                <Megaphone className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Annonces</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            <TabsTrigger value="publications" disabled={isPending}>
              <BookOpen className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Publications</span>
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            {isGivingEligible && !isBloodCabin && (
              <TabsTrigger value="giving" disabled={isPending}>
                <Gift className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Dons</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            {isBloodCabin && (
              <TabsTrigger value="blood-emergency" disabled={isPending}>
                <Droplet className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Urgences Sang</span>
                {isPending && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" disabled={isPending}>
              <BarChart3 className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Stats</span>
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="reviews-panel" disabled={isPending}>
              <Star className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Avis</span>
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Subscription Card */}
            <div className="mb-6">
              <SubscriptionCard
                planType={(providerData as any)?.planType || 'basic'}
                onUpgrade={async (newPlan) => {
                  await updateProviderData({ planType: newPlan } as any);
                }}
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ===== Blood Bank Overview Widgets ===== */}
              {isBloodCabin && (
                <>
                  {/* Notification Permission Banner */}
                  {notifPermission !== 'granted' && (
                    <div className="lg:col-span-2">
                      <Alert className="border-primary/30 bg-primary/5">
                        <Bell className="h-5 w-5 text-primary" />
                        <AlertTitle>Activez les notifications</AlertTitle>
                        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            Recevez une alerte instantanée quand un donneur répond à vos urgences.
                          </span>
                          <Button
                            size="sm"
                            variant="default"
                            className="shrink-0"
                            onClick={async () => {
                              if (!('Notification' in window)) return;
                              const result = await Notification.requestPermission();
                              setNotifPermission(result);
                              if (result === 'granted') {
                                sonnerToast.success('Notifications activées !');
                              }
                            }}
                          >
                            <Bell className="h-4 w-4 mr-1.5" />
                            Autoriser
                          </Button>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Live Inventory Widget */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Droplet className="h-5 w-5 text-destructive" />
                        Inventaire en Direct
                      </CardTitle>
                      <CardDescription>Mettez à jour le niveau de stock par groupe sanguin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {BLOOD_TYPES.map((bt) => {
                          const level = bloodStockLevels[bt] || 'normal';
                          const isSaving = savingStock === bt;
                          return (
                            <div key={bt} className="p-3 rounded-lg border bg-card">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg">{bt}</span>
                                {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant={level === 'critical' ? 'destructive' : 'outline'}
                                  className={cn("flex-1 text-xs h-7", level === 'critical' && 'shadow-sm')}
                                  onClick={() => handleStockUpdate(bt, 'critical')}
                                  disabled={isSaving}
                                >
                                  Critique
                                </Button>
                                <Button
                                  size="sm"
                                  variant={level === 'low' ? 'default' : 'outline'}
                                  className={cn(
                                    "flex-1 text-xs h-7",
                                    level === 'low' && 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                                  )}
                                  onClick={() => handleStockUpdate(bt, 'low')}
                                  disabled={isSaving}
                                >
                                  Faible
                                </Button>
                                <Button
                                  size="sm"
                                  variant={level === 'normal' ? 'default' : 'outline'}
                                  className={cn(
                                    "flex-1 text-xs h-7",
                                    level === 'normal' && 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                  )}
                                  onClick={() => handleStockUpdate(bt, 'normal')}
                                  disabled={isSaving}
                                >
                                  Normal
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Broadcast Panel */}
                  <BroadcastEmergencyPanel
                    providerId={providerData?.id || ''}
                    providerName={sensitiveData.name}
                    providerLat={sensitiveData.lat}
                    providerLng={sensitiveData.lng}
                  />

                  {/* Active Donors Table */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Donneurs Attendus
                      </CardTitle>
                      <CardDescription>Citoyens ayant répondu à vos alertes d'urgence</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {donorResponses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                          <p>Aucun donneur en attente</p>
                          <p className="text-xs mt-1">Les donneurs apparaîtront ici lorsqu'ils répondront à vos alertes</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom du Donneur</TableHead>
                              <TableHead>Téléphone</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {donorResponses.map((resp) => (
                              <TableRow key={resp.id}>
                                <TableCell className="font-medium">{resp.citizen_name || 'Anonyme'}</TableCell>
                                <TableCell>{resp.citizen_phone || '—'}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    resp.status === 'en_route' ? 'default' :
                                    resp.status === 'completed' ? 'secondary' : 'destructive'
                                  } className={cn(
                                    resp.status === 'en_route' && 'bg-amber-500 hover:bg-amber-600',
                                    resp.status === 'completed' && 'bg-green-600 hover:bg-green-700 text-white'
                                  )}>
                                    {resp.status === 'en_route' ? 'En route' :
                                     resp.status === 'completed' ? 'Terminé' :
                                     resp.status === 'cancelled' ? 'Annulé' : resp.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {new Date(resp.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Pharmacy Overview Widgets */}
              {isPharmacy && (
                <>
                  {/* Massive Pharmacie de Garde Toggle */}
                  {/* Compact Pharmacie de Garde Toggle */}
                  <Card className="lg:col-span-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                            isPharmacieDeGarde 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            <Pill className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              Pharmacie de Garde
                              {isPharmacieDeGarde && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                  Active
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isPharmacieDeGarde 
                                ? 'Visible comme pharmacie de garde' 
                                : 'Activer le statut de garde'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleToggleGarde}
                          disabled={savingGarde || isPending}
                          className={cn(
                            "relative w-14 h-7 rounded-full transition-all duration-200 shrink-0",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isPharmacieDeGarde ? "bg-primary" : "bg-muted-foreground/25",
                            (savingGarde || isPending) && "opacity-50 cursor-not-allowed"
                          )}
                          aria-label={isPharmacieDeGarde ? 'Désactiver la garde' : 'Activer la garde'}
                        >
                          <span className={cn(
                            "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200",
                            isPharmacieDeGarde ? "left-[calc(100%-1.625rem)]" : "left-0.5"
                          )} />
                          {savingGarde && (
                            <Loader2 className="absolute top-1 left-1/2 -translate-x-1/2 h-5 w-5 animate-spin text-white" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assurances & Conventions */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">Conventions acceptées</CardTitle>
                            <CardDescription className="text-xs">
                              {Object.values(pharmacyInsurances).filter(Boolean).length} / {Object.keys(pharmacyInsurances).length} activées
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(pharmacyInsurances).map(([name, active]) => (
                          <div 
                            key={name} 
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200",
                              active 
                                ? "border-primary/20 bg-primary/5" 
                                : "border-border bg-card hover:bg-muted/50"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                active ? "bg-primary" : "bg-muted-foreground/30"
                              )} />
                              <span className={cn(
                                "text-sm font-medium",
                                active ? "text-foreground" : "text-muted-foreground"
                              )}>{name}</span>
                            </div>
                            <button
                              onClick={() => handleToggleInsurance(name)}
                              disabled={savingInsurance === name || isPending}
                              className={cn(
                                "relative w-10 h-5 rounded-full transition-all duration-200",
                                active ? "bg-primary" : "bg-muted-foreground/25",
                                (savingInsurance === name || isPending) && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <span className={cn(
                                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                                active ? "left-[calc(100%-1.125rem)]" : "left-0.5"
                              )} />
                              {savingInsurance === name && <Loader2 className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-5 animate-spin" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Equipment Overview Widgets */}
              {isEquipment && (
                <>
                  {/* Catalog Summary */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Gestion de Catalogue
                      </CardTitle>
                      <CardDescription>Ajoutez et gérez vos équipements médicaux</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Alert className="mb-4 border-primary/20 bg-primary/5">
                        <AlertDescription className="text-sm text-muted-foreground">
                          📦 Ce module affiche des données de démonstration. La gestion complète du catalogue sera disponible prochainement.
                        </AlertDescription>
                      </Alert>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Équipement</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Stock</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { nom: 'Fauteuil roulant pliant', cat: 'Mobilité', type: 'À Vendre', prix: '35 000 DA', stock: 'En stock' },
                            { nom: 'Lit médicalisé électrique', cat: 'Hospitalisation', type: 'À Louer', prix: '8 000 DA/mois', stock: 'En stock' },
                            { nom: 'Concentrateur d\'oxygène', cat: 'Respiratoire', type: 'À Vendre', prix: '95 000 DA', stock: 'Rupture' },
                            { nom: 'Déambulateur', cat: 'Mobilité', type: 'À Vendre', prix: '12 000 DA', stock: 'En stock' },
                            { nom: 'Matelas anti-escarres', cat: 'Hospitalisation', type: 'À Louer', prix: '3 000 DA/mois', stock: 'En stock' },
                          ].map((item, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{item.nom}</TableCell>
                              <TableCell className="text-muted-foreground">{item.cat}</TableCell>
                              <TableCell>
                                <Badge variant={item.type === 'À Vendre' ? 'default' : 'secondary'} className={cn(
                                  item.type === 'À Vendre' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                  item.type === 'À Louer' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                )}>
                                  {item.type === 'À Vendre' ? <ShoppingBag className="h-3 w-3 mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                  {item.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.prix}</TableCell>
                              <TableCell>
                                <Badge variant={item.stock === 'En stock' ? 'secondary' : 'destructive'} className={cn(
                                  item.stock === 'En stock' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                )}>
                                  {item.stock}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Demandes de Devis Summary */}
                   <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Demandes de Devis Récentes
                      </CardTitle>
                      <CardDescription>Messages de clients pour des devis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {quotesLoading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                      ) : quoteRequests.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Aucune demande de devis pour le moment.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Client</TableHead>
                              <TableHead>Produit demandé</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quoteRequests.slice(0, 3).map((row) => (
                              <TableRow key={row.id}>
                                <TableCell className="font-medium">{row.client_name}</TableCell>
                                <TableCell className="text-muted-foreground">{row.equipment}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(row.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell>
                                  <Badge variant={row.status === 'répondu' ? 'secondary' : row.status === 'nouveau' ? 'default' : 'outline'}
                                    className={cn(
                                      row.status === 'répondu' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                      row.status === 'nouveau' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    )}
                                  >
                                    {row.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Onboarding Checklist */}
              <ProviderOnboardingChecklist
                providerData={providerData}
                verificationStatus={contextVerificationStatus}
                onNavigateToTab={navigateToTab}
              />
              
              {/* Verification Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Statut de vérification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isPending && (
                      <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg">
                        <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
                        <div>
                          <p className="font-medium">En cours de vérification</p>
                          <p className="text-sm text-muted-foreground">24-48h de délai</p>
                        </div>
                      </div>
                    )}
                    {isVerified && (
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="font-medium">Profil vérifié</p>
                          <p className="text-sm text-muted-foreground">Visible publiquement</p>
                        </div>
                      </div>
                    )}
                    {isRejected && (
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-500" />
                        <div>
                          <p className="font-medium">Vérification refusée</p>
                          <p className="text-sm text-muted-foreground">Documents à corriger</p>
                        </div>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      variant={isVerified ? 'outline' : 'default'}
                      onClick={navigateToVerificationTab}
                    >
                      {isVerified ? 'Voir les documents' : 'Gérer la vérification'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ===== Hospital Overview Widgets ===== */}
              {isHospital && (
                <>
                  {/* Live Wait Time Widget - kept inline for quick access */}
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Temps d'attente en direct
                      </CardTitle>
                      <CardDescription>Mettez à jour le temps d'attente estimé pour les patients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          min={0}
                          max={999}
                          placeholder="Minutes"
                          className="w-32"
                          value={providerData?.waitTimeMinutes ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : null;
                            updateProviderData({ waitTimeMinutes: val, waitTimeUpdatedAt: new Date().toISOString() } as any);
                          }}
                        />
                        <span className="text-sm text-muted-foreground">minutes</span>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await updateProviderData({
                                waitTimeMinutes: providerData?.waitTimeMinutes ?? null,
                                waitTimeUpdatedAt: new Date().toISOString(),
                              } as any);
                              sonnerToast.success('Temps d\'attente mis à jour');
                            } catch {
                              sonnerToast.error('Erreur lors de la mise à jour');
                            }
                          }}
                        >
                          <Save className="h-4 w-4 mr-1.5" />
                          Publier
                        </Button>
                      </div>
                      {providerData?.waitTimeUpdatedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Dernière mise à jour : {new Date(providerData.waitTimeUpdatedAt).toLocaleTimeString('fr-FR')}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Hospital Settings Summary → link to tab */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Paramètres Hôpital
                      </CardTitle>
                      <CardDescription>Phones, départements, infrastructure</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Lits:</span> <span className="font-medium">{providerData?.numberOfBeds ?? '—'}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Blocs:</span> <span className="font-medium">{providerData?.operatingBlocks ?? '—'}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Départements:</span> <span className="font-medium">{providerData?.departments?.length ?? 0}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Réa:</span> <span className="font-medium">{providerData?.hasReanimation ? '✓' : '—'}</span>
                        </div>
                      </div>
                      <Button className="w-full gap-2" variant="outline" onClick={() => navigateToTab('hospital-settings')}>
                        <Settings className="h-4 w-4" />
                        Gérer les paramètres hôpital
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ===== Maternity Overview Widgets ===== */}
              {isMaternity && (
                <>
                  {/* Maternity Settings Summary → link to tab */}
                  <Card className="lg:col-span-2 border-pink-200 dark:border-pink-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Baby className="h-5 w-5 text-pink-600" />
                        Paramètres Maternité
                      </CardTitle>
                      <CardDescription>Services, personnel, NICU et politique de visites</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {(providerData?.maternityServices || []).length > 0 ? (
                          providerData!.maternityServices!.slice(0, 5).map((service) => (
                            <Badge key={service} className="bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800">
                              {service}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Aucun service configuré</p>
                        )}
                        {(providerData?.maternityServices?.length || 0) > 5 && (
                          <Badge variant="outline">+{providerData!.maternityServices!.length - 5} autres</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <span className="block text-muted-foreground text-xs">NICU</span>
                          <span className="font-medium">{providerData?.hasNICU ? '✓' : '—'}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <span className="block text-muted-foreground text-xs">Personnel fém.</span>
                          <span className="font-medium">{providerData?.femaleStaffOnly ? '✓' : '—'}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50 text-center">
                          <span className="block text-muted-foreground text-xs">Pédiatre</span>
                          <span className="font-medium">{providerData?.pediatricianOnSite ? '✓' : '—'}</span>
                        </div>
                      </div>
                      <Button className="w-full gap-2" variant="outline" onClick={() => navigateToTab('maternity-settings')}>
                        <Settings className="h-4 w-4" />
                        Gérer les paramètres maternité
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ===== Clinic Overview — Editable ===== */}
              {isClinicOnly && providerData && (
                <div className="lg:col-span-2">
                  <DoctorRosterEditor
                    provider={providerData}
                    onSave={async (updates) => { await updateProviderData(updates as any); }}
                  />
                </div>
              )}

              {/* ===== Doctor Overview — Editable ===== */}
              {isDoctor && providerData && (
                <div className="lg:col-span-2">
                  <DoctorEducationEditor
                    provider={providerData}
                    onSave={async (updates) => { await updateProviderData(updates as any); }}
                  />
                </div>
              )}

              {/* Quick Actions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    {isBloodCabin ? (
                      <div className="grid gap-4 sm:grid-cols-4">
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2"
                          onClick={() => navigateToTab('profile')}
                        >
                          <Settings className="h-6 w-6" />
                          <span>Modifier le profil</span>
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('blood-emergency')}
                              >
                                <Droplet className="h-6 w-6" />
                                <span>Diffuser une alerte</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('blood-emergency')}
                              >
                                <Users className="h-6 w-6" />
                                <span>Voir les donneurs</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('analytics')}
                              >
                                <BarChart3 className="h-6 w-6" />
                                <span>Voir les stats</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                      </div>
                    ) : isCareProvider ? (
                      <div className={cn("grid gap-4", isClinicOrHospital ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('appointments')}
                              >
                                <Calendar className="h-6 w-6" />
                                <span>Gérer les RDV</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('patient-records')}
                              >
                                <FileText className="h-6 w-6" />
                                <span>Dossiers patients</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('ads')}
                              >
                                <Megaphone className="h-6 w-6" />
                                <span>Créer une annonce</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        {isClinicOrHospital && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="w-full">
                                <Button 
                                  variant="outline" 
                                  className="h-auto py-4 flex-col gap-2 w-full"
                                  disabled={isPending}
                                  onClick={() => navigateToTab('team')}
                                >
                                  <Users className="h-6 w-6" />
                                  <span>Gérer l'équipe</span>
                                  {isPending && <Lock className="h-3 w-3" />}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                          </Tooltip>
                        )}
                      </div>
                    ) : isDiagnosisProvider ? (
                      <div className="grid gap-4 sm:grid-cols-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('sampling-queue')}
                              >
                                <ClipboardList className="h-6 w-6" />
                                <span>File d'attente</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('upload-results')}
                              >
                                <Upload className="h-6 w-6" />
                                <span>Envoyer résultats</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('home-requests')}
                              >
                                <HomeIcon className="h-6 w-6" />
                                <span>Demandes domicile</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('ads')}
                              >
                                <Megaphone className="h-6 w-6" />
                                <span>Créer une annonce</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                      </div>
                    ) : isPharmacy ? (
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('pharmacy-garde')}
                              >
                                <Pill className="h-6 w-6" />
                                <span>Gestion Pharmacie</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('ads')}
                              >
                                <Megaphone className="h-6 w-6" />
                                <span>Créer une annonce</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('analytics')}
                              >
                                <BarChart3 className="h-6 w-6" />
                                <span>Voir les stats</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                      </div>
                    ) : isEquipment ? (
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('equipment-catalog')}
                              >
                                <Package className="h-6 w-6" />
                                <span>Gérer le catalogue</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('quote-requests')}
                              >
                                <FileText className="h-6 w-6" />
                                <span>Demandes de devis</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('analytics')}
                              >
                                <BarChart3 className="h-6 w-6" />
                                <span>Voir les stats</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                      </div>
                    ) : (
                      <div className={cn("grid gap-4", isGivingEligible ? "sm:grid-cols-5" : "sm:grid-cols-4")}>
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2"
                          onClick={() => navigateToTab('profile')}
                        >
                          <Settings className="h-6 w-6" />
                          <span>Modifier le profil</span>
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('appointments')}
                              >
                                <Calendar className="h-6 w-6" />
                                <span>Gérer les RDV</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('ads')}
                              >
                                <Megaphone className="h-6 w-6" />
                                <span>Créer une annonce</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                        {isGivingEligible && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="w-full">
                                <Button 
                                  variant="outline" 
                                  className="h-auto py-4 flex-col gap-2 w-full"
                                  disabled={isPending}
                                  onClick={() => navigateToTab('giving')}
                                >
                                  <Gift className="h-6 w-6" />
                                  <span>Don gratuit</span>
                                  {isPending && <Lock className="h-3 w-3" />}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button 
                                variant="outline" 
                                className="h-auto py-4 flex-col gap-2 w-full"
                                disabled={isPending}
                                onClick={() => navigateToTab('analytics')}
                              >
                                <BarChart3 className="h-6 w-6" />
                                <span>Voir les stats</span>
                                {isPending && <Lock className="h-3 w-3" />}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isPending && <TooltipContent>Disponible après vérification</TooltipContent>}
                        </Tooltip>
                      </div>
                    )}
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <SensitiveFieldsEditor
                  data={sensitiveData}
                  originalData={originalSensitiveData}
                  isVerified={isVerified}
                  isSaving={isVerificationSaving}
                  onDataChange={handleSensitiveChange}
                  onSave={handleSaveSensitive}
                />
              </div>
              <div>
                <NonSensitiveFieldsEditor
                  data={nonSensitiveData}
                  isVerified={isVerified}
                  isSaving={isSaving}
                  hasChanges={hasNonSensitiveChanges}
                  providerType={providerData?.type}
                  providerId={providerData?.id}
                  onDataChange={handleNonSensitiveChange}
                  onSave={handleSaveNonSensitive}
                />
              </div>
            </div>
            <div className="lg:col-span-2 mt-6">
              <ProviderPDFUpload />
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <EnhancedVerificationCenter
              providerId={providerData?.id || ''}
              providerName={sensitiveData.name}
              currentStatus={verificationStatus}
              profileComplete={isProfileComplete}
              onStatusChange={setVerificationStatus}
            />
          </TabsContent>

          {/* Appointments Tab - hidden for blood banks, diagnosis providers, pharmacies, and equipment */}
          {!isBloodCabin && !isDiagnosisProvider && !isPharmacy && !isEquipment && (
            <TabsContent value="appointments">
              <AppointmentsDashboard
                providerId={providerData?.id || ''}
                providerUserId={user?.uid || ''}
                providerName={sensitiveData.name}
                isVerified={isVerified}
              />
            </TabsContent>
          )}

          {/* Pharmacy Tab */}
          {isPharmacy && (
            <TabsContent value="pharmacy-garde">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pharmacie de Garde Toggle - Full width */}
                <Card className="lg:col-span-2 border-2 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-green-600" />
                      Activer la Pharmacie de Garde
                    </CardTitle>
                    <CardDescription>Ce toggle met à jour instantanément votre statut sur le profil public</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                          isPharmacieDeGarde 
                            ? "bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)]" 
                            : "bg-muted"
                        )}>
                          <Pill className={cn("h-10 w-10", isPharmacieDeGarde ? "text-white" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{isPharmacieDeGarde ? '🟢 Pharmacie de Garde Active' : '⚪ Pharmacie de Garde Inactive'}</p>
                          <p className="text-muted-foreground mt-1">
                            {isPharmacieDeGarde ? 'Les patients voient un badge vert clignotant sur votre profil' : 'Activez pour signaler votre disponibilité de garde'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleGarde}
                        disabled={savingGarde || isPending}
                        className={cn(
                          "relative w-28 h-14 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 shrink-0",
                          isPharmacieDeGarde ? "bg-green-500" : "bg-muted-foreground/30",
                          (savingGarde || isPending) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 w-12 h-12 rounded-full bg-white shadow-lg transition-all duration-300",
                          isPharmacieDeGarde ? "left-[calc(100%-3.25rem)]" : "left-1"
                        )} />
                        {savingGarde && <Loader2 className="absolute top-3.5 left-1/2 -translate-x-1/2 h-7 w-7 animate-spin text-white" />}
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Assurances & Conventions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Assurances & Conventions
                    </CardTitle>
                    <CardDescription>Gérez les conventions acceptées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(pharmacyInsurances).map(([name, active]) => (
                        <div key={name} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Shield className={cn("h-5 w-5", active ? "text-green-600" : "text-muted-foreground")} />
                            <div>
                              <span className={cn("font-medium", active ? "" : "text-muted-foreground")}>{name}</span>
                              {name === 'Carte Chifa' && active && (
                                <p className="text-xs text-green-600 mt-0.5">✓ Affiché sur le profil public</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleInsurance(name)}
                            disabled={savingInsurance === name || isPending}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all duration-200",
                              active ? "bg-green-500" : "bg-muted-foreground/30",
                              (savingInsurance === name || isPending) && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className={cn(
                              "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200",
                              active ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pharmacy Services Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Services de la Pharmacie
                    </CardTitle>
                    <CardDescription>Gérez vos services dans l'onglet Profil</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="border-primary/20 bg-primary/5">
                      <AlertDescription className="text-sm text-muted-foreground">
                        💊 Les services de votre pharmacie (Prise de tension, Orthopédie, Préparation magistrale, etc.) sont configurables dans l'onglet Profil &gt; Services.
                      </AlertDescription>
                    </Alert>
                    <Button className="w-full mt-4 gap-2" variant="outline" onClick={() => navigateToTab('profile')}>
                      <Settings className="h-4 w-4" />
                      Gérer les services
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Pharmacy Settings */}
              {providerData && (
                <PharmacySettingsEditor
                  provider={providerData}
                  onSave={async (updates) => { await updateProviderData(updates as any); }}
                />
              )}
            </TabsContent>
          )}

          {/* Equipment Catalog Tab */}
          {isEquipment && (
            <TabsContent value="equipment-catalog">
              {providerData && (
                <EquipmentCatalogEditor
                  provider={providerData}
                  onSave={async (updates) => { await updateProviderData(updates as any); }}
                />
              )}
            </TabsContent>
          )}

          {/* Quote Requests Tab */}
          {isEquipment && (
            <TabsContent value="quote-requests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Demandes de Devis
                  </CardTitle>
                  <CardDescription>Gérez les demandes de devis et messages clients</CardDescription>
                </CardHeader>
                <CardContent>
                  {quotesLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : quoteRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucune demande de devis pour le moment.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Produit demandé</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Détails</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quoteRequests.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.client_name}</TableCell>
                            <TableCell className="text-muted-foreground">{row.equipment}</TableCell>
                            <TableCell>{row.client_phone}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(row.created_at).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{row.details || '—'}</TableCell>
                            <TableCell>
                              <Badge variant={row.status === 'répondu' ? 'secondary' : row.status === 'nouveau' ? 'default' : 'outline'}
                                className={cn(
                                  row.status === 'répondu' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                  row.status === 'nouveau' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                )}
                              >
                                {row.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {row.status === 'nouveau' && (
                                <Button size="sm" variant="outline" onClick={async () => {
                                  await supabase.from('quote_requests').update({ status: 'répondu' }).eq('id', row.id);
                                  setQuoteRequests(prev => prev.map(q => q.id === row.id ? { ...q, status: 'répondu' } : q));
                                  sonnerToast.success('Statut mis à jour');
                                }}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Répondu
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Lab Catalog Tab */}
          {isLab && providerData && (
            <TabsContent value="lab-catalog">
              <LabTestCatalogEditor
                provider={providerData}
                onSave={async (updates) => { await updateProviderData(updates as any); }}
              />
            </TabsContent>
          )}

          {/* Radiology Catalog Tab */}
          {isRadiology && providerData && (
            <TabsContent value="radiology-catalog">
              <RadiologyExamCatalogEditor
                provider={providerData}
                onSave={async (updates) => { await updateProviderData(updates as any); }}
              />
            </TabsContent>
          )}

          {/* Sampling Queue Tab - diagnosis providers only */}
          {isDiagnosisProvider && (
            <TabsContent value="sampling-queue">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    File d'attente / Prélèvements
                  </CardTitle>
                  <CardDescription>Gestion de la file d'attente des prélèvements et imageries</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm text-muted-foreground">
                      🧪 Ce module affiche des données de démonstration. La connexion au système de file d'attente réel sera disponible prochainement.
                    </AlertDescription>
                  </Alert>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° de file</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { num: 1, patient: 'Amina B.', type: 'Prélèvement', heure: '08:30', statut: 'Terminé' },
                        { num: 2, patient: 'Youcef K.', type: 'Imagerie', heure: '09:00', statut: 'En cours' },
                        { num: 3, patient: 'Fatima Z.', type: 'Prélèvement', heure: '09:15', statut: 'En attente' },
                        { num: 4, patient: 'Mohamed L.', type: 'Prélèvement', heure: '09:30', statut: 'En attente' },
                        { num: 5, patient: 'Sara M.', type: 'Imagerie', heure: '09:45', statut: 'En attente' },
                      ].map((row) => (
                        <TableRow key={row.num}>
                          <TableCell className="font-bold">{row.num}</TableCell>
                          <TableCell className="font-medium">{row.patient}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{row.type}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{row.heure}</TableCell>
                          <TableCell>
                            <Badge variant={row.statut === 'Terminé' ? 'secondary' : row.statut === 'En cours' ? 'default' : 'outline'}
                              className={cn(
                                row.statut === 'Terminé' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                row.statut === 'En cours' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              )}
                            >
                              {row.statut}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Upload Results Tab - diagnosis providers only */}
          {isDiagnosisProvider && (
            <TabsContent value="upload-results">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Transmission des Résultats
                  </CardTitle>
                  <CardDescription>Envoyez les résultats d'analyses aux patients de façon sécurisée</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm text-muted-foreground">
                      📄 Ce module affiche des données de démonstration. L'envoi sécurisé de résultats réels sera disponible prochainement.
                    </AlertDescription>
                  </Alert>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">ID Patient ou Téléphone</label>
                      <input
                        type="text"
                        placeholder="Ex: PAT-2026-001 ou 0555..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Fichier (PDF)</label>
                      <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-dashed border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        Glissez un PDF ou cliquez
                      </div>
                    </div>
                  </div>
                  <Button disabled className="gap-2">
                    <Upload className="h-4 w-4" />
                    Envoyer le résultat
                  </Button>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Envois récents</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient ID</TableHead>
                          <TableHead>Fichier</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { id: 'PAT-2026-001', fichier: 'Bilan_sanguin.pdf', date: '2026-02-22', statut: 'Envoyé' },
                          { id: 'PAT-2026-002', fichier: 'IRM_cervicale.pdf', date: '2026-02-21', statut: 'Envoyé' },
                          { id: 'PAT-2026-003', fichier: 'Analyse_urine.pdf', date: '2026-02-21', statut: 'En attente' },
                        ].map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.id}</TableCell>
                            <TableCell className="text-muted-foreground">{row.fichier}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(row.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell>
                              <Badge variant={row.statut === 'Envoyé' ? 'secondary' : 'outline'}
                                className={row.statut === 'Envoyé' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                              >
                                {row.statut}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Home Requests Tab - diagnosis providers only */}
          {isDiagnosisProvider && (
            <TabsContent value="home-requests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5" />
                    Demandes de prélèvement à domicile
                  </CardTitle>
                  <CardDescription>Gérez les demandes de prélèvement à domicile des patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm text-muted-foreground">
                      🏠 Ce module affiche des données de démonstration. La gestion des demandes réelles sera disponible prochainement.
                    </AlertDescription>
                  </Alert>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Type d'analyse</TableHead>
                        <TableHead>Date demandée</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { patient: 'Khadija R.', adresse: '12 Rue Pasteur, Sidi Bel Abbès', type: 'Bilan sanguin', date: '2026-02-23', statut: 'Nouvelle' },
                        { patient: 'Omar T.', adresse: '45 Bd de la République', type: 'Glycémie à jeun', date: '2026-02-23', statut: 'Confirmée' },
                        { patient: 'Meriem H.', adresse: '8 Cité des Oliviers', type: 'Bilan rénal', date: '2026-02-22', statut: 'Terminée' },
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{row.patient}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{row.adresse}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(row.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <Badge variant={row.statut === 'Terminée' ? 'secondary' : row.statut === 'Confirmée' ? 'default' : 'outline'}
                              className={cn(
                                row.statut === 'Terminée' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                row.statut === 'Confirmée' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              )}
                            >
                              {row.statut}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Patient Records Tab - care providers only */}
          {isCareProvider && (
            <TabsContent value="patient-records">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Dossiers Patients
                      </CardTitle>
                      <CardDescription>Historique des consultations récentes</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Rechercher un patient..."
                          className="pl-8 h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm text-muted-foreground">
                      📋 Ce module affiche des données de démonstration. La connexion aux dossiers patients réels sera disponible prochainement.
                    </AlertDescription>
                  </Alert>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: 'Ahmed B.', date: '2026-02-22', notes: 'Contrôle tension artérielle', status: 'Terminé' },
                        { name: 'Fatima Z.', date: '2026-02-21', notes: 'Suivi post-opératoire', status: 'Terminé' },
                        { name: 'Karim M.', date: '2026-02-20', notes: 'Consultation générale', status: 'En attente' },
                        { name: 'Nadia L.', date: '2026-02-19', notes: 'Bilan sanguin', status: 'Terminé' },
                      ].map((record, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(record.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-muted-foreground">{record.notes}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'Terminé' ? 'secondary' : 'default'} className={record.status === 'Terminé' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}>
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Team Management Tab - clinics/hospitals only */}
          {isClinicOrHospital && (
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Équipe Médicale
                      </CardTitle>
                      <CardDescription>Gestion des médecins et leurs gardes</CardDescription>
                    </div>
                    <Button disabled>
                      <Users className="h-4 w-4 mr-2" />
                      Ajouter un médecin
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm text-muted-foreground">
                      👥 Ce module affiche des données de démonstration. La gestion réelle de l'équipe sera disponible prochainement.
                    </AlertDescription>
                  </Alert>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Spécialité</TableHead>
                        <TableHead>Garde</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: 'Dr. Benali K.', specialty: 'Cardiologie', shift: 'Matin (8h-14h)', status: 'Actif' },
                        { name: 'Dr. Mehdaoui S.', specialty: 'Pédiatrie', shift: 'Après-midi (14h-20h)', status: 'Actif' },
                        { name: 'Dr. Rahmani A.', specialty: 'Chirurgie', shift: 'Nuit (20h-8h)', status: 'En congé' },
                        { name: 'Dr. Touati F.', specialty: 'Médecine générale', shift: 'Matin (8h-14h)', status: 'Actif' },
                      ].map((doc, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell className="text-muted-foreground">{doc.specialty}</TableCell>
                          <TableCell className="text-muted-foreground">{doc.shift}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === 'Actif' ? 'secondary' : 'outline'} className={doc.status === 'Actif' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Hospital Settings Tab */}
          {isHospital && providerData && (
            <TabsContent value="hospital-settings">
              <HospitalSettingsEditor
                provider={providerData}
                onSave={async (updates) => { await updateProviderData(updates as any); }}
              />
            </TabsContent>
          )}

          {/* Maternity Settings Tab */}
          {isMaternity && providerData && (
            <TabsContent value="maternity-settings">
              <MaternitySettingsEditor
                provider={providerData}
                onSave={async (updates) => { await updateProviderData(updates as any); }}
              />
            </TabsContent>
          )}

          {/* Ads Tab - hidden for blood banks */}
          {!isBloodCabin && (
            <TabsContent value="ads">
              <ProviderAdsManager
                providerId={providerData?.id || ''}
                providerUserId={user?.uid || ''}
                providerName={sensitiveData.name}
                providerAvatar={(providerData as any)?.logo}
                providerType={providerData?.type}
                providerCity={providerData?.city}
                isVerified={isVerified}
              />
            </TabsContent>
          )}

          {/* Publications Tab */}
          <TabsContent value="publications">
            <ProviderArticlesManager />
          </TabsContent>

          {/* Giving for Free Tab - hidden for blood banks */}
          {isGivingEligible && !isBloodCabin && (
            <TabsContent value="giving">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Dons gratuits
                      </CardTitle>
                      <CardDescription>Proposez des ressources gratuitement à la communauté</CardDescription>
                    </div>
                    <Button onClick={() => navigate('/citizen/provide/new')}>
                      <Gift className="h-4 w-4 mr-2" />
                      Nouvelle offre
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <OfferList
                    offers={filteredOffers}
                    loading={offersLoading}
                    selectedCategory={offerCategory}
                    onCategoryChange={setOfferCategory}
                    isOwner
                    onEdit={(id) => navigate(`/citizen/provide/edit/${id}`)}
                    onDelete={handleDeleteOffer}
                    deletingId={deletingOfferId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isBloodCabin && (
            <TabsContent value="blood-emergency">
              <div className="grid gap-6 lg:grid-cols-2">
                <BroadcastEmergencyPanel
                  providerId={providerData?.id || ''}
                  providerName={sensitiveData.name}
                  providerLat={sensitiveData.lat}
                  providerLng={sensitiveData.lng}
                />
                <ActiveEmergenciesDashboard providerId={providerData?.id || ''} />
              </div>
            </TabsContent>
          )}

          <TabsContent value="analytics">
            <AnalyticsCharts providerId={providerData?.id || ''} providerUserId={user?.uid || ''} />
          </TabsContent>

          <TabsContent value="reviews-panel">
            <ProviderReviewsPanel providerId={providerData?.id || ''} reporterId={user?.uid || ''} />
          </TabsContent>
        </Tabs>

        {/* Settings Modal */}
        <ProviderSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          providerEmail={sensitiveData.email}
          providerSettings={{
            emailNotifications: providerData?.settings?.emailNotifications ?? true,
            smsNotifications: providerData?.settings?.smsNotifications ?? false,
            appointmentReminders: providerData?.settings?.appointmentReminders ?? true,
            marketingEmails: providerData?.settings?.marketingEmails ?? false,
            showPhoneOnProfile: providerData?.settings?.showPhoneOnProfile ?? true,
            showEmailOnProfile: providerData?.settings?.showEmailOnProfile ?? false,
            allowReviews: providerData?.settings?.allowReviews ?? true,
            language: (providerData?.settings?.language as 'fr' | 'ar' | 'en') ?? 'fr',
          }}
          onSaveSettings={async (settings) => {
            await updateProviderData({ settings: { ...providerData?.settings, ...settings } });
          }}
        />
        
        {/* Welcome Modal */}
        <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <DialogTitle className="sr-only">Bienvenue sur CityHealth</DialogTitle>
            <OnboardingWelcome
              providerName={providerData?.name?.split(' ')[0]}
              onGetStarted={handleWelcomeClose}
            />
          </DialogContent>
        </Dialog>
        
        {/* Celebration Modal */}
        <Dialog open={!!currentCelebration} onOpenChange={() => dismissCelebration()}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <DialogTitle className="sr-only">Félicitations</DialogTitle>
            {currentCelebration && (
              <OnboardingCelebration
                type={currentCelebration}
                providerName={providerData?.name?.split(' ')[0]}
                onContinue={handleCelebrationContinue}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
