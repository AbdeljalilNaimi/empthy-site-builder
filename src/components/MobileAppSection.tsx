import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, Star, Shield, MapPin, Clock } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';

const MobileAppSection = () => {
  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Géolocalisation précise",
      description: "Trouvez les prestataires les plus proches"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Disponibilité temps réel",
      description: "Horaires et disponibilités mises à jour"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Prestataires vérifiés",
      description: "Tous nos partenaires sont certifiés"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-secondary/10 to-primary/5">
      <div className="max-w-6xl mx-auto">
        <AnimatedTransition show={true} animation="fade">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Téléchargez l'app CityHealth
                </h2>
                <p className="text-lg text-muted-foreground">
                  Accédez à tous vos services de santé depuis votre smartphone. 
                  Simple, rapide et sécurisé.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-primary">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* App Store Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="flex items-center gap-3 bg-black hover:bg-black/90 text-white px-6 py-3 rounded-xl"
                  >
                    <div className="text-2xl">📱</div>
                    <div className="text-left">
                      <div className="text-xs opacity-80">Télécharger sur</div>
                      <div className="font-semibold">App Store</div>
                    </div>
                  </Button>

                  <Button 
                    size="lg" 
                    className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                  >
                    <div className="text-2xl">📱</div>
                    <div className="text-left">
                      <div className="text-xs opacity-80">Disponible sur</div>
                      <div className="font-semibold">Google Play</div>
                    </div>
                  </Button>
                </div>

                {/* App Rating */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-foreground">4.8</span>
                    <span>(2,500+ avis)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>50,000+ téléchargements</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Phone Mockup */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Phone frame */}
                <div className="relative w-64 h-[520px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
                    
                    {/* Screen content */}
                    <div className="h-full bg-gradient-to-br from-primary/5 to-secondary/5 p-4 pt-8">
                      {/* Status bar */}
                      <div className="flex justify-between items-center text-xs text-gray-600 mb-6 pt-2">
                        <span>9:41</span>
                        <span>📶 🔋</span>
                      </div>

                      {/* App header */}
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-2">
                          <Smartphone className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">CityHealth</h3>
                        <p className="text-xs text-gray-600">Sidi Bel Abbès</p>
                      </div>

                      {/* Search bar */}
                      <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">Rechercher un médecin...</span>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                          <div className="text-2xl mb-1">🏥</div>
                          <div className="text-xs font-medium">Urgences</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                          <div className="text-2xl mb-1">💊</div>
                          <div className="text-xs font-medium">Pharmacies</div>
                        </div>
                      </div>

                      {/* Provider cards */}
                      <div className="space-y-2">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs">👨‍⚕️</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium">Dr. Benali</div>
                              <div className="text-xs text-gray-500">Cardiologue</div>
                            </div>
                            <div className="text-xs text-green-600">●</div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs">🏥</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium">Hôpital Central</div>
                              <div className="text-xs text-gray-500">0.8 km</div>
                            </div>
                            <div className="text-xs text-green-600">●</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full animate-float blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-secondary/20 rounded-full animate-float blur-xl" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </AnimatedTransition>
      </div>
    </section>
  );
};

export default MobileAppSection;