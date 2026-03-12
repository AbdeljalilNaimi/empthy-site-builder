import { useState } from 'react';
import { Bell, User, Settings, LogOut, CheckCheck, Flag, UserPlus, Shield, Megaphone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRealtimeNotifications, type RealtimeEvent } from '@/hooks/useAdminRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdminHeaderProps {
  title: string;
  notificationCount?: number;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  new_registration: <UserPlus className="h-3.5 w-3.5 text-primary" />,
  new_report_provider: <Flag className="h-3.5 w-3.5 text-destructive" />,
  new_report_ad: <Megaphone className="h-3.5 w-3.5 text-amber-500" />,
  new_report_community: <MessageSquare className="h-3.5 w-3.5 text-orange-500" />,
  firestore_notification: <Bell className="h-3.5 w-3.5 text-primary" />,
  verification_revoked: <Shield className="h-3.5 w-3.5 text-destructive" />,
  verification_submitted: <Shield className="h-3.5 w-3.5 text-green-500" />,
};

function NotificationItem({ notification, onRead }: { notification: RealtimeEvent; onRead: () => void }) {
  const icon = NOTIFICATION_ICONS[notification.type] || <Bell className="h-3.5 w-3.5 text-muted-foreground" />;
  const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr });

  return (
    <button
      onClick={onRead}
      className={`w-full flex items-start gap-2.5 p-2.5 text-left transition-colors hover:bg-muted/50 rounded-md ${
        !notification.isRead ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex-shrink-0 mt-0.5 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-foreground leading-tight`}>
          {notification.title}
        </p>
        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{timeAgo}</p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
      )}
    </button>
  );
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminRealtimeNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-14 px-6">
        <h1 className="text-base font-semibold text-foreground tracking-tight">{title}</h1>

        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-muted-foreground" onClick={markAllAsRead}>
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Tout lire
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-[320px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-6 w-6 mb-1.5 opacity-20" />
                    <p className="text-xs">Aucune notification</p>
                  </div>
                ) : (
                  <div className="p-1.5 space-y-0.5">
                    {notifications.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onRead={() => markAsRead(notif.id, notif.source)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="py-1.5">
                <p className="text-xs font-medium">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground font-normal">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/profile')} className="text-xs">
                <User className="mr-2 h-3.5 w-3.5" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="text-xs">
                <Settings className="mr-2 h-3.5 w-3.5" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-xs text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
