import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet, Users, Clock, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import {
  BloodEmergency,
  BloodEmergencyResponse,
  getEmergenciesByProvider,
  resolveEmergency,
  subscribeToResponses,
} from '@/services/bloodEmergencyService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActiveEmergenciesDashboardProps {
  providerId: string;
}

export function ActiveEmergenciesDashboard({ providerId }: ActiveEmergenciesDashboardProps) {
  const [emergencies, setEmergencies] = useState<BloodEmergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [responsesMap, setResponsesMap] = useState<Record<string, BloodEmergencyResponse[]>>({});

  // Load emergencies
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEmergenciesByProvider(providerId);
        setEmergencies(data);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Realtime updates for the provider's emergencies
    const channel = supabase
      .channel(`provider-emergencies-${providerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_emergencies', filter: `provider_id=eq.${providerId}` }, () => {
        getEmergenciesByProvider(providerId).then(setEmergencies);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [providerId]);

  // Subscribe to responses for active emergencies
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const activeEmergencies = emergencies.filter(e => e.status === 'active');
    
    activeEmergencies.forEach(e => {
      const unsub = subscribeToResponses(e.id, (responses) => {
        setResponsesMap(prev => ({ ...prev, [e.id]: responses }));
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, [emergencies]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveEmergency(id);
      toast.success('Urgence marquée comme résolue');
    } catch {
      toast.error('Erreur lors de la résolution');
    } finally {
      setResolvingId(null);
    }
  };

  const activeEmergencies = emergencies.filter(e => e.status === 'active');
  const resolvedEmergencies = emergencies.filter(e => e.status === 'resolved').slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Urgences Actives ({activeEmergencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeEmergencies.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune urgence active</p>
          ) : (
            activeEmergencies.map((emergency) => {
              const responses = responsesMap[emergency.id] || [];
              const onTheWay = responses.filter(r => r.status === 'on_the_way');
              return (
                <div key={emergency.id} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-lg px-3 py-1">
                        <Droplet className="h-4 w-4 mr-1" />
                        {emergency.blood_type_needed}
                      </Badge>
                      <Badge variant={emergency.urgency_level === 'critical' ? 'destructive' : 'secondary'}>
                        {emergency.urgency_level === 'critical' ? 'Critique' : 'Urgent'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(emergency.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>

                  {emergency.message && (
                    <p className="text-sm text-muted-foreground">{emergency.message}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{onTheWay.length} donneur{onTheWay.length !== 1 ? 's' : ''} en route</span>
                  </div>

                  {responses.length > 0 && (
                    <div className="space-y-1">
                      {responses.map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                          <span>{r.citizen_name || 'Donneur anonyme'}</span>
                          <Badge variant="outline" className="text-xs">
                            {r.status === 'on_the_way' ? 'En route' : r.status === 'arrived' ? 'Arrivé' : 'Annulé'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleResolve(emergency.id)}
                    disabled={resolvingId === emergency.id}
                  >
                    {resolvingId === emergency.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Marquer comme résolu
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {resolvedEmergencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Urgences récentes résolues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {resolvedEmergencies.map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{e.blood_type_needed}</Badge>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Résolu
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
