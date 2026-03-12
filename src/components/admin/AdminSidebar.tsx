import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Shield,
  Megaphone,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Flag,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Code,
  MessageSquare,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  icon: React.ElementType;
  tabValue: string;
  section?: string;
}

const navItems: NavItem[] = [
  { title: 'Tableau de bord', icon: LayoutDashboard, tabValue: 'overview', section: 'main' },
  { title: 'Inscriptions', icon: UserPlus, tabValue: 'inscriptions', section: 'main' },
  { title: 'Vérifications', icon: Shield, tabValue: 'verifications', section: 'main' },
  { title: 'Annonces', icon: Megaphone, tabValue: 'ads', section: 'main' },
  { title: 'Utilisateurs', icon: Users, tabValue: 'users', section: 'main' },
  { title: 'Analytiques', icon: BarChart3, tabValue: 'analytics', section: 'insights' },
  { title: 'Journal d\'audit', icon: FileText, tabValue: 'audit', section: 'insights' },
  { title: 'Signalements', icon: Flag, tabValue: 'reports', section: 'insights' },
  { title: 'Messages contact', icon: MessageSquare, tabValue: 'contact', section: 'main' },
  { title: 'Avis', icon: Star, tabValue: 'reviews', section: 'main' },
  { title: 'Documentation IA', icon: BookOpen, tabValue: 'documentation', section: 'system' },
  { title: 'Gestion API', icon: Code, tabValue: 'api', section: 'system' },
  { title: 'Configuration', icon: Settings, tabValue: 'settings', section: 'system' },
];

const SECTION_LABELS: Record<string, string> = {
  main: 'Principal',
  insights: 'Analyses',
  system: 'Système',
};

interface AdminSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ currentTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const sections = ['main', 'insights', 'system'];

  return (
    <aside
      className={cn(
        'flex flex-col bg-card border-r border-border transition-all duration-200 h-screen sticky top-0',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Brand */}
      <div className={cn(
        'flex items-center h-14 border-b border-border px-3',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground tracking-tight">
            CityHealth Admin
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {sections.map((section, sectionIdx) => {
          const sectionItems = navItems.filter(item => item.section === section);
          return (
            <div key={section} className={cn(sectionIdx > 0 && 'mt-4')}>
              {!collapsed && (
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {SECTION_LABELS[section]}
                </p>
              )}
              {collapsed && sectionIdx > 0 && (
                <div className="mx-2 mb-2 border-t border-border" />
              )}
              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const isActive = currentTab === item.tabValue;
                  const Icon = item.icon;

                  const button = (
                    <button
                      key={item.tabValue}
                      onClick={() => onTabChange(item.tabValue)}
                      className={cn(
                        'w-full flex items-center gap-2.5 rounded-md transition-colors text-left relative',
                        collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Icon className={cn(collapsed ? 'h-4.5 w-4.5' : 'h-4 w-4')} />
                        {item.tabValue === 'contact' && unreadCount > 0 && collapsed && (
                          <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="text-[13px] flex-1">{item.title}</span>
                          {item.tabValue === 'contact' && unreadCount > 0 && (
                            <span className="h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.tabValue} delayDuration={0}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return button;
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
        )}

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? 'icon' : 'default'}
              onClick={handleLogout}
              className={cn(
                'w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-xs',
                collapsed && 'h-8 w-8'
              )}
            >
              <LogOut className="h-3.5 w-3.5" />
              {!collapsed && <span className="ml-2">Déconnexion</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="text-xs">Déconnexion</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
