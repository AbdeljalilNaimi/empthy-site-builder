import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Droplet, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { broadcastEmergency, BLOOD_TYPES } from '@/services/bloodEmergencyService';
import { toast } from 'sonner';

interface BroadcastEmergencyPanelProps {
  providerId: string;
  providerName: string;
  providerLat?: number;
  providerLng?: number;
}

export function BroadcastEmergencyPanel({ providerId, providerName, providerLat, providerLng }: BroadcastEmergencyPanelProps) {
  const [bloodType, setBloodType] = useState('');
  const [urgency, setUrgency] = useState<'critical' | 'high'>('critical');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async () => {
    if (!bloodType) {
      toast.error('Sélectionnez un groupe sanguin');
      return;
    }
    setIsSending(true);
    try {
      await broadcastEmergency({
        provider_id: providerId,
        provider_name: providerName,
        provider_lat: providerLat,
        provider_lng: providerLng,
        blood_type_needed: bloodType,
        urgency_level: urgency,
        message: message || undefined,
      });
      toast.success('Alerte diffusée avec succès !');
      setBloodType('');
      setMessage('');
    } catch (err) {
      toast.error('Erreur lors de la diffusion de l\'alerte');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-destructive" />
          Diffuser une Alerte d'Urgence
        </CardTitle>
        <CardDescription>Lancez un appel aux donneurs de sang compatibles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Groupe sanguin recherché</Label>
          <Select value={bloodType} onValueChange={setBloodType}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le groupe sanguin" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Niveau d'urgence</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={urgency === 'critical' ? 'destructive' : 'outline'}
              className="flex-1"
              onClick={() => setUrgency('critical')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Critique
            </Button>
            <Button
              type="button"
              variant={urgency === 'high' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setUrgency('high')}
            >
              Urgent
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Message (optionnel)</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Contexte additionnel pour les donneurs..."
            rows={3}
          />
        </div>

        {bloodType && (
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-sm font-medium">Résumé de l'alerte :</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="destructive">{bloodType}</Badge>
              <Badge variant={urgency === 'critical' ? 'destructive' : 'secondary'}>
                {urgency === 'critical' ? 'Critique' : 'Urgent'}
              </Badge>
            </div>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" variant="destructive" disabled={!bloodType || isSending}>
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Diffuser l'alerte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la diffusion</AlertDialogTitle>
              <AlertDialogDescription>
                Vous êtes sur le point de diffuser une alerte d'urgence pour le groupe sanguin <strong>{bloodType}</strong> (niveau: {urgency === 'critical' ? 'Critique' : 'Urgent'}). Tous les donneurs compatibles inscrits seront notifiés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleBroadcast} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirmer la diffusion
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
