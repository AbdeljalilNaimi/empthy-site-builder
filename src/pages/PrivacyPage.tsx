import { Shield, Lock, Eye, Database, Clock, UserCheck, Cookie, Server, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const PrivacyPage = () => {
  const sections = [
    {
      id: 'introduction',
      icon: Shield,
      title: '1. Introduction',
      content: `CityHealth SBA ("nous", "notre", "nos") s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément à la réglementation en vigueur.

Notre plateforme met en relation les citoyens de Sidi Bel Abbès avec les professionnels de santé locaux. Nous traitons vos données avec le plus grand soin et transparence.`
    },
    {
      id: 'data-collected',
      icon: Database,
      title: '2. Données collectées',
      content: `Nous collectons les catégories de données suivantes :

**Données d'identification :**
• Nom, prénom, adresse email
• Numéro de téléphone
• Photo de profil (optionnelle)

**Données de santé (pour les prestataires) :**
• Spécialité médicale
• Numéro d'agrément professionnel
• Diplômes et certifications

**Données de localisation :**
• Adresse du cabinet/établissement
• Coordonnées géographiques pour la carte

**Données d'utilisation :**
• Historique de recherche
• Rendez-vous pris
• Avis et évaluations`
    },
    {
      id: 'purposes',
      icon: Eye,
      title: '3. Finalités du traitement',
      content: `Vos données sont utilisées pour :

**Fourniture du service :**
• Mise en relation patients-praticiens
• Gestion des rendez-vous
• Affichage sur la carte interactive

**Amélioration du service :**
• Analyse statistique anonymisée
• Optimisation de l'expérience utilisateur
• Développement de nouvelles fonctionnalités

**Sécurité :**
• Vérification des identités professionnelles
• Prévention des fraudes
• Protection contre les accès non autorisés

**Communication :**
• Notifications de rendez-vous
• Mises à jour importantes du service
• Newsletter (avec consentement)`
    },
    {
      id: 'legal-basis',
      icon: UserCheck,
      title: '4. Base légale',
      content: `Le traitement de vos données repose sur :

**Consentement :** Pour la création de compte, la géolocalisation et les communications marketing.

**Exécution du contrat :** Pour la fourniture du service de mise en relation et la gestion des rendez-vous.

**Obligation légale :** Pour la conservation des données de santé et la vérification des qualifications professionnelles.

**Intérêt légitime :** Pour la sécurité de la plateforme et l'amélioration du service.`
    },
    {
      id: 'retention',
      icon: Clock,
      title: '5. Durée de conservation',
      content: `Nous conservons vos données selon les durées suivantes :

| Type de données | Durée de conservation |
|-----------------|----------------------|
| Compte actif | Durée de l'utilisation |
| Compte inactif | 3 ans après dernière connexion |
| Données de santé | 10 ans (obligation légale) |
| Logs de connexion | 1 an |
| Données de facturation | 10 ans |

Après ces délais, vos données sont supprimées ou anonymisées de manière irréversible.`
    },
    {
      id: 'rights',
      icon: UserCheck,
      title: '6. Vos droits',
      content: `Vous disposez des droits suivants :

**Droit d'accès :** Obtenir une copie de vos données personnelles.

**Droit de rectification :** Corriger des données inexactes ou incomplètes.

**Droit à l'effacement :** Demander la suppression de vos données (sous conditions).

**Droit à la portabilité :** Recevoir vos données dans un format structuré.

**Droit d'opposition :** Vous opposer au traitement pour des raisons légitimes.

**Droit de limitation :** Restreindre le traitement de vos données.

Pour exercer ces droits, contactez-nous à : privacy@cityhealth-sba.dz`
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: '7. Cookies',
      content: `Notre site utilise des cookies pour :

**Cookies essentiels :**
• Authentification et sécurité
• Préférences de langue
• Session utilisateur

**Cookies analytiques :**
• Statistiques d'utilisation anonymisées
• Amélioration des performances

**Cookies fonctionnels :**
• Mémorisation des préférences
• Personnalisation de l'expérience

Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.`
    },
    {
      id: 'security',
      icon: Server,
      title: '8. Sécurité',
      content: `Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :

**Mesures techniques :**
• Chiffrement SSL/TLS pour toutes les communications
• Chiffrement des données sensibles au repos
• Authentification sécurisée avec hachage des mots de passe
• Pare-feu et détection d'intrusion

**Mesures organisationnelles :**
• Accès limité aux données (principe du moindre privilège)
• Formation du personnel à la protection des données
• Audits de sécurité réguliers
• Procédures de notification en cas de violation`
    },
    {
      id: 'contact',
      icon: Mail,
      title: '9. Contact',
      content: `Pour toute question concernant cette politique ou vos données personnelles :

**Responsable du traitement :**
CityHealth SBA
Sidi Bel Abbès, Algérie

**Délégué à la Protection des Données :**
Email : dpo@cityhealth-sba.dz

**Adresse postale :**
CityHealth SBA - DPO
BP 123, Sidi Bel Abbès 22000
Algérie

Nous nous engageons à répondre à vos demandes dans un délai de 30 jours.`
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Politique de <span className="text-primary">Confidentialité</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Protection de vos données personnelles
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
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">En résumé</h3>
                  <p className="text-sm text-muted-foreground">
                    CityHealth SBA collecte uniquement les données nécessaires au fonctionnement du service. 
                    Vos données sont protégées par des mesures de sécurité avancées et ne sont jamais vendues à des tiers. 
                    Vous pouvez exercer vos droits à tout moment en nous contactant.
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
                Cette politique de confidentialité fait partie intégrante de nos{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Conditions Générales d'Utilisation
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

export default PrivacyPage;
