import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Droplet, AlertTriangle, Pill, HeartPulse, Phone, User, Printer, WifiOff } from 'lucide-react';
import { EmergencyHealthCard } from '@/services/emergencyCardService';
import { getCachedEmergencyCard } from '@/hooks/useOfflineEmergencyCard';

interface EmergencyCardDisplayProps {
  card?: EmergencyHealthCard | null;
  offlineMode?: boolean;
  patientName?: string;
}

export function EmergencyCardDisplay({ card: propCard, offlineMode, patientName }: EmergencyCardDisplayProps) {
  const card = propCard || (offlineMode ? getCachedEmergencyCard() : null);
  if (!card) return null;

  const baseUrl = window.location.origin;
  const publicUrl = card.share_token ? `${baseUrl}/emergency-card/${card.share_token}` : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Compact Medical ID Card */}
      <div id="emergency-card-printable" className="max-w-md mx-auto rounded-xl border-2 border-destructive/30 shadow-lg overflow-hidden bg-card">
        {/* Red Header Band */}
        <div className="emergency-card-header bg-destructive text-destructive-foreground px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            <span className="font-bold text-sm tracking-wide uppercase">Carte d'Urgence Médicale</span>
          </div>
          {card.blood_group && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5">
              <Droplet className="h-3.5 w-3.5" />
              <span className="font-black text-lg leading-none">{card.blood_group}</span>
            </div>
          )}
        </div>

        {/* Card Body: 2-column layout */}
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* Left Column - Info (~70%) */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Patient Name */}
              {patientName && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                    <User className="h-2.5 w-2.5" /> Patient
                  </p>
                  <p className="text-sm font-bold truncate">{patientName}</p>
                </div>
              )}

              {/* Allergies */}
              {card.allergies && card.allergies.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-destructive font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" /> Allergies
                  </p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {card.allergies.map(a => (
                      <Badge key={a} variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-medium">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Chronic Conditions */}
              {card.chronic_conditions && card.chronic_conditions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-orange-600 font-semibold flex items-center gap-1">
                    <HeartPulse className="h-2.5 w-2.5" /> Maladies Chroniques
                  </p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {card.chronic_conditions.map(c => (
                      <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-orange-400 text-orange-700">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {card.current_medications && card.current_medications.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold flex items-center gap-1">
                    <Pill className="h-2.5 w-2.5" /> Médicaments
                  </p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {card.current_medications.map(m => (
                      <Badge key={m} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{m}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(card.emergency_contact_name || card.emergency_contact_phone) && (
                <div className="rounded-md bg-muted p-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" /> Contact d'Urgence
                  </p>
                  {card.emergency_contact_name && (
                    <p className="text-xs">{card.emergency_contact_name}</p>
                  )}
                  {card.emergency_contact_phone && (
                    <a href={`tel:${card.emergency_contact_phone}`} className="text-xs font-mono text-primary underline">
                      {card.emergency_contact_phone}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - QR Code (~30%) */}
            {publicUrl && card.is_public_for_emergencies && (
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <div className="bg-white p-1.5 rounded-md border">
                  <QRCodeSVG value={publicUrl} size={90} level="H" />
                </div>
                <p className="text-[8px] text-muted-foreground text-center mt-1 max-w-[90px] leading-tight">
                  Scanner pour accès urgence
                </p>
              </div>
            )}
          </div>

          {!card.is_public_for_emergencies && (
            <p className="text-[10px] text-muted-foreground text-center italic mt-2 pt-2 border-t print:hidden">
              QR désactivé — activez le partage d'urgence
            </p>
          )}
        </CardContent>
      </div>

      {offlineMode && !propCard && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 print:hidden">
          <WifiOff className="h-3.5 w-3.5" />
          Données hors-ligne — dernière mise à jour en cache
        </div>
      )}

      <Button variant="outline" onClick={handlePrint} className="w-full print:hidden">
        <Printer className="h-4 w-4 mr-2" />
        Télécharger en PDF / Imprimer
      </Button>
    </div>
  );
}
