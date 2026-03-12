import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplet, Award, Calendar, MapPin, Loader2 } from 'lucide-react';
import { getDonationHistory, DonationRecord } from '@/services/bloodEmergencyService';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DonationHistoryTimelineProps {
  citizenId: string;
}

const MILESTONES = [
  { count: 1, label: 'Premier Don', color: 'bg-amber-600', emoji: '🥉' },
  { count: 3, label: 'Donneur Fidèle', color: 'bg-gray-400', emoji: '🥈' },
  { count: 5, label: 'Héros', color: 'bg-yellow-500', emoji: '🥇' },
  { count: 10, label: 'Légende', color: 'bg-purple-500', emoji: '💎' },
];

export function DonationHistoryTimeline({ citizenId }: DonationHistoryTimelineProps) {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDonationHistory(citizenId)
      .then(setDonations)
      .finally(() => setLoading(false));
  }, [citizenId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const totalDonations = donations.length;
  const currentMilestone = [...MILESTONES].reverse().find(m => totalDonations >= m.count);
  const nextMilestone = MILESTONES.find(m => totalDonations < m.count);

  return (
    <div className="space-y-4">
      {/* Stats & Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Mes Badges de Donneur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-primary">{totalDonations}</p>
            <p className="text-sm text-muted-foreground">don{totalDonations !== 1 ? 's' : ''} au total</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {MILESTONES.map(milestone => {
              const earned = totalDonations >= milestone.count;
              return (
                <div
                  key={milestone.count}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    earned ? 'border-primary/50 bg-primary/5' : 'border-border/50 opacity-40'
                  }`}
                >
                  <span className="text-2xl">{milestone.emoji}</span>
                  <span className="text-xs font-medium mt-1">{milestone.label}</span>
                  <span className="text-xs text-muted-foreground">{milestone.count} don{milestone.count > 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>

          {nextMilestone && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Plus que {nextMilestone.count - totalDonations} don{nextMilestone.count - totalDonations > 1 ? 's' : ''} pour le badge "{nextMilestone.label}" {nextMilestone.emoji}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des Dons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Droplet className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun don enregistré</p>
              <p className="text-sm">Votre premier don apparaîtra ici</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {donations.map((donation, index) => (
                  <div key={donation.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-destructive border-2 border-background" />

                    <div className="flex-1 p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          <Droplet className="h-3 w-3 mr-1 text-destructive" />
                          {donation.blood_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(donation.donated_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      {donation.provider_name && (
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {donation.provider_name}
                        </p>
                      )}
                      {donation.emergency_id && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Don d'urgence
                        </Badge>
                      )}
                      {donation.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{donation.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
