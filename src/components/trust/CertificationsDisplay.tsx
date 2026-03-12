import { Award, Shield, CheckCircle, FileCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Certification {
  icon: typeof Award;
  name: string;
  issuer: string;
  year: string;
  verified: boolean;
}

interface CertificationsDisplayProps {
  compact?: boolean;
}

export const CertificationsDisplay = ({ compact = false }: CertificationsDisplayProps) => {
  const certifications: Certification[] = [
    {
      icon: Shield,
      name: 'Hébergement de Données de Santé',
      issuer: 'ANSSI',
      year: '2024',
      verified: true
    },
    {
      icon: FileCheck,
      name: 'RGPD Conforme',
      issuer: 'CNIL',
      year: '2024',
      verified: true
    },
    {
      icon: Award,
      name: 'Certification ISO 27001',
      issuer: 'ISO',
      year: '2023',
      verified: true
    },
    {
      icon: CheckCircle,
      name: 'SOC 2 Type II',
      issuer: 'AICPA',
      year: '2024',
      verified: true
    }
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {certifications.map((cert, index) => (
          <Badge 
            key={index}
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 px-3 py-1"
          >
            <cert.icon size={14} className="mr-1" />
            {cert.name}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {certifications.map((cert, index) => (
        <Card 
          key={index}
          className="glass-card hover-lift border-primary/10 animate-scale-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <cert.icon className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="font-semibold text-sm mb-2">{cert.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {cert.issuer} • {cert.year}
            </p>
            
            {cert.verified && (
              <Badge 
                variant="outline" 
                className="bg-primary/5 text-primary border-primary/20 text-xs"
              >
                <CheckCircle size={12} className="mr-1" />
                Vérifié
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
