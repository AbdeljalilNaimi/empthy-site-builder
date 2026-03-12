import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Key, Gauge, Server, AlertTriangle, Copy, Check, ChevronRight, Menu, X, ExternalLink, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import Footer from '@/components/Footer';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qedotqjxndtmskcgrajt.supabase.co';
const API_BASE = `${SUPABASE_URL}/functions/v1/public-api`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="absolute top-3 right-3 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function CodeBlock({ children, title, language: lang }: { children: string; title?: string; language?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/60 my-4 shadow-sm" dir="ltr">
      {title && (
        <div className="bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/60 flex items-center justify-between">
          <span>{title}</span>
          {lang && <Badge variant="outline" className="text-[10px] h-5">{lang}</Badge>}
        </div>
      )}
      <div className="relative">
        <pre className="bg-foreground/[0.03] p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
          <code>{children}</code>
        </pre>
        <CopyButton text={children} />
      </div>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    POST: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  };
  return <span className={cn('px-2 py-0.5 rounded-md text-xs font-bold border', colors[method] || 'bg-muted')}>{method}</span>;
}

function EndpointBlock({ method, path, description, noKey, noRateLimit, children }: {
  method: string; path: string; description: string; noKey?: boolean; noRateLimit?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="border border-border/60 rounded-xl p-5 mb-6 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <MethodBadge method={method} />
        <code className="text-sm font-bold text-foreground">{path}</code>
        {noKey && <Badge variant="secondary" className="text-[10px]">No Key</Badge>}
        {noRateLimit && <Badge variant="secondary" className="text-[10px]">No Limit</Badge>}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      {children}
    </div>
  );
}

export default function DeveloperDocsPage() {
  const [activeSection, setActiveSection] = useState('auth');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);

  const tri = (fr: string, en: string, ar: string) =>
    language === 'ar' ? ar : language === 'en' ? en : fr;

  const sections = [
    { id: 'auth', label: tri('Authentification', 'Authentication', 'المصادقة'), icon: Key },
    { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
    { id: 'endpoints', label: 'Endpoints', icon: Server },
    { id: 'errors', label: tri("Codes d'erreur", 'Error Codes', 'رموز الخطأ'), icon: AlertTriangle },
  ];

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, [activeSection]);

  const switchSection = (id: string) => setActiveSection(id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/developers')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {tri('Retour', 'Back', 'رجوع')}
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Book className="h-4 w-4" /> {tri('Documentation API', 'API Documentation', 'وثائق API')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex gap-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> v1.0
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop sidebar */}
        <aside className="w-60 border-r border-border/40 min-h-[calc(100vh-3.5rem)] p-5 hidden md:block sticky top-14 self-start">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {tri('Sections', 'Sections', 'الأقسام')}
          </div>
          <nav className="space-y-1">
            {sections.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => switchSection(s.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-all duration-200',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{tri('Base URL', 'Base URL', 'عنوان القاعدة')}</span>
            </div>
            <code className="text-[10px] text-muted-foreground break-all leading-relaxed">{API_BASE}</code>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              className="fixed inset-0 z-40 md:hidden"
            >
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
              <div className="relative w-64 h-full bg-background border-r border-border p-5 shadow-xl">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {tri('Sections', 'Sections', 'الأقسام')}
                </div>
                <nav className="space-y-1">
                  {sections.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => switchSection(s.id)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-colors',
                          activeSection === s.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" /> {s.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main ref={contentRef} className="flex-1 p-6 md:p-10 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {/* ═══════ AUTH ═══════ */}
              {activeSection === 'auth' && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10"><Key className="h-5 w-5 text-primary" /></div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{tri('Authentification', 'Authentication', 'المصادقة')}</h1>
                  </div>
                  <p className="text-muted-foreground mb-8 max-w-2xl">
                    {tri(
                      'Toutes les requêtes API (sauf /v1/categories) nécessitent une clé API envoyée via le header x-api-key.',
                      'All API requests (except /v1/categories) require an API key sent via the x-api-key header.',
                      'تتطلب جميع طلبات API (باستثناء /v1/categories) مفتاح API يُرسل عبر الترويسة x-api-key.'
                    )}
                  </p>

                  <CodeBlock title="curl" language="bash">{`curl -H "x-api-key: ch_live_your_key" \\
  ${API_BASE}/v1/providers`}</CodeBlock>

                  <CodeBlock title="JavaScript" language="fetch">{`const response = await fetch(
  '${API_BASE}/v1/providers',
  {
    headers: { 'x-api-key': 'ch_live_your_key' }
  }
);
const data = await response.json();
console.log(data);`}</CodeBlock>

                  <CodeBlock title="Python" language="requests">{`import requests

response = requests.get(
    '${API_BASE}/v1/providers',
    headers={'x-api-key': 'ch_live_your_key'}
)
data = response.json()
print(data)`}</CodeBlock>

                  <div className="mt-8 p-5 rounded-xl border border-border/60 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{tri('Sécurité', 'Security', 'الأمان')}</h3>
                    </div>
                    <ul className="space-y-2">
                      {(tri(
                        'Les clés sont hachées en SHA-256 côté serveur|Ne partagez jamais votre clé API|Utilisez des variables d\'environnement pour stocker votre clé|Régénérez vos clés régulièrement depuis le tableau de bord',
                        'Keys are hashed with SHA-256 server-side|Never share your API key|Use environment variables to store your key|Rotate keys regularly from your dashboard',
                        'المفاتيح مشفرة بـ SHA-256 على الخادم|لا تشارك مفتاح API الخاص بك أبداً|استخدم متغيرات البيئة لتخزين مفتاحك|قم بتدوير المفاتيح بانتظام من لوحة التحكم'
                      )).split('|').map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ═══════ RATE LIMITS ═══════ */}
              {activeSection === 'rate-limits' && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10"><Gauge className="h-5 w-5 text-primary" /></div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rate Limits</h1>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    {tri(
                      'Chaque plan a une limite de requêtes quotidiennes.',
                      'Each plan has a daily request limit.',
                      'لكل خطة حد أقصى للطلبات اليومية.'
                    )}
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    {[
                      { name: 'Free', count: '100', color: 'border-muted-foreground/30' },
                      { name: 'Basic', count: '1,000', color: 'border-primary/40' },
                      { name: 'Pro', count: '10,000', color: 'border-primary' },
                    ].map((plan) => (
                      <div key={plan.name} className={cn('border-2 rounded-xl p-5 text-center transition-colors hover:bg-muted/30', plan.color)}>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{plan.name}</div>
                        <div className="text-2xl font-bold text-foreground">{plan.count}</div>
                        <div className="text-xs text-muted-foreground">{tri('requêtes / jour', 'requests / day', 'طلب / يوم')}</div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{tri('Headers de réponse', 'Response Headers', 'ترويسات الاستجابة')}</h3>
                  <CodeBlock language="HTTP">{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1710000000`}</CodeBlock>

                  <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{tri('Exception', 'Exception', 'استثناء')}</p>
                      <p className="text-sm text-muted-foreground">
                        {tri(
                          "L'endpoint /v1/emergency ne compte pas dans les limites.",
                          'The /v1/emergency endpoint does not count against limits.',
                          'نقطة النهاية /v1/emergency لا تُحتسب ضمن الحدود.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════ ENDPOINTS ═══════ */}
              {activeSection === 'endpoints' && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10"><Server className="h-5 w-5 text-primary" /></div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Endpoints</h1>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    {tri(
                      'Tous les endpoints retournent du JSON. Base URL :',
                      'All endpoints return JSON. Base URL:',
                      'جميع نقاط النهاية تعيد JSON. عنوان القاعدة:'
                    )}{' '}
                    <code className="text-xs bg-muted px-2 py-1 rounded-md">{API_BASE}</code>
                  </p>

                  <EndpointBlock
                    method="GET" path="/v1/categories"
                    description={tri('Liste des catégories de prestataires. Pas de clé requise.', 'List of provider categories. No key required.', 'قائمة فئات مقدمي الخدمات. لا يتطلب مفتاح.')}
                    noKey
                  >
                    <CodeBlock title={tri('Réponse', 'Response', 'الاستجابة')} language="JSON">{`{
  "success": true,
  "data": [
    { "id": "hospital", "label": "Hôpital", "label_ar": "مستشفى" },
    { "id": "pharmacy", "label": "Pharmacie", "label_ar": "صيدلية" },
    { "id": "doctor", "label": "Médecin", "label_ar": "طبيب" },
    { "id": "laboratory", "label": "Laboratoire", "label_ar": "مختبر" }
  ]
}`}</CodeBlock>
                  </EndpointBlock>

                  <EndpointBlock
                    method="GET" path="/v1/providers"
                    description={tri('Recherche de prestataires avec filtres.', 'Search providers with filters.', 'البحث عن مقدمي الخدمات مع فلاتر.')}
                  >
                    <div className="text-sm text-muted-foreground mb-3 space-y-1.5">
                      <div className="flex items-center gap-2"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">?q=</code> <span>{tri('Recherche textuelle', 'Text search', 'بحث نصي')}</span></div>
                      <div className="flex items-center gap-2"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">?type=</code> <span>{tri('Filtrer par type', 'Filter by type', 'تصفية حسب النوع')} (hospital, pharmacy…)</span></div>
                      <div className="flex items-center gap-2"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">?city=</code> <span>{tri('Filtrer par ville', 'Filter by city', 'تصفية حسب المدينة')}</span></div>
                      <div className="flex items-center gap-2"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">?verified_only=</code> <span>true ({tri('défaut', 'default', 'افتراضي')}) | false</span></div>
                      <div className="flex items-center gap-2"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">?limit=</code> <span>{tri('Max résultats (défaut 20, max 100)', 'Max results (default 20, max 100)', 'أقصى النتائج (افتراضي 20، أقصى 100)')}</span></div>
                      <div className="flex items-center gap-2"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">?offset=</code> <span>{tri('Pagination', 'Pagination', 'ترقيم الصفحات')}</span></div>
                    </div>
                    <CodeBlock title={tri('Réponse', 'Response', 'الاستجابة')} language="JSON">{`{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Dr. Benali",
      "type": "doctor",
      "specialty": "Cardiologie",
      "city": "Sidi Bel Abbès",
      "rating": 4.8,
      "is_verified": true,
      "is_open": true
    }
  ],
  "meta": { "total": 42, "limit": 20, "offset": 0 }
}`}</CodeBlock>
                  </EndpointBlock>

                  <EndpointBlock
                    method="GET" path="/v1/providers/:id"
                    description={tri("Détails d'un prestataire par ID.", 'Provider details by ID.', 'تفاصيل مقدم خدمة حسب المعرف.')}
                  >
                    <CodeBlock title={tri('Réponse', 'Response', 'الاستجابة')} language="JSON">{`{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Dr. Benali",
    "type": "doctor",
    "specialty": "Cardiologie",
    "address": "Rue Ben M'hidi, SBA",
    "phone": "+213 48 XX XX XX",
    "lat": 35.19,
    "lng": -0.63,
    "rating": 4.8,
    "reviews_count": 24,
    "is_verified": true,
    "is_24h": false,
    "languages": ["fr", "ar"]
  }
}`}</CodeBlock>
                  </EndpointBlock>

                  <EndpointBlock
                    method="GET" path="/v1/emergency"
                    description={tri('Prestataires 24/7 vérifiés. Pas de rate limit.', 'Verified 24/7 providers. No rate limit.', 'مقدمو خدمات 24/7 معتمدون. لا حد للطلبات.')}
                    noRateLimit
                  >
                    <CodeBlock title="curl" language="bash">{`curl -H "x-api-key: ch_live_your_key" \\
  ${API_BASE}/v1/emergency`}</CodeBlock>
                  </EndpointBlock>

                  <EndpointBlock
                    method="GET" path="/v1/pharmacies"
                    description={tri('Pharmacies vérifiées avec info de garde.', 'Verified pharmacies with on-duty info.', 'صيدليات معتمدة مع معلومات المناوبة.')}
                  />

                  <EndpointBlock
                    method="GET" path="/v1/search"
                    description={tri('Recherche full-text. Paramètre ?q= obligatoire.', 'Full-text search. Parameter ?q= required.', 'بحث نصي كامل. المعامل ?q= مطلوب.')}
                  >
                    <CodeBlock title="curl" language="bash">{`curl -H "x-api-key: ch_live_your_key" \\
  "${API_BASE}/v1/search?q=cardiologue&city=sba"`}</CodeBlock>
                  </EndpointBlock>
                </div>
              )}

              {/* ═══════ ERRORS ═══════ */}
              {activeSection === 'errors' && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10"><AlertTriangle className="h-5 w-5 text-primary" /></div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{tri("Codes d'erreur", 'Error Codes', 'رموز الخطأ')}</h1>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    {tri(
                      'Toutes les erreurs suivent un format JSON standard.',
                      'All errors follow a standard JSON format.',
                      'جميع الأخطاء تتبع تنسيق JSON قياسي.'
                    )}
                  </p>

                  <div className="space-y-3 mb-8">
                    {([
                      { code: 400, label: tri('Paramètres de requête invalides', 'Invalid request parameters', 'معاملات طلب غير صالحة'), color: 'text-amber-600 dark:text-amber-400' },
                      { code: 401, label: tri('Clé API manquante, invalide ou désactivée', 'Missing, invalid, or disabled API key', 'مفتاح API مفقود أو غير صالح أو معطّل'), color: 'text-red-600 dark:text-red-400' },
                      { code: 404, label: tri('Endpoint ou ressource introuvable', 'Endpoint or resource not found', 'نقطة نهاية أو مورد غير موجود'), color: 'text-orange-600 dark:text-orange-400' },
                      { code: 429, label: tri('Limite quotidienne de requêtes dépassée', 'Daily request limit exceeded', 'تم تجاوز الحد اليومي للطلبات'), color: 'text-purple-600 dark:text-purple-400' },
                      { code: 500, label: tri('Erreur serveur interne', 'Internal server error', 'خطأ داخلي في الخادم'), color: 'text-red-700 dark:text-red-400' },
                    ]).map((err) => (
                      <div key={err.code} className="border border-border/60 rounded-xl p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                        <code className={cn('text-lg font-bold tabular-nums', err.color)}>{err.code}</code>
                        <span className="text-sm text-muted-foreground">{err.label}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{tri("Format d'erreur", 'Error Format', 'تنسيق الخطأ')}</h3>
                  <CodeBlock title={tri('Exemple', 'Example', 'مثال')} language="JSON">{`{
  "success": false,
  "error": {
    "code": 429,
    "message": "Daily rate limit exceeded."
  }
}`}</CodeBlock>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  );
}