import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  HelpCircle, 
  Search, 
  Users, 
  Stethoscope, 
  Settings, 
  Siren, 
  Shield,
  ArrowLeft,
  MessageCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqCategories = [
  { id: "all", label: "Tous", icon: HelpCircle },
  { id: "citizens", label: "Citoyens", icon: Users },
  { id: "providers", label: "Prestataires", icon: Stethoscope },
  { id: "technical", label: "Technique", icon: Settings },
  { id: "emergency", label: "Urgences", icon: Siren },
  { id: "security", label: "Données & Sécurité", icon: Shield },
];

const faqData: FAQItem[] = [
  // Citoyens
  {
    id: "c1",
    question: "Comment créer un compte citoyen ?",
    answer: "Pour créer un compte citoyen, cliquez sur 'Connexion Citoyen' dans le menu puis sur 'Créer un compte'. Remplissez le formulaire avec votre email, un mot de passe sécurisé et vos informations personnelles. Vous recevrez un email de confirmation pour activer votre compte.",
    category: "citizens",
  },
  {
    id: "c2",
    question: "Comment rechercher un médecin ou spécialiste ?",
    answer: "Utilisez la barre de recherche sur la page d'accueil ou accédez à la carte interactive. Vous pouvez filtrer par spécialité (médecin généraliste, cardiologue, dentiste...), par localisation dans Sidi Bel Abbès, par disponibilité ou par avis des patients.",
    category: "citizens",
  },
  {
    id: "c3",
    question: "Comment utiliser la carte interactive ?",
    answer: "La carte interactive affiche tous les professionnels de santé vérifiés à Sidi Bel Abbès. Cliquez sur un marqueur pour voir les détails du praticien. Vous pouvez zoomer, filtrer par type d'établissement et activer la géolocalisation pour trouver les praticiens les plus proches.",
    category: "citizens",
  },
  {
    id: "c4",
    question: "Comment prendre rendez-vous en ligne ?",
    answer: "Trouvez le praticien souhaité, consultez ses disponibilités affichées sur son profil et cliquez sur 'Prendre RDV'. Sélectionnez un créneau horaire disponible, confirmez vos coordonnées et vous recevrez une confirmation par email et SMS.",
    category: "citizens",
  },
  {
    id: "c5",
    question: "Comment ajouter un praticien à mes favoris ?",
    answer: "Connectez-vous à votre compte citoyen, puis sur la fiche d'un praticien, cliquez sur l'icône cœur. Retrouvez tous vos favoris dans la section 'Mes Favoris' accessible depuis votre tableau de bord.",
    category: "citizens",
  },
  {
    id: "c6",
    question: "Comment contacter un professionnel de santé ?",
    answer: "Sur la fiche du praticien, vous trouverez ses coordonnées (téléphone, email si disponible). Certains praticiens proposent également un formulaire de contact direct ou la prise de rendez-vous en ligne.",
    category: "citizens",
  },
  {
    id: "c7",
    question: "L'utilisation de CityHealth est-elle gratuite ?",
    answer: "Oui, CityHealth est entièrement gratuit pour les citoyens. La recherche de praticiens, la consultation des fiches, l'ajout aux favoris et la prise de rendez-vous sont des fonctionnalités gratuites.",
    category: "citizens",
  },
  {
    id: "c8",
    question: "Comment modifier mes informations personnelles ?",
    answer: "Connectez-vous à votre compte, accédez à 'Mon Profil' depuis le menu. Vous pouvez y modifier vos informations personnelles, votre numéro de téléphone, votre adresse email et gérer vos préférences de notification.",
    category: "citizens",
  },

  // Prestataires
  {
    id: "p1",
    question: "Comment s'inscrire en tant que professionnel de santé ?",
    answer: "Cliquez sur 'Espace Pro' puis 'S'inscrire'. Remplissez le formulaire d'inscription avec vos informations professionnelles, téléchargez vos documents justificatifs (diplôme, autorisation d'exercer) et soumettez votre demande. Notre équipe vérifiera votre dossier sous 48h.",
    category: "providers",
  },
  {
    id: "p2",
    question: "Quel est le processus de vérification ?",
    answer: "Après soumission de votre dossier, notre équipe vérifie l'authenticité de vos documents, votre inscription à l'Ordre professionnel concerné et vos qualifications. Ce processus prend généralement 24 à 48 heures ouvrables. Vous recevrez un email confirmant votre vérification.",
    category: "providers",
  },
  {
    id: "p3",
    question: "Quels documents sont nécessaires pour la vérification ?",
    answer: "Les documents requis incluent : copie du diplôme, autorisation d'exercer délivrée par les autorités compétentes, attestation d'inscription à l'Ordre professionnel, pièce d'identité et photo professionnelle. Des documents supplémentaires peuvent être demandés selon votre spécialité.",
    category: "providers",
  },
  {
    id: "p4",
    question: "Comment gérer mon profil et mes disponibilités ?",
    answer: "Depuis votre tableau de bord professionnel, accédez à 'Mon Profil' pour modifier vos informations et à 'Planning' pour gérer vos disponibilités. Vous pouvez définir vos horaires de consultation, bloquer des créneaux et gérer vos absences.",
    category: "providers",
  },
  {
    id: "p5",
    question: "Comment recevoir des demandes de rendez-vous ?",
    answer: "Une fois votre profil vérifié et vos disponibilités configurées, les citoyens peuvent prendre rendez-vous directement. Vous recevrez une notification par email et dans votre tableau de bord pour chaque nouvelle demande.",
    category: "providers",
  },
  {
    id: "p6",
    question: "Comment apparaître en tête des résultats de recherche ?",
    answer: "Plusieurs facteurs influencent votre positionnement : complétude de votre profil (photo, description détaillée, services), avis positifs des patients, temps de réponse aux demandes et fréquence de mise à jour de vos disponibilités.",
    category: "providers",
  },
  {
    id: "p7",
    question: "L'inscription est-elle payante pour les professionnels ?",
    answer: "L'inscription de base est gratuite et inclut : fiche praticien, géolocalisation sur la carte, gestion des disponibilités. Des options premium peuvent être proposées pour une meilleure visibilité et des fonctionnalités avancées.",
    category: "providers",
  },

  // Technique
  {
    id: "t1",
    question: "Quels navigateurs sont compatibles avec CityHealth ?",
    answer: "CityHealth est compatible avec les versions récentes de Chrome, Firefox, Safari et Edge. Pour une expérience optimale, nous recommandons d'utiliser la dernière version de votre navigateur et d'activer JavaScript.",
    category: "technical",
  },
  {
    id: "t2",
    question: "Existe-t-il une application mobile CityHealth ?",
    answer: "CityHealth est une application web progressive (PWA) qui fonctionne comme une application native. Sur mobile, vous pouvez l'ajouter à votre écran d'accueil via le menu de votre navigateur pour un accès rapide, même hors connexion pour certaines fonctionnalités.",
    category: "technical",
  },
  {
    id: "t3",
    question: "Je n'arrive pas à me connecter, que faire ?",
    answer: "Vérifiez que votre email est correct, que les majuscules de votre mot de passe sont respectées. Si le problème persiste, cliquez sur 'Mot de passe oublié' pour réinitialiser. Si vous n'avez toujours pas accès, contactez notre support à support@cityhealth-sba.dz.",
    category: "technical",
  },
  {
    id: "t4",
    question: "Comment réinitialiser mon mot de passe ?",
    answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre adresse email et vous recevrez un lien de réinitialisation valable 24 heures. Cliquez sur ce lien et choisissez un nouveau mot de passe sécurisé.",
    category: "technical",
  },
  {
    id: "t5",
    question: "La carte ne s'affiche pas correctement, que faire ?",
    answer: "Vérifiez votre connexion internet et rafraîchissez la page. Si le problème persiste, essayez de vider le cache de votre navigateur ou d'utiliser un autre navigateur. Assurez-vous également que JavaScript est activé.",
    category: "technical",
  },
  {
    id: "t6",
    question: "Comment activer les notifications ?",
    answer: "Dans votre profil, accédez à 'Paramètres' puis 'Notifications'. Vous pouvez activer les notifications par email, SMS ou push (navigateur). Autorisez les notifications de CityHealth quand votre navigateur vous le demande.",
    category: "technical",
  },

  // Urgences
  {
    id: "e1",
    question: "Quels sont les numéros d'urgence à Sidi Bel Abbès ?",
    answer: "SAMU : 14 | Protection Civile : 14 | Police : 17 | Gendarmerie : 1055 | Centre anti-poison : 021 97 98 98. Ces numéros sont disponibles 24h/24. En cas d'urgence vitale, appelez immédiatement le 14.",
    category: "emergency",
  },
  {
    id: "e2",
    question: "Comment trouver une pharmacie de garde ?",
    answer: "Utilisez notre section 'Urgences' accessible depuis le menu principal ou la carte interactive. Filtrez par 'Pharmacies de garde' pour voir celles ouvertes actuellement. La liste est mise à jour quotidiennement.",
    category: "emergency",
  },
  {
    id: "e3",
    question: "Comment accéder aux urgences les plus proches ?",
    answer: "Activez votre géolocalisation sur la carte interactive et sélectionnez le filtre 'Urgences'. La carte vous montrera les services d'urgences les plus proches avec l'itinéraire et le temps de trajet estimé.",
    category: "emergency",
  },
  {
    id: "e4",
    question: "CityHealth peut-il remplacer un avis médical ?",
    answer: "Non. CityHealth est un outil d'information et de mise en relation. Il ne remplace en aucun cas une consultation médicale. En cas de symptômes inquiétants ou d'urgence, consultez immédiatement un médecin ou appelez les services d'urgence.",
    category: "emergency",
  },

  // Données & Sécurité
  {
    id: "s1",
    question: "Comment mes données sont-elles protégées ?",
    answer: "Vos données sont chiffrées en transit (HTTPS) et au repos. Nous utilisons des protocoles de sécurité avancés, des sauvegardes régulières et un hébergement sécurisé conforme aux normes algériennes et internationales de protection des données.",
    category: "security",
  },
  {
    id: "s2",
    question: "Quelles données collectez-vous ?",
    answer: "Nous collectons les données nécessaires au fonctionnement du service : informations de compte (email, nom), données de recherche (pour améliorer les résultats), et pour les prestataires, leurs informations professionnelles. Consultez notre Politique de Confidentialité pour plus de détails.",
    category: "security",
  },
  {
    id: "s3",
    question: "Puis-je supprimer mon compte et mes données ?",
    answer: "Oui, vous pouvez demander la suppression de votre compte à tout moment depuis les paramètres de votre profil ou en nous contactant. Vos données personnelles seront supprimées sous 30 jours, sauf obligation légale de conservation.",
    category: "security",
  },
  {
    id: "s4",
    question: "Mes données de santé sont-elles partagées ?",
    answer: "Non. Nous ne partageons jamais vos données de santé avec des tiers sans votre consentement explicite. Les informations de rendez-vous sont uniquement accessibles par vous et le praticien concerné.",
    category: "security",
  },
  {
    id: "s5",
    question: "Comment exercer mes droits sur mes données (RGPD) ?",
    answer: "Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, connectez-vous à votre compte section 'Paramètres > Données personnelles' ou contactez notre DPO à dpo@cityhealth-sba.dz.",
    category: "security",
  },
];

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const filteredFAQs = useMemo(() => {
    let items = faqData;

    // Filter by category
    if (activeCategory !== "all") {
      items = items.filter((item) => item.category === activeCategory);
    }

    // Filter by search query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return items;
  }, [activeCategory, debouncedSearch]);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") {
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        return faqData.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ).length;
      }
      return faqData.length;
    }
    
    let items = faqData.filter((item) => item.category === categoryId);
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }
    return items.length;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = faqCategories.find((c) => c.id === categoryId);
    if (!category) return HelpCircle;
    return category.icon;
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary/5 via-primary/3 to-background border-b">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">
                {faqData.length}+ questions
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold">
                Foire aux <span className="text-primary">Questions</span>
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Trouvez rapidement des réponses à vos questions sur CityHealth SBA.
            Utilisez la recherche ou parcourez les catégories ci-dessous.
          </p>
        </div>
      </header>

      {/* Search Bar - Sticky */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
          {debouncedSearch && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredFAQs.length} résultat{filteredFAQs.length > 1 ? "s" : ""} pour "{debouncedSearch}"
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          {/* Category Tabs */}
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-8">
            {faqCategories.map((category) => {
              const Icon = category.icon;
              const count = getCategoryCount(category.id);
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full border data-[state=inactive]:bg-background"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 px-1.5 text-xs data-[state=active]:bg-primary-foreground/20"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* FAQ Content */}
          <div className="max-w-3xl">
            {filteredFAQs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez avec d'autres termes ou parcourez les catégories.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Effacer la recherche
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const CategoryIcon = getCategoryIcon(faq.category);
                  return (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border rounded-lg px-4 bg-card shadow-sm"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                            <CategoryIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">
                            {highlightText(faq.question, debouncedSearch)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-10 pb-4">
                        {highlightText(faq.answer, debouncedSearch)}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </Tabs>

        {/* Contact CTA */}
        <Card className="mt-12 max-w-3xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Vous n'avez pas trouvé la réponse ?</CardTitle>
                <CardDescription>
                  Notre équipe est là pour vous aider
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link to="/contact">
                Nous contacter
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/docs">
                Consulter la documentation
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/privacy"
            className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-medium">Confidentialité</span>
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">Conditions d'utilisation</span>
          </Link>
          <Link
            to="/emergency"
            className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <Siren className="h-5 w-5 text-destructive" />
            <span className="font-medium">Urgences</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
