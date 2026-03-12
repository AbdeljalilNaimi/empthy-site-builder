import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  BellRing,
  ShieldAlert,
  UserPlus,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  type AdminNotification,
  type AdminNotificationType
} from '@/services/adminNotificationService';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NOTIFICATION_CONFIG: Record<AdminNotificationType, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  verification_revoked: {
    icon: ShieldAlert,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  new_registration: {
    icon: UserPlus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  verification_submitted: {
    icon: FileCheck,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  security_alert: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
  },
  document_uploaded: {
    icon: FileCheck,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  provider_edit: {
    icon: Eye,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
  },
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'border-l-4 border-l-red-500',
  high: 'border-l-4 border-l-amber-500',
  medium: 'border-l-4 border-l-blue-500',
  low: 'border-l-4 border-l-gray-300',
};

interface AdminNotificationsPanelProps {
  onNavigateToProvider?: (providerId: string) => void;
}

export function AdminNotificationsPanel({ onNavigateToProvider }: AdminNotificationsPanelProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'revoked'>('all');

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      (newNotifications) => {
        setNotifications(newNotifications);
        setIsLoading(false);
        setPermissionError(false);
      },
      20,
      (error) => {
        console.error('Notification subscription error:', error);
        setIsLoading(false);
        // Check if it's a permission error
        if (error?.code === 'permission-denied' || 
            error?.message?.includes('permission') || 
            error?.message?.includes('Permission')) {
          setPermissionError(true);
        }
      }
    );

    // Get initial unread count
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0));

    return () => unsubscribe();
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleViewProvider = (notification: AdminNotification) => {
    if (notification.providerId) {
      handleMarkAsRead(notification.id!);
      if (onNavigateToProvider) {
        onNavigateToProvider(notification.providerId);
      } else {
        // Default: navigate to verification tab
        navigate('/admin/dashboard?tab=verifications');
      }
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'revoked') return n.type === 'verification_revoked';
    return true;
  });

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (permissionError) {
    return (
      <Card className="border-amber-500/50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500 mb-3" />
          <h3 className="text-sm font-semibold mb-1">Notifications non disponibles</h3>
          <p className="text-xs text-muted-foreground">
            Connectez-vous en tant qu'administrateur pour voir les notifications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {unreadCount > 0 ? (
                <BellRing className="h-6 w-6 text-primary animate-pulse" />
              ) : (
                <Bell className="h-6 w-6 text-muted-foreground" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle>Notifications Administrateur</CardTitle>
              <CardDescription>
                Alertes importantes concernant les prestataires
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Toutes
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="revoked">
              <ShieldAlert className="h-4 w-4 mr-1" />
              Révocations
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucune notification</p>
                <p className="text-sm">
                  {filter === 'unread' 
                    ? 'Toutes les notifications ont été lues'
                    : filter === 'revoked'
                    ? 'Aucune révocation de vérification'
                    : 'Pas encore de notifications'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const config = NOTIFICATION_CONFIG[notification.type];
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 rounded-lg transition-all cursor-pointer hover:shadow-md',
                        config.bgColor,
                        PRIORITY_STYLES[notification.priority],
                        !notification.isRead && 'ring-2 ring-primary/20'
                      )}
                      onClick={() => handleViewProvider(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-full', config.bgColor)}>
                          <Icon className={cn('h-5 w-5', config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs px-1.5 py-0">
                                Nouveau
                              </Badge>
                            )}
                            {notification.priority === 'urgent' && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                Urgent
                              </Badge>
                            )}
                            {notification.priority === 'high' && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0 border-amber-500 text-amber-600">
                                Important
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(notification.createdAt)}
                            </span>
                            
                            {notification.providerId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProvider(notification);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Voir le profil
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
