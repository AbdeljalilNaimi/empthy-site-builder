import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { 
  Droplet, 
  Hospital, 
  Clock, 
  MapPin, 
  Phone, 
  AlertTriangle,
  Heart,
  Calendar,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  Info,
  Shield,
  Users,
  Map,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { EmergencyAlertBanner } from '@/components/blood-emergency/EmergencyAlertBanner';
import { DonationConfirmationView } from '@/components/blood-emergency/DonationConfirmationView';
import { getDonationHistory, subscribeToEmergencies } from '@/services/bloodEmergencyService';
import type { BloodEmergency } from '@/services/bloodEmergencyService';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] as const;

type BloodType = typeof BLOOD_TYPES[number];

interface BloodProfile {
  bloodType?: BloodType;
  lastDonationDate?: string;
  reminderEnabled: boolean;
}

export default function BloodDonationPage() {
  const { isRTL, language } = useLanguage();
  const { isAuthenticated, profile } = useAuth();
  
  const [respondingEmergency, setRespondingEmergency] = useState<BloodEmergency | null>(null);
  const [activeEmergencies, setActiveEmergencies] = useState<BloodEmergency[]>([]);
  const [eligibilityAge, setEligibilityAge] = useState('');
  const [eligibilityWeight, setEligibilityWeight] = useState('');
  const [eligibilityHeight, setEligibilityHeight] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'not_yet' | null>(null);
  const [nextEligibleDate, setNextEligibleDate] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [profileAutoFilledAge, setProfileAutoFilledAge] = useState(false);
  const [profileAutoFilledWeight, setProfileAutoFilledWeight] = useState(false);
  const [profileAutoFilledHeight, setProfileAutoFilledHeight] = useState(false);
  const [bmiValue, setBmiValue] = useState<number | null>(null);
  const [bloodProfile, setBloodProfile] = useState<BloodProfile>({ reminderEnabled: false });
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  // Real stats
  const [donationCount, setDonationCount] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [centerCount, setCenterCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToEmergencies(setActiveEmergencies);
    return unsub;
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const [donationsRes, centersRes] = await Promise.all([
        supabase.from('donation_history').select('citizen_id'),
        supabase.from('providers_public').select('id', { count: 'exact', head: true })
          .or('type.eq.hospital,type.eq.blood_cabin'),
      ]);
      if (donationsRes.data) {
        setDonationCount(donationsRes.data.length);
        const unique = new Set(donationsRes.data.map(d => d.citizen_id));
        setDonorCount(unique.size);
      }
      if (centersRes.count != null) setCenterCount(centersRes.count);
    };
    fetchStats();
  }, []);
  
  // Auto-fill from profile and donation history
  useEffect(() => {
    if (!isAuthenticated || !profile || profileLoaded) return;
    const profileAny = profile as any;
    if (profileAny.blood_group) {
      setBloodProfile(prev => ({ ...prev, bloodType: profileAny.blood_group }));
    }
    if (profileAny.date_of_birth) {
      const dob = new Date(profileAny.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age > 0 && age < 150) { setEligibilityAge(String(age)); setProfileAutoFilledAge(true); }
    }
    if (profileAny.weight && profileAny.weight > 0) { setEligibilityWeight(String(profileAny.weight)); setProfileAutoFilledWeight(true); }
    if (profileAny.height && profileAny.height > 0) { setEligibilityHeight(String(profileAny.height)); setProfileAutoFilledHeight(true); }
    if (profileAny.id || profileAny.uid) {
      const citizenId = profileAny.id || profileAny.uid;
      getDonationHistory(citizenId).then(history => {
        if (history.length > 0) {
          const donatedDate = history[0].donated_at.split('T')[0];
          setLastDonation(donatedDate);
          setBloodProfile(prev => ({ ...prev, lastDonationDate: donatedDate }));
        } else if (profileAny.last_donation_date) {
          setLastDonation(profileAny.last_donation_date);
          setBloodProfile(prev => ({ ...prev, lastDonationDate: profileAny.last_donation_date }));
        }
      }).catch(() => {
        if (profileAny.last_donation_date) {
          setLastDonation(profileAny.last_donation_date);
          setBloodProfile(prev => ({ ...prev, lastDonationDate: profileAny.last_donation_date }));
        }
      });
    } else if (profileAny.last_donation_date) {
      setLastDonation(profileAny.last_donation_date);
      setBloodProfile(prev => ({ ...prev, lastDonationDate: profileAny.last_donation_date }));
    }
    setProfileLoaded(true);
  }, [isAuthenticated, profile, profileLoaded]);

  const texts = useMemo(() => ({
    fr: {
      title: 'Don de Sang & Recherche d\'Urgence',
      subtitle: 'Trouvez rapidement les hôpitaux et centres de don de sang à Sidi Bel Abbès',
      emergencyFinder: 'Recherche d\'Urgence',
      donateBlood: 'Donner du Sang',
      reminders: 'Rappels',
      info: 'Informations',
      selectBloodType: 'Sélectionnez votre groupe sanguin',
      disclaimer: 'Pour les urgences vitales, contactez immédiatement les services d\'urgence.',
      emergencyCall: 'Appelez le 15',
      eligibilityChecker: 'Vérificateur d\'éligibilité',
      age: 'Âge',
      weight: 'Poids (kg)',
      lastDonationDate: 'Date du dernier don',
      checkEligibility: 'Vérifier mon éligibilité',
      eligible: 'Vous êtes éligible au don de sang !',
      notYetEligible: 'Vous ne pouvez pas encore donner',
      nextEligible: 'Prochaine date éligible',
      eligibilityNote: 'Ceci est une estimation. L\'approbation finale dépend du personnel médical.',
      findCenter: 'Trouver un centre près de moi',
      viewMap: 'Voir la carte interactive',
      bloodType: 'Groupe sanguin',
      saveProfile: 'Sauvegarder mon profil sanguin',
      enableReminders: 'Activer les rappels de don',
      reminderInfo: 'Recevez une notification tous les 3 mois',
      loginRequired: 'Connectez-vous pour sauvegarder vos préférences',
      whyDonate: 'Pourquoi donner son sang ?',
      fact1: 'Un don peut sauver jusqu\'à 3 vies',
      fact2: 'Seulement 10-15 minutes',
      fact3: 'Don possible tous les 56 jours',
      fact4: 'Totalement sécurisé et médicalement supervisé',
      heroStat1: 'Vies sauvées',
      heroStat2: 'Donneurs actifs',
      heroStat3: 'Centres de don',
      ctaFinal: 'Chaque goutte compte',
      ctaFinalSub: 'Votre don peut faire la différence entre la vie et la mort. Rejoignez des milliers de donneurs.',
      ctaFinalBtn: 'Je veux donner',
      noEmergencies: 'Aucune urgence en cours',
      noEmergenciesSub: 'Toutes les réserves de sang sont stables',
      currentEmergencies: 'Urgences Actuelles à Sidi Bel Abbès',
      canDonate: 'Je peux donner',
    },
    ar: {
      title: 'التبرع بالدم والبحث الطارئ',
      subtitle: 'ابحث بسرعة عن المستشفيات ومراكز التبرع بالدم في سيدي بلعباس',
      emergencyFinder: 'البحث الطارئ',
      donateBlood: 'تبرع بالدم',
      reminders: 'التذكيرات',
      info: 'معلومات',
      selectBloodType: 'اختر فصيلة دمك',
      disclaimer: 'للحالات الطارئة، اتصل فوراً بخدمات الطوارئ.',
      emergencyCall: 'اتصل بـ 15',
      eligibilityChecker: 'فحص الأهلية',
      age: 'العمر',
      weight: 'الوزن (كجم)',
      lastDonationDate: 'تاريخ آخر تبرع',
      checkEligibility: 'تحقق من أهليتي',
      eligible: 'أنت مؤهل للتبرع بالدم!',
      notYetEligible: 'لا يمكنك التبرع بعد',
      nextEligible: 'التاريخ المؤهل التالي',
      eligibilityNote: 'هذا تقدير. الموافقة النهائية تعتمد على الطاقم الطبي.',
      findCenter: 'ابحث عن مركز بالقرب مني',
      viewMap: 'عرض الخريطة التفاعلية',
      bloodType: 'فصيلة الدم',
      saveProfile: 'حفظ ملف الدم الخاص بي',
      enableReminders: 'تفعيل تذكيرات التبرع',
      reminderInfo: 'تلقي إشعار كل 3 أشهر',
      loginRequired: 'سجل الدخول لحفظ تفضيلاتك',
      whyDonate: 'لماذا التبرع بالدم؟',
      fact1: 'يمكن لتبرع واحد إنقاذ ما يصل إلى 3 أرواح',
      fact2: '10-15 دقيقة فقط',
      fact3: 'التبرع ممكن كل 56 يومًا',
      fact4: 'آمن تمامًا ومراقب طبيًا',
      heroStat1: 'أرواح أُنقذت',
      heroStat2: 'متبرعون نشطون',
      heroStat3: 'مراكز التبرع',
      ctaFinal: 'كل قطرة مهمة',
      ctaFinalSub: 'تبرعك يمكن أن يحدث الفرق بين الحياة والموت. انضم إلى آلاف المتبرعين.',
      ctaFinalBtn: 'أريد أن أتبرع',
      noEmergencies: 'لا توجد حالات طوارئ حالياً',
      noEmergenciesSub: 'جميع احتياطيات الدم مستقرة',
      currentEmergencies: 'الحالات الطارئة الحالية في سيدي بلعباس',
      canDonate: 'يمكنني التبرع',
    },
    en: {
      title: 'Blood Donation & Emergency Finder',
      subtitle: 'Quickly find hospitals and blood donation centers in Sidi Bel Abbès',
      emergencyFinder: 'Emergency Finder',
      donateBlood: 'Donate Blood',
      reminders: 'Reminders',
      info: 'Information',
      selectBloodType: 'Select your blood type',
      disclaimer: 'For life-threatening emergencies, contact emergency services immediately.',
      emergencyCall: 'Call 15',
      eligibilityChecker: 'Eligibility Checker',
      age: 'Age',
      weight: 'Weight (kg)',
      lastDonationDate: 'Last donation date',
      checkEligibility: 'Check my eligibility',
      eligible: 'You are eligible to donate blood!',
      notYetEligible: 'You cannot donate yet',
      nextEligible: 'Next eligible date',
      eligibilityNote: 'This is guidance only, not medical approval.',
      findCenter: 'Find a center near me',
      viewMap: 'View interactive map',
      bloodType: 'Blood type',
      saveProfile: 'Save my blood profile',
      enableReminders: 'Enable donation reminders',
      reminderInfo: 'Receive a notification every 3 months',
      loginRequired: 'Log in to save your preferences',
      whyDonate: 'Why donate blood?',
      fact1: 'One donation can save up to 3 lives',
      fact2: 'Only 10-15 minutes',
      fact3: 'Donation possible every 56 days',
      fact4: 'Completely safe and medically supervised',
      heroStat1: 'Lives saved',
      heroStat2: 'Active donors',
      heroStat3: 'Donation centers',
      ctaFinal: 'Every drop counts',
      ctaFinalSub: 'Your donation can make the difference between life and death. Join thousands of donors.',
      ctaFinalBtn: 'I want to donate',
      noEmergencies: 'No active emergencies',
      noEmergenciesSub: 'All blood reserves are stable',
      currentEmergencies: 'Current Emergencies in Sidi Bel Abbès',
      canDonate: 'I can donate',
    }
  }), []);
  
  const tx = texts[language as keyof typeof texts] || texts.fr;
  
  const checkEligibility = () => {
    const age = parseInt(eligibilityAge);
    const weight = parseInt(eligibilityWeight);
    const height = parseInt(eligibilityHeight);
    setDaysRemaining(null);
    if (weight > 0 && height > 0) {
      const heightM = height / 100;
      setBmiValue(Math.round((weight / (heightM * heightM)) * 10) / 10);
    } else {
      setBmiValue(null);
    }
    if (age < 18 || weight < 50) { setEligibilityResult('not_yet'); setNextEligibleDate(null); return; }
    if (lastDonation) {
      const lastDate = new Date(lastDonation);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 56);
      if (nextDate > new Date()) {
        const remaining = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        setDaysRemaining(remaining);
        setEligibilityResult('not_yet');
        setNextEligibleDate(nextDate.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR'));
        return;
      }
    }
    setEligibilityResult('eligible');
    setNextEligibleDate(null);
  };
  
  const saveBloodProfile = () => {
    localStorage.setItem('blood_profile', JSON.stringify(bloodProfile));
  };

  const profileBloodGroup = (profile as any)?.blood_group;
  const hasAutoFilledDonationDate = profileLoaded && !!bloodProfile.lastDonationDate;

  const factItems = [
    { icon: Users, text: tx.fact1, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
    { icon: Clock, text: tx.fact2, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { icon: Calendar, text: tx.fact3, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Shield, text: tx.fact4, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' }
  ];
  
  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      
      {/* ===== PREMIUM HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-destructive/90 via-destructive/80 to-rose-600/90 pt-24 pb-16">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-rose-300/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Emergency compact banner */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <a
              href="tel:15"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm hover:bg-white/25 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {tx.emergencyCall} — {tx.disclaimer}
            </a>
          </div>

          {/* Animated droplet icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-white/20" style={{ animationDuration: '2s' }} />
              <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Droplet className="h-8 w-8 text-white fill-white/30" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center mb-4 tracking-tight">
            {tx.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 text-center max-w-2xl mx-auto mb-10">
            {tx.subtitle}
          </p>

          {/* Hero CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="rounded-full bg-white text-destructive hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold gap-2 px-8">
              <Link to="/map/blood">
                <Map className="h-5 w-5" />
                {tx.viewMap}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full border-white/70 text-white hover:bg-white/20 backdrop-blur-sm gap-2 px-8 font-semibold shadow-lg">
              <Link to="/map/emergency">
                <AlertTriangle className="h-5 w-5" />
                {tx.emergencyFinder}
              </Link>
            </Button>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: donationCount > 0 ? `${donationCount}+` : '—', label: tx.heroStat1 },
              { value: donorCount > 0 ? `${donorCount}+` : '—', label: tx.heroStat2 },
              { value: centerCount > 0 ? String(centerCount) : '—', label: tx.heroStat3 },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs md:text-sm text-white/80 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 space-y-12">
        {/* Emergency Alert Banner */}
        {!respondingEmergency && (
          <EmergencyAlertBanner onRespond={setRespondingEmergency} />
        )}
        {respondingEmergency && (
          <DonationConfirmationView
            emergency={respondingEmergency}
            onClose={() => setRespondingEmergency(null)}
          />
        )}

        {/* ===== REAL-TIME EMERGENCIES FEED ===== */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Droplet className="h-5 w-5 text-destructive" />
            {tx.currentEmergencies}
          </h2>
          {activeEmergencies.length === 0 ? (
            <div className="py-12 rounded-2xl border-2 border-dashed border-border bg-muted/20 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-lg font-semibold text-foreground">{tx.noEmergencies}</p>
              <p className="text-sm text-muted-foreground mt-1">{tx.noEmergenciesSub}</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-1 px-1 snap-x">
              {activeEmergencies.map((emergency, idx) => (
                <div
                  key={emergency.id}
                  className={cn(
                    "flex-shrink-0 w-80 p-5 rounded-2xl border-2 snap-start animate-fade-in transition-shadow hover:shadow-lg",
                    emergency.urgency_level === 'critical'
                      ? "border-destructive/60 bg-destructive/5"
                      : "border-amber-400/60 bg-amber-50 dark:bg-amber-950/20"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                      emergency.urgency_level === 'critical'
                        ? "bg-destructive/15 text-destructive"
                        : "bg-amber-500/15 text-amber-600"
                    )}>
                      {emergency.blood_type_needed}
                    </div>
                    <div className="flex-1 min-w-0">
                      {emergency.provider_name && (
                        <p className="text-sm font-medium truncate">
                          <MapPin className="h-3 w-3 inline mr-1 text-muted-foreground" />
                          {emergency.provider_name}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={emergency.urgency_level === 'critical' ? 'destructive' : 'secondary'}
                      className={cn(
                        "shrink-0",
                        emergency.urgency_level === 'critical' && "animate-pulse"
                      )}
                    >
                      {emergency.urgency_level === 'critical' ? 'Critique' : 'Urgent'}
                    </Badge>
                  </div>
                  {emergency.message && (
                    <p className="text-xs text-muted-foreground mb-4 italic line-clamp-2">"{emergency.message}"</p>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full rounded-xl"
                    onClick={() => setRespondingEmergency(emergency)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {tx.canDonate}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* ===== MAIN TABS ===== */}
        <Tabs defaultValue="donate" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 rounded-xl bg-muted/60 backdrop-blur-sm">
            <TabsTrigger value="donate" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Heart className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{tx.donateBlood}</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{tx.reminders}</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Info className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{tx.info}</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Donate Blood */}
          <TabsContent value="donate" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Eligibility Checker */}
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    {tx.eligibilityChecker}
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      {tx.eligibilityNote}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">{tx.age}</Label>
                      <Input id="age" type="number" min="1" max="100" value={eligibilityAge} onChange={(e) => setEligibilityAge(e.target.value)} placeholder="≥ 18" readOnly={profileAutoFilledAge} className={profileAutoFilledAge ? "opacity-70 cursor-not-allowed" : ""} />
                      {profileAutoFilledAge && <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تم حسابه من ملفك الشخصي' : 'Calculé depuis votre profil'}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">{tx.weight}</Label>
                      <Input id="weight" type="number" min="1" max="300" value={eligibilityWeight} onChange={(e) => setEligibilityWeight(e.target.value)} placeholder="≥ 50" readOnly={profileAutoFilledWeight} className={profileAutoFilledWeight ? "opacity-70 cursor-not-allowed" : ""} />
                      {profileAutoFilledWeight && <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تم ملؤه من ملفك الشخصي' : 'Pré-rempli depuis votre profil'}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">{language === 'ar' ? 'الطول (سم)' : 'Taille (cm)'}</Label>
                      <Input id="height" type="number" min="50" max="250" value={eligibilityHeight} onChange={(e) => setEligibilityHeight(e.target.value)} placeholder="≥ 100" readOnly={profileAutoFilledHeight} className={profileAutoFilledHeight ? "opacity-70 cursor-not-allowed" : ""} />
                      {profileAutoFilledHeight && <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تم ملؤه من ملفك الشخصي' : 'Pré-rempli depuis votre profil'}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'مؤشر كتلة الجسم' : 'IMC'}</Label>
                      {bmiValue !== null ? (
                        <div className={cn(
                          "flex items-center gap-2 h-10 px-3 rounded-md border text-sm font-medium",
                          bmiValue < 18.5 ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" :
                          bmiValue <= 25 ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" :
                          bmiValue <= 30 ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" :
                          "border-destructive/50 bg-destructive/10 text-destructive"
                        )}>
                          <span>{bmiValue.toFixed(1)}</span>
                          <span className="text-xs opacity-75">
                            {bmiValue < 18.5 ? (language === 'ar' ? 'نقص الوزن' : 'Insuffisant') :
                             bmiValue <= 25 ? (language === 'ar' ? 'طبيعي' : 'Normal') :
                             bmiValue <= 30 ? (language === 'ar' ? 'زيادة الوزن' : 'Surpoids') :
                             (language === 'ar' ? 'سمنة' : 'Obésité')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center h-10 px-3 rounded-md border text-sm text-muted-foreground">
                          {language === 'ar' ? 'أدخل الوزن والطول' : 'Entrez poids & taille'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastDonation">{tx.lastDonationDate}</Label>
                    <Input id="lastDonation" type="date" value={lastDonation} onChange={(e) => setLastDonation(e.target.value)} readOnly={hasAutoFilledDonationDate} className={hasAutoFilledDonationDate ? "opacity-70 cursor-not-allowed" : ""} />
                    {hasAutoFilledDonationDate && <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تم ملؤه تلقائياً من سجل التبرعات' : 'Pré-rempli depuis votre historique de dons'}</p>}
                  </div>
                  
                  <Button onClick={checkEligibility} className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {tx.checkEligibility}
                  </Button>
                  
                  {eligibilityResult && (
                    <div className={cn(
                      "p-5 rounded-xl border-2 animate-fade-in",
                      eligibilityResult === 'eligible'
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                    )}>
                      <div className="flex items-center gap-3">
                        {eligibilityResult === 'eligible' ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="font-semibold text-green-700 dark:text-green-300">{tx.eligible}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                              <XCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="font-semibold text-amber-700 dark:text-amber-300">{tx.notYetEligible}</span>
                          </>
                        )}
                      </div>
                      {daysRemaining !== null && (
                        <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">
                          {language === 'ar'
                            ? `يجب الانتظار ${daysRemaining} يومًا إضافيًا قبل التبرع التالي.`
                            : `Vous devez attendre encore ${daysRemaining} jours avant votre prochain don.`}
                        </p>
                      )}
                      {nextEligibleDate && (
                        <p className="mt-1 text-sm text-muted-foreground">{tx.nextEligible}: <strong>{nextEligibleDate}</strong></p>
                      )}
                      {bmiValue !== null && (bmiValue < 18.5 || bmiValue > 30) && (
                        <Alert variant="destructive" className="mt-4 border-destructive/40 bg-destructive/5">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{language === 'ar' ? 'تنبيه بشأن مؤشر كتلة الجسم' : 'Alerte IMC'}</AlertTitle>
                          <AlertDescription className="text-sm">
                            {bmiValue < 18.5
                              ? (language === 'ar'
                                  ? `مؤشر كتلة الجسم الخاص بك (${bmiValue.toFixed(1)}) أقل من 18.5. قد يؤثر نقص الوزن على أهليتك للتبرع.`
                                  : `Votre IMC (${bmiValue.toFixed(1)}) est inférieur à 18.5. L'insuffisance pondérale peut affecter votre éligibilité.`)
                              : (language === 'ar'
                                  ? `مؤشر كتلة الجسم الخاص بك (${bmiValue.toFixed(1)}) أعلى من 30. قد يطلب الطاقم الطبي فحصاً إضافياً.`
                                  : `Votre IMC (${bmiValue.toFixed(1)}) est supérieur à 30. Un examen complémentaire pourrait être demandé.`)}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>
                      {language === 'ar'
                        ? "مؤشر كتلة الجسم (IMC) يُحسب من الوزن والطول. القيم الطبيعية بين 18.5 و 25."
                        : "L'IMC est calculé à partir du poids et de la taille. Les valeurs normales se situent entre 18.5 et 25."}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Blood Facts */}
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-destructive" />
                    </div>
                    {tx.whyDonate}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {factItems.map((item, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02]",
                          item.bg
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", item.color)}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full mt-4 rounded-xl" asChild>
                    <Link to="/map/blood">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tx.findCenter}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab 2: Reminders */}
          <TabsContent value="reminders" className="space-y-6">
            <Card className="border-2 shadow-sm max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  {language === 'ar' ? 'تذكيرات التبرع' : 'Rappels de Don'}
                </CardTitle>
                <CardDescription>{tx.reminderInfo}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isAuthenticated ? (
                  <Alert><Info className="h-4 w-4" /><AlertDescription>{tx.loginRequired}</AlertDescription></Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>{tx.bloodType}</Label>
                      {profileBloodGroup ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-lg py-2 px-4"><Droplet className="h-4 w-4 mr-1" />{profileBloodGroup}</Badge>
                          <span className="text-xs text-muted-foreground">{language === 'ar' ? 'من ملفك الشخصي' : 'Depuis votre profil'}</span>
                        </div>
                      ) : (
                        <Select value={bloodProfile.bloodType || ''} onValueChange={(value) => setBloodProfile({ ...bloodProfile, bloodType: value as BloodType })}>
                          <SelectTrigger><SelectValue placeholder={tx.selectBloodType} /></SelectTrigger>
                          <SelectContent>{BLOOD_TYPES.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{tx.lastDonationDate}</Label>
                      <Input type="date" value={bloodProfile.lastDonationDate || ''} onChange={(e) => setBloodProfile({ ...bloodProfile, lastDonationDate: e.target.value })} readOnly={hasAutoFilledDonationDate} className={hasAutoFilledDonationDate ? "opacity-70 cursor-not-allowed" : ""} />
                      {hasAutoFilledDonationDate && <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تم ملؤه تلقائياً من سجل التبرعات' : 'Pré-rempli depuis votre historique de dons'}</p>}
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                      <div className="flex items-center gap-3">
                        {bloodProfile.reminderEnabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                        <div>
                          <p className="font-medium">{tx.enableReminders}</p>
                          <p className="text-sm text-muted-foreground">{tx.reminderInfo}</p>
                        </div>
                      </div>
                      <Switch checked={bloodProfile.reminderEnabled} onCheckedChange={(checked) => setBloodProfile({ ...bloodProfile, reminderEnabled: checked })} />
                    </div>
                    <Button onClick={saveBloodProfile} className="w-full rounded-xl">{tx.saveProfile}</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab 3: Info */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Droplet className="h-5 w-5 text-destructive" />
                    </div>
                    {language === 'ar' ? 'فصائل الدم' : 'Groupes Sanguins'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {BLOOD_TYPES.map((type) => (
                      <Badge key={type} variant="outline" className="text-base py-2 px-4 rounded-lg border-2">{type}</Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {language === 'ar' ? 'O- هو المتبرع العام، AB+ هو المتلقي العام' : 'O- est le donneur universel, AB+ est le receveur universel'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Hospital className="h-5 w-5 text-primary" />
                    </div>
                    {language === 'ar' ? 'أين تتبرع؟' : 'Où donner ?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'يمكنك التبرع في المستشفيات ومراكز التبرع بالدم المعتمدة.' : 'Vous pouvez donner dans les hôpitaux et centres de don agréés.'}
                  </p>
                  <Button className="w-full rounded-xl" variant="outline" asChild>
                    <Link to="/map/blood"><Map className="h-4 w-4 mr-2" />{tx.viewMap}</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-destructive" />
                    </div>
                    {language === 'ar' ? 'أرقام الطوارئ' : 'Numéros d\'urgence'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href="tel:15" className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border border-destructive/20 hover:bg-destructive/15 transition-colors">
                    <span className="font-semibold">SAMU</span>
                    <span className="text-destructive font-bold text-xl">15</span>
                  </a>
                  <a href="tel:14" className="flex items-center justify-between p-4 bg-muted rounded-xl border hover:bg-muted/80 transition-colors">
                    <span className="font-semibold">{language === 'ar' ? 'الحماية المدنية' : 'Protection Civile'}</span>
                    <span className="font-bold text-xl">14</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ===== CTA FINAL SECTION ===== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-destructive/90 to-rose-600/90 p-10 md:p-16 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-7 w-7 text-white fill-white/30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{tx.ctaFinal}</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">{tx.ctaFinalSub}</p>
            <Button size="lg" asChild className="rounded-full bg-white text-destructive hover:bg-white/90 shadow-xl font-semibold px-10 hover:scale-105 transition-transform">
              <Link to="/map/blood">
                <Droplet className="h-5 w-5 mr-2" />
                {tx.ctaFinalBtn}
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
