# 🏗️ Architecture CityHealth

> Documentation technique de l'architecture de CityHealth

---

## 📊 Vue d'Ensemble

| Catégorie | Technologies |
|-----------|--------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **State** | React Context (Auth, Registration, Language), Zustand, TanStack Query |
| **Maps** | Leaflet (CityHealthMap unifié) |
| **Backend** | Firebase (Auth, Firestore, Storage, Cloud Functions) |

---

## 🗄️ Schema Firestore

### `profiles` - Profils utilisateurs
```typescript
{ id, email, full_name, avatar_url, created_at, updated_at }
```

### `user_roles` - Rôles (patient/provider/admin)
```typescript
{ user_id, role, created_at }  // Doc ID: "{uid}_{role}"
```

### `providers` - Prestataires de santé
```typescript
{ id, name, type, specialty, address, city, area, lat, lng, phone,
  verified, verificationStatus, isPublic, emergency, rating, reviewsCount,
  image, description, languages, bloodTypes?, stockStatus?, imagingTypes? }
```

### `favorites`, `analytics_events`, `chat_sessions`

---

## 🔄 Flux Inscription Prestataire (6 étapes)

1. **Identité** → providerType, email, password (20%)
2. **Informations** → nom, numéro légal, contact (20%)
3. **Localisation** → adresse, carte, horaires (30%)
4. **Services** → catégories, spécialités (15%)
5. **Médias** → logo, galerie, description (15%)
6. **Prévisualisation** → scoring, soumission

**Scoring**: `isSearchable = true` si score ≥ 50%

---

## 🔐 Sécurité

- **Auth**: Firebase Auth (Email + Google OAuth)
- **Firestore**: Règles RLS par utilisateur/rôle
- **Storage**: Accès owner-only pour documents privés
- **Prestataires pending**: Masqués de la recherche publique

---

## 🧩 Composants Clés

| Composant | Rôle |
|-----------|------|
| `CityHealthMap` | Carte Leaflet unifiée (mode: all/emergency/blood) |
| `RegistrationContext` | État inscription 6 étapes + auto-save |
| `AuthContext` | Firebase Auth + profils Firestore |
| `ProtectedRoute` | Garde de routes par rôle |
