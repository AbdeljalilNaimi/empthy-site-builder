import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, LogOut, Settings, User as UserIcon, Calendar, Bot, Stethoscope, Sparkles,
  MapPin, Phone, Heart, Search, ChevronDown, Droplet, AlertTriangle, Home, Info, HelpCircle, UserPlus, Building2, Shield, Users, HeartPulse, Globe, Check,
  HeartHandshake, FileText, Megaphone, BookOpen, Sun, Moon
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface NavSection {
  label: string;
  items: {
    label: string;
    href: string;
    icon: typeof Home;
    description?: string;
    isDestructive?: boolean;
  }[];
}

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { profile, isAuthenticated, logout, isAdmin, isProvider: isProviderAuth, isCitizen } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'FR', fullName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'AR', fullName: 'العربية', flag: '🇩🇿' },
    { code: 'en', name: 'EN', fullName: 'English', flag: '🇬🇧' },
  ];
  
  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const userInitials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const isProvider = isProviderAuth || profile?.roles?.includes('provider');
  
  // Helper to get correct profile path based on user type
  const getProfilePath = () => {
    if (isAdmin) return '/admin/profile';
    if (isProvider) return '/provider/profile';
    return '/profile';
  };

  // Translations for nav sections
  const tx = {
    fr: {
      discover: 'Découvrir',
      services: 'Services',
      emergency: 'Urgences',
      pro: 'Pro',
      home: 'Accueil',
      why: 'Pourquoi CityHealth',
      how: 'Comment ça marche',
      map: 'Carte interactive',
      search: 'Rechercher',
      aiAssistant: 'Assistant IA',
      bloodDonation: 'Don de sang',
      emergencyServices: 'Services d\'urgence',
      emergencyCall: 'Appeler le 15',
      providerRegister: 'Devenir prestataire',
      providerDashboard: 'Espace praticien',
      mapDesc: 'Tous les prestataires de santé',
      searchDesc: 'Recherche par spécialité',
      aiDesc: 'Conseils santé personnalisés',
      bloodDesc: 'Centres de don et urgences',
      emergencyDesc: 'Hôpitaux 24/7',
      providerDesc: 'Rejoignez notre réseau',
      dashboardDesc: 'Gérez vos rendez-vous',
      communityAid: 'Don Gratuit',
      communityAidDesc: 'Aide communautaire gratuite',
      announcements: 'Annonces',
      announcementsDesc: 'Offres des professionnels',
      research: 'Recherche Médicale',
      researchDesc: 'Articles et publications',
      documentation: 'Documentation',
      documentationDesc: 'Guides et ressources'
    },
    ar: {
      discover: 'اكتشف',
      services: 'الخدمات',
      emergency: 'الطوارئ',
      pro: 'للمحترفين',
      home: 'الرئيسية',
      why: 'لماذا CityHealth',
      how: 'كيف يعمل',
      map: 'الخريطة التفاعلية',
      search: 'البحث',
      aiAssistant: 'المساعد الذكي',
      bloodDonation: 'التبرع بالدم',
      emergencyServices: 'خدمات الطوارئ',
      emergencyCall: 'اتصل بـ 15',
      providerRegister: 'كن مقدم خدمة',
      providerDashboard: 'لوحة المقدم',
      mapDesc: 'جميع مقدمي الرعاية الصحية',
      searchDesc: 'بحث حسب التخصص',
      aiDesc: 'نصائح صحية مخصصة',
      bloodDesc: 'مراكز التبرع والطوارئ',
      emergencyDesc: 'مستشفيات 24/7',
      providerDesc: 'انضم إلى شبكتنا',
      dashboardDesc: 'إدارة مواعيدك',
      communityAid: 'تبرع مجاني',
      communityAidDesc: 'مساعدة مجتمعية مجانية',
      announcements: 'الإعلانات',
      announcementsDesc: 'عروض المهنيين',
      research: 'البحث الطبي',
      researchDesc: 'مقالات ومنشورات',
      documentation: 'التوثيق',
      documentationDesc: 'أدلة وموارد'
    },
    en: {
      discover: 'Discover',
      services: 'Services',
      emergency: 'Emergency',
      pro: 'Pro',
      home: 'Home',
      why: 'Why CityHealth',
      how: 'How it works',
      map: 'Interactive Map',
      search: 'Search',
      aiAssistant: 'AI Assistant',
      bloodDonation: 'Blood Donation',
      emergencyServices: 'Emergency Services',
      emergencyCall: 'Call 15',
      providerRegister: 'Become a provider',
      providerDashboard: 'Provider Dashboard',
      mapDesc: 'All healthcare providers',
      searchDesc: 'Search by specialty',
      aiDesc: 'Personalized health advice',
      bloodDesc: 'Donation centers',
      emergencyDesc: 'Hospitals 24/7',
      providerDesc: 'Join our network',
      dashboardDesc: 'Manage appointments',
      communityAid: 'Community Aid',
      communityAidDesc: 'Free community help',
      announcements: 'Announcements',
      announcementsDesc: 'Professional offers',
      research: 'Medical Research',
      researchDesc: 'Articles and publications',
      documentation: 'Documentation',
      documentationDesc: 'Guides and resources'
    }
  };

  const texts = tx[language as keyof typeof tx] || tx.fr;

  const navSections: NavSection[] = [
    {
      label: texts.discover,
      items: [
        { label: texts.home, href: '/', icon: Home },
        { label: texts.why, href: '/why', icon: Info },
        { label: texts.how, href: '/how', icon: HelpCircle },
        { label: texts.documentation, href: '/docs', icon: FileText, description: texts.documentationDesc },
      ]
    },
    {
      label: texts.services,
      items: [
        { label: texts.map, href: '/map/providers', icon: MapPin, description: texts.mapDesc },
        { label: texts.search, href: '/search', icon: Search, description: texts.searchDesc },
        { label: texts.aiAssistant, href: '/medical-assistant', icon: Bot, description: texts.aiDesc },
        { label: texts.bloodDonation, href: '/blood-donation', icon: Droplet, description: texts.bloodDesc },
        { label: texts.communityAid, href: '/citizen/provide', icon: HeartHandshake, description: texts.communityAidDesc },
        { label: texts.announcements, href: '/annonces', icon: Megaphone, description: texts.announcementsDesc },
        { label: texts.research, href: '/research', icon: BookOpen, description: texts.researchDesc },
      ]
    },
    {
      label: texts.emergency,
      items: [
        { label: texts.emergencyServices, href: '/map/emergency', icon: AlertTriangle, description: texts.emergencyDesc },
        { label: texts.emergencyCall, href: 'tel:15', icon: Phone, isDestructive: true },
      ]
    },
    {
      label: texts.pro,
      items: [
        { label: texts.providerRegister, href: '/provider/register', icon: UserPlus, description: texts.providerDesc },
        { label: texts.providerDashboard, href: '/provider/dashboard', icon: Building2, description: texts.dashboardDesc },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  const NavDropdown = ({ section }: { section: NavSection }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center gap-1 h-9 px-3",
            section.items.some(item => isActive(item.href)) && "bg-primary/10 text-primary"
          )}
        >
          {section.label}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur-lg">
        {section.items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            {item.href.startsWith('tel:') ? (
              <a href={item.href} className="flex items-center gap-3 cursor-pointer">
                <item.icon className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">{item.label}</span>
              </a>
            ) : (
              <Link to={item.href} className="flex items-center gap-3 cursor-pointer">
                <item.icon className={cn("h-4 w-4", isActive(item.href) && "text-primary")} />
                <div>
                  <div className={cn("font-medium", isActive(item.href) && "text-primary")}>{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  )}
                </div>
              </Link>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Skip to main content - Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
      >
        {t('admin', 'skipToContent')}
      </a>
      
      <header className={cn(
        "sticky top-0 z-[60] w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60",
        isRTL && "rtl"
      )}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
          aria-label="CityHealth Home"
        >
          {/* Logo Container avec effets premium */}
          <div className="relative">
            {/* Ring animé externe */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-primary/60 to-primary opacity-0 blur-md group-hover:opacity-75 transition-all duration-500" />
            
            {/* Container principal */}
            <div className="relative w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/20 transition-all duration-300">
              {/* Effet de brillance interne */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
              
              {/* Icône principale */}
              <HeartPulse className="h-6 w-6 text-primary-foreground drop-shadow-md relative z-10 group-hover:animate-heartbeat" />
              
              {/* Indicateur en ligne */}
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background shadow-lg">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
              </span>
            </div>
          </div>
          
          {/* Texte du logo avec typographie premium */}
          <div className="hidden sm:flex flex-col -space-y-0.5">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-foreground">City</span>
              <span className="text-primary">Health</span>
            </span>
            <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-medium">
              Sidi Bel Abbès
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Sections with Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navSections.map((section) => (
            <NavDropdown key={section.label} section={section} />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Emergency Button - Always visible with pulse */}
          <Button
            variant="destructive"
            size="sm"
            className="hidden md:flex items-center gap-2 relative"
            asChild
          >
            <a href="tel:15">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full" />
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">{texts.emergency} 24/7</span>
              <span className="lg:hidden">15</span>
            </a>
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/10 transition-all duration-300"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-yellow-400 transition-transform duration-300 rotate-0" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground transition-transform duration-300" />
            )}
          </Button>

          {/* Language Selector Premium */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl 
                           bg-gradient-to-r from-muted/50 to-muted/30 
                           hover:from-primary/10 hover:to-primary/5 
                           border border-border/50 hover:border-primary/30
                           transition-all duration-300 group/lang
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Select language"
              >
                {/* Globe icon with animation */}
                <div className="relative">
                  <Globe className="h-4 w-4 text-muted-foreground group-hover/lang:text-primary transition-colors group-hover/lang:animate-spin-slow" />
                </div>
                
                {/* Flag + Code */}
                <span className="flex items-center gap-1.5">
                  <span className="text-base">{currentLang.flag}</span>
                  <span className="hidden lg:inline text-foreground/80 group-hover/lang:text-foreground transition-colors">
                    {currentLang.name}
                  </span>
                </span>
                
                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/lang:text-primary transition-all duration-300 group-hover/lang:rotate-180" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-lg border-border/50 min-w-[160px] z-50">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as 'fr' | 'ar' | 'en')}
                  className={cn(
                    "cursor-pointer flex items-center gap-3 py-2.5",
                    language === lang.code && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.fullName}</span>
                  {language === lang.code && (
                    <Check className="h-4 w-4 ml-auto text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification Center */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
          )}

          {/* User Menu or Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{profile?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-popover/95 backdrop-blur-lg">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                          <Shield className="h-3 w-3" />
                          {t('roles', 'administrator')}
                        </span>
                      )}
                      {isProvider && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                          <Stethoscope className="h-3 w-3" />
                          {t('roles', 'practitioner')}
                        </span>
                      )}
                      {isCitizen && !isAdmin && !isProvider && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">
                          <Users className="h-3 w-3" />
                          {t('roles', 'citizen')}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-0" />
                  <DropdownMenuItem asChild>
                    <Link to={getProfilePath()} className="cursor-pointer">
                      <UserIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                      {t('header', 'profile')}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <Settings className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        {t('admin', 'administration')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Heart className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                      {t('admin', 'favorites')}
                    </Link>
                  </DropdownMenuItem>
                  {profile?.roles.includes('patient') && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <Calendar className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        {t('admin', 'dashboard')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isProvider && (
                    <DropdownMenuItem asChild>
                      <Link to="/provider/dashboard" className="cursor-pointer">
                        <Stethoscope className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        {t('admin', 'providerSpace')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive">
                        <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        {t('header', 'logout')}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('admin', 'confirmLogout')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('admin', 'confirmLogoutDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t('admin', 'cancelLabel')}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={logout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t('admin', 'logoutAction')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/citizen/login')}
                >
                  {t('header', 'signin')}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate('/citizen/login')}
                >
                  {t('header', 'signup')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                aria-label="Open mobile menu"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'left' : 'right'} className="w-[300px] bg-background/95 backdrop-blur-lg">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  CityHealth
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-6 mt-6" role="navigation" aria-label="Mobile navigation">
                {navSections.map((section) => (
                  <div key={section.label}>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {section.label}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        item.href.startsWith('tel:') ? (
                          <a
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </a>
                        ) : (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                              isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Mobile Language Selector Premium */}
                {/* Dark Mode Toggle - Mobile */}
                <div className="border-t border-border/40 pt-4">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-300"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>

                {/* Language Selector - Mobile */}
                <div className="border-t border-border/40 pt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl 
                                   bg-gradient-to-r from-muted/50 to-muted/30 
                                   hover:from-primary/10 hover:to-primary/5 
                                   border border-border/50 hover:border-primary/30
                                   transition-all duration-300 group/lang"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground group-hover/lang:text-primary transition-colors" />
                        <span className="text-lg">{currentLang.flag}</span>
                        <span className="font-medium">{currentLang.fullName}</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/lang:text-primary transition-all duration-300 group-hover/lang:rotate-180 ml-auto" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-popover/95 backdrop-blur-lg border-border/50 min-w-[160px]">
                      {languages.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onClick={() => setLanguage(lang.code as 'fr' | 'ar' | 'en')}
                          className={cn(
                            "cursor-pointer flex items-center gap-3 py-2.5",
                            language === lang.code && "bg-primary/10 text-primary"
                          )}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.fullName}</span>
                          {language === lang.code && (
                            <Check className="h-4 w-4 ml-auto text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Auth */}
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <UserIcon className="h-4 w-4 mr-2" />
                          {t('header', 'profile')}
                        </Link>
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('header', 'logout')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => { 
                          navigate('/citizen/login');
                          setMobileMenuOpen(false); 
                        }}
                      >
                        {t('header', 'signin')}
                      </Button>
                      <Button 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                        onClick={() => { 
                          navigate('/citizen/login');
                          setMobileMenuOpen(false); 
                        }}
                      >
                        {t('header', 'signup')}
                      </Button>
                    </>
                  )}
                </div>

                {/* Emergency Button in Mobile */}
                <a
                  href="tel:15"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium"
                >
                  <Phone className="h-5 w-5" />
                  {texts.emergencyCall}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  );
};
