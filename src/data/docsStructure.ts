import { 
  BookOpen, 
  Users, 
  Stethoscope, 
  Zap, 
  User, 
  HelpCircle,
  Rocket,
  Search,
  Map,
  Heart,
  Siren,
  FileCheck,
  Camera,
  Bot,
  Droplets,
  Shield,
  Settings,
  LogIn
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface DocPage {
  id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  content: string;
  contentAr?: string;
  contentEn?: string;
  icon?: LucideIcon;
  tags?: string[];
}

export interface DocSection {
  id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon: LucideIcon;
  color: string;
  pages: DocPage[];
}

export const docsStructure: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Démarrage',
    titleAr: 'البدء',
    titleEn: 'Getting Started',
    description: 'Premiers pas avec CityHealth',
    descriptionAr: 'الخطوات الأولى مع CityHealth',
    descriptionEn: 'First steps with CityHealth',
    icon: Rocket,
    color: 'text-blue-500',
    pages: [
      {
        id: 'welcome',
        title: 'Bienvenue sur CityHealth',
        titleAr: 'مرحباً بك في CityHealth',
        titleEn: 'Welcome to CityHealth',
        description: 'Découvrez la plateforme de santé de Sidi Bel Abbès',
        icon: BookOpen,
        tags: ['accueil', 'introduction', 'présentation'],
        content: `
# Bienvenue sur CityHealth

CityHealth est la plateforme de référence pour connecter les citoyens de Sidi Bel Abbès avec les meilleurs prestataires de santé vérifiés de la région.

## Notre Mission

Faciliter l'accès aux soins de santé pour tous les habitants de Sidi Bel Abbès en :
- **Centralisant** les informations sur les professionnels de santé
- **Vérifiant** les qualifications de chaque prestataire
- **Simplifiant** la prise de rendez-vous
- **Offrant** un assistant IA pour les questions de santé

## Ce que vous pouvez faire

### Pour les Citoyens
- Rechercher des médecins et spécialistes
- Consulter la carte interactive des prestataires
- Prendre rendez-vous en ligne
- Accéder aux services d'urgence 24/7
- Utiliser l'assistant IA santé

### Pour les Professionnels
- S'inscrire et créer son profil
- Gérer ses disponibilités
- Recevoir des demandes de rendez-vous
- Obtenir la vérification officielle

## Commencez maintenant

Utilisez la barre de recherche pour trouver un professionnel de santé, ou explorez la carte interactive pour découvrir les prestataires près de chez vous.
        `
      },
      {
        id: 'first-steps',
        title: 'Premiers pas',
        titleAr: 'الخطوات الأولى',
        titleEn: 'First Steps',
        description: 'Comment utiliser CityHealth efficacement',
        icon: Rocket,
        tags: ['guide', 'tutoriel', 'démarrage'],
        content: `
# Premiers pas avec CityHealth

Ce guide vous aidera à prendre en main CityHealth rapidement.

## 1. Créer un compte (optionnel)

Vous pouvez naviguer sur CityHealth sans compte, mais la création d'un compte vous permet de :
- Sauvegarder vos favoris
- Prendre des rendez-vous
- Recevoir des notifications
- Accéder à votre historique

## 2. Rechercher un professionnel

### Par la barre de recherche
1. Cliquez sur la barre de recherche
2. Tapez une spécialité, un nom ou un symptôme
3. Utilisez les filtres pour affiner les résultats

### Par la carte interactive
1. Accédez à la carte via le menu
2. Explorez les différentes zones
3. Cliquez sur un marqueur pour voir les détails

## 3. Consulter un profil

Chaque profil de professionnel affiche :
- Les informations de contact
- Les horaires d'ouverture
- Les avis des patients
- Le badge de vérification (si applicable)

## 4. Prendre rendez-vous

1. Sélectionnez un créneau disponible
2. Confirmez vos informations
3. Recevez la confirmation par email

## Besoin d'aide ?

Utilisez l'assistant IA en cliquant sur l'icône en bas à droite de l'écran pour poser vos questions.
        `
      },
      {
        id: 'why-cityhealth',
        title: 'Pourquoi CityHealth ?',
        titleAr: 'لماذا CityHealth؟',
        titleEn: 'Why CityHealth?',
        description: 'Comprendre notre mission et nos valeurs',
        icon: Heart,
        tags: ['mission', 'valeurs', 'pourquoi', 'vision'],
        content: `
# Pourquoi CityHealth ?

Révolutionner l'accès aux soins de santé à Sidi Bel Abbès.

## 🎯 Parce que l'accès aux soins doit être simple

Dans une ville en pleine croissance, trouver le bon professionnel de santé peut être un défi :
- **Centralisation** : Toutes les informations au même endroit
- **Disponibilité 24h/24** : Accédez à la plateforme à tout moment
- **Multilingue** : Arabe, Français et Anglais

## ⚡ Parce que les urgences n'attendent pas

Chaque seconde compte en situation d'urgence :
- **Accès instantané** aux pharmacies de garde
- **Numéros d'urgence** toujours visibles
- **Itinéraires GPS** vers l'établissement le plus proche

## ✅ Parce que la confiance est essentielle

Votre santé mérite les meilleurs professionnels :
- **Vérification** des diplômes et accréditations
- **Badge de confiance** pour les praticiens certifiés
- **Avis vérifiés** de vrais patients

## 🤝 Parce que la santé est une affaire collective

Nous connectons toute la communauté :
- **500+** professionnels de santé référencés
- **Services 24/7** pour les urgences
- **3 langues** pour tous les citoyens

## 📍 Parce que nous connaissons notre ville

CityHealth est fait par et pour Sidi Bel Abbès :
- **Données locales** actualisées
- **Carte interactive** de la ville
- **Support local** réactif

## Notre vision

Faire de Sidi Bel Abbès un modèle d'accès aux soins en Algérie, où chaque citoyen peut trouver le professionnel adapté à ses besoins en quelques clics.
        `
      },
      {
        id: 'how-it-works',
        title: 'Comment ça marche ?',
        titleAr: 'كيف يعمل؟',
        titleEn: 'How It Works',
        description: 'Guide complet du fonctionnement de la plateforme',
        icon: Zap,
        tags: ['guide', 'fonctionnement', 'tutoriel', 'étapes'],
        content: `
# Comment fonctionne CityHealth ?

Une plateforme simple et intuitive pour connecter les citoyens aux professionnels de santé.

## 🔍 Pour les Citoyens - 4 étapes simples

### 1. Recherchez
Utilisez notre moteur de recherche intelligent :
- Par **spécialité** : cardiologue, dentiste, pédiatre...
- Par **symptôme** : mal de tête, douleur au dos...
- Par **localisation** : près de chez vous

### 2. Comparez
Consultez les profils détaillés :
- Qualifications et diplômes
- Horaires d'ouverture
- Avis des patients
- Photos du cabinet

### 3. Localisez
Visualisez sur la carte interactive :
- Position exacte sur la carte
- Distance depuis votre position
- Itinéraire GPS en un clic

### 4. Contactez
Prenez rendez-vous facilement :
- Appel direct depuis l'application
- Réservation en ligne (si disponible)
- Chat avec l'assistant IA

## 👨‍⚕️ Pour les Professionnels

| Étape | Description | Résultat |
|-------|-------------|----------|
| Inscription | Créez votre profil | Compte activé |
| Vérification | Soumettez vos documents | Badge ✅ |
| Personnalisation | Complétez votre profil | Visibilité maximale |
| Gestion | Gérez vos RDV | Patients satisfaits |

## 📱 Accès multi-plateforme

CityHealth fonctionne sur :
- **Ordinateur** : Chrome, Firefox, Safari, Edge
- **Tablette** : Interface adaptée
- **Mobile** : Progressive Web App

## 🆘 Numéros d'urgence

| Service | Numéro |
|---------|--------|
| SAMU | 14 |
| Police | 17 |
| Protection Civile | 14 |
| Gendarmerie | 1055 |

## 🤖 Assistant IA

Notre assistant intelligent peut :
- Répondre à vos questions de santé
- Suggérer des spécialistes adaptés
- Guider votre navigation sur la plateforme
        `
      }
    ]
  },
  {
    id: 'citizens',
    title: 'Pour les Citoyens',
    titleAr: 'للمواطنين',
    titleEn: 'For Citizens',
    description: 'Guide complet pour les patients et utilisateurs',
    descriptionAr: 'دليل شامل للمرضى والمستخدمين',
    descriptionEn: 'Complete guide for patients and users',
    icon: Users,
    color: 'text-green-500',
    pages: [
      {
        id: 'search-provider',
        title: 'Rechercher un médecin',
        titleAr: 'البحث عن طبيب',
        titleEn: 'Search for a Doctor',
        description: 'Trouvez le professionnel adapté à vos besoins',
        icon: Search,
        tags: ['recherche', 'médecin', 'spécialiste', 'trouver'],
        content: `
# Rechercher un médecin

CityHealth vous permet de trouver facilement le professionnel de santé adapté à vos besoins.

## Utiliser la barre de recherche

La barre de recherche intelligente comprend vos besoins :

- **Par spécialité** : "cardiologue", "dentiste", "pédiatre"
- **Par symptôme** : "mal de tête", "douleur au dos"
- **Par nom** : le nom du praticien si vous le connaissez
- **Par adresse** : pour trouver des praticiens proches

## Filtres disponibles

### Type de praticien
- Médecin généraliste
- Spécialiste
- Pharmacie
- Laboratoire
- Clinique / Hôpital

### Disponibilité
- Ouvert maintenant
- Rendez-vous disponibles
- Garde de nuit

### Distance
- Moins de 1 km
- Moins de 5 km
- Toute la ville

### Badge de vérification
- Praticiens vérifiés uniquement
- Tous les praticiens

## Comprendre les résultats

Chaque résultat affiche :
- ⭐ Note moyenne et nombre d'avis
- 📍 Distance depuis votre position
- ✅ Badge de vérification si applicable
- 🕐 Prochaine disponibilité

## Conseils

1. Activez la géolocalisation pour des résultats plus précis
2. Utilisez les avis pour comparer les praticiens
3. Vérifiez les horaires avant de vous déplacer
        `
      },
      {
        id: 'use-map',
        title: 'Utiliser la carte interactive',
        titleAr: 'استخدام الخريطة التفاعلية',
        titleEn: 'Using the Interactive Map',
        description: 'Naviguez visuellement pour trouver des prestataires',
        icon: Map,
        tags: ['carte', 'map', 'localisation', 'GPS'],
        content: `
# Utiliser la carte interactive

La carte CityHealth vous permet de visualiser tous les prestataires de santé de Sidi Bel Abbès.

## Accéder à la carte

1. Cliquez sur "Carte" dans le menu principal
2. Ou utilisez l'icône carte dans la barre de navigation

## Navigation

### Zoom et déplacement
- Utilisez la molette de la souris pour zoomer
- Cliquez-glissez pour vous déplacer
- Double-cliquez pour centrer sur un point

### Types de marqueurs
- 🔴 Urgences et hôpitaux
- 🔵 Médecins et spécialistes
- 🟢 Pharmacies
- 🟡 Laboratoires
- 🩸 Centres de don de sang

## Modes de carte

### Mode Prestataires
Affiche tous les professionnels de santé par catégorie.

### Mode Urgences
Affiche uniquement les services d'urgence 24/7.

### Mode Don de sang
Localise les centres de don et les collectes mobiles.

## Fonctionnalités

### Ma position
Cliquez sur l'icône de localisation pour centrer la carte sur votre position.

### Filtres
Utilisez le panneau de filtres pour afficher uniquement certaines catégories.

### Itinéraire
Cliquez sur "Itinéraire" depuis un marqueur pour ouvrir Google Maps.

## Accessibilité

La carte est entièrement navigable au clavier avec les touches directionnelles.
        `
      },
      {
        id: 'favorites',
        title: 'Gérer vos favoris',
        titleAr: 'إدارة المفضلات',
        titleEn: 'Managing Favorites',
        description: 'Sauvegardez vos praticiens préférés',
        icon: Heart,
        tags: ['favoris', 'sauvegarde', 'liste'],
        content: `
# Gérer vos favoris

Sauvegardez vos praticiens préférés pour y accéder rapidement.

## Ajouter aux favoris

1. Trouvez un praticien via la recherche ou la carte
2. Cliquez sur l'icône ❤️ sur sa fiche
3. Le praticien est ajouté à vos favoris

## Accéder à vos favoris

- Cliquez sur "Mes favoris" dans le menu
- Ou accédez à votre profil > Favoris

## Organiser vos favoris

Vos favoris sont automatiquement classés par catégorie :
- Médecins généralistes
- Spécialistes
- Pharmacies
- Autres

## Supprimer un favori

Cliquez à nouveau sur l'icône ❤️ pour retirer un praticien de vos favoris.

## Synchronisation

Vos favoris sont synchronisés sur tous vos appareils si vous êtes connecté à votre compte.
        `
      },
      {
        id: 'emergency',
        title: 'Services d\'urgence',
        titleAr: 'خدمات الطوارئ',
        titleEn: 'Emergency Services',
        description: 'Accédez rapidement aux urgences 24/7',
        icon: Siren,
        tags: ['urgence', 'hôpital', '24/7', 'garde'],
        content: `
# Services d'urgence

CityHealth vous aide à accéder rapidement aux services d'urgence de Sidi Bel Abbès.

## Numéros d'urgence

| Service | Numéro |
|---------|--------|
| SAMU | 15 |
| Police | 17 |
| Pompiers | 14 |
| Protection civile | 1021 |

## Accès rapide

### Bouton d'urgence
Un bouton d'urgence rouge est accessible depuis toutes les pages de CityHealth.

### Carte des urgences
Accédez à la carte en mode "Urgences" pour voir :
- Hôpitaux avec service d'urgence
- Pharmacies de garde
- SAMU et ambulances

## Pharmacies de garde

La liste des pharmacies de garde est mise à jour quotidiennement.

### Ce week-end
Consultez la section "Urgences" pour la liste du week-end en cours.

### Nuit
Les pharmacies de garde de nuit sont signalées par une icône 🌙

## CHU de Sidi Bel Abbès

**Adresse** : Boulevard Dr Benzerdjeb, Sidi Bel Abbès

**Services d'urgence** :
- Urgences générales : 24/7
- Urgences pédiatriques : 24/7
- Urgences maternité : 24/7

## Conseils

1. Enregistrez les numéros d'urgence dans votre téléphone
2. Gardez votre carte de sécurité sociale accessible
3. En cas de doute, appelez le 15 (SAMU)
        `
      }
    ]
  },
  {
    id: 'providers',
    title: 'Pour les Professionnels',
    titleAr: 'للمحترفين',
    titleEn: 'For Healthcare Providers',
    description: 'Guide pour les professionnels de santé',
    descriptionAr: 'دليل لمحترفي الصحة',
    descriptionEn: 'Guide for healthcare professionals',
    icon: Stethoscope,
    color: 'text-purple-500',
    pages: [
      {
        id: 'registration',
        title: 'S\'inscrire comme professionnel',
        titleAr: 'التسجيل كمحترف',
        titleEn: 'Register as a Professional',
        description: 'Créez votre profil professionnel sur CityHealth',
        icon: FileCheck,
        tags: ['inscription', 'registration', 'professionnel', 'praticien'],
        content: `
# S'inscrire comme professionnel

Rejoignez CityHealth pour être visible par des milliers de patients à Sidi Bel Abbès.

## Qui peut s'inscrire ?

- Médecins généralistes
- Médecins spécialistes
- Chirurgiens-dentistes
- Pharmaciens
- Infirmiers
- Kinésithérapeutes
- Laboratoires d'analyses
- Cliniques et hôpitaux

## Processus d'inscription

### Étape 1 : Créer un compte
1. Cliquez sur "Inscription Prestataire"
2. Renseignez votre email et créez un mot de passe
3. Validez votre email

### Étape 2 : Informations de base
- Nom et prénom
- Spécialité principale
- Numéro d'ordre (si applicable)

### Étape 3 : Localisation
- Adresse du cabinet/établissement
- Positionnement sur la carte
- Zone de couverture

### Étape 4 : Services
- Liste des services proposés
- Tarifs (optionnel)
- Modes de paiement acceptés

### Étape 5 : Documents
- Photo de profil professionnelle
- Diplômes et certifications
- Attestation d'assurance

### Étape 6 : Vérification
Votre dossier est examiné par notre équipe sous 48h.

## Documents requis

| Document | Obligatoire |
|----------|-------------|
| Pièce d'identité | ✅ |
| Diplôme | ✅ |
| N° Ordre | ✅ (si applicable) |
| Photo pro | ✅ |
| Assurance | ⚪ Recommandé |

## Après l'inscription

Une fois vérifié, vous obtenez :
- Un badge ✅ "Vérifié" sur votre profil
- Visibilité dans les recherches
- Accès au tableau de bord professionnel
        `
      },
      {
        id: 'profile-setup',
        title: 'Compléter son profil',
        titleAr: 'إكمال الملف الشخصي',
        titleEn: 'Complete Your Profile',
        description: 'Optimisez votre profil pour attirer plus de patients',
        icon: User,
        tags: ['profil', 'optimisation', 'visibilité'],
        content: `
# Compléter son profil

Un profil complet augmente votre visibilité et inspire confiance aux patients.

## Éléments essentiels

### Photo de profil
- Photo professionnelle, de face
- Fond neutre
- Tenue professionnelle recommandée

### Description
Rédigez une bio de 100-200 mots incluant :
- Votre parcours et formation
- Vos spécialisations
- Votre approche patient

### Horaires
Renseignez précisément vos horaires :
- Heures d'ouverture par jour
- Pauses (midi, etc.)
- Jours de fermeture

### Services détaillés
Listez tous les services que vous proposez avec :
- Description claire
- Durée estimée
- Tarif (optionnel mais recommandé)

## Conseils d'optimisation

1. **Ajoutez des photos** de votre cabinet/clinique
2. **Répondez aux avis** (positifs comme négatifs)
3. **Mettez à jour régulièrement** vos disponibilités
4. **Utilisez des mots-clés** pertinents dans votre description

## Statistiques

Votre tableau de bord affiche :
- Nombre de vues de votre profil
- Demandes de rendez-vous
- Avis et notes reçus
        `
      },
      {
        id: 'verification',
        title: 'Processus de vérification',
        titleAr: 'عملية التحقق',
        titleEn: 'Verification Process',
        description: 'Comment obtenir le badge vérifié',
        icon: Shield,
        tags: ['vérification', 'badge', 'confiance', 'authentification'],
        content: `
# Processus de vérification

Le badge "Vérifié" garantit aux patients que vous êtes un professionnel authentique.

## Pourquoi être vérifié ?

- ✅ Badge visible sur votre profil
- 📈 Meilleur classement dans les recherches
- 🏆 Confiance accrue des patients
- 🔒 Accès à toutes les fonctionnalités

## Documents requis

### Pour les médecins
1. Diplôme de médecine
2. Inscription à l'Ordre des médecins
3. Pièce d'identité

### Pour les pharmaciens
1. Diplôme de pharmacie
2. Autorisation d'exercer
3. Pièce d'identité

### Pour les autres professionnels
1. Diplôme ou certification
2. Agrément (si applicable)
3. Pièce d'identité

## Processus

### 1. Téléchargement
Téléchargez vos documents depuis votre espace professionnel.

### 2. Vérification OCR
Nos outils vérifient automatiquement la validité des documents.

### 3. Revue manuelle
Notre équipe examine votre dossier sous 48h ouvrées.

### 4. Résultat
Vous recevez un email avec le résultat :
- ✅ Vérifié : badge activé immédiatement
- ⚠️ Documents insuffisants : précisions demandées
- ❌ Refusé : motifs expliqués

## Renouvellement

La vérification est valable 2 ans. Vous serez notifié avant expiration.
        `
      },
      {
        id: 'ocr-verification',
        title: 'Vérification OCR des documents',
        titleAr: 'التحقق من المستندات بالقراءة الآلية',
        titleEn: 'OCR Document Verification',
        description: 'Comment fonctionne notre système de lecture automatique',
        icon: Camera,
        tags: ['OCR', 'document', 'scan', 'automatique'],
        content: `
# Vérification OCR des documents

CityHealth utilise la technologie OCR (Reconnaissance Optique de Caractères) pour accélérer la vérification.

## Comment ça marche ?

1. **Téléchargement** : Vous uploadez une photo ou scan de votre document
2. **Extraction** : Notre IA lit les informations du document
3. **Validation** : Les données sont comparées avec les bases officielles
4. **Résultat** : Confirmation ou demande de document plus lisible

## Conseils pour de bons scans

### Qualité de l'image
- Résolution minimale : 300 DPI
- Format : PDF, JPG, PNG
- Taille max : 10 Mo par document

### Positionnement
- Document bien cadré
- Pas de reflets ni d'ombres
- Texte lisible et net

### Éclairage
- Lumière uniforme
- Évitez le flash direct
- Préférez la lumière naturelle

## Documents supportés

| Type | Langues | Précision |
|------|---------|-----------|
| Diplômes | FR, AR | 98% |
| Cartes d'ordre | FR | 99% |
| Pièces d'identité | FR, AR | 97% |

## En cas d'échec

Si l'OCR ne peut pas lire votre document :
1. Vérifiez la qualité de l'image
2. Re-scannez avec un meilleur éclairage
3. Contactez le support pour une vérification manuelle
        `
      }
    ]
  },
  {
    id: 'features',
    title: 'Fonctionnalités',
    titleAr: 'الميزات',
    titleEn: 'Features',
    description: 'Découvrez toutes les fonctionnalités de CityHealth',
    descriptionAr: 'اكتشف جميع ميزات CityHealth',
    descriptionEn: 'Discover all CityHealth features',
    icon: Zap,
    color: 'text-yellow-500',
    pages: [
      {
        id: 'ai-assistant',
        title: 'Assistant IA Santé',
        titleAr: 'مساعد الذكاء الاصطناعي للصحة',
        titleEn: 'AI Health Assistant',
        description: 'Posez vos questions de santé à notre assistant intelligent',
        icon: Bot,
        tags: ['IA', 'chatbot', 'assistant', 'questions'],
        content: `
# Assistant IA Santé

L'assistant IA CityHealth répond à vos questions de santé générales 24/7.

## Ce que peut faire l'assistant

### Informations générales
- Expliquer des termes médicaux
- Décrire des symptômes courants
- Donner des conseils de prévention

### Orientation
- Suggérer le type de spécialiste adapté
- Recommander de consulter en urgence si nécessaire
- Proposer des praticiens sur CityHealth

### Rappels et suivi
- Créer des rappels de médicaments
- Programmer des alertes de rendez-vous
- Suivre vos symptômes

## Limitations importantes

⚠️ **L'assistant IA ne remplace pas un médecin**

- Pas de diagnostic médical
- Pas de prescription
- Pas de conseils personnalisés sur des traitements

## Comment l'utiliser

1. Cliquez sur l'icône 🤖 en bas à droite
2. Posez votre question en langage naturel
3. Suivez les recommandations ou approfondissez

## Exemples de questions

- "Quels sont les symptômes de la grippe ?"
- "Quel spécialiste consulter pour un mal de dos ?"
- "Comment prévenir le diabète ?"
- "Créer un rappel pour mon médicament à 8h"

## Confidentialité

Vos conversations sont chiffrées et ne sont pas partagées avec des tiers.
        `
      },
      {
        id: 'blood-donation',
        title: 'Don de sang',
        titleAr: 'التبرع بالدم',
        titleEn: 'Blood Donation',
        description: 'Trouvez les centres de don et collectes près de chez vous',
        icon: Droplets,
        tags: ['don', 'sang', 'collecte', 'solidarité'],
        content: `
# Don de sang

CityHealth facilite le don de sang à Sidi Bel Abbès.

## Trouver un centre de don

### Carte interactive
Accédez à la carte en mode "Don de sang" pour voir :
- Centres de transfusion permanents
- Collectes mobiles programmées
- Points de don éphémères

### Centres permanents

| Lieu | Adresse | Horaires |
|------|---------|----------|
| CHU SBA | Bd Benzerdjeb | 8h-16h |
| CTS | Rue Emir AEK | 8h-14h |

## Conditions pour donner

### Critères généraux
- Avoir entre 18 et 65 ans
- Peser plus de 50 kg
- Être en bonne santé
- Avoir bien dormi et mangé

### Contre-indications
- Maladie récente
- Prise de certains médicaments
- Tatouage ou piercing récent (< 4 mois)
- Voyage récent en zone à risque

## Déroulement d'un don

1. **Inscription** (5 min)
2. **Entretien médical** (10 min)
3. **Don** (10-15 min)
4. **Collation** (15 min)

## Alertes

Inscrivez-vous aux alertes pour être notifié :
- Des collectes près de chez vous
- Des besoins urgents de votre groupe sanguin
        `
      }
    ]
  },
  {
    id: 'account',
    title: 'Compte & Paramètres',
    titleAr: 'الحساب والإعدادات',
    titleEn: 'Account & Settings',
    description: 'Gérez votre compte CityHealth',
    descriptionAr: 'إدارة حساب CityHealth الخاص بك',
    descriptionEn: 'Manage your CityHealth account',
    icon: User,
    color: 'text-indigo-500',
    pages: [
      {
        id: 'create-account',
        title: 'Créer un compte',
        titleAr: 'إنشاء حساب',
        titleEn: 'Create an Account',
        description: 'Inscrivez-vous sur CityHealth',
        icon: LogIn,
        tags: ['inscription', 'compte', 'email', 'créer'],
        content: `
# Créer un compte

Un compte CityHealth vous donne accès à toutes les fonctionnalités.

## Méthodes d'inscription

### Par email
1. Cliquez sur "S'inscrire"
2. Entrez votre email
3. Créez un mot de passe sécurisé
4. Validez via le lien reçu par email

### Par Google
1. Cliquez sur "Continuer avec Google"
2. Sélectionnez votre compte Google
3. C'est fait !

## Avantages d'un compte

| Fonctionnalité | Sans compte | Avec compte |
|----------------|-------------|-------------|
| Recherche | ✅ | ✅ |
| Carte | ✅ | ✅ |
| Favoris | ❌ | ✅ |
| Rendez-vous | ❌ | ✅ |
| Historique | ❌ | ✅ |
| Assistant IA+ | ⚪ Limité | ✅ Complet |

## Sécurité du mot de passe

Votre mot de passe doit contenir :
- Au moins 8 caractères
- Une lettre majuscule
- Une lettre minuscule
- Un chiffre
- Un caractère spécial (recommandé)

## Protection des données

Vos données sont protégées selon la réglementation algérienne sur la protection des données personnelles.
        `
      },
      {
        id: 'settings',
        title: 'Paramètres du compte',
        titleAr: 'إعدادات الحساب',
        titleEn: 'Account Settings',
        description: 'Personnalisez votre expérience CityHealth',
        icon: Settings,
        tags: ['paramètres', 'configuration', 'préférences', 'notifications'],
        content: `
# Paramètres du compte

Personnalisez CityHealth selon vos préférences.

## Accéder aux paramètres

1. Connectez-vous à votre compte
2. Cliquez sur votre avatar en haut à droite
3. Sélectionnez "Paramètres"

## Paramètres disponibles

### Profil
- Photo de profil
- Nom affiché
- Numéro de téléphone
- Adresse (pour la géolocalisation)

### Notifications
- Rappels de rendez-vous
- Alertes don de sang
- Newsletter CityHealth
- Notifications push

### Confidentialité
- Visibilité du profil
- Historique de recherche
- Cookies et tracking

### Affichage
- Thème (clair/sombre/automatique)
- Langue (Français/Arabe/Anglais)
- Taille de police

### Sécurité
- Changer le mot de passe
- Authentification à deux facteurs
- Sessions actives
- Supprimer le compte

## Langue

CityHealth est disponible en :
- 🇫🇷 Français
- 🇩🇿 العربية (Arabe)
- 🇬🇧 English

Changez la langue depuis le menu en bas du site ou dans les paramètres.
        `
      }
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    titleAr: 'الأسئلة الشائعة',
    titleEn: 'FAQ',
    description: 'Questions fréquemment posées',
    descriptionAr: 'الأسئلة المتكررة',
    descriptionEn: 'Frequently Asked Questions',
    icon: HelpCircle,
    color: 'text-orange-500',
    pages: [
      {
        id: 'general-faq',
        title: 'Questions générales',
        titleAr: 'أسئلة عامة',
        titleEn: 'General Questions',
        description: 'Réponses aux questions les plus courantes',
        icon: HelpCircle,
        tags: ['FAQ', 'questions', 'aide', 'support'],
        content: `
# Questions générales

Retrouvez les réponses aux questions les plus fréquentes.

## CityHealth est-il gratuit ?

**Oui**, CityHealth est entièrement gratuit pour les patients. Les professionnels peuvent accéder à des fonctionnalités premium moyennant un abonnement.

## Comment contacter le support ?

- **Email** : contact@cityhealth.dz
- **Téléphone** : +213 48 XX XX XX
- **Formulaire** : Page Contact

Délai de réponse : 24-48h ouvrées.

## Mes données sont-elles sécurisées ?

Oui, CityHealth utilise :
- Chiffrement SSL/TLS
- Stockage sécurisé des données
- Conformité RGPD

## Puis-je supprimer mon compte ?

Oui, depuis Paramètres > Sécurité > Supprimer le compte. Vos données seront supprimées sous 30 jours.

## L'application mobile existe-t-elle ?

CityHealth est accessible via navigateur mobile. Une application native est en développement.

## Comment signaler un problème ?

1. Utilisez le bouton "Signaler" sur la page concernée
2. Ou contactez le support avec une capture d'écran

## Les avis sont-ils vérifiés ?

Seuls les utilisateurs ayant un compte vérifié peuvent laisser un avis. Les avis frauduleux sont supprimés.

## Quelles villes sont couvertes ?

Actuellement, CityHealth couvre Sidi Bel Abbès et sa région. L'extension à d'autres wilayas est prévue.
        `
      }
    ]
  }
];

// Helper function to find a doc page by section and page id
export const findDocPage = (sectionId: string, pageId: string): DocPage | undefined => {
  const section = docsStructure.find(s => s.id === sectionId);
  return section?.pages.find(p => p.id === pageId);
};

// Helper function to get all pages flattened
export const getAllDocPages = (): Array<DocPage & { sectionId: string; sectionTitle: string }> => {
  return docsStructure.flatMap(section => 
    section.pages.map(page => ({
      ...page,
      sectionId: section.id,
      sectionTitle: section.title
    }))
  );
};

// Search function for local search
export const searchDocs = (query: string): Array<DocPage & { sectionId: string; sectionTitle: string }> => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  return getAllDocPages().filter(page => {
    const searchableText = [
      page.title,
      page.titleAr,
      page.titleEn,
      page.description,
      page.content,
      ...(page.tags || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(normalizedQuery);
  });
};
