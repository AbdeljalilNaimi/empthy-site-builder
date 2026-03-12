import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: 5 | 4;
  text: {
    fr: string;
    ar: string;
    en: string;
  };
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Amira K.',
    location: 'Centre Ville',
    rating: 5,
    text: {
      fr: "CityHealth m'a permis de trouver rapidement un excellent cardiologue. L'interface est simple et tous les professionnels sont vérifiés !",
      ar: "ساعدني CityHealth في العثور بسرعة على طبيب قلب ممتاز. الواجهة بسيطة وجميع المهنيين تم التحقق منهم!",
      en: "CityHealth helped me quickly find an excellent cardiologist. The interface is simple and all professionals are verified!"
    },
    avatar: 'AK'
  },
  {
    id: '2',
    name: 'Mohamed B.',
    location: 'Hay El Badr',
    rating: 5,
    text: {
      fr: "Grâce à cette plateforme, j'ai pu prendre rendez-vous en quelques clics avec un dentiste de qualité. Service exceptionnel !",
      ar: "بفضل هذه المنصة، تمكنت من حجز موعد بنقرات قليلة مع طبيب أسنان عالي الجودة. خدمة استثنائية!",
      en: "Thanks to this platform, I was able to book an appointment in a few clicks with a quality dentist. Exceptional service!"
    },
    avatar: 'MB'
  },
  {
    id: '3',
    name: 'Sarah L.',
    location: 'Sidi Bel Abbès Est',
    rating: 4,
    text: {
      fr: "Application très utile pour trouver des pharmacies de garde. Les informations sont toujours à jour et fiables.",
      ar: "تطبيق مفيد جداً للعثور على الصيدليات المناوبة. المعلومات دائماً محدثة وموثوقة.",
      en: "Very useful app for finding on-call pharmacies. Information is always up-to-date and reliable."
    },
    avatar: 'SL'
  },
  {
    id: '4',
    name: 'Youssef T.',
    location: 'Sidi Bel Abbès Ouest',
    rating: 5,
    text: {
      fr: "Excellent outil pour les urgences. J'ai trouvé un hôpital proche avec service d'urgence en moins de 2 minutes.",
      ar: "أداة ممتازة للطوارئ. وجدت مستشفى قريب مع خدمة طوارئ في أقل من دقيقتين.",
      en: "Excellent tool for emergencies. I found a nearby hospital with emergency services in less than 2 minutes."
    },
    avatar: 'YT'
  },
  {
    id: '5',
    name: 'Fatima Z.',
    location: 'Périphérie Nord',
    rating: 5,
    text: {
      fr: "La recherche par spécialité est très pratique. J'ai pu consulter les avis d'autres patients avant de choisir mon médecin.",
      ar: "البحث حسب التخصص عملي جداً. تمكنت من قراءة تقييمات المرضى الآخرين قبل اختيار طبيبي.",
      en: "The specialty search is very practical. I was able to read other patients' reviews before choosing my doctor."
    },
    avatar: 'FZ'
  }
];

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[currentIndex];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ce Que Disent Nos Utilisateurs
          </h2>
          <p className="text-muted-foreground text-lg">
            Des milliers de patients satisfaits nous font confiance
          </p>
        </div>

        <Card 
          className="glass-card border-primary/20 shadow-xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <CardContent className="p-8 md:p-12 relative">
            <Quote className="h-12 w-12 text-primary/20 mb-6" />
            
            <div className="mb-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    className={i < current.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"} 
                  />
                ))}
              </div>
              
              <p className="text-lg md:text-xl leading-relaxed mb-6">
                "{current.text[language]}"
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {current.avatar}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{current.name}</p>
                <p className="text-muted-foreground text-sm">{current.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="h-10 w-10 rounded-full hover:bg-primary/10"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-primary/30 w-2 hover:bg-primary/50'
                }`}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="h-10 w-10 rounded-full hover:bg-primary/10"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};
