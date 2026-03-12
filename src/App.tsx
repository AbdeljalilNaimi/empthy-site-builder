import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProviderProvider } from "@/contexts/ProviderContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProviderRouteGuard } from "@/components/ProviderRouteGuard";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { CitizenGuard } from "@/components/guards/CitizenGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AntigravityHeader } from "./components/AntigravityHeader";
import BackToTop from "./components/BackToTop";

// Conditional header - hidden on pages with their own navigation
const ConditionalHeader = () => {
  const location = useLocation();
  const hiddenPrefixes = ['/admin/dashboard', '/provider/dashboard', '/docs', '/map/', '/admin/login', '/provider/login', '/citizen/login', '/citizen/register', '/provider/register', '/email-verified', '/developers/login', '/developers/register', '/developers/dashboard', '/developers/profile', '/forgot-password', '/reset-password'];
  const shouldHide = hiddenPrefixes.some(p => location.pathname.startsWith(p));
  if (shouldHide) return null;
  return <AntigravityHeader />;
};

// Lazy-load heavy pages for better LCP
const AntigravityIndex = lazy(() => import("./pages/AntigravityIndex"));
const MapMother = lazy(() => import("./components/map/MapMother"));
const ProvidersMapChild = lazy(() => import("./components/map/children/ProvidersMapChild"));
const EmergencyMapChild = lazy(() => import("./components/map/children/EmergencyMapChild"));
const BloodMapChild = lazy(() => import("./components/map/children/BloodMapChild"));

import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded pages for code splitting
const CitizenLoginPage = lazy(() => import("./pages/CitizenLoginPage"));
const CitizenRegisterPage = lazy(() => import("./pages/CitizenRegisterPage"));
const ProviderLoginPage = lazy(() => import("./pages/ProviderLoginPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const ProviderProfilePage = lazy(() => import("./pages/ProviderProfilePage"));
const ProviderOwnProfilePage = lazy(() => import("./pages/ProviderOwnProfilePage"));
const ProviderRegister = lazy(() => import("./pages/ProviderRegister"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));

const RegistrationStatus = lazy(() => import("./pages/RegistrationStatus"));
const RegistrationThankYou = lazy(() => import("./pages/RegistrationThankYou"));
const MedicalAssistantPage = lazy(() => import("./pages/MedicalAssistantPage"));
const CitizenProfilePage = lazy(() => import("./pages/CitizenProfilePage"));
const BloodDonationPage = lazy(() => import("./pages/BloodDonationPage"));
const AdminMigratePage = lazy(() => import("./pages/AdminMigratePage"));
const AdminProfilePage = lazy(() => import("./pages/AdminProfilePage"));
const DocsPage = lazy(() => import("./pages/DocsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const TarifsPage = lazy(() => import("./pages/TarifsPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const EmergencyCardPublicPage = lazy(() => import("./pages/EmergencyCardPublicPage"));
const CitizenAppointmentsPage = lazy(() => import("./pages/citizen/appointments/CitizenAppointmentsPage"));
const AppointmentHistoryPage = lazy(() => import("./pages/citizen/appointments/AppointmentHistoryPage"));
const NewAppointmentPage = lazy(() => import("./pages/citizen/appointments/NewAppointmentPage"));
const ProvideListPage = lazy(() => import("./pages/citizen/provide/ProvideListPage"));
const MyOffersPage = lazy(() => import("./pages/citizen/provide/MyOffersPage"));
const CreateOfferPage = lazy(() => import("./pages/citizen/provide/CreateOfferPage"));
const EditOfferPage = lazy(() => import("./pages/citizen/provide/EditOfferPage"));
const DevToolsPage = lazy(() => import("./pages/DevToolsPage"));
const ProviderWelcomePage = lazy(() => import("./pages/ProviderWelcomePage"));
const AdsPage = lazy(() => import("./pages/AdsPage"));
const ResearchHubPage = lazy(() => import("./pages/ResearchHubPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const EmailVerifiedPage = lazy(() => import("./pages/EmailVerifiedPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DeveloperLandingPage = lazy(() => import("./pages/developers/DeveloperLandingPage"));
const DeveloperDashboardPage = lazy(() => import("./pages/developers/DeveloperDashboardPage"));
const DeveloperDocsPage = lazy(() => import("./pages/developers/DeveloperDocsPage"));
const DeveloperLoginPage = lazy(() => import("./pages/developers/DeveloperLoginPage"));
const DeveloperRegisterPage = lazy(() => import("./pages/developers/DeveloperRegisterPage"));
const DeveloperProfilePage = lazy(() => import("./pages/developers/DeveloperProfilePage"));
const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      {children}
    </div>
  );
};


// Verification redirect wrapper for providers
const VerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Check if user is a provider with pending verification
  const isPendingProvider = isAuthenticated && 
    profile?.userType === 'provider' && 
    profile?.verification_status === 'pending';
  
  // Allowed paths for pending providers
  const allowedPaths = ['/registration-status', '/provider/register', '/provider/login', '/citizen/login', '/admin/login', '/'];
  const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
  
  if (isPendingProvider && !isAllowedPath) {
    return <Navigate to="/registration-status" replace />;
  }
  
  return <>{children}</>;
};

// Smart redirect for legacy /carte route preserving query params
function CarteRedirect() {
  const [params] = useSearchParams();
  const mode = params.get('mode');
  const dest = mode === 'blood' ? '/map/blood'
             : mode === 'emergency' ? '/map/emergency'
             : '/map/providers';
  return <Navigate to={dest} replace />;
}



const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <AntigravityIndex />
            </PageTransition>
          } 
        />
        
        
        {/* ============================================ */}
        {/* CITIZEN ROUTES */}
        {/* ============================================ */}
        <Route path="/citizen/login" element={<PageTransition><CitizenLoginPage /></PageTransition>} />
        <Route path="/citizen/register" element={<PageTransition><CitizenRegisterPage /></PageTransition>} />
        <Route path="/email-verified" element={<PageTransition><EmailVerifiedPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        <Route element={<MainLayout />}>
          <Route 
            path="/citizen/dashboard" 
            element={
              <PageTransition>
                <CitizenGuard>
                  <PatientDashboard />
                </CitizenGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PageTransition>
                <CitizenGuard>
                  <CitizenProfilePage />
                </CitizenGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <PageTransition>
                <CitizenGuard>
                  <FavoritesPage />
                </CitizenGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="/citizen/appointments" 
            element={
              <PageTransition>
                <CitizenGuard>
                  <CitizenAppointmentsPage />
                </CitizenGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="/citizen/appointments/history" 
            element={
              <PageTransition>
                <CitizenGuard>
                  <AppointmentHistoryPage />
                </CitizenGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="/citizen/appointments/new" 
            element={
              <PageTransition>
                <CitizenGuard>
                  <NewAppointmentPage />
                </CitizenGuard>
              </PageTransition>
            } 
          />
          {/* ---- Provide (Community Help) ---- */}
          <Route 
            path="/citizen/provide" 
            element={
              <PageTransition>
                <ProvideListPage />
              </PageTransition>
            } 
          />
          <Route 
            path="/citizen/provide/mine" 
            element={
              <PageTransition>
                <ProviderRouteGuard>
                  <MyOffersPage />
                </ProviderRouteGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="/citizen/provide/new" 
            element={
              <PageTransition>
                <ProviderRouteGuard>
                  <CreateOfferPage />
                </ProviderRouteGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="/citizen/provide/edit/:offerId" 
            element={
              <PageTransition>
                <ProviderRouteGuard>
                  <EditOfferPage />
                </ProviderRouteGuard>
              </PageTransition>
            } 
          />
        </Route>
        {/* Legacy /dashboard redirects to citizen dashboard */}
        <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />
        
        {/* ============================================ */}
        {/* PROVIDER ROUTES */}
        {/* ============================================ */}
        <Route path="/provider/login" element={<PageTransition><ProviderLoginPage /></PageTransition>} />
        <Route 
          path="/provider/register/*" 
          element={
            <PageTransition>
              <ProviderRegister />
            </PageTransition>
          } 
        />
        <Route 
          path="/provider/dashboard" 
          element={
            <PageTransition>
              <ProviderRouteGuard>
                <ProviderDashboard />
              </ProviderRouteGuard>
            </PageTransition>
          } 
        />
        <Route 
          path="/provider/profile" 
          element={
            <PageTransition>
              <ProviderRouteGuard>
                <ProviderOwnProfilePage />
              </ProviderRouteGuard>
            </PageTransition>
          } 
        />
        <Route 
          path="/provider/welcome" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <ProviderProvider>
                  <ProviderWelcomePage />
                </ProviderProvider>
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
        <Route 
          path="/registration-status" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <RegistrationStatus />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/registration-thank-you" 
          element={
            <PageTransition>
              <RegistrationThankYou />
            </PageTransition>
          } 
        />
        
        {/* ============================================ */}
        {/* ADMIN ROUTES */}
        {/* ============================================ */}
        <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
        <Route 
          path="/admin/dashboard" 
          element={
            <PageTransition>
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            </PageTransition>
          } 
        />
        <Route element={<MainLayout />}>
          <Route 
            path="/admin/migrate" 
            element={
              <PageTransition>
                <AdminGuard>
                  <AdminMigratePage />
                </AdminGuard>
              </PageTransition>
            } 
          />
        </Route>
        <Route 
          path="/admin/profile" 
          element={
            <PageTransition>
              <AdminGuard>
                <AdminProfilePage />
              </AdminGuard>
            </PageTransition>
          } 
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* ============================================ */}
        {/* PUBLIC ROUTES */}
        {/* ============================================ */}
        <Route 
          path="/search" 
          element={
            <VerificationGuard>
              <PageTransition>
                <SearchPage />
              </PageTransition>
            </VerificationGuard>
          } 
        />
        <Route path="/providers" element={<Navigate to="/provider/register" replace />} />
        <Route 
          path="/provider/:id" 
          element={
            <PageTransition>
              <ProviderProfilePage />
            </PageTransition>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <PageTransition>
              <ContactPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/emergency" 
          element={
            <PageTransition>
              <EmergencyPage />
            </PageTransition>
          } 
        />
        <Route element={<MainLayout />}>
          <Route 
            path="/blood-donation" 
            element={
              <PageTransition>
                <BloodDonationPage />
              </PageTransition>
            } 
          />
        </Route>
        <Route path="/ai-health-chat" element={<Navigate to="/docs" replace />} />
        <Route 
          path="/medical-assistant" 
          element={
            <PageTransition>
              <MedicalAssistantPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/community" 
          element={
            <PageTransition>
              <CommunityPage />
            </PageTransition>
          } 
        />
        
        {/* ============================================ */}
        {/* EMERGENCY CARD PUBLIC ROUTE */}
        {/* ============================================ */}
        <Route 
          path="/emergency-card/:token" 
          element={<EmergencyCardPublicPage />} 
        />
        
        {/* ============================================ */}
        {/* MAP ROUTES */}
        {/* ============================================ */}
        <Route path="/map" element={<MapMother />}>
          <Route index element={<Navigate to="/map/providers" replace />} />
          <Route path="providers" element={<ProvidersMapChild />} />
          <Route path="emergency" element={<EmergencyMapChild />} />
          <Route path="blood" element={<BloodMapChild />} />
        </Route>
        
        {/* ============================================ */}
        {/* DOCUMENTATION ROUTES */}
        {/* ============================================ */}
        <Route 
          path="/docs" 
          element={
            <PageTransition>
              <DocsPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/docs/:sectionId/:pageId" 
          element={
            <PageTransition>
              <DocsPage />
            </PageTransition>
          } 
        />
        
        {/* ============================================ */}
        {/* LEGAL PAGES */}
        {/* ============================================ */}
        <Route 
          path="/privacy" 
          element={
            <PageTransition>
              <PrivacyPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/terms" 
          element={
            <PageTransition>
              <TermsPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/faq" 
          element={
            <PageTransition>
              <FAQPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/tarifs" 
          element={
            <PageTransition>
              <TarifsPage />
            </PageTransition>
          } 
        />
        
        {/* ============================================ */}
        {/* ADS PUBLIC PAGE */}
        {/* ============================================ */}
        <Route 
          path="/annonces" 
          element={
            <PageTransition>
              <AdsPage />
            </PageTransition>
          } 
        />

        {/* ============================================ */}
        {/* RESEARCH HUB */}
        {/* ============================================ */}
        <Route 
          path="/research" 
          element={
            <PageTransition>
              <ResearchHubPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/research/:articleId" 
          element={
            <PageTransition>
              <ArticleDetailPage />
            </PageTransition>
          } 
        />

        {/* ============================================ */}
        {/* LEGACY REDIRECTS */}
        {/* ============================================ */}
        <Route path="/why" element={<Navigate to="/docs/getting-started/why-cityhealth" replace />} />
        <Route path="/how" element={<Navigate to="/docs/getting-started/how-it-works" replace />} />
        <Route path="/carte" element={<CarteRedirect />} />
        <Route path="/providers-map" element={<Navigate to="/map/providers" replace />} />
        <Route path="/urgences" element={<Navigate to="/map/emergency" replace />} />
        
        {/* ============================================ */}
        {/* DEVELOPER PORTAL */}
        {/* ============================================ */}
        <Route path="/developers" element={<PageTransition><DeveloperLandingPage /></PageTransition>} />
        <Route path="/developers/login" element={<PageTransition><DeveloperLoginPage /></PageTransition>} />
        <Route path="/developers/register" element={<PageTransition><DeveloperRegisterPage /></PageTransition>} />
        <Route path="/developers/dashboard" element={<PageTransition><DeveloperDashboardPage /></PageTransition>} />
        <Route path="/developers/profile" element={<PageTransition><DeveloperProfilePage /></PageTransition>} />
        <Route path="/developers/docs" element={<PageTransition><DeveloperDocsPage /></PageTransition>} />

        {/* ============================================ */}
        {/* DEV TOOLS (hidden) */}
        {/* ============================================ */}
        <Route path="/dev-tools" element={<PageTransition><DevToolsPage /></PageTransition>} />
        
        {/* ============================================ */}
        {/* 404 */}
        {/* ============================================ */}
        <Route 
          path="*" 
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          } 
        />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ProviderProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  
                  <div className="min-h-screen bg-background text-foreground">
                    <ConditionalHeader />
                    <AppRoutes />
                    <BackToTop />
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </ProviderProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
