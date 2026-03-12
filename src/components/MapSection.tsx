import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Search, 
  Filter, 
  Navigation, 
  Clock, 
  Phone, 
  Star,
  Stethoscope,
  Heart,
  Pill,
  TestTube,
  Building2,
  Zap
} from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';

interface Provider {
  id: number;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'doctor';
  specialty?: string;
  address: string;
  distance: number;
  rating: number;
  isOpen: boolean;
  isEmergency: boolean;
  phone: string;
  lat: number;
  lng: number;
}

const mockProviders: Provider[] = [
  {
    id: 1,
    name: "Hôpital Universitaire Dr. Hassani Abdelkader",
    type: "hospital",
    address: "Avenue de l'Indépendance, Centre Ville",
    distance: 0.8,
    rating: 4.8,
    isOpen: true,
    isEmergency: true,
    phone: "+213 48 54 XX XX",
    lat: 35.1909,
    lng: -0.6345
  },
  {
    id: 2,
    name: "Cabinet Dr. Benali - Cardiologue",
    type: "doctor",
    specialty: "Cardiologie",
    address: "Rue des Frères Boudiaf, Hay El Badr",
    distance: 1.2,
    rating: 4.9,
    isOpen: true,
    isEmergency: false,
    phone: "+213 48 55 XX XX",
    lat: 35.1985,
    lng: -0.6298
  },
  {
    id: 3,
    name: "Pharmacie Centrale",
    type: "pharmacy",
    address: "Place 1er Novembre, Centre Ville",
    distance: 0.5,
    rating: 4.7,
    isOpen: true,
    isEmergency: false,
    phone: "+213 48 56 XX XX",
    lat: 35.1889,
    lng: -0.6412
  },
  {
    id: 4,
    name: "Laboratoire d'Analyses Médicales El Amal",
    type: "lab",
    address: "Boulevard Emir Abdelkader",
    distance: 1.8,
    rating: 4.6,
    isOpen: false,
    isEmergency: false,
    phone: "+213 48 57 XX XX",
    lat: 35.1856,
    lng: -0.6421
  },
  {
    id: 5,
    name: "Clinique El Chifa",
    type: "clinic",
    address: "Rue Larbi Ben M'hidi",
    distance: 2.1,
    rating: 4.5,
    isOpen: true,
    isEmergency: false,
    phone: "+213 48 58 XX XX",
    lat: 35.1945,
    lng: -0.6278
  }
];

const getProviderIcon = (type: Provider['type']) => {
  switch (type) {
    case 'hospital': return <Building2 className="h-5 w-5" />;
    case 'clinic': return <Heart className="h-5 w-5" />;
    case 'pharmacy': return <Pill className="h-5 w-5" />;
    case 'lab': return <TestTube className="h-5 w-5" />;
    case 'doctor': return <Stethoscope className="h-5 w-5" />;
    default: return <MapPin className="h-5 w-5" />;
  }
};

const getProviderColor = (type: Provider['type']) => {
  switch (type) {
    case 'hospital': return 'text-red-600 bg-red-100';
    case 'clinic': return 'text-blue-600 bg-blue-100';
    case 'pharmacy': return 'text-green-600 bg-green-100';
    case 'lab': return 'text-purple-600 bg-purple-100';
    case 'doctor': return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const MapSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [filteredProviders, setFilteredProviders] = useState(mockProviders);

  useEffect(() => {
    let filtered = mockProviders;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(provider => provider.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  }, [searchQuery, selectedType]);

  const providerTypes = [
    { value: 'all', label: 'Tous les services' },
    { value: 'hospital', label: 'Hôpitaux' },
    { value: 'clinic', label: 'Cliniques' },
    { value: 'doctor', label: 'Médecins' },
    { value: 'pharmacy', label: 'Pharmacies' },
    { value: 'lab', label: 'Laboratoires' }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedTransition show={true} animation="fade">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Carte Interactive des Services de Santé
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Localisez facilement tous les prestataires de santé près de chez vous
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Filters and Results */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search and Filters */}
              <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Rechercher un service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de service" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button className="w-full" variant="outline">
                    <Navigation className="mr-2 h-4 w-4" />
                    Ma position
                  </Button>
                </CardContent>
              </Card>

              {/* Results List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProviders.map((provider) => (
                  <Card 
                    key={provider.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getProviderColor(provider.type)}`}>
                          {getProviderIcon(provider.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {provider.name}
                              </h3>
                              {provider.specialty && (
                                <p className="text-xs text-primary font-medium">
                                  {provider.specialty}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {provider.isOpen ? (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Ouvert
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                  Fermé
                                </Badge>
                              )}
                              {provider.isEmergency && (
                                <Badge variant="destructive" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  24/7
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {provider.address}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-medium">{provider.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {provider.distance} km
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="lg:col-span-2">
              <Card className="glass-card h-[600px] relative overflow-hidden">
                <CardContent className="p-0 h-full">
                  {/* Map placeholder - would be replaced with actual map component */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 relative flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Carte Interactive
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-sm">
                        Intégration Mapbox en cours de développement. 
                        La carte affichera tous les prestataires avec leurs emplacements précis.
                      </p>
                      <Button variant="outline">
                        Configurer Mapbox
                      </Button>
                    </div>

                    {/* Mock markers */}
                    <div className="absolute top-20 left-20 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute top-32 right-32 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Pill className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute bottom-24 left-32 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Stethoscope className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Selected provider popup */}
                  {selectedProvider && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Card className="glass-card border-0">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getProviderColor(selectedProvider.type)}`}>
                              {getProviderIcon(selectedProvider.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground">
                                    {selectedProvider.name}
                                  </h3>
                                  {selectedProvider.specialty && (
                                    <p className="text-sm text-primary font-medium">
                                      {selectedProvider.specialty}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProvider.address}
                                  </p>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => setSelectedProvider(null)}
                                  variant="ghost"
                                >
                                  ✕
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-sm">{selectedProvider.rating}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {selectedProvider.distance} km
                                </span>
                                {selectedProvider.isOpen && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                    Ouvert
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" className="flex-1">
                                  <Navigation className="h-4 w-4 mr-2" />
                                  Itinéraire
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Phone className="h-4 w-4 mr-2" />
                                  Appeler
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </AnimatedTransition>
      </div>
    </section>
  );
};

export default MapSection;