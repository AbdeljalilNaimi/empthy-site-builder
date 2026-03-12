import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MapPin, Star, Phone, Share2, Flag, Calendar, Languages, Award, 
  Image as ImageIcon, Heart, Navigation, Copy, Check, Clock, 
  ArrowLeft, Building2, Stethoscope, Pill, FlaskConical, 
  Hospital, Baby, Droplets, RadioTower, Wrench, Shield,
  Megaphone, ExternalLink, Sparkles, Accessibility, MessageSquare,
  Car, Footprints, X, Loader2, Route, BedDouble, HeartPulse, Scissors, Video, Home as HomeIcon, ClipboardList, AlertTriangle, ShieldCheck,
  Package, ShoppingBag, RefreshCw, Truck, FileText, Search as SearchIcon, Users, UserCheck
} from "lucide-react";
import { useProvider } from "@/hooks/useProviders";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { BookingModal } from "@/components/BookingModal";
import { ReviewSystem } from "@/components/ReviewSystem";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { ReportProviderDialog } from "@/components/provider/ReportProviderDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProviderMap from "@/components/ProviderMap";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from 'qrcode.react';
import { getDefaultSchedule } from "@/data/providerAssets";
import { VerifiedBadge } from "@/components/trust/VerifiedBadge";
import { isProviderVerified } from "@/utils/verificationUtils";
import { ClientAIChat } from "@/components/provider/ClientAIChat";
import { ClientAIChatBanner } from "@/components/provider/ClientAIChatBanner";
import { AppointmentWidget } from "@/components/provider/profile/AppointmentWidget";
import { PROVIDER_TYPES as PROVIDER_TYPES_ARRAY } from "@/types/provider";
import type { ProviderType } from "@/types/provider";
import { useProviderFieldConfig } from "@/hooks/useProviderFieldConfig";
import { providerAnalytics } from "@/services/providerAnalyticsService";

// Mapping from Firestore display strings to enum values
const TYPE_DISPLAY_TO_ENUM: Record<string, ProviderType> = {
  'Médecin': 'doctor',
  'Médecin généraliste': 'doctor',
  'Clinique': 'clinic',
  'Pharmacie': 'pharmacy',
  'Laboratoire': 'lab',
  'Hôpital': 'hospital',
  'Maternité': 'birth_hospital',
  'Centre de don du sang': 'blood_cabin',
  'Centre de radiologie': 'radiology_center',
  'Équipement médical': 'medical_equipment',
};

/** Resolve provider type from potential display string to enum */
function resolveProviderType(rawType: string): ProviderType {
  if ((PROVIDER_TYPES_ARRAY as readonly string[]).includes(rawType)) {
    return rawType as ProviderType;
  }
  return TYPE_DISPLAY_TO_ENUM[rawType] || 'doctor';
}

// Provider type icon mapping with colors
const providerTypeConfig: Record<ProviderType, { icon: typeof Building2; color: string; gradient: string }> = {
  doctor: { icon: Stethoscope, color: "text-blue-600", gradient: "from-blue-500/20 to-cyan-500/20" },
  clinic: { icon: Building2, color: "text-emerald-600", gradient: "from-emerald-500/20 to-teal-500/20" },
  pharmacy: { icon: Pill, color: "text-green-600", gradient: "from-green-500/20 to-lime-500/20" },
  lab: { icon: FlaskConical, color: "text-purple-600", gradient: "from-purple-500/20 to-violet-500/20" },
  hospital: { icon: Hospital, color: "text-red-600", gradient: "from-red-500/20 to-rose-500/20" },
  birth_hospital: { icon: Baby, color: "text-pink-600", gradient: "from-pink-500/20 to-rose-500/20" },
  blood_cabin: { icon: Droplets, color: "text-red-600", gradient: "from-red-500/20 to-orange-500/20" },
  radiology_center: { icon: RadioTower, color: "text-indigo-600", gradient: "from-indigo-500/20 to-blue-500/20" },
  medical_equipment: { icon: Wrench, color: "text-slate-600", gradient: "from-slate-500/20 to-gray-500/20" },
};

const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, profile, isAuthenticated } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAvailable, setChatAvailable] = useState<boolean | null>(null);
  
  // Routing state
  const [routesData, setRoutesData] = useState<import('@/types/routing').RouteData[] | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isRouting, setIsRouting] = useState(false);
  const [transportMode, setTransportMode] = useState<'driving' | 'foot'>('driving');
  
  // Get current URL for sharing
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Use TanStack Query for provider data
  const { data: provider, isLoading: loading, isError } = useProvider(id);
  
  // Use TanStack Query for favorites
  const { data: favorites = [] } = useFavorites();
  const { toggle: toggleFavorite, isLoading: favoriteLoading } = useToggleFavorite();
  
  const isFavorite = provider ? favorites.includes(provider.id) : false;

  // Supabase reviews hook
  const { reviews: reviewsData, stats: reviewStats, isLoading: reviewsLoading, submitReview: submitReviewMutation } = useSupabaseReviews(id);

  // Resolve provider type (handles both enum and display strings from Firestore)
  const resolvedType = provider ? resolveProviderType(provider.type) : 'doctor';
  const typeConfig = providerTypeConfig[resolvedType] || providerTypeConfig.doctor;
  const TypeIcon = typeConfig.icon;

  // Resolve category-specific field config for future dynamic rendering
  const fieldConfig = useProviderFieldConfig(
    provider?.providerCategory,
    resolvedType
  );

  // Day mapping for schedule with translations
  const dayKeys = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
  const dayTranslationKeys = ['mondayShort', 'tuesdayShort', 'wednesdayShort', 'thursdayShort', 'fridayShort', 'saturdayShort', 'sundayShort'] as const;

  // Update document title and track profile view when provider loads
  useEffect(() => {
    if (provider) {
      document.title = `${provider.name} – CityHealth Profile`;
      const providerUserId = provider.id.replace(/^provider_/, '');
      providerAnalytics.trackProfileView(provider.id, user?.uid, providerUserId);
    }
  }, [provider?.id]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast.error(t('auth.login'), {
        description: t('provider.addToFavorites'),
        action: {
          label: t('auth.login'),
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    if (!provider) return;
    toggleFavorite(provider.id);
    toast.success(isFavorite ? t('provider.addToFavorites') : t('provider.removeFromFavorites'));
  };

  const calculateRouteToProvider = useCallback((mode: 'driving' | 'foot' = transportMode) => {
    if (!provider) return;
    setIsRouting(true);
    setRoutesData(null);
    setSelectedRouteIndex(0);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        try {
          const profile = mode === 'foot' ? 'foot' : 'driving';
          const url = `https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${provider.lng},${provider.lat}?overview=full&geometries=geojson&alternatives=true`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.code !== 'Ok' || !data.routes?.length) {
            toast.error("Impossible de calculer l'itinéraire");
            setIsRouting(false);
            return;
          }
          const routes: import('@/types/routing').RouteData[] = data.routes.map((route: any) => ({
            coordinates: route.geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as [number, number]
            ),
            distance: Math.round((route.distance / 1000) * 10) / 10,
            duration: Math.round(route.duration / 60),
          }));
          setRoutesData(routes);
        } catch {
          toast.error("Erreur de connexion au service de routage");
        } finally {
          setIsRouting(false);
        }
      },
      () => {
        toast.error("Veuillez autoriser la géolocalisation");
        setIsRouting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [provider, transportMode]);

  const handleToggleTransportMode = useCallback((mode: 'driving' | 'foot') => {
    setTransportMode(mode);
    if (routesData) {
      calculateRouteToProvider(mode);
    }
  }, [routesData, calculateRouteToProvider]);

  const clearRoute = useCallback(() => {
    setRoutesData(null);
    setSelectedRouteIndex(0);
  }, []);

  const handleGetDirections = () => {
    calculateRouteToProvider();
  };

  const handleOpenInMaps = () => {
    if (!provider) return;
    navigate(`/map/providers?provider=${provider.id}`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('provider.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleNativeShare = async () => {
    if (!provider) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: provider.name,
          text: `${provider.name} - CityHealth`,
          url: shareUrl
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCall = () => {
    if (!provider) return;
    // Track phone click
    const providerUserId = provider.id.replace(/^provider_/, '');
    providerAnalytics.trackPhoneClick(provider.id, user?.uid, providerUserId);
    window.location.href = `tel:${provider.phone}`;
  };

  // Check if provider is new (within 7 days)
  const isNewProvider = provider && 'createdAt' in provider && provider.createdAt ? 
    (new Date().getTime() - new Date(provider.createdAt as unknown as Date).getTime()) < 7 * 24 * 60 * 60 * 1000 
    : false;

  if (loading) {
    return (
      <main className="pt-20 pb-16 px-4 max-w-6xl mx-auto">
        {/* Hero skeleton */}
        <Skeleton className="h-48 md:h-64 w-full rounded-2xl mb-6" />
        
        {/* Header skeleton */}
        <div className="glass-card rounded-2xl p-6 mb-6 mt-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Skeleton className="w-28 h-28 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <Card className="glass-card border-destructive/20">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('provider.notFound')}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('provider.notFoundDesc')}
            </p>
            <Button onClick={() => navigate('/search')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('provider.backToSearch')}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Get gallery and schedule
  const gallery = provider.gallery?.length ? provider.gallery : [];
  const schedule = provider.schedule || getDefaultSchedule(resolvedType, provider.emergency);

  return (
    <main className="pt-20 pb-16" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Pharmacie de Garde Pulsing Banner */}
      {resolvedType === 'pharmacy' && provider.isPharmacieDeGarde && (
        <div className="mx-4 max-w-6xl lg:mx-auto mt-2 mb-0">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
              <Pill className="h-6 w-6" />
              <span className="text-lg font-bold tracking-wide">PHARMACIE DE GARDE — Ouverte maintenant</span>
              <Pill className="h-6 w-6" />
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
            </div>
          </div>
        </div>
      )}

      {/* Minimal Hero */}
      <section className="relative h-40 md:h-52 bg-muted/50 overflow-hidden">
        {gallery[0] && (
          <img 
            src={gallery[0]} 
            alt={`${provider.name} cover`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 gap-1.5 text-foreground/80 hover:text-foreground bg-background/60 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>

        <nav className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Link to="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-foreground transition-colors">{t('nav.search')}</Link>
        </nav>
      </section>

      <div className="px-4 max-w-6xl mx-auto -mt-14 relative z-10">
        {/* Profile Header */}
        <section className="rounded-2xl border bg-card p-6 mb-6 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row gap-5">
            {/* Avatar */}
            <div className="relative group w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
              <div className="w-full h-full rounded-2xl border-4 border-background shadow-lg overflow-hidden bg-muted flex items-center justify-center ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/30 group-hover:shadow-xl">
                {provider.image && provider.image !== '/placeholder.svg' && provider.image !== '' ? (
                  <img 
                    src={provider.image} 
                    alt={provider.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <TypeIcon className={`h-10 w-10 md:h-12 md:w-12 ${typeConfig.color} drop-shadow-sm`} />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name + Verified */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">{provider.name}</h1>
                {isProviderVerified(provider) && <VerifiedBadge type={(provider as any).planType === 'premium' ? 'premium' : 'verified'} size="md" />}
              </div>

              {/* Type line */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <TypeIcon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
                <span>{t(`providerTypes.${resolvedType}`)}</span>
                {provider.specialty && (
                  <>
                    <span className="text-border">·</span>
                    <span>{provider.specialty}</span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {reviewStats.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">{reviewStats.totalReviews} {t('provider.reviews')}</span>
                {provider.accessible && (
                  <>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Accessibility className="h-3.5 w-3.5" />
                      {t('provider.accessible')}
                    </span>
                  </>
                )}
              </div>

              {/* Contextual badges — compact row */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {isNewProvider && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Sparkles className="h-3 w-3" />
                    {t('provider.newProvider')}
                  </Badge>
                )}
                {(provider.emergency || provider.emergencyCapable) && ['doctor', 'clinic', 'hospital', 'birth_hospital'].includes(resolvedType) && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <HeartPulse className="h-3 w-3" />
                    Urgences 24/7
                  </Badge>
                )}
                {resolvedType === 'pharmacy' && provider.isPharmacieDeGarde && (
                  <Badge className="text-xs gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Pharmacie de Garde
                  </Badge>
                )}
                {resolvedType === 'pharmacy' && provider.pharmacyDeliveryAvailable && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Truck className="h-3 w-3" /> Livraison
                  </Badge>
                )}
                {provider.homeCollection && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <HomeIcon className="h-3 w-3" /> Prélèvement à domicile
                  </Badge>
                )}
                {provider.turnaroundHours && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Clock className="h-3 w-3" /> ~{provider.turnaroundHours}h
                  </Badge>
                )}
                {/* Specialties inline */}
                {provider.specialties && provider.specialties.length > 0 && ['doctor', 'clinic', 'hospital'].includes(resolvedType) && 
                  provider.specialties.slice(0, 3).map((spec: string) => (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))
                }
                {provider.specialties && provider.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{provider.specialties.length - 3}
                  </Badge>
                )}
                {/* Infrastructure highlights */}
                {provider.numberOfBeds && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <BedDouble className="h-3 w-3" /> {provider.numberOfBeds} lits
                  </Badge>
                )}
                {provider.operatingBlocks && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Scissors className="h-3 w-3" /> {provider.operatingBlocks} blocs
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions — right side */}
            <div className="flex md:flex-col gap-2 flex-wrap md:items-end flex-shrink-0">
              {/* Primary CTA */}
              {['doctor', 'clinic', 'hospital', 'birth_hospital'].includes(resolvedType) && (
                <Button onClick={() => setBookingOpen(true)} size="sm" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
                  <Calendar className="h-3.5 w-3.5" />
                  Prendre rendez-vous
                </Button>
              )}
              {['lab', 'radiology_center'].includes(resolvedType) && (
                <Button onClick={() => setBookingOpen(true)} size="sm" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Planifier un examen
                </Button>
              )}
              {resolvedType === 'pharmacy' && (
                <Button onClick={handleCall} size="sm" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
                  <Phone className="h-3.5 w-3.5" />
                  Appeler
                </Button>
              )}
              {resolvedType === 'blood_cabin' && (
                <Button onClick={() => navigate('/blood-donation')} size="sm" className="gap-1.5 bg-destructive hover:bg-destructive/90 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
                  <Droplets className="h-3.5 w-3.5" />
                  Donner mon sang
                </Button>
              )}
              {resolvedType === 'medical_equipment' && (
                <Button onClick={handleCall} size="sm" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
                  <FileText className="h-3.5 w-3.5" />
                  Demander un devis
                </Button>
              )}

              {/* Secondary actions row */}
              <div className="flex gap-1.5">
                <Button 
                  variant={isFavorite ? "default" : "outline"} 
                  size="icon"
                  className="h-8 w-8 transition-all duration-200 hover:scale-110 active:scale-90"
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 transition-all duration-200 hover:scale-110 active:scale-90">
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('provider.shareProfile')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-center p-4 bg-muted rounded-lg">
                        <QRCodeSVG value={shareUrl} size={160} level="M" includeMargin />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={shareUrl} readOnly className="flex-1 px-3 py-2 border rounded-lg text-sm bg-muted truncate" />
                        <Button size="sm" onClick={handleCopyLink}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      {typeof navigator !== 'undefined' && navigator.share && (
                        <Button className="w-full gap-2" onClick={handleNativeShare}>
                          <Share2 className="h-4 w-4" />
                          {t('provider.shareProfile')}
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <ReportProviderDialog
                  providerId={provider.id}
                  reporterId={user?.uid || 'anonymous'}
                  tooltipLabel={t('provider.reportProfile')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Left column - 2/3 width */}
          <div className="space-y-6 lg:col-span-2">
            {/* About Card */}
            <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
              <CardHeader className="py-4">
                <CardTitle className="flex items-center gap-2">
                  <Award className={`h-5 w-5 ${typeConfig.color}`} />
                  {t('provider.about')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {provider.description || t('provider.noAnnouncements')}
                </p>

                {/* Specialties */}
                {['doctor', 'clinic', 'hospital', 'birth_hospital'].includes(resolvedType) && (provider.specialties?.length || provider.specialty) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    {['doctor', 'clinic', 'hospital'].includes(resolvedType) && (
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      )}
                    {['doctor', 'clinic', 'hospital'].includes(resolvedType)
                        ? 'Spécialités Médicales'
                        : t('provider.specialties')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.specialty && (
                        ['doctor', 'clinic', 'hospital', 'birth_hospital'].includes(resolvedType) ? (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 gap-1">
                            <Stethoscope className="h-3 w-3" />
                            {provider.specialty}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{provider.specialty}</Badge>
                        )
                      )}
                      {provider.specialties?.map(spec => (
                        ['doctor', 'clinic', 'hospital', 'birth_hospital'].includes(resolvedType) ? (
                          <Badge key={spec} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 gap-1">
                            <Stethoscope className="h-3 w-3" />
                            {spec}
                          </Badge>
                        ) : (
                          <Badge key={spec} variant="outline">{spec}</Badge>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Maternity: Visiting Hours in About */}
                {resolvedType === 'birth_hospital' && provider.visitingHoursPolicy && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800">
                      <Clock className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="text-sm font-medium text-pink-700 dark:text-pink-400">Horaires de visite</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{provider.visitingHoursPolicy}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.gradient}`}>
                      <MapPin className={`h-4 w-4 ${typeConfig.color}`} />
                    </div>
                    <span className="text-muted-foreground">{provider.area || provider.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.gradient}`}>
                      <Languages className={`h-4 w-4 ${typeConfig.color}`} />
                    </div>
                    <span className="text-muted-foreground">
                      {t('provider.languages')}: {provider.languages?.join(", ") || "FR, AR"}
                    </span>
                  </div>
                  {provider.insurances?.length > 0 && (
                    <div className="flex items-center gap-3 text-sm sm:col-span-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.gradient}`}>
                        <Shield className={`h-4 w-4 ${typeConfig.color}`} />
                      </div>
                      <span className="text-muted-foreground">
                        {t('provider.insuranceAccepted')}: {provider.insurances.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clinic: Surgeries Offered */}
            {resolvedType === 'clinic' && provider.surgeriesOffered?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '120ms' }}>
                <div className="h-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-emerald-600" />
                    Chirurgies proposées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.surgeriesOffered.map((surgery: string) => (
                      <Badge key={surgery} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                        {surgery}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinic: Doctor Roster (Enhanced) */}
            {resolvedType === 'clinic' && provider.doctorRoster?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '130ms' }}>
                <div className="h-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Médecins affiliés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provider.doctorRoster.map((doc: { name: string; specialty: string; consultationDays?: string; phone?: string }, idx: number) => (
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
                                <a href={`tel:${doc.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                                  <Phone className="h-3 w-3" /> {doc.phone}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinic: Payment Methods */}
            {resolvedType === 'clinic' && provider.paymentMethods?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '140ms' }}>
                <div className="h-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Moyens de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.paymentMethods.map((method: string) => (
                      <Badge key={method} variant="secondary" className="gap-1 text-xs py-1.5">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinic: Insurance Accepted */}
            {resolvedType === 'clinic' && provider.insurances?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div className="h-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Assurances acceptées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.insurances.map((ins: string) => (
                      <Badge key={ins} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinic: Consultation Fee */}
            {resolvedType === 'clinic' && provider.consultationFee && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div className="h-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Tarif de consultation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-foreground">{provider.consultationFee}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tarif indicatif — peut varier selon la spécialité</p>
                </CardContent>
              </Card>
            )}

            {/* ========== MATERNITY-SPECIFIC PROFILE CARDS ========== */}

            {/* Maternity: Services Card */}
            {resolvedType === 'birth_hospital' && provider.maternityServices?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '120ms' }}>
                <div className="h-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5 text-pink-600" />
                    Services de maternité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.maternityServices.map((service: string) => (
                      <Badge key={service} variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Maternity: Infrastructure Card */}
            {resolvedType === 'birth_hospital' && (provider.deliveryRooms || provider.hasNICU || provider.numberOfBeds) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '130ms' }}>
                <div className="h-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-pink-600" />
                    Infrastructure maternité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {provider.deliveryRooms && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800">
                        <Baby className="h-5 w-5 text-pink-600 mb-1" />
                        <span className="text-lg font-bold text-pink-700 dark:text-pink-400">{provider.deliveryRooms}</span>
                        <span className="text-xs text-muted-foreground text-center">Salles d'accouchement</span>
                      </div>
                    )}
                    {provider.numberOfBeds && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 border">
                        <BedDouble className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-lg font-bold">{provider.numberOfBeds}</span>
                        <span className="text-xs text-muted-foreground text-center">Lits</span>
                      </div>
                    )}
                    {provider.hasNICU && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                        <HeartPulse className="h-5 w-5 text-red-600 mb-1" />
                        <span className="text-sm font-bold text-red-700 dark:text-red-400">NICU</span>
                        <span className="text-xs text-muted-foreground text-center">Réanimation néonatale</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Maternity: Personnel Card */}
            {resolvedType === 'birth_hospital' && (provider.femaleStaffOnly || provider.pediatricianOnSite) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '140ms' }}>
                <div className="h-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-600" />
                    Personnel spécialisé
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.femaleStaffOnly && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800">
                      <span className="text-lg">👩‍⚕️</span>
                      <div>
                        <p className="text-sm font-medium text-pink-700 dark:text-pink-400">Personnel féminin uniquement</p>
                        <p className="text-xs text-muted-foreground">Option personnel exclusivement féminin disponible</p>
                      </div>
                    </div>
                  )}
                  {provider.pediatricianOnSite && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                      <span className="text-lg">👶</span>
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Pédiatre sur place</p>
                        <p className="text-xs text-muted-foreground">Pédiatre disponible en permanence</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Maternity: Visiting Hours Card */}
            {resolvedType === 'birth_hospital' && provider.visitingHoursPolicy && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div className="h-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-pink-600" />
                    Politique de visites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{provider.visitingHoursPolicy}</p>
                </CardContent>
              </Card>
            )}

            {/* Maternity: Insurance Card */}
            {resolvedType === 'birth_hospital' && provider.insurances?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div className="h-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-pink-600" />
                    Assurances acceptées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.insurances.map((ins: string) => (
                      <Badge key={ins} variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800">
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}



            {/* Doctor: Education Card */}
            {resolvedType === 'doctor' && (provider.medicalSchool || provider.yearsOfExperience) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '120ms' }}>
                <div className="h-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Formation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.medicalSchool && (
                    <p className="text-sm">
                      🎓 {provider.medicalSchool}
                      {provider.graduationYear && <span className="text-muted-foreground"> — Promotion {provider.graduationYear}</span>}
                    </p>
                  )}
                  {provider.yearsOfExperience && (
                    <p className="text-sm text-muted-foreground">
                      {provider.yearsOfExperience} ans d'expérience
                    </p>
                  )}
                  {provider.trainedAbroad && (
                    <Badge className="gap-1.5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                      🌍 Formé en {provider.trainingCountry || 'étranger'}
                    </Badge>
                  )}
                  {provider.ordreMedecinsNumber && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">N° Ordre: {provider.ordreMedecinsNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Doctor: Secondary Specialty */}
            {resolvedType === 'doctor' && provider.secondarySpecialty && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '130ms' }}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Spécialité secondaire:</span>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                      {provider.secondarySpecialty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Doctor: Patient Types */}
            {resolvedType === 'doctor' && provider.patientTypes?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '140ms' }}>
                <div className="h-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Patients acceptés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.patientTypes.map((pt: string) => (
                      <Badge key={pt} variant="secondary" className="text-xs py-1.5">{pt}</Badge>
                    ))}
                    {provider.womenOnlyPractice && (
                      <Badge className="text-xs gap-1 bg-pink-500 text-white border-pink-400">
                        👩‍⚕️ Cabinet féminin
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Doctor: Consultation Fee */}
            {resolvedType === 'doctor' && provider.consultationFee && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div className="h-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Tarif de consultation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-foreground">{provider.consultationFee}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tarif indicatif — peut varier selon le type de consultation</p>
                </CardContent>
              </Card>
            )}

            {/* Doctor: Insurance Accepted */}
            {resolvedType === 'doctor' && provider.insurances?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div className="h-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Assurances acceptées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.insurances.map((ins: string) => (
                      <Badge key={ins} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resolvedType === 'hospital' && provider.waitTimeMinutes != null && provider.waitTimeUpdatedAt && (
              (() => {
                const updatedAt = new Date(provider.waitTimeUpdatedAt);
                const hoursAgo = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
                if (hoursAgo > 4) return null;
                const minutesAgo = Math.round((Date.now() - updatedAt.getTime()) / (1000 * 60));
                return (
                  <Card className="glass-card overflow-hidden animate-fade-in border-primary/20" style={{ animationDelay: '120ms' }}>
                    <div className="h-1 bg-gradient-to-r from-primary/40 to-primary/10" />
                    <CardContent className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Temps d'attente estimé</p>
                          <p className="text-2xl font-bold text-primary">~{provider.waitTimeMinutes} min</p>
                          <p className="text-xs text-muted-foreground">
                            Mis à jour il y a {minutesAgo < 60 ? `${minutesAgo} min` : `${Math.round(minutesAgo / 60)}h`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()
            )}

            {/* Hospital: Department Hours */}
            {resolvedType === 'hospital' && provider.departmentSchedules && Object.keys(provider.departmentSchedules).length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '140ms' }}>
                <div className="h-1 bg-gradient-to-r from-red-500/20 to-rose-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    Horaires par département
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(provider.departmentSchedules).map(([dept, hours]) => (
                      <div key={dept} className="flex justify-between items-center text-sm py-1.5 px-3 rounded-lg bg-muted/30">
                        <span className="font-medium">{dept}</span>
                        <span className="text-muted-foreground">
                          {hours.open === '00:00' && hours.close === '23:59' ? '24/7' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plateau Technique — diagnosis providers only */}
            {['lab', 'radiology_center'].includes(resolvedType) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    {resolvedType === 'lab' ? (
                      <FlaskConical className={`h-5 w-5 ${typeConfig.color}`} />
                    ) : (
                      <RadioTower className={`h-5 w-5 ${typeConfig.color}`} />
                    )}
                    Plateau Technique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Imaging types for radiology */}
                  {resolvedType === 'radiology_center' && provider.imagingTypes?.length && provider.imagingTypes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Équipements d'imagerie</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {provider.imagingTypes!.map((type: string) => {
                          const iconMap: Record<string, typeof RadioTower> = {
                            'IRM': RadioTower, 'Scanner': RadioTower, 'Échographie': RadioTower,
                            'Radiographie': RadioTower, 'Mammographie': RadioTower, 'Panoramique dentaire': RadioTower,
                          };
                          const Icon = iconMap[type] || RadioTower;
                          return (
                            <div key={type} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                                <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span className="text-xs font-medium">{type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Analysis types for labs */}
                  {resolvedType === 'lab' && provider.analysisTypes?.length && provider.analysisTypes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Types d'analyses</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {provider.analysisTypes!.map((type: string) => {
                          const iconMap: Record<string, typeof FlaskConical> = {
                            'Sérologie': FlaskConical, 'Hématologie': Droplets, 'Biochimie': FlaskConical,
                            'Microbiologie': FlaskConical, 'Parasitologie': FlaskConical, 'Immunologie': FlaskConical,
                            'Hormonologie': FlaskConical, 'Toxicologie': FlaskConical, 'Anatomie pathologique': FlaskConical,
                          };
                          const Icon = iconMap[type] || FlaskConical;
                          return (
                            <div key={type} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                                <Icon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <span className="text-xs font-medium">{type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* General equipment */}
                  {provider.equipment?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Équipements</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {provider.equipment.map((eq: string) => (
                          <Badge key={eq} variant="secondary" className="text-xs">{eq}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ========== LAB-SPECIFIC PROFILE SECTIONS ========== */}

            {/* Lab: Fasting Info Banner */}
            {resolvedType === 'lab' && provider.labFastingInfoNote && (
              <Card className="glass-card overflow-hidden animate-fade-in border-amber-200 dark:border-amber-800" style={{ animationDelay: '155ms' }}>
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400" />
                <CardContent className="py-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">⚠️ Informations importantes — Jeûne</p>
                      <p className="text-sm text-muted-foreground mt-1">{provider.labFastingInfoNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lab: Test Catalog */}
            {resolvedType === 'lab' && provider.labTestCatalog?.length > 0 && (() => {
              const catalog = provider.labTestCatalog as Array<{
                id: string; name: string; category: string;
                priceMin: number | null; priceMax: number | null;
                turnaround: string; prescriptionRequired: boolean;
                fastingRequired: boolean; cnasCovered: boolean;
              }>;
              const turnaroundLabels: Record<string, string> = {
                same_day: 'Même jour', '24h': '24h', '48h': '48h', '1_week': '1 semaine'
              };
              // Group by category
              const grouped = catalog.reduce((acc, t) => {
                (acc[t.category] = acc[t.category] || []).push(t);
                return acc;
              }, {} as Record<string, typeof catalog>);

              return (
                <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '160ms' }}>
                  <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                  <CardHeader className="py-4">
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className={`h-5 w-5 ${typeConfig.color}`} />
                      Catalogue d'analyses ({catalog.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(grouped).map(([category, tests]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-400">{category}</h4>
                        <div className="space-y-2">
                          {tests.map(test => (
                            <div key={test.id} className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg border bg-muted/30 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-medium">{test.name}</span>
                                {test.fastingRequired && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-700 dark:text-amber-400">
                                    À jeun
                                  </Badge>
                                )}
                                {test.prescriptionRequired && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    Ordonnance
                                  </Badge>
                                )}
                                {test.cnasCovered && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-300 text-green-700 dark:text-green-400">
                                    CNAS
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {(test.priceMin || test.priceMax) && (
                                  <span className="font-medium text-foreground">
                                    {test.priceMin && test.priceMax
                                      ? `${test.priceMin} – ${test.priceMax} DA`
                                      : test.priceMin ? `${test.priceMin} DA` : `${test.priceMax} DA`
                                    }
                                  </span>
                                )}
                                <span>{turnaroundLabels[test.turnaround] || test.turnaround}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Lab: Result Delivery Methods */}
            {resolvedType === 'lab' && provider.labResultDeliveryMethods?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '165ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className={`h-5 w-5 ${typeConfig.color}`} />
                    Remise des résultats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(provider.labResultDeliveryMethods as string[]).map((method: string) => (
                      <Badge key={method} variant="secondary" className="gap-1 text-xs py-1.5">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lab: Home Collection Details */}
            {resolvedType === 'lab' && provider.homeCollection && (provider.homeCollectionZone || provider.homeCollectionFee) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '170ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className={`h-5 w-5 ${typeConfig.color}`} />
                    Prélèvement à domicile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.homeCollectionZone && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-xs text-muted-foreground mb-0.5">Zone couverte</p>
                        <p>{provider.homeCollectionZone}</p>
                      </div>
                    </div>
                  )}
                  {provider.homeCollectionFee && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-xs text-muted-foreground mb-0.5">Frais de déplacement</p>
                        <p>{provider.homeCollectionFee}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lab: Accreditations */}
            {resolvedType === 'lab' && provider.labAccreditations?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '175ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className={`h-5 w-5 ${typeConfig.color}`} />
                    Accréditations & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(provider.labAccreditations as string[]).map((accr: string) => (
                      <Badge key={accr} className="gap-1.5 text-xs py-1.5 bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700">
                        <ShieldCheck className="h-3 w-3" />
                        {accr}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lab: Insurance */}
            {resolvedType === 'lab' && provider.insurances?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '180ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className={`h-5 w-5 ${typeConfig.color}`} />
                    Assurances acceptées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.insurances.map((ins: string) => (
                      <Badge key={ins} variant="secondary" className="gap-1 text-xs py-1.5">
                        <Shield className="h-3 w-3" />
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ========== RADIOLOGY-SPECIFIC PROFILE SECTIONS ========== */}

            {/* Radiology: Exam Catalog */}
            {resolvedType === 'radiology_center' && provider.radiologyExamCatalog?.length > 0 && (() => {
              const catalog = provider.radiologyExamCatalog as Array<{
                id: string; name: string; imagingType: string;
                priceMin: number | null; priceMax: number | null;
                turnaround: string; prescriptionRequired: boolean;
                preparationInstructions: string; cnasCovered: boolean;
              }>;
              const turnaroundLabels: Record<string, string> = {
                same_day: 'Même jour', '24h': '24h', '48h': '48h', '1_week': '1 semaine'
              };
              // Group by imaging type
              const grouped = catalog.reduce((acc, e) => {
                (acc[e.imagingType] = acc[e.imagingType] || []).push(e);
                return acc;
              }, {} as Record<string, typeof catalog>);

              return (
                <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '160ms' }}>
                  <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                  <CardHeader className="py-4">
                    <CardTitle className="flex items-center gap-2">
                      <RadioTower className={`h-5 w-5 ${typeConfig.color}`} />
                      Catalogue d'examens ({catalog.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(grouped).map(([imagingType, exams]) => (
                      <div key={imagingType}>
                        <h4 className="text-sm font-semibold mb-2 text-indigo-700 dark:text-indigo-400">{imagingType}</h4>
                        <div className="space-y-2">
                          {exams.map(exam => (
                            <div key={exam.id} className="py-2 px-3 rounded-lg border bg-muted/30 text-sm space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-medium">{exam.name}</span>
                                  {exam.prescriptionRequired && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      Ordonnance
                                    </Badge>
                                  )}
                                  {exam.cnasCovered && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-300 text-green-700 dark:text-green-400">
                                      CNAS
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {(exam.priceMin || exam.priceMax) && (
                                    <span className="font-medium text-foreground">
                                      {exam.priceMin && exam.priceMax
                                        ? `${exam.priceMin} – ${exam.priceMax} DA`
                                        : exam.priceMin ? `${exam.priceMin} DA` : `${exam.priceMax} DA`
                                      }
                                    </span>
                                  )}
                                  <span>{turnaroundLabels[exam.turnaround] || exam.turnaround}</span>
                                </div>
                              </div>
                              {exam.preparationInstructions && (
                                <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1.5">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                  <span>{exam.preparationInstructions}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Radiology: Result Delivery Methods */}
            {resolvedType === 'radiology_center' && provider.radiologyResultDeliveryMethods?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '165ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className={`h-5 w-5 ${typeConfig.color}`} />
                    Remise des résultats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(provider.radiologyResultDeliveryMethods as string[]).map((method: string) => (
                      <Badge key={method} variant="secondary" className="gap-1 text-xs py-1.5">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Radiology: Accreditations */}
            {resolvedType === 'radiology_center' && provider.radiologyAccreditations?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '175ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className={`h-5 w-5 ${typeConfig.color}`} />
                    Accréditations & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(provider.radiologyAccreditations as string[]).map((accr: string) => (
                      <Badge key={accr} className="gap-1.5 text-xs py-1.5 bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700">
                        <ShieldCheck className="h-3 w-3" />
                        {accr}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Radiology: Insurance */}
            {resolvedType === 'radiology_center' && provider.insurances?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '180ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className={`h-5 w-5 ${typeConfig.color}`} />
                    Assurances acceptées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.insurances.map((ins: string) => (
                      <Badge key={ins} variant="secondary" className="gap-1 text-xs py-1.5">
                        <Shield className="h-3 w-3" />
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pharmacy Services Card - Enhanced with icons */}
            {resolvedType === 'pharmacy' && provider.pharmacyServices?.length && provider.pharmacyServices.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div className="h-1 bg-gradient-to-r from-green-500/20 to-lime-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className={`h-5 w-5 ${typeConfig.color}`} />
                    Services en Pharmacie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {provider.pharmacyServices!.map((service: string) => {
                      const serviceIconMap: Record<string, typeof Pill> = {
                        'Prise de tension': HeartPulse,
                        'Orthopédie': Wrench,
                        'Préparation magistrale': FlaskConical,
                        'Vaccination': Shield,
                        'Conseil nutritionnel': Stethoscope,
                        'Aromathérapie': FlaskConical,
                        'Dermocosmétique': Sparkles,
                        'Matériel médical': Wrench,
                        'Homéopathie': Droplets,
                        'Phytothérapie': FlaskConical,
                      };
                      const ServiceIcon = serviceIconMap[service] || Pill;
                      return (
                        <div key={service} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                            <ServiceIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-xs font-medium">{service}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Carte Chifa Badge Card */}
            {resolvedType === 'pharmacy' && provider.insurances?.includes('Carte Chifa') && (
              <Card className="glass-card overflow-hidden animate-fade-in border-green-200 dark:border-green-800" style={{ animationDelay: '155ms' }}>
                <div className="h-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20" />
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-green-700 dark:text-green-400">Carte Chifa Acceptée ✓</p>
                      <p className="text-xs text-muted-foreground">Convention CNAS — Tiers payant disponible</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pharmacy Insurance Card */}
            {resolvedType === 'pharmacy' && provider.insurances?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div className="h-1 bg-gradient-to-r from-green-500/20 to-lime-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className={`h-5 w-5 ${typeConfig.color}`} />
                    Assurances acceptées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.insurances.map((ins: string) => (
                      <Badge key={ins} variant="secondary" className="gap-1 text-xs py-1.5">
                        <Shield className="h-3 w-3" />
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pharmacy — Garde Schedule Calendar */}
            {resolvedType === 'pharmacy' && provider.pharmacyGardeSchedule?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in border-emerald-200 dark:border-emerald-800" style={{ animationDelay: '162ms' }}>
                <div className="h-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Calendar className="h-5 w-5" />
                    Planning de garde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...provider.pharmacyGardeSchedule]
                      .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .map((slot: any) => (
                        <div key={slot.id} className="flex items-start gap-3 p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10">
                          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {new Date(slot.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                              {slot.endDate && slot.endDate !== slot.startDate && (
                                <> — {new Date(slot.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                              )}
                            </p>
                            {slot.note && <p className="text-xs text-muted-foreground mt-0.5">{slot.note}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pharmacy — Duty Phone & Night Bell */}
            {resolvedType === 'pharmacy' && (provider.pharmacyDutyPhone || provider.pharmacyNightBell) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '164ms' }}>
                <CardContent className="py-4 space-y-3">
                  {provider.pharmacyDutyPhone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                      <Phone className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium">Téléphone de garde</p>
                        <a href={`tel:${provider.pharmacyDutyPhone}`} className="text-sm text-primary hover:underline font-mono">
                          {provider.pharmacyDutyPhone}
                        </a>
                      </div>
                    </div>
                  )}
                  {provider.pharmacyNightBell && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium">Sonnette de nuit disponible 🔔</p>
                        <p className="text-xs text-muted-foreground">Service d'urgence nocturne via sonnette</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pharmacy — Home Delivery Info */}
            {resolvedType === 'pharmacy' && provider.pharmacyDeliveryAvailable && (
              <Card className="glass-card overflow-hidden animate-fade-in border-blue-200 dark:border-blue-800" style={{ animationDelay: '166ms' }}>
                <div className="h-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Livraison à domicile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provider.pharmacyDeliveryZone && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span><strong>Zone :</strong> {provider.pharmacyDeliveryZone}</span>
                      </div>
                    )}
                    {provider.pharmacyDeliveryFee && (
                      <div className="flex items-center gap-2 text-sm">
                        <Pill className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span><strong>Frais :</strong> {provider.pharmacyDeliveryFee}</span>
                      </div>
                    )}
                    {provider.pharmacyDeliveryHours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span><strong>Horaires :</strong> {provider.pharmacyDeliveryHours}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pharmacy — Stock Info */}
            {resolvedType === 'pharmacy' && provider.pharmacyStockInfo && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '168ms' }}>
                <div className="h-1 bg-gradient-to-r from-green-500/20 to-lime-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Stock & Disponibilité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{provider.pharmacyStockInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* Blood Bank — Urgent Need Alert Banner */}
            {resolvedType === 'blood_cabin' && provider.urgentNeed && provider.urgentBloodType && (
              <Card className="glass-card overflow-hidden animate-fade-in border-red-300 dark:border-red-700" style={{ animationDelay: '120ms' }}>
                <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/40">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-red-700 dark:text-red-400">
                        🚨 Besoin urgent de sang {provider.urgentBloodType} !
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400/80">
                        Ce centre a un besoin urgent de donneurs. Prenez rendez-vous dès maintenant.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blood Bank — Stock Levels Dashboard */}
            {resolvedType === 'blood_cabin' && provider.bloodStockLevels && Object.keys(provider.bloodStockLevels).length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div className="h-1 bg-gradient-to-r from-red-500/20 to-orange-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className={`h-5 w-5 ${typeConfig.color}`} />
                    Niveaux de Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(provider.bloodStockLevels as Record<string, string>).map(([bloodType, level]) => (
                      <div key={bloodType} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-muted/30">
                        <span className="font-bold text-lg text-red-600 dark:text-red-400">{bloodType}</span>
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          level === 'critical' ? "bg-red-500 animate-pulse" : level === 'low' ? "bg-orange-500" : "bg-emerald-500"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          level === 'critical' ? "text-red-600 dark:text-red-400" : level === 'low' ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {level === 'critical' ? 'Critique' : level === 'low' ? 'Faible' : 'Normal'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blood Cabin — Walk-In Badge */}
            {resolvedType === 'blood_cabin' && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '155ms' }}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {provider.bloodCabinWalkInAllowed !== false ? 'Don sans rendez-vous accepté' : 'Sur rendez-vous uniquement'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {provider.bloodCabinWalkInAllowed !== false 
                          ? 'Vous pouvez venir donner votre sang sans rendez-vous' 
                          : 'Veuillez prendre rendez-vous avant de venir'}
                      </p>
                    </div>
                    <Badge className={provider.bloodCabinWalkInAllowed !== false 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-muted text-muted-foreground"
                    }>
                      {provider.bloodCabinWalkInAllowed !== false ? '✓ Walk-in' : 'RDV requis'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blood Cabin — Preparation Guidelines */}
            {resolvedType === 'blood_cabin' && provider.donationPreparationGuidelines && (
              <Card className="glass-card overflow-hidden animate-fade-in border-amber-200 dark:border-amber-800" style={{ animationDelay: '160ms' }}>
                <div className="h-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <ClipboardList className="h-5 w-5" />
                    Consignes de préparation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-line">
                      {provider.donationPreparationGuidelines}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blood Cabin — Donation Campaign Calendar */}
            {resolvedType === 'blood_cabin' && provider.donationCampaigns?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '165ms' }}>
                <div className="h-1 bg-gradient-to-r from-red-500/20 to-orange-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    Campagnes de don à venir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...provider.donationCampaigns]
                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((campaign: any) => (
                        <div key={campaign.id} className="p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{campaign.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(campaign.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{campaign.location}</span>
                              </div>
                            </div>
                          </div>
                          {campaign.description && (
                            <p className="text-xs text-muted-foreground mt-2 border-t pt-2">{campaign.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blood Cabin — Mobile Donation Units */}
            {resolvedType === 'blood_cabin' && provider.mobileDonationUnits?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '170ms' }}>
                <div className="h-1 bg-gradient-to-r from-red-500/20 to-orange-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-red-600" />
                    Unités mobiles de collecte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {provider.mobileDonationUnits.map((unit: any) => (
                      <div key={unit.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 shrink-0">
                          <Truck className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{unit.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">📍 {unit.area}</p>
                          <p className="text-xs text-muted-foreground">🕐 {unit.schedule}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blood Cabin — Donation Counter & Min Wait */}
            {resolvedType === 'blood_cabin' && (provider.totalDonationsReceived || provider.minDaysBetweenDonations) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '175ms' }}>
                <CardContent className="py-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {provider.totalDonationsReceived && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        <div>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{provider.totalDonationsReceived.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">dons reçus au total</p>
                        </div>
                      </div>
                    )}
                    {provider.minDaysBetweenDonations && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                        <Clock className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-2xl font-bold text-primary">{provider.minDaysBetweenDonations}j</p>
                          <p className="text-xs text-muted-foreground">délai minimum entre dons</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Equipment Catalog Card - Enhanced e-commerce style */}
            {resolvedType === 'medical_equipment' && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '155ms' }}>
                <div className="h-1 bg-gradient-to-r from-slate-500/20 to-gray-500/20" />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className={`h-5 w-5 ${typeConfig.color}`} />
                    Catalogue d'Équipements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Business type + service badges */}
                  <div className="flex flex-wrap gap-2">
                    {provider.equipmentBusinessTypes?.map((bt: string) => (
                      <Badge key={bt} variant="outline" className="gap-1 text-xs py-1.5">
                        {bt === 'sale' ? <ShoppingBag className="h-3 w-3" /> : bt === 'rental' ? <RefreshCw className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                        {bt === 'sale' ? 'Vente' : bt === 'rental' ? 'Location' : 'Réparation'}
                      </Badge>
                    ))}
                    {provider.installationAvailable && (
                      <Badge className="gap-1.5 text-xs py-1.5 bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700">
                        <Truck className="h-3 w-3" />
                        Livraison & Installation
                      </Badge>
                    )}
                    {provider.maintenanceServiceAvailable && (
                      <Badge className="gap-1.5 text-xs py-1.5 bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
                        <Wrench className="h-3 w-3" />
                        Maintenance / SAV
                      </Badge>
                    )}
                    {provider.technicalSupportAvailable && (
                      <Badge className="gap-1.5 text-xs py-1.5 bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700">
                        <Phone className="h-3 w-3" />
                        Support technique
                      </Badge>
                    )}
                  </div>

                  {/* Brands */}
                  {provider.equipmentBrands?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Marques distribuées</p>
                      <div className="flex flex-wrap gap-1.5">
                        {provider.equipmentBrands.map((brand: string) => (
                          <Badge key={brand} variant="secondary" className="text-xs">{brand}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product catalog items */}
                  {provider.equipmentCatalog?.length > 0 ? (
                    <div className="space-y-3">
                      {provider.equipmentCatalog.map((product: any) => (
                        <div key={product.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-sm">{product.name}</span>
                              {product.brand && <span className="text-xs text-muted-foreground ml-2">— {product.brand}</span>}
                            </div>
                            <div className="flex gap-1">
                              {product.cnasReimbursable && (
                                <Badge className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">CNAS</Badge>
                              )}
                              {product.prescriptionRequired && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">📋 Ordonnance</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="text-xs">{product.category}</Badge>
                            {(product.availableFor === 'sale' || product.availableFor === 'both') && product.salePrice && (
                              <span className="font-semibold text-primary">{product.salePrice.toLocaleString()} DA</span>
                            )}
                            {(product.availableFor === 'rental' || product.availableFor === 'both') && product.rentalPricePerDay && (
                              <span className="text-amber-600 dark:text-amber-400">{product.rentalPricePerDay.toLocaleString()} DA/jour</span>
                            )}
                            {product.stockStatus && (
                              <Badge className={`text-[10px] px-1.5 py-0.5 ${
                                product.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                product.stockStatus === 'low_stock' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                product.stockStatus === 'out_of_stock' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {product.stockStatus === 'in_stock' ? 'En stock' : product.stockStatus === 'low_stock' ? 'Stock faible' : product.stockStatus === 'out_of_stock' ? 'Rupture' : 'En commande'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : provider.productCategories?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {provider.productCategories.map((cat: string) => (
                        <div key={cat} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer group">
                          <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                            <Package className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-center">{cat}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Delivery zone & fee */}
                  {(provider.equipmentDeliveryZone || provider.equipmentDeliveryFee) && (
                    <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Truck className="h-4 w-4 text-primary" />
                        Livraison
                      </div>
                      {provider.equipmentDeliveryZone && (
                        <p className="text-xs text-muted-foreground">Zone : {provider.equipmentDeliveryZone}</p>
                      )}
                      {provider.equipmentDeliveryFee && (
                        <p className="text-xs text-muted-foreground">Frais : {provider.equipmentDeliveryFee}</p>
                      )}
                    </div>
                  )}

                  {/* Technical support phone */}
                  {provider.technicalSupportAvailable && provider.technicalSupportPhone && (
                    <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-3">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Support technique</p>
                        <a href={`tel:${provider.technicalSupportPhone}`} className="text-xs text-blue-600 hover:underline">{provider.technicalSupportPhone}</a>
                      </div>
                    </div>
                  )}

                  {/* Catalog PDF */}
                  {provider.catalogPdfUrl && (
                    <a href={provider.catalogPdfUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg border bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-medium text-primary">
                      <FileText className="h-4 w-4" />
                      Télécharger le catalogue PDF
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Gallery Card */}
            {gallery.length > 0 && (
            <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
              <CardHeader className="py-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className={`h-5 w-5 ${typeConfig.color}`} />
                    {t('provider.gallery')}
                  </span>
                  <Badge variant="secondary">{gallery.length} photos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.slice(0, 6).map((img, i) => (
                    <Dialog key={i}>
                      <DialogTrigger asChild>
                        <div className="aspect-video rounded-xl overflow-hidden cursor-pointer group relative">
                          <img 
                            src={img} 
                            alt={`${provider.name} - Photo ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-0 overflow-hidden">
                        <img 
                          src={img.replace('w=600', 'w=1200')} 
                          alt={`${provider.name} - Photo ${i + 1}`}
                          className="w-full h-auto"
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Reviews */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <ReviewSystem 
                providerId={provider.id}
                providerName={provider.name}
                canReview={!!user && profile?.userType === 'citizen'}
                reviews={reviewsData}
                stats={reviewStats}
                isLoading={reviewsLoading}
                submitReview={submitReviewMutation}
                currentUserId={user?.uid}
                currentUserName={profile?.full_name || user?.displayName || undefined}
              />
            </div>
          </div>

          {/* Right column - 1/3 width */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
              <CardHeader className="py-4">
                <CardTitle className="flex items-center gap-2">
                  <Phone className={`h-5 w-5 ${typeConfig.color}`} />
                  {t('provider.contact')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{provider.address}</p>
                    {/* Landmark for hospitals, maternity, clinic & doctor */}
                    {['hospital', 'birth_hospital', 'clinic', 'doctor'].includes(resolvedType) && provider.landmarkDescription && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        📍 Repère: {provider.landmarkDescription}
                      </p>
                    )}
                    {/* Doctor: Home visit zone */}
                    {resolvedType === 'doctor' && provider.homeVisitAvailable && provider.homeVisitZone && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <HomeIcon className="h-3.5 w-3.5 text-primary mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Visites à domicile:</span> {provider.homeVisitZone}
                        </p>
                      </div>
                    )}
                    {/* Doctor: Teleconsultation platform */}
                    {resolvedType === 'doctor' && provider.teleconsultationPlatform && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-primary" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Téléconsultation:</span> {provider.teleconsultationPlatform}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hospital/Maternity: Multiple Phone Numbers */}
                {resolvedType === 'hospital' && (provider.receptionPhone || provider.ambulancePhone || provider.adminPhone) ? (
                  <div className="space-y-2">
                    {provider.receptionPhone && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border">
                        <a href={`tel:${provider.receptionPhone}`} className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Réception:</span>
                          <span className="font-medium">{provider.receptionPhone}</span>
                        </a>
                      </div>
                    )}
                    {provider.ambulancePhone && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                        <a href={`tel:${provider.ambulancePhone}`} className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-destructive" />
                          <span className="text-xs text-destructive font-semibold">Urgences:</span>
                          <span className="font-bold text-destructive">{provider.ambulancePhone}</span>
                        </a>
                        <Button size="sm" variant="destructive" onClick={() => window.location.href = `tel:${provider.ambulancePhone}`} className="gap-1 h-7 text-xs">
                          <Phone className="h-3 w-3" />
                          Appeler
                        </Button>
                      </div>
                    )}
                    {provider.adminPhone && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border">
                        <a href={`tel:${provider.adminPhone}`} className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Administration:</span>
                          <span className="font-medium">{provider.adminPhone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : resolvedType === 'birth_hospital' && provider.maternityEmergencyPhone ? (
                  <div className="space-y-2">
                    {/* Main phone */}
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border">
                      <a href={`tel:${provider.phone}`} className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Standard:</span>
                        <span className="font-medium">{provider.phone}</span>
                      </a>
                    </div>
                    {/* Emergency maternity line */}
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                      <a href={`tel:${provider.maternityEmergencyPhone}`} className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-destructive" />
                        <span className="text-xs text-destructive font-semibold">Urgence maternité:</span>
                        <span className="font-bold text-destructive">{provider.maternityEmergencyPhone}</span>
                      </a>
                      <Button size="sm" variant="destructive" onClick={() => window.location.href = `tel:${provider.maternityEmergencyPhone}`} className="gap-1 h-7 text-xs">
                        <Phone className="h-3 w-3" />
                        Appeler
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Default: Single phone */
                  <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <a href={`tel:${provider.phone}`} className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      {provider.phone}
                    </a>
                    <Button size="sm" onClick={handleCall} className="gap-1">
                      <Phone className="h-3 w-3" />
                      {t('provider.callNow')}
                    </Button>
                  </div>
                )}

                {/* Open/Closed status */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  provider.isOpen 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${provider.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">
                    {provider.isOpen ? t('provider.openNow') : t('provider.closed')}
                  </span>
                </div>
                
                {/* Schedule */}
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('provider.hours')}</span>
                    {provider.is24_7 && (
                      <Badge variant="secondary" className="text-xs">{t('provider.is24_7')}</Badge>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {dayKeys.map((day, index) => {
                      const hours = schedule[day] as { open: string; close: string; closed?: boolean } | undefined;
                      if (!hours) return null;
                      const isClosed = hours.closed || (hours.open === '00:00' && hours.close === '00:00');
                      const is24h = hours.open === '00:00' && hours.close === '23:59';
                      const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
                      
                      return (
                        <div 
                          key={day} 
                          className={`flex justify-between text-xs py-1 px-2 rounded ${
                            isToday ? 'bg-primary/10 font-medium' : ''
                          }`}
                        >
                          <span className="text-muted-foreground">
                            {t(`days.${dayTranslationKeys[index]}` as any)}
                          </span>
                          <span className={isClosed ? 'text-destructive' : ''}>
                            {isClosed ? t('provider.closed') : is24h ? t('provider.is24_7') : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Appointment Widget for care providers, blood donation for blood_cabin, fallback for others */}
                {resolvedType === 'blood_cabin' ? (
                  <div className="space-y-3">
                    {provider.urgentNeed && provider.urgentBloodType && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse shrink-0" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          Besoin urgent de {provider.urgentBloodType} !
                        </span>
                      </div>
                    )}
                    <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={() => setBookingOpen(true)}>
                      <Droplets className="h-4 w-4" />
                      Donner son sang
                    </Button>
                  </div>
                ) : resolvedType === 'medical_equipment' ? (
                  <div className="space-y-3">
                    {/* Delivery & Installation badges */}
                    {provider.installationAvailable && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900">
                          <Truck className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Livraison disponible</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900">
                          <Wrench className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Installation à domicile</span>
                        </div>
                      </div>
                    )}
                    {/* Quote request form */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2">
                          <FileText className="h-4 w-4" />
                          Demander un devis
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Demander un devis</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const formData = new FormData(form);
                          const clientName = formData.get('client_name') as string;
                          const clientPhone = formData.get('client_phone') as string;
                          const equipment = formData.get('equipment') as string;
                          const details = formData.get('details') as string;
                          if (!clientName || !clientPhone || !equipment) {
                            toast.error("Veuillez remplir tous les champs obligatoires.");
                            return;
                          }
                          try {
                            const { error } = await supabase.from('quote_requests').insert({
                              provider_id: provider.id,
                              client_name: clientName,
                              client_phone: clientPhone,
                              equipment,
                              details: details || null,
                            });
                            if (error) throw error;
                            toast.success("Demande envoyée !", { description: "Le fournisseur vous contactera prochainement." });
                            form.reset();
                          } catch (err) {
                            console.error('Quote request error:', err);
                            toast.error("Erreur lors de l'envoi. Réessayez.");
                          }
                        }}>
                          <p className="text-sm text-muted-foreground">
                            Remplissez le formulaire et {provider.name} vous répondra dans les plus brefs délais.
                          </p>
                          <input name="client_name" type="text" placeholder="Votre nom complet *" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground" />
                          <input name="client_phone" type="tel" placeholder="Téléphone *" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground" />
                          <input name="equipment" type="text" placeholder="Équipement souhaité *" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground" />
                          <textarea name="details" placeholder="Détails de votre demande..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground" />
                          <Button type="submit" className="w-full gap-2">
                            <FileText className="h-4 w-4" />
                            Envoyer la demande
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="w-full gap-2" onClick={handleCall}>
                      <Phone className="h-4 w-4" />
                      Appeler le fournisseur
                    </Button>
                  </div>
                ) : ['doctor', 'clinic', 'hospital', 'birth_hospital'].includes(resolvedType) ? (
                  <AppointmentWidget
                    providerId={provider.id}
                    providerName={provider.name}
                    onBookSlot={(date, time) => setBookingOpen(true)}
                    onViewMore={() => setBookingOpen(true)}
                  />
                ) : ['lab', 'radiology_center'].includes(resolvedType) ? (
                  <div className="space-y-2">
                    {provider.homeCollection && (
                      <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setBookingOpen(true)}>
                        <HomeIcon className="h-4 w-4" />
                        Demander un prélèvement à domicile
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20">
                          <ClipboardList className="h-4 w-4" />
                          Télécharger mes résultats
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Accéder à vos résultats</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Entrez votre code patient pour accéder à vos résultats d'analyses.
                          </p>
                          <input
                            type="text"
                            placeholder="Code patient (ex: PAT-2026-001)"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                          />
                          <Button className="w-full gap-2" onClick={() => toast.success("Fonctionnalité bientôt disponible", { description: "Le téléchargement sécurisé des résultats sera activé prochainement." })}>
                            <SearchIcon className="h-4 w-4" />
                            Rechercher mes résultats
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : resolvedType === 'pharmacy' ? (
                  <div className="space-y-3">
                    {provider.isPharmacieDeGarde && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Pharmacie de Garde — Ouverte
                        </span>
                      </div>
                    )}
                    {provider.insurances?.includes('Carte Chifa') && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Carte Chifa Acceptée</span>
                      </div>
                    )}
                    <Button className="w-full gap-2" onClick={handleCall}>
                      <Phone className="h-4 w-4" />
                      Appeler la pharmacie
                    </Button>
                    <Button variant="outline" className="w-full gap-2" onClick={handleGetDirections}>
                      <Navigation className="h-4 w-4" />
                      Itinéraire
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full gap-2" onClick={() => setBookingOpen(true)}>
                    <Calendar className="h-4 w-4" />
                    {t('provider.viewAvailability')}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Languages Card - Universal */}
            {provider.languages?.length > 0 && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <Languages className={`h-5 w-5 ${typeConfig.color}`} />
                    Langues parlées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(provider.languages as string[]).map((lang: string) => {
                      const langLabels: Record<string, string> = {
                        fr: 'Français',
                        ar: 'العربية',
                        en: 'English',
                        amazigh: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
                      };
                      return (
                        <Badge key={lang} variant="secondary" className="gap-1 text-xs py-1.5">
                          {langLabels[lang] || lang}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links Card - Universal */}
            {(provider.socialLinks?.website || provider.socialLinks?.facebook || provider.socialLinks?.instagram || provider.socialLinks?.linkedin) && (
              <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '225ms' }}>
                <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className={`h-5 w-5 ${typeConfig.color}`} />
                    Liens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {provider.socialLinks?.website && (
                    <a href={provider.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      Site web
                    </a>
                  )}
                  {provider.socialLinks?.facebook && (
                    <a href={provider.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      Facebook
                    </a>
                  )}
                  {provider.socialLinks?.instagram && (
                    <a href={provider.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      Instagram
                    </a>
                  )}
                  {provider.socialLinks?.linkedin && (
                    <a href={provider.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Map Card */}
            <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '250ms' }}>
              <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />
              <CardHeader className="py-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className={`h-5 w-5 ${typeConfig.color}`} />
                  {t('provider.location')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl overflow-hidden border">
                  <ProviderMap 
                    lat={provider.lat} 
                    lng={provider.lng} 
                    name={provider.name}
                    address={provider.address}
                    type={provider.type as ProviderType}
                    routesData={routesData ?? undefined}
                    selectedRouteIndex={selectedRouteIndex}
                  />
                </div>

                {/* Multi-route info banner */}
                {(routesData || isRouting) && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    {isRouting ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Calcul de l'itinéraire...
                      </div>
                    ) : routesData ? (
                      <>
                        {routesData.map((route, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedRouteIndex(index)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left text-sm",
                              selectedRouteIndex === index ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted"
                            )}
                          >
                            <div className={cn(
                              "w-3 h-0.5 rounded-full shrink-0",
                              index === 0 ? "bg-blue-500" : "bg-gray-400"
                            )} />
                            <Route className={cn("h-4 w-4 shrink-0", index === 0 ? "text-primary" : "text-muted-foreground")} />
                            <span className="font-medium">{route.distance} km</span>
                            <span className="text-muted-foreground">≈ {route.duration} min</span>
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />ETA {new Date(Date.now() + route.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {index > 0 && <span className="text-xs text-muted-foreground ml-auto">Alternatif</span>}
                          </button>
                        ))}
                        <div className="flex justify-end pt-1">
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={clearRoute}>
                            <X className="h-3 w-3" />
                            Effacer
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Transport mode toggle + action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={() => handleGetDirections()}
                    disabled={isRouting}
                  >
                    {isRouting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    {t('provider.getDirections')}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleOpenInMaps}>
                    <ExternalLink className="h-4 w-4" />
                    {t('provider.openInMaps')}
                  </Button>
                </div>

                {/* Transport mode selector (shown when route exists) */}
                {routesData && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={transportMode === 'driving' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleToggleTransportMode('driving')}
                      disabled={isRouting}
                    >
                      <Car className="h-4 w-4" />
                      Voiture
                    </Button>
                    <Button
                      variant={transportMode === 'foot' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleToggleTransportMode('foot')}
                      disabled={isRouting}
                    >
                      <Footprints className="h-4 w-4" />
                      À pied
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Chat Banner — only if PDF is uploaded */}
            {chatAvailable && <ClientAIChatBanner onOpenChat={() => setChatOpen(true)} />}

            {/* Announcements Card — consistent glass-card style */}
            <Card className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '350ms' }}>
              <div className={cn("h-1.5 bg-gradient-to-r", typeConfig.gradient)} />
              <CardHeader className="py-4">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className={cn("h-5 w-5", typeConfig.color)} />
                  {t('provider.announcements')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{t('provider.newService')}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date().toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{t('provider.extendedHours')}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(Date.now() - 86400000).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Floating AI Chat Widget */}
      <ClientAIChat 
        providerId={provider.id} 
        providerName={provider.name}
        isOpen={chatOpen}
        onOpenChange={setChatOpen}
        onAvailabilityChange={setChatAvailable}
      />

      {/* Booking Modal - only for categories that use scheduling */}
      {['doctor', 'clinic', 'hospital', 'birth_hospital', 'lab', 'radiology_center', 'blood_cabin'].includes(resolvedType) && (
        <BookingModal 
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          providerName={provider.name}
          providerId={provider.id}
        />
      )}
    </main>
  );
};

export default ProviderProfilePage;