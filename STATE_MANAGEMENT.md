# State Management Guide

This document describes when to use each state management solution in the CityHealth app.

## Overview

| Solution | Use Case | Example |
|----------|----------|---------|
| **React Context** | Global app-wide state that rarely changes | Auth, Language/i18n, Theme |
| **TanStack Query** | Server state from Firestore/APIs | Providers list, Favorites |
| **Local State (useState)** | Component-specific UI state | Form inputs, modals, toggles |
| **Custom Hooks** | Encapsulated local state with logic | Registration wizard |

---

## 1. React Context (Global State)

Use for **app-wide settings** that need to be accessed anywhere and change infrequently.

### Current Contexts:
- **`AuthContext`** - User authentication state, login/logout
- **`LanguageContext`** - Current language (fr/ar/en), translation function
- **`ThemeContext`** - Light/dark mode preference

### When to use:
- The value needs to be accessible from many components
- Changes trigger minimal re-renders (infrequent updates)
- No server synchronization needed

### When NOT to use:
- Frequently changing data → use local state
- Server data that needs caching → use TanStack Query

### Example:
```tsx
// Using AuthContext
const { user, isAuthenticated, logout } = useAuth();

// Using LanguageContext
const { language, t, setLanguage } = useLanguage();
```

---

## 2. TanStack Query (Server State)

Use for **all data fetched from Firestore or external APIs**.

### Current Query Hooks:
- **`useProviders.ts`** - All provider-related queries
  - `useVerifiedProviders()` - Public provider list
  - `useProvider(id)` - Single provider details
  - `usePendingProviders()` - Admin verification queue
  - `useEmergencyProviders()` - Emergency services
- **`useFavorites.ts`** - User favorites
  - `useFavorites()` - Get user's favorite IDs
  - `useToggleFavorite()` - Add/remove favorites

### Benefits:
- Automatic caching (no duplicate fetches)
- Background refetching (data stays fresh)
- Loading/error states included
- Optimistic updates for mutations
- Automatic retry on failure

### When to use:
- Fetching data from Firestore
- Data that multiple components might need
- Data that should be cached across page navigations

### Example:
```tsx
// Fetching providers
const { data: providers, isLoading, error } = useVerifiedProviders();

// Mutations
const { mutate: updateVerification } = useUpdateVerification();
updateVerification({ providerId: '123', status: 'verified', isPublic: true });
```

### Query Key Conventions:
```ts
// All provider queries start with ['providers']
providerKeys.all         // ['providers']
providerKeys.verified()  // ['providers', 'verified']
providerKeys.detail(id)  // ['providers', 'detail', '123']

// All favorite queries start with ['favorites']
favoriteKeys.user(uid)   // ['favorites', 'user123']
```

---

## 3. Local State (useState)

Use for **component-specific UI state** that doesn't need to be shared.

### Examples:
- Form input values
- Modal open/closed state
- Accordion expanded state
- Local loading indicators
- Temporary selections

### When to use:
- State only affects one component
- State doesn't need to persist
- No sharing with sibling/parent components needed

### Example:
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

---

## 4. Custom Hooks (Encapsulated Local State)

Use for **complex local state with business logic** that should be reusable or testable.

### Current Custom Hooks:
- **`useRegistrationWizard`** - Multi-step form state with localStorage persistence

### When to use:
- Complex state logic in one component
- Need localStorage persistence
- State + effects + handlers should be grouped

### Example:
```tsx
// In ProviderRegister page
const {
  formData,
  updateFormData,
  currentStep,
  nextStep,
  prevStep,
  profileScore,
} = useRegistrationWizard();
```

---

## Decision Tree

```
Need state?
├── Is it server data (Firestore/API)?
│   └── YES → Use TanStack Query hooks
│
├── Does it need to be accessible app-wide?
│   └── YES → Is it user auth, language, or theme?
│       ├── YES → Use existing Context
│       └── NO → Consider if Context is really needed
│
├── Is it complex with business logic?
│   └── YES → Create a custom hook
│
└── NO to all above
    └── Use local useState
```

---

## Migration Notes

### Removed:
- `src/stores/useSearchStore.ts` - Migrated to local state + TanStack Query
- `src/stores/useUIStore.ts` - Migrated to local state
- `RegistrationContext` as global - Now a local hook

### Pages Using TanStack Query:
| Page | Hooks Used |
|------|------------|
| `SearchPage` | `useVerifiedProviders()` |
| `ProviderProfilePage` | `useProvider(id)`, `useFavorites()`, `useToggleFavorite()` |
| `ProviderDashboard` | `useProviderByUserId()` |
| `AdminDashboard` | `usePendingProviders()`, `useAllProviders()`, `useUpdateVerification()` |
| `FavoritesPage` | `useFavorites()`, `useRemoveFavorite()`, `useVerifiedProviders()` |
| `CartePage/CityHealthMap` | `useVerifiedProviders()`, `useEmergencyProviders()`, `useBloodCenters()` |

### Real-Time Updates:
Provider hooks include `refetchInterval` for automatic background updates:
- `useVerifiedProviders()` - Every 3 minutes
- `useEmergencyProviders()` - Every 2 minutes (more critical)
- `useBloodCenters()` - Every 2 minutes

### Files to Reference:
- `src/contexts/AuthContext.tsx` - Auth pattern
- `src/contexts/LanguageContext.tsx` - i18n pattern
- `src/hooks/useProviders.ts` - TanStack Query pattern
- `src/hooks/useFavorites.ts` - TanStack Query with mutations
- `src/hooks/useRegistrationWizard.ts` - Complex local hook pattern
