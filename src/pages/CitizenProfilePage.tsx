import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfileScore } from '@/hooks/useProfileScore';
import { ProfileCompletionWidget } from '@/components/patient/ProfileCompletionWidget';
import { ProfileWelcomeBanner } from '@/components/patient/ProfileWelcomeBanner';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Bell, Lock, 
  Heart, Clock, CheckCircle2, XCircle, AlertCircle, Edit2, 
  Trash2, Star, Navigation, ExternalLink, Droplet, Award, ShieldCheck,
  History as HistoryIcon
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DonationHistoryTimeline } from '@/components/blood-emergency/DonationHistoryTimeline';
import { BLOOD_TYPES } from '@/services/bloodEmergencyService';
import { useNotifications } from '@/hooks/useNotifications';
import { CityHealthProvider, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { getProviderById } from '@/services/firestoreProviderService';
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { usePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getEmergencyCard, upsertEmergencyCard, EmergencyHealthCard } from '@/services/emergencyCardService';
import { EmergencyCardForm } from '@/components/emergency-card/EmergencyCardForm';
import { EmergencyCardDisplay } from '@/components/emergency-card/EmergencyCardDisplay';
import { ConsultationHistory } from '@/components/emergency-card/ConsultationHistory';
import { useOfflineEmergencyCard } from '@/hooks/useOfflineEmergencyCard';

// Profile completion now handled by useProfileScore hook

export default function CitizenProfilePage() {
  const { user, profile, updateProfile, logout, isAuthenticated, hasRole } = useAuth();
  const { preferences, updatePreferences } = useNotifications();
  const navigate = useNavigate();
  
  // TanStack Query hooks for favorites - synchronized with FavoritesPage
  const { data: favoriteIds = [], isLoading: favoritesLoading } = useFavorites();
  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useRemoveFavorite();
  const { data: allProviders = [] } = useVerifiedProviders();
  
  // Filter providers to get only favorites
  const favorites = allProviders.filter(p => favoriteIds.includes(p.id));
  
  // TanStack Query hooks for appointments - using Firestore
  const { data: appointments = [], isLoading: appointmentsLoading } = usePatientAppointments();
  const { mutate: cancelAppointmentMutation, isPending: isCancellingAppointment } = useCancelAppointment();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    weight: '' as string,
    height: '' as string,
    last_donation_date: '' as string
  });

  // Format phone to +213 X XX XX XX XX pattern
  const formatAlgerianPhone = (value: string): string => {
    // Strip everything except digits
    let digits = value.replace(/[^\d]/g, '');
    // Remove leading 213 if user typed it (we add prefix automatically)
    if (digits.startsWith('213')) digits = digits.slice(3);
    // Remove leading 0 (local format)
    if (digits.startsWith('0')) digits = digits.slice(1);
    // Limit to 9 digits
    digits = digits.slice(0, 9);
    // Format: X XX XX XX XX
    if (digits.length === 0) return '';
    let formatted = digits[0];
    if (digits.length > 1) formatted += ' ' + digits.slice(1, 3);
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    return '+213 ' + formatted;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.full_name.trim()) {
      errors.full_name = 'Le nom est obligatoire';
    } else if (formData.full_name.trim().length < 3) {
      errors.full_name = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.full_name.trim().length > 100) {
      errors.full_name = 'Le nom ne doit pas dépasser 100 caractères';
    }

    // Phone validation (Algerian format)
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/[^\d]/g, '');
      // Should be 12 digits total (213 + 9 digits)
      if (phoneDigits.length !== 12 || !phoneDigits.startsWith('213')) {
        errors.phone = 'Numéro invalide. Format : +213 X XX XX XX XX';
      }
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      const age = (today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (dob > today) {
        errors.dateOfBirth = 'La date ne peut pas être dans le futur';
      } else if (dob < minDate) {
        errors.dateOfBirth = 'Date de naissance invalide';
      } else if (age < 13) {
        errors.dateOfBirth = 'Vous devez avoir au moins 13 ans';
      }
    }

    // Weight validation
    if (formData.weight) {
      const w = Number(formData.weight);
      if (isNaN(w) || w < 20 || w > 350) {
        errors.weight = 'Poids invalide (20-350 kg)';
      }
    }

    // Height validation
    if (formData.height) {
      const h = Number(formData.height);
      if (isNaN(h) || h < 50 || h > 260) {
        errors.height = 'Taille invalide (50-260 cm)';
      }
    }

    // Last donation date validation
    if (formData.last_donation_date) {
      const donDate = new Date(formData.last_donation_date);
      const today = new Date();
      if (donDate > today) {
        errors.last_donation_date = 'La date ne peut pas être dans le futur';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const [providerCache, setProviderCache] = useState<Record<string, CityHealthProvider | null>>({});
  const [emergencyCard, setEmergencyCard] = useState<EmergencyHealthCard | null>(null);

  // Load emergency card
  useEffect(() => {
    if (user?.uid) {
      getEmergencyCard(user.uid).then(setEmergencyCard).catch(console.error);
    }
  }, [user?.uid]);

  // Cache emergency card for offline PWA access
  useOfflineEmergencyCard(emergencyCard);

  const scoreData = useProfileScore(profile, emergencyCard);

  // Load form data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.date_of_birth || '',
        weight: profile.weight ? String(profile.weight) : '',
        height: profile.height ? String(profile.height) : '',
        last_donation_date: profile.last_donation_date || ''
      });
    }
  }, [profile]);

  // Load provider details for appointments
  useEffect(() => {
    const loadProviders = async () => {
      const providerIds = [...new Set(appointments.map(a => a.providerId))];
      const cache: Record<string, CityHealthProvider | null> = {};
      for (const id of providerIds) {
        if (!providerCache[id]) {
          cache[id] = await getProviderById(id);
        }
      }
      if (Object.keys(cache).length > 0) {
        setProviderCache(prev => ({ ...prev, ...cache }));
      }
    };
    if (appointments.length > 0) {
      loadProviders();
    }
  }, [appointments]);

  if (!profile) return null;

  const initials = profile.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }
    await updateProfile({ 
      full_name: formData.full_name.trim(),
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      date_of_birth: formData.dateOfBirth || undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      last_donation_date: formData.last_donation_date || undefined,
    });
    toast.success('Profil mis à jour');
    setIsEditing(false);
    setFormErrors({});
  };

  const handleRemoveFavorite = (providerId: string) => {
    removeFavorite(providerId, {
      onSuccess: () => {
        toast.success('Retiré des favoris');
      },
      onError: () => {
        toast.error('Erreur lors de la suppression');
      }
    });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointmentMutation(appointmentId, {
      onSuccess: () => {
        toast.success('Rendez-vous annulé');
      },
      onError: () => {
        toast.error('Erreur lors de l\'annulation');
      }
    });
  };

  // Filter appointments by date for upcoming vs past
  const now = new Date();
  const upcomingAppointments = appointments.filter(a => 
    new Date(a.dateTime) > now && a.status !== 'cancelled' && a.status !== 'completed'
  );
  const pastAppointments = appointments.filter(a => 
    new Date(a.dateTime) <= now || a.status === 'cancelled' || a.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8 max-w-5xl">
        {/* Welcome Banner */}
        {user?.uid && (
          <ProfileWelcomeBanner userId={user.uid} score={scoreData.totalScore} />
        )}

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{profile.full_name || 'Mon Profil'}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {/* Profile Completion Widget */}
        <div className="mb-6">
          <ProfileCompletionWidget
            scoreData={scoreData}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="emergency-card" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Carte d'Urgence</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Rendez-vous</span>
              {upcomingAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-1">{upcomingAppointments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favoris</span>
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1">{favorites.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <span className="hidden sm:inline">Mes Dons</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Gérez vos informations de profil</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.full_name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, full_name: e.target.value }));
                          if (formErrors.full_name) setFormErrors(prev => ({ ...prev, full_name: '' }));
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", formErrors.full_name && "border-destructive")}
                        placeholder="Votre nom complet"
                        maxLength={100}
                      />
                    </div>
                    {formErrors.full_name && <p className="text-sm text-destructive">{formErrors.full_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatAlgerianPhone(e.target.value);
                          setFormData(prev => ({ ...prev, phone: formatted }));
                          if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", formErrors.phone && "border-destructive")}
                        placeholder="+213 X XX XX XX XX"
                      />
                    </div>
                    {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date de naissance</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }));
                          if (formErrors.dateOfBirth) setFormErrors(prev => ({ ...prev, dateOfBirth: '' }));
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", formErrors.dateOfBirth && "border-destructive")}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {formErrors.dateOfBirth && <p className="text-sm text-destructive">{formErrors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="weight"
                        type="number"
                        min="20"
                        max="350"
                        value={formData.weight}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, weight: e.target.value }));
                          if (formErrors.weight) setFormErrors(prev => ({ ...prev, weight: '' }));
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", formErrors.weight && "border-destructive")}
                        placeholder="kg"
                      />
                    </div>
                    {formErrors.weight && <p className="text-sm text-destructive">{formErrors.weight}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Taille (cm)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="height"
                        type="number"
                        min="50"
                        max="260"
                        value={formData.height}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, height: e.target.value }));
                          if (formErrors.height) setFormErrors(prev => ({ ...prev, height: '' }));
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", formErrors.height && "border-destructive")}
                        placeholder="cm"
                      />
                    </div>
                    {formErrors.height && <p className="text-sm text-destructive">{formErrors.height}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastDonation">Date du dernier don</Label>
                    <div className="relative">
                      <Droplet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastDonation"
                        type="date"
                        value={formData.last_donation_date}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, last_donation_date: e.target.value }));
                          if (formErrors.last_donation_date) setFormErrors(prev => ({ ...prev, last_donation_date: '' }));
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", formErrors.last_donation_date && "border-destructive")}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {formErrors.last_donation_date && <p className="text-sm text-destructive">{formErrors.last_donation_date}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Votre adresse à Sidi Bel Abbès"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave}>Enregistrer</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blood Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-destructive" />
                  Profil Sanguin
                </CardTitle>
                <CardDescription>Renseignez votre groupe sanguin pour recevoir les alertes d'urgence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Groupe sanguin</Label>
                  <Select
                    value={profile.blood_group || ''}
                    onValueChange={async (value) => {
                      updateProfile({ blood_group: value });
                      // Sync with emergency card
                      if (user?.uid) {
                        const updated = await upsertEmergencyCard(user.uid, { blood_group: value });
                        if (updated) setEmergencyCard(updated);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner votre groupe" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label>Recevoir les alertes d'urgence</Label>
                    <p className="text-sm text-muted-foreground">Soyez notifié quand votre groupe est recherché</p>
                  </div>
                  <Switch
                    checked={profile.emergency_opt_in || false}
                    onCheckedChange={(checked) => {
                      updateProfile({ emergency_opt_in: checked });
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </Button>
                <Separator />
                <div className="space-y-2">
                  <Button variant="destructive" onClick={logout} className="w-full">
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Card Tab */}
          <TabsContent value="emergency-card" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
              <EmergencyCardForm
                userId={user?.uid || ''}
                card={emergencyCard}
                onSaved={setEmergencyCard}
                onBloodGroupChange={(bg) => updateProfile({ blood_group: bg })}
              />
            </div>
            {emergencyCard && emergencyCard.blood_group && (
              <EmergencyCardDisplay card={emergencyCard} patientName={profile.full_name || undefined} />
            )}
            {user?.uid && (
              <ConsultationHistory userId={user.uid} />
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Rendez-vous à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun rendez-vous à venir</p>
                    <Button variant="link" onClick={() => navigate('/search')}>
                      Trouver un prestataire
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-3">
                      {upcomingAppointments.map((apt) => {
                        const provider = providerCache[apt.providerId];
                        return (
                          <Card key={apt.id} className="border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{apt.providerName || provider?.name || 'Prestataire'}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(apt.dateTime).toLocaleDateString('fr-FR', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleCancelAppointment(apt.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Historique des rendez-vous
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/citizen/appointments/history')}>
                  <HistoryIcon className="h-4 w-4 mr-2" />
                  Voir l'historique complet
                </Button>
              </CardHeader>
              <CardContent>
                {pastAppointments.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Aucun rendez-vous passé</p>
                ) : (
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                      {pastAppointments.slice(0, 5).map((apt) => {
                        const provider = providerCache[apt.providerId];
                        return (
                          <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium text-sm">{apt.providerName || provider?.name || 'Prestataire'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(apt.dateTime).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <Badge variant={apt.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {apt.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                            </Badge>
                          </div>
                        );
                      })}
                      {pastAppointments.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          + {pastAppointments.length - 5} autres rendez-vous
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Mes prestataires favoris
                </CardTitle>
                <CardDescription>Accès rapide à vos prestataires préférés</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun favori pour l'instant</p>
                    <Button variant="link" onClick={() => navigate('/providers-map')}>
                      Découvrir les prestataires
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {favorites.map((provider) => (
                      <Card key={provider.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm">{provider.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {PROVIDER_TYPE_LABELS[provider.type]?.icon} {PROVIDER_TYPE_LABELS[provider.type]?.fr}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(provider.id);
                              }}
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span>{provider.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{provider.address}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => navigate(`/provider/${provider.id}`)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`, '_blank');
                              }}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Y aller
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            {user && <DonationHistoryTimeline citizenId={user.uid} />}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications push</Label>
                      <p className="text-sm text-muted-foreground">Notifications dans le navigateur</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => {
                        updatePreferences({ pushNotifications: checked });
                        toast.success(checked ? 'Notifications push activées' : 'Notifications push désactivées');
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications email</Label>
                      <p className="text-sm text-muted-foreground">Emails de notification</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => {
                        updatePreferences({ emailNotifications: checked });
                        toast.success(checked ? 'Notifications email activées' : 'Notifications email désactivées');
                      }}
                    />
                  </div>

                  <Separator />

                  <h4 className="font-medium">Types de notifications</h4>

                  <div className="flex items-center justify-between">
                    <Label>Rappels de rendez-vous</Label>
                    <Switch
                      checked={preferences.appointments}
                      onCheckedChange={(checked) => {
                        updatePreferences({ appointments: checked });
                        toast.success(checked ? 'Rappels de rendez-vous activés' : 'Rappels de rendez-vous désactivés');
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Messages</Label>
                    <Switch
                      checked={preferences.messages}
                      onCheckedChange={(checked) => {
                        updatePreferences({ messages: checked });
                        toast.success(checked ? 'Notifications de messages activées' : 'Notifications de messages désactivées');
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Rappels de santé</Label>
                    <Switch
                      checked={preferences.profileUpdates}
                      onCheckedChange={(checked) => {
                        updatePreferences({ profileUpdates: checked });
                        toast.success(checked ? 'Rappels de santé activés' : 'Rappels de santé désactivés');
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alertes don de sang</Label>
                      <p className="text-sm text-muted-foreground">Urgences de don de sang à proximité</p>
                    </div>
                    <Switch
                      checked={preferences.bloodEmergencies}
                      onCheckedChange={(checked) => {
                        updatePreferences({ bloodEmergencies: checked });
                        toast.success(checked ? 'Alertes don de sang activées' : 'Alertes don de sang désactivées');
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
