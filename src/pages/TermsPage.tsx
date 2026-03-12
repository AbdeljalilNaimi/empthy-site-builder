import { FileText, Users, Stethoscope, Scale, AlertTriangle, Ban, RefreshCw, Gavel, Clock, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const TermsPage = () => {
  const sections = [
    {
      id: 'object',
      icon: FileText,
      title: 'Article 1 - Objet',
      content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme CityHealth SBA.

CityHealth SBA est une plateforme numérique de mise en relation entre :
• Les citoyens de Sidi Bel Abbès et sa région recherchant des soins de santé
• Les professionnels de santé (médecins, pharmacies, cliniques, laboratoires, etc.)

Le service permet notamment :
• La recherche de praticiens par spécialité, localisation et disponibilité
• La consultation des profils et avis des professionnels
• La prise de rendez-vous en ligne
• L'accès à une carte interactive des établissements de santé`
    },
    {
      id: 'acceptance',
      icon: Users,
      title: 'Article 2 - Acceptation',
      content: `L'utilisation de CityHealth SBA implique l'acceptation pleine et entière des présentes CGU.

**Conditions d'accès :**
• Être âgé d'au moins 18 ans ou disposer de l'autorisation d'un représentant légal
• Fournir des informations exactes et à jour
• Ne pas utiliser le service à des fins illicites

**Modification des CGU :**
CityHealth SBA se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email et notification sur la plateforme au moins 30 jours avant l'entrée en vigueur des modifications.

La poursuite de l'utilisation du service après cette date vaut acceptation des nouvelles conditions.`
    },
    {
      id: 'registration',
      icon: Users,
      title: 'Article 3 - Inscription',
      content: `**Compte Citoyen :**
L'inscription est gratuite et nécessite :
• Une adresse email valide
• Un mot de passe sécurisé
• Des informations d'identification (nom, prénom)

**Compte Prestataire :**
L'inscription des professionnels de santé requiert :
• Les informations d'identification de l'établissement
• Les documents justificatifs (agrément, diplômes)
• La validation par notre équipe de vérification

Le processus de vérification peut prendre jusqu'à 5 jours ouvrés. Un prestataire non vérifié ne peut pas apparaître dans les résultats de recherche.`
    },
    {
      id: 'user-obligations',
      icon: Users,
      title: 'Article 4 - Obligations des utilisateurs',
      content: `Tout utilisateur s'engage à :

**Exactitude des informations :**
• Fournir des informations véridiques et complètes
• Mettre à jour ses informations en cas de changement
• Ne pas usurper l'identité d'un tiers

**Comportement approprié :**
• Respecter les autres utilisateurs et prestataires
• Ne pas publier de contenu diffamatoire, injurieux ou illégal
• Ne pas tenter de contourner les mesures de sécurité

**Confidentialité du compte :**
• Maintenir la confidentialité de ses identifiants
• Signaler immédiatement tout accès non autorisé
• Ne pas partager son compte avec des tiers`
    },
    {
      id: 'provider-obligations',
      icon: Stethoscope,
      title: 'Article 5 - Obligations des prestataires',
      content: `Les professionnels de santé s'engagent à :

**Vérification et qualifications :**
• Détenir toutes les autorisations légales d'exercice
• Maintenir à jour leurs qualifications et agréments
• Informer CityHealth SBA de toute suspension ou retrait d'agrément

**Qualité du service :**
• Fournir des informations exactes sur leurs services et tarifs
• Respecter les rendez-vous pris via la plateforme
• Répondre aux avis de manière professionnelle

**Disponibilité :**
• Maintenir à jour leur calendrier de disponibilités
• Prévenir en cas d'absence ou de fermeture exceptionnelle
• Respecter un délai raisonnable pour les urgences signalées`
    },
    {
      id: 'intellectual-property',
      icon: Scale,
      title: 'Article 6 - Propriété intellectuelle',
      content: `**Droits de CityHealth SBA :**
La marque CityHealth SBA, le logo, le design et l'ensemble des contenus de la plateforme sont protégés par le droit de la propriété intellectuelle.

Toute reproduction, représentation ou exploitation non autorisée est strictement interdite.

**Contenu utilisateur :**
Les utilisateurs conservent leurs droits sur le contenu qu'ils publient (avis, photos, etc.) mais accordent à CityHealth SBA une licence non exclusive pour afficher ce contenu sur la plateforme.

**Données des prestataires :**
Les informations professionnelles fournies par les prestataires peuvent être utilisées par CityHealth SBA pour le référencement et l'amélioration du service.`
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: 'Article 7 - Responsabilités',
      content: `**Rôle de CityHealth SBA :**
CityHealth SBA agit en tant qu'intermédiaire technique. Nous ne sommes pas partie aux relations entre patients et praticiens.

**Exclusions de responsabilité :**
• Qualité des soins dispensés par les prestataires
• Exactitude des informations fournies par les utilisateurs
• Interruptions temporaires du service pour maintenance
• Dommages résultant d'une utilisation non conforme

**Limitation de responsabilité :**
En aucun cas, la responsabilité de CityHealth SBA ne pourra être engagée pour des dommages indirects, consécutifs ou immatériels.

**Garanties :**
CityHealth SBA s'engage à :
• Maintenir la disponibilité du service dans la mesure du possible
• Protéger les données personnelles conformément à notre politique de confidentialité
• Vérifier les qualifications des prestataires inscrits`
    },
    {
      id: 'termination',
      icon: Ban,
      title: 'Article 8 - Résiliation',
      content: `**Résiliation par l'utilisateur :**
Tout utilisateur peut supprimer son compte à tout moment depuis les paramètres de son profil ou en contactant notre support.

**Résiliation par CityHealth SBA :**
Nous nous réservons le droit de suspendre ou supprimer un compte en cas de :
• Violation des présentes CGU
• Fourniture d'informations fausses ou trompeuses
• Comportement nuisible envers d'autres utilisateurs
• Non-paiement des services premium (pour les prestataires)
• Inactivité prolongée (plus de 3 ans)

**Conséquences de la résiliation :**
• Suppression des données personnelles (sauf obligation légale de conservation)
• Perte d'accès aux fonctionnalités du compte
• Conservation anonymisée des avis publiés`
    },
    {
      id: 'modifications',
      icon: RefreshCw,
      title: 'Article 9 - Modifications du service',
      content: `CityHealth SBA se réserve le droit de :

**Évolution du service :**
• Ajouter, modifier ou supprimer des fonctionnalités
• Modifier la structure tarifaire avec préavis de 30 jours
• Interrompre temporairement le service pour maintenance

**Communication des changements :**
Les modifications significatives seront communiquées par :
• Email aux utilisateurs concernés
• Notification sur la plateforme
• Publication sur notre blog/actualités

**Continuité du service :**
En cas de cessation définitive du service, les utilisateurs seront informés au moins 90 jours à l'avance et pourront récupérer leurs données.`
    },
    {
      id: 'applicable-law',
      icon: Gavel,
      title: 'Article 10 - Droit applicable',
      content: `**Législation applicable :**
Les présentes CGU sont régies par le droit algérien.

**Règlement des litiges :**
En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.

À défaut d'accord amiable dans un délai de 30 jours, le litige sera soumis aux tribunaux compétents de Sidi Bel Abbès.

**Médiation :**
Pour les litiges de consommation, l'utilisateur peut recourir gratuitement à un médiateur de la consommation.

**Nullité partielle :**
Si une clause des présentes CGU est déclarée nulle, les autres clauses restent en vigueur.`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Conditions Générales <span className="text-primary">d'Utilisation</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Règles d'utilisation de la plateforme CityHealth SBA
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className="mt-4">
            <Clock className="h-3 w-3 mr-1" />
            Dernière mise à jour : 25 janvier 2025
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick summary */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Scale className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">En résumé</h3>
                  <p className="text-sm text-muted-foreground">
                    CityHealth SBA est une plateforme de mise en relation entre patients et professionnels de santé à Sidi Bel Abbès. 
                    En utilisant nos services, vous acceptez de fournir des informations exactes, de respecter les autres utilisateurs 
                    et de vous conformer à la législation algérienne en vigueur.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Accordion type="single" collapsible className="space-y-4">
            {sections.map((section) => (
              <AccordionItem 
                key={section.id} 
                value={section.id}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <section.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-left">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="prose prose-sm max-w-none text-muted-foreground pl-11">
                    {section.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Footer */}
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Ces CGU sont complétées par notre{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Politique de Confidentialité
                </Link>
                .
              </p>
              <Link to="/contact">
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Nous contacter
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
