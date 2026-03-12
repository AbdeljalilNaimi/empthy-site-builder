import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Eye } from 'lucide-react';
import { getConsultationHistory, CardConsultationLog } from '@/services/emergencyCardService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConsultationHistoryProps {
  userId: string;
}

export function ConsultationHistory({ userId }: ConsultationHistoryProps) {
  const [logs, setLogs] = useState<CardConsultationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsultationHistory(userId)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Card className="print:hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Historique des consultations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune consultation enregistrée pour le moment.</p>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{log.provider_name || 'Professionnel'}</span>
                      {log.provider_type && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          {log.provider_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.scanned_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
