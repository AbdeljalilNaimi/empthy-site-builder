import { Bell, Check, Settings, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppointmentNotifications, type AppointmentNotification } from '@/hooks/useAppointmentNotifications';
import { useRealtimePatientAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotificationCenter = () => {
  const { isCitizen } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    preferences,
    permission,
    requestPermission 
  } = useNotifications();

  // Appointment notifications for citizens
  const { appointments } = useRealtimePatientAppointments();
  const { 
    notifications: aptNotifications, 
    unreadCount: aptUnreadCount, 
    markAsRead: markAptAsRead, 
    markAllAsRead: markAllAptAsRead 
  } = useAppointmentNotifications(isCitizen ? appointments : [], preferences.appointments);

  const totalUnread = unreadCount + aptUnreadCount;

  const handleMarkAllRead = () => {
    markAllAsRead();
    markAllAptAsRead();
  };

  const getAptStatusIcon = (status: string) => {
    if (status === 'confirmed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'cancelled') return <XCircle className="h-4 w-4 text-destructive" />;
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-primary" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const getAptStatusLabel = (status: string) => {
    const labels: Record<string, string> = { confirmed: 'Confirmé', cancelled: 'Annulé', completed: 'Terminé', pending: 'En attente' };
    return labels[status] || status;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${totalUnread > 0 ? ` (${totalUnread} non lues)` : ''}`}>
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
              aria-hidden="true"
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" role="region" aria-label="Centre de notifications">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-2">
            {totalUnread > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                <Check className="h-4 w-4 mr-1" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>

        {permission !== 'granted' && (
          <div className="p-4 bg-muted/50 border-b">
            <p className="text-sm mb-2">Activez les notifications push</p>
            <Button size="sm" onClick={requestPermission} className="w-full">
              Activer les notifications
            </Button>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          <div role="status" aria-live="polite" className="sr-only">
            {totalUnread > 0 ? `${totalUnread} nouvelles notifications` : 'Aucune nouvelle notification'}
          </div>
          
          {notifications.length === 0 && aptNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" aria-hidden="true" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y" role="list" aria-label="Liste des notifications">
              {/* Appointment notifications first */}
              {aptNotifications.map((notif) => (
                <div
                  key={`apt-${notif.id}`}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => markAptAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAptStatusIcon(notif.newStatus)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <p className="font-medium text-sm">RDV {getAptStatusLabel(notif.newStatus)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rendez-vous avec {notif.providerName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Generic notifications */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) window.location.href = notification.link;
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <p className="font-medium text-sm">{notification.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      aria-label="Delete notification"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
