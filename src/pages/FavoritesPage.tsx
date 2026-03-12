import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, Star, Clock, Calendar, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import SkeletonCard from '@/components/SkeletonCard';
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { toast } from 'sonner';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Note: Authentication is now handled by CitizenGuard in App.tsx
  const headerRef = useScrollReveal();

  // Use TanStack Query for favorites and providers
  const { data: favoriteIds = [], isLoading: loadingFavorites } = useFavorites();
  const { data: allProviders = [], isLoading: loadingProviders } = useVerifiedProviders();
  const removeFavorite = useRemoveFavorite();

  const isLoading = loadingFavorites || loadingProviders;

  // Get favorite providers by matching IDs
  const favoriteProviders = useMemo(() => {
    return allProviders.filter(provider => favoriteIds.includes(provider.id));
  }, [allProviders, favoriteIds]);

  const categories = [
    'Tous',
    'Hôpitaux',
    'Cliniques', 
    'Médecins Généralistes',
    'Spécialistes',
    'Pharmacies',
    'Laboratoires'
  ];

  const handleRemoveFavorite = (id: string) => {
    removeFavorite.mutate(id);
    toast.success('Favori supprimé', {
      description: 'Le prestataire a été retiré de vos favoris'
    });
  };

  const handleBookAppointment = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const filteredFavorites = useMemo(() => {
    return favoriteProviders.filter(favorite => {
      const matchesSearch = !searchQuery || 
        favorite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (favorite.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || selectedCategory === 'Tous' || 
        favorite.type.toLowerCase().includes(selectedCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });
  }, [favoriteProviders, searchQuery, selectedCategory]);

  // Note: Authentication check removed - CitizenGuard handles this in App.tsx

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <section ref={headerRef} className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6 animate-float">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-glow-pulse">
              <Heart className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mes Favoris
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Vos prestataires de santé préférés, toujours à portée de main
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="glass-panel p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Nom ou spécialité..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2" size={18} />
                  {filteredFavorites.length} résultat(s)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Favorites List */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Heart className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-semibold mb-4">
                {searchQuery || selectedCategory ? 'Aucun résultat' : 'Aucun favori'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory 
                  ? 'Aucun prestataire ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore ajouté de prestataires à vos favoris.'
                }
              </p>
              {!searchQuery && !selectedCategory && (
                <Button asChild>
                  <Link to="/search">
                    <Search className="mr-2" size={18} />
                    Découvrir des prestataires
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite, index) => (
              <Card 
                key={favorite.id} 
                className="glass-card hover-lift transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link to={`/provider/${favorite.id}`} className="hover:text-primary">
                          <h3 className="font-semibold text-lg line-clamp-1">{favorite.name}</h3>
                        </Link>
                        {favorite.verified && (
                          <Badge variant="secondary" className="text-xs">✓ Vérifié</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{favorite.specialty || favorite.type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      disabled={removeFavorite.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Retirer ${favorite.name} des favoris`}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm">{favorite.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm">{favorite.phone}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" aria-hidden="true" />
                        <span className="text-sm">{favorite.rating}</span>
                      </div>
                      
                      <Badge variant={favorite.isOpen ? 'default' : 'secondary'} className="text-xs">
                        {favorite.isOpen ? 'Ouvert' : 'Fermé'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm">{favorite.area}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBookAppointment(favorite.id)}
                    >
                      <Calendar className="mr-1" size={14} aria-hidden="true" />
                      RDV
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleCall(favorite.phone)}
                    >
                      <Phone className="mr-1" size={14} aria-hidden="true" />
                      Appeler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
