import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Shield, Heart, LayoutDashboard, Users, Globe, Check, Stethoscope, Search, Map, Siren, Bot, Droplets, UserPlus, BookOpen, Mail, LogOut, MessageSquare, FileText, ArrowRight, Megaphone, ArrowLeft, Sun, Moon, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/ui/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type MenuKey = 'services' | 'pro' | 'resources';

interface MegaMenuItem {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const AntigravityHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [serviceCategory, setServiceCategory] = useState<'soins' | 'communaute'>('soins');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, profile, isProvider, isAdmin, isCitizen } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMenu(null);
  }, [location.pathname]);

  const handleMenuEnter = useCallback((menu: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  }, []);

  const handleMenuLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 220);
  }, []);

  const handlePanelEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handlePanelLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 220);
  }, []);

  // Data
  const soinsItems: MegaMenuItem[] = [
    { label: t('footer', 'searchDoctors'), description: 'Trouvez un médecin près de chez vous', href: '/search', icon: Search },
    { label: t('footer', 'interactiveMap'), description: 'Explorez les établissements de santé', href: '/map/providers', icon: Map },
    { label: t('footer', 'emergency247'), description: 'Accès rapide aux urgences', href: '/map/emergency', icon: Siren },
    { label: t('footer', 'aiAssistant'), description: 'Posez vos questions de santé', href: '/medical-assistant', icon: Bot },
    { label: language === 'ar' ? 'الإعلانات' : language === 'en' ? 'Announcements' : 'Annonces', description: language === 'ar' ? 'عروض المهنيين' : language === 'en' ? 'Professional offers' : 'Offres des professionnels', href: '/annonces', icon: Megaphone },
    { label: language === 'ar' ? 'البحث الطبي' : language === 'en' ? 'Medical Research' : 'Recherche Médicale', description: language === 'ar' ? 'مقالات ومنشورات علمية' : language === 'en' ? 'Articles and publications' : 'Articles et publications scientifiques', href: '/research', icon: BookOpen },
  ];

  const communauteItems: MegaMenuItem[] = [
    { label: t('footer', 'bloodDonation'), description: 'Donnez votre sang, sauvez des vies', href: '/blood-donation', icon: Droplets },
    { label: t('offers', 'freeDonations'), description: 'Offrez ou recevez gratuitement', href: '/citizen/provide', icon: Heart },
  ];

  const providerItems: MegaMenuItem[] = [
    { label: t('footer', 'becomePartner'), description: 'Inscrivez votre établissement', href: '/provider/register', icon: UserPlus },
    { label: t('footer', 'providerDashboard'), description: 'Gérez votre profil et rendez-vous', href: '/provider/dashboard', icon: LayoutDashboard },
    { label: language === 'ar' ? 'الأسعار' : language === 'en' ? 'Pricing' : 'Tarifs', description: language === 'ar' ? 'اكتشف عروضنا' : language === 'en' ? 'Discover our plans' : 'Découvrez nos forfaits', href: '/#pricing', icon: FileText },
    { label: language === 'ar' ? 'بوابة المطورين' : language === 'en' ? 'Developer Portal' : 'Portail développeur', description: language === 'ar' ? 'API وأدوات التكامل' : language === 'en' ? 'API & integration tools' : 'API & outils d\'intégration', href: '/developers', icon: BookOpen },
  ];

  const resourceItems: MegaMenuItem[] = [
    { label: t('community', 'headerLink'), description: 'Échangez avec la communauté', href: '/community', icon: MessageSquare },
    { label: t('footer', 'documentation'), description: 'Guides et documentation complète', href: '/docs', icon: FileText },
    { label: t('footer', 'contact'), description: 'Contactez notre équipe', href: '/contact', icon: Mail },
  ];

  const servicesLinks = [...soinsItems, ...communauteItems];
  const resourcesLinks = resourceItems;
  const providerLinks = providerItems;

  const languages = [
    { code: 'fr', name: 'FR', fullName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'AR', fullName: 'العربية', flag: '🇩🇿' },
    { code: 'en', name: 'EN', fullName: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Mega-menu item renderer
  const MegaItem = ({ item }: { item: MegaMenuItem }) => {
    const handleClick = (e: React.MouseEvent) => {
      if (item.href.includes('#')) {
        e.preventDefault();
        const [path, hash] = item.href.split('#');
        setActiveMenu(null);
        setIsMobileMenuOpen(false);
        if (location.pathname === (path || '/')) {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate(path || '/');
          setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      }
    };

    return (
      <Link
        to={item.href}
        onClick={handleClick}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors group/item"
      >
        <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/15 transition-colors">
          <item.icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{item.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
        </div>
      </Link>
    );
  };

  // Nav trigger button
  const NavTrigger = ({ label, menuKey }: { label: string; menuKey: MenuKey }) => (
    <button
      onMouseEnter={() => handleMenuEnter(menuKey)}
      aria-expanded={activeMenu === menuKey}
      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {label}
      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 rtl-flip ${activeMenu === menuKey ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg border-b border-border/30 transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex items-center h-16">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {location.pathname !== '/' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                aria-label={language === 'ar' ? 'العودة' : language === 'en' ? 'Back' : 'Retour'}
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </Button>
            )}
            <Logo size="md" showText={true} showOnlineIndicator={true} />
          </div>

          {/* Center: Navigation */}
          <nav
            className="hidden lg:flex flex-1 h-full items-center justify-center gap-1"
            role="navigation"
            onMouseLeave={handleMenuLeave}
          >
            <NavTrigger label={t('footer', 'services')} menuKey="services" />
            <NavTrigger label={t('footer', 'professionals')} menuKey="pro" />
            <NavTrigger label={t('footer', 'resources')} menuKey="resources" />
            <Link
              to="/map/emergency"
              className="px-4 py-2 text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors rounded-lg hover:bg-destructive/5"
            >
              {t('nav', 'emergency')}
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Dark Mode Toggle */}
            <div className="hidden md:block">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center h-9 w-9 rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/50 hover:border-primary/30 transition-all duration-300"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Language Selector */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/50 hover:border-border transition-all group/lang focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Globe className="h-4 w-4 text-muted-foreground group-hover/lang:text-foreground transition-colors" />
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">{currentLang.flag}</span>
                      <span className="hidden sm:inline text-foreground/80">{currentLang.name}</span>
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-lg border-border/50 min-w-[160px]">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`cursor-pointer flex items-center gap-3 py-2.5 ${language === lang.code ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.fullName}</span>
                      {language === lang.code && <Check className="h-4 w-4 ml-auto text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Auth Section */}
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{user.email?.[0]?.toUpperCase()}</span>
                      </div>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-popover/95 backdrop-blur-lg">
                    <div className="px-3 py-2.5 border-b border-border/50 mb-1">
                      <p className="text-sm font-medium truncate">{profile?.full_name || user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                            <Shield className="h-3 w-3" />{t('roles', 'administrator')}
                          </span>
                        )}
                        {isProvider && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                            <Stethoscope className="h-3 w-3" />{t('roles', 'practitioner')}
                          </span>
                        )}
                        {isCitizen && !isAdmin && !isProvider && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">
                            <Users className="h-3 w-3" />{t('roles', 'citizen')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenuItem asChild>
                      <Link to={isAdmin ? '/admin/profile' : isProvider ? '/provider/profile' : '/profile'} className="cursor-pointer">
                        {t('header', 'profile')}
                      </Link>
                    </DropdownMenuItem>
                    
                    {isProvider && (
                      <DropdownMenuItem asChild>
                        <Link to="/provider/dashboard" className="cursor-pointer flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />{t('footer', 'providerDashboard')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="cursor-pointer flex items-center gap-2">
                          <Shield className="h-4 w-4" />{t('footer', 'administration')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {isCitizen && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/favorites" className="cursor-pointer flex items-center gap-2">
                            <Heart className="h-4 w-4" />{t('footer', 'myFavorites')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/citizen/dashboard" className="cursor-pointer flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />{t('footer', 'dashboard')}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      {t('header', 'logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => navigate('/citizen/login')}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 py-2"
                >
                  {t('header', 'signin')}
                </button>
              )}
            </div>

            {/* CTA Button — ghost/outline style */}
            <button
              onClick={() => navigate('/search')}
              className="hidden md:flex items-center gap-2 ml-1 px-5 py-2 text-sm font-medium border border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary rounded-lg transition-all duration-200"
            >
              {t('footer', 'findDoctor')}
            </button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t('footer', 'openMenu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ===== MEGA-MENU PANELS ===== */}
      {activeMenu && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full z-50"
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
        >
          <div className="max-w-7xl mx-auto px-8 lg:px-12 pt-0 pb-4">
            {/* Services Mega-Menu */}
            {activeMenu === 'services' && (
              <div className="animate-mega-enter bg-popover border border-border/40 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl overflow-hidden">
                <div className="flex">
                  {/* Left sidebar — category tabs */}
                  <div className="w-52 bg-muted/30 border-r border-border/30 p-4 flex flex-col gap-1">
                    <button
                      onClick={() => setServiceCategory('soins')}
                      className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        serviceCategory === 'soins'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      🏥 Soins & Recherche
                    </button>
                    <button
                      onClick={() => setServiceCategory('communaute')}
                      className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        serviceCategory === 'communaute'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      🤝 Communauté & Aide
                    </button>
                  </div>

                  {/* Center grid */}
                  <div className="flex-1 p-5">
                    <div className="grid grid-cols-2 gap-1">
                      {(serviceCategory === 'soins' ? soinsItems : communauteItems).map((item) => (
                        <MegaItem key={item.href} item={item} />
                      ))}
                    </div>
                  </div>

                  {/* Right highlight — Urgences */}
                  <div className="w-64 p-5 flex items-stretch">
                    <div className="w-full bg-destructive/5 border border-destructive/10 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-3">
                          <Siren className="h-5 w-5 text-destructive" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground">Urgences 24/7</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Trouvez les urgences les plus proches en temps réel.
                        </p>
                      </div>
                      <Link
                        to="/map/emergency"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                      >
                        Accéder aux urgences <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professionnels Mega-Menu */}
            {activeMenu === 'pro' && (
              <div className="animate-mega-enter bg-popover border border-border/40 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl overflow-hidden max-w-2xl mx-auto">
                <div className="flex">
                  <div className="flex-1 p-5">
                    <div className="grid grid-cols-2 gap-1">
                      {providerItems.map((item) => (
                        <MegaItem key={item.href} item={item} />
                      ))}
                    </div>
                  </div>
                  <div className="w-56 p-5 flex items-stretch">
                    <div className="w-full bg-primary/5 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                          <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground">Rejoindre CityHealth</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Référencez votre établissement et touchez plus de patients.
                        </p>
                      </div>
                      <Link
                        to="/provider/register"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        S'inscrire <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ressources Mega-Menu */}
            {activeMenu === 'resources' && (
              <div className="animate-mega-enter bg-popover border border-border/40 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl overflow-hidden max-w-2xl mx-auto">
                <div className="flex">
                  <div className="flex-1 p-5">
                    <div className="grid grid-cols-2 gap-1">
                      {resourceItems.map((item) => (
                        <MegaItem key={item.href} item={item} />
                      ))}
                    </div>
                  </div>
                  <div className="w-56 p-5 flex items-stretch">
                    <div className="w-full bg-primary/5 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground">Documentation complète</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Guides, tutoriels et ressources pour les utilisateurs.
                        </p>
                      </div>
                      <Link
                        to="/docs"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        Explorer <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MOBILE SHEET MENU (unchanged) ===== */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
            <SheetTitle className="flex items-center gap-3">
              <Logo size="sm" showText={true} />
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="py-4">
              {/* Services */}
              <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('footer', 'services')}
              </div>
              {servicesLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-3 px-6 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  {link.label}
                </Link>
              ))}

              <Separator className="my-3" />

              {/* Professionals */}
              <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('footer', 'professionals')}
              </div>
              {providerLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-3 px-6 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  {link.label}
                </Link>
              ))}

              <Separator className="my-3" />

              {/* Resources */}
              <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('footer', 'resources')}
              </div>
              {resourcesLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-3 px-6 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  {link.label}
                </Link>
              ))}

              <Separator className="my-3" />

              {/* Emergency */}
              <Link
                to="/map/emergency"
                className="flex items-center gap-3 px-6 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Siren className="h-4 w-4" />
                🚨 {t('nav', 'emergency')} 24/7
              </Link>

              <Separator className="my-3" />

              {/* Dark Mode Toggle - Mobile */}
              <div className="px-4">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              <Separator className="my-3" />

              {/* Language selector */}
              <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Langue / Language
              </div>
              <div className="px-4 flex gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted/50 text-foreground/70'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>

              <Separator className="my-3" />

              {/* Auth section */}
              {user ? (
                <div className="px-6 space-y-1">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{user.email?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile?.full_name || user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to={isAdmin ? '/admin/profile' : isProvider ? '/provider/profile' : '/profile'}
                    className="flex items-center gap-3 px-2 py-2.5 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {t('header', 'profile')}
                  </Link>

                  {isProvider && (
                    <Link
                      to="/provider/dashboard"
                      className="flex items-center gap-3 px-2 py-2.5 text-sm text-primary font-medium hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Stethoscope className="h-4 w-4" />
                      {t('footer', 'providerDashboard')}
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-2 py-2.5 text-sm text-destructive font-medium hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      {t('footer', 'administration')}
                    </Link>
                  )}

                  {isCitizen && (
                    <>
                      <Link
                        to="/favorites"
                        className="flex items-center gap-3 px-2 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        {t('footer', 'myFavorites')}
                      </Link>
                      <Link
                        to="/citizen/dashboard"
                        className="flex items-center gap-3 px-2 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        {t('footer', 'dashboard')}
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-2 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('header', 'logout')}
                  </button>
                </div>
              ) : (
                <div className="px-6 space-y-2">
                  <Button
                    onClick={() => {
                      navigate('/citizen/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    {t('header', 'signin')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/search');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('footer', 'findDoctor')}
                  </Button>
                </div>
              )}

              {/* Provider CTA restored at bottom */}
              <div className="px-6 mt-5">
                <div className="rounded-xl border border-border/60 bg-muted/35 p-4">
                  <p className="text-sm font-semibold text-foreground">Vous êtes un professionnel de santé ?</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Rejoignez CityHealth et développez votre présence locale à Sidi Bel Abbès.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => {
                      navigate('/provider/register');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Inscrire mon établissement
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </header>
  );
};
