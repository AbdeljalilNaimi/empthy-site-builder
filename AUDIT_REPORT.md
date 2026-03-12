# Rapport d'Audit et Corrections - Auth, Rôles & Structure

## Résumé Exécutif

Audit complet et corrections du système d'authentification, des rôles (RBAC) et de la structure de données, conformément à l'architecture Firebase Auth + Firestore.

---

## 1. État Actuel Après Corrections

### ✅ Structure des Rôles

| Type | Collection | Route Dashboard | Login Page |
|------|------------|-----------------|------------|
| **Admin** | `users/{uid}` + `admins/{uid}` | `/admin/dashboard` | `/admin/login` |
| **Provider** | `users/{uid}` + `providers/{id}` | `/provider/dashboard` | `/provider/login` |
| **Citizen** | `users/{uid}` + `citizens/{uid}` | `/citizen/dashboard` | `/citizen/login` |

### ✅ Guards Implémentés

| Guard | Fichier | Vérifie |
|-------|---------|---------|
| `AdminGuard` | `src/components/guards/AdminGuard.tsx` | `profile.userType === 'admin'` |
| `CitizenGuard` | `src/components/guards/CitizenGuard.tsx` | `profile.userType === 'citizen'` |
| `ProviderRouteGuard` | `src/components/ProviderRouteGuard.tsx` | `hasRole('provider')` + provider doc |

---

## 2. Corrections Effectuées

### 2.1 Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `src/components/guards/AdminGuard.tsx` | Guard admin avec vérification userType |
| `src/components/guards/CitizenGuard.tsx` | Guard citoyen avec vérification userType |
| `src/components/guards/index.ts` | Export des guards |
| `src/services/medicalAdsService.ts` | Service Firestore pour annonces médicales |

### 2.2 Fichiers Modifiés

| Fichier | Modifications |
|---------|---------------|
| `src/App.tsx` | Routes réorganisées avec nouveaux guards, /auth redirige vers /citizen/login |
| `src/contexts/AuthContext.tsx` | Ajout `isCitizen`, `isProvider`, `isAdmin` helpers |
| `src/components/admin/MedicalAdsModeration.tsx` | Migration localStorage → Firestore + audit logging |
| `src/components/provider/MedicalAdsManager.tsx` | Migration localStorage → Firestore |
| `firestore.rules` | Ajout collection `ads` avec règles RLS |

### 2.3 Fichiers Supprimés

| Fichier | Raison |
|---------|--------|
| `src/pages/AuthPage.tsx` | Legacy - remplacé par pages spécifiques par rôle |
| `src/pages/MapPage.tsx` | Inutilisé - remplacé par `MapMother` |

---

## 3. Modèle de Données Firestore

### 3.1 Collections Principales

```
users/{uid}
├── email: string
├── userType: 'citizen' | 'provider' | 'admin'
└── createdAt: Timestamp

citizens/{uid}
├── name: string
├── preferences: { language, theme }
└── createdAt: Timestamp

providers/{providerId}
├── userId: string (owner UID)
├── verificationStatus: 'pending' | 'verified' | 'rejected'
├── isPublic: boolean
└── ... (profile data)

admins/{uid}
├── permissions: string[]
└── createdAt: Timestamp

user_roles/{uid}_{role}
├── user_id: string
├── role: 'patient' | 'provider' | 'admin'
└── created_at: Timestamp

ads/{adId}
├── providerId: string
├── providerName: string
├── title: string
├── content: string
├── status: 'pending' | 'approved' | 'rejected'
├── views: number
├── createdAt: Timestamp
└── expiresAt: Timestamp

audit_log/{logId}
├── adminId: string
├── adminEmail: string
├── action: string
├── targetId: string
├── targetType: 'provider' | 'ad' | 'user' | 'settings'
├── details: object
└── timestamp: Timestamp
```

---

## 4. Routes et Protection

### 4.1 Routes Citoyens (CitizenGuard)
- `/citizen/login` - Connexion
- `/citizen/register` - Inscription
- `/citizen/dashboard` - Tableau de bord
- `/profile` - Profil utilisateur
- `/favorites` - Favoris

### 4.2 Routes Providers (ProviderRouteGuard)
- `/provider/login` - Connexion
- `/provider/register/*` - Inscription multi-étapes
- `/provider/dashboard` - Tableau de bord
- `/registration-status` - Statut vérification

### 4.3 Routes Admin (AdminGuard)
- `/admin/login` - Connexion
- `/admin/dashboard` - Tableau de bord
- `/admin/migrate` - Migration données

### 4.4 Routes Publiques
- `/` - Accueil
- `/search` - Recherche
- `/providers` - Liste prestataires
- `/provider/:id` - Profil prestataire
- `/map/*` - Cartes
- `/contact`, `/emergency`, `/docs`

### 4.5 Redirections Legacy
- `/auth` → `/citizen/login`
- `/dashboard` → `/citizen/dashboard`
- `/carte` → `/map/providers`
- `/urgences` → `/map/emergency`

---

## 5. Sécurité Firestore

### 5.1 Règles par Collection

| Collection | Read | Write |
|------------|------|-------|
| `users` | Owner + Admin | Owner (create), Owner (update) |
| `citizens` | Owner + Admin | Owner |
| `admins` | Owner + Admin | Admin only |
| `providers` | Public (verified+public), Owner, Admin | Owner (create), Owner (update, sauf verification), Admin |
| `ads` | Public (approved), Owner, Admin | Provider (create), Provider (delete own), Admin (update) |
| `audit_log` | Admin | Admin (create) |

### 5.2 Protection Admin
- Seuls les admins existants peuvent créer d'autres admins
- Impossible de s'auto-promouvoir admin

---

## 6. AuthContext API

### 6.1 Propriétés
```typescript
user: User | null          // Firebase Auth user
profile: UserProfile | null // Firestore profile + userType
isAuthenticated: boolean
isLoading: boolean
isCitizen: boolean         // NEW: profile.userType === 'citizen'
isProvider: boolean        // NEW: profile.userType === 'provider'
isAdmin: boolean           // NEW: profile.userType === 'admin'
```

### 6.2 Méthodes Type-Spécifiques
```typescript
loginAsCitizen(email, password)   // Vérifie userType === 'citizen'
signupAsCitizen(email, password, fullName, phone?)
loginAsProvider(email, password)  // Vérifie userType === 'provider'
loginAsAdmin(email, password)     // Vérifie userType === 'admin'
```

---

## 7. Comptes de Test (À Créer)

| Rôle | Email | Password | Collections |
|------|-------|----------|-------------|
| ADMIN | admin@test.com | Admin123! | `users`, `admins`, `user_roles` |
| PROVIDER | provider@test.com | Provider123! | `users`, `providers`, `user_roles` |
| CLIENT | client@test.com | Client123! | `users`, `citizens`, `user_roles` |

> ⚠️ Ces comptes doivent être créés manuellement dans Firebase Console ou via un script admin.

---

## 8. Déploiement

### 8.1 Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 8.2 Vérification
1. Tester connexion admin via `/admin/login`
2. Tester connexion provider via `/provider/login`
3. Tester inscription citizen via `/citizen/register`
4. Vérifier accès interdit aux mauvaises routes

---

## 9. Architecture Finale

```
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE AUTH                               │
│              (Email/Password + Google OAuth)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AuthContext                                 │
│  - user, profile, isAuthenticated, isLoading                    │
│  - isCitizen, isProvider, isAdmin (NEW)                         │
│  - loginAs*, signupAs* methods                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   AdminGuard    │  │ProviderGuard   │  │  CitizenGuard   │
│   /admin/*      │  │  /provider/*   │  │  /citizen/*     │
│                 │  │                │  │  /profile       │
│  userType:admin │  │ userType:      │  │  /favorites     │
│                 │  │  provider      │  │                 │
│                 │  │ + provider doc │  │ userType:citizen│
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIRESTORE COLLECTIONS                         │
│                                                                  │
│  users/{uid}        → userType, email, createdAt                │
│  citizens/{uid}     → preferences, savedSearches                │
│  providers/{id}     → profile, verificationStatus, isPublic     │
│  admins/{uid}       → permissions, createdBy                    │
│  ads/{id}           → medical advertisements                    │
│  audit_log/{id}     → admin action tracking                     │
│  user_roles/{uid}_* → legacy role compatibility                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Résumé des Changements

| Catégorie | Avant | Après |
|-----------|-------|-------|
| Guards | 2 (ProtectedRoute, ProviderRouteGuard) | 4 (+AdminGuard, +CitizenGuard) |
| Pages Auth | 1 unifiée (AuthPage) | 4 séparées par rôle |
| Type Check | hasRole() only | isCitizen, isProvider, isAdmin |
| Medical Ads | localStorage | Firestore + RLS |
| Audit Logging | Partiel | Complet avec auditLogService |
| Dead Code | 2 fichiers | Supprimés |

**Résultat**: Système d'authentification et d'autorisation entièrement fonctionnel avec séparation stricte des rôles Admin / Provider / Citizen.
