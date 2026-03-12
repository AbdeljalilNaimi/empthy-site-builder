# 🔥 Configuration Firebase - CityHealth

## 📋 Prérequis

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init
```

---

## 🚀 Deployment

### Deploy All Rules & Indexes

```bash
firebase deploy --only firestore:rules,storage,firestore:indexes
```

### Deploy Only Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Only Storage Rules

```bash
firebase deploy --only storage
```

---

## 🔐 Firestore Security Rules Summary

| Collection | Read | Write |
|------------|------|-------|
| `profiles` | Owner only | Owner only |
| `user_roles` | Owner or Admin | Admin only |
| `providers` | Public (if verified + isPublic) / Owner / Admin | Owner (create/update) / Admin (delete) |
| `providerDrafts` | Owner only | Owner only |
| `favorites` | Owner only | Owner only |
| `appointments` | Patient or Provider | Patient (create) / Both (update) |
| `reviews` | Public | Owner only |
| `chat_sessions` | Owner only | Owner only |
| `analytics_events` | Admin only | Authenticated users |

### Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated() { return request.auth != null; }

// Check if user owns the resource
function isOwner(userId) { return request.auth.uid == userId; }

// Check if user is admin
function isAdmin() {
  return exists(/databases/$(database)/documents/user_roles/$(request.auth.uid)) &&
         get(...).data.role == 'admin';
}
```

---

## 🧪 Verification Steps

### 1. Test Rules in Firebase Console

1. Go to **Firebase Console** → **Firestore Database**
2. Click **Rules** tab → **Rules Playground**
3. Test the following scenarios:

**Test: Profile Read (Should PASS)**
```
Path: /profiles/{userId}
Method: get
Auth: Simulate as user with matching UID
```

**Test: Provider Public Read (Should PASS)**
```
Path: /providers/{providerId}
Method: get
Auth: None
Document: { verificationStatus: "verified", isPublic: true }
```

**Test: Provider Unverified Read (Should FAIL)**
```
Path: /providers/{providerId}
Method: get
Auth: None
Document: { verificationStatus: "pending", isPublic: false }
```

**Test: Admin Write to user_roles (Should PASS)**
```
Path: /user_roles/{userId}
Method: set
Auth: Simulate as admin user
```

### 2. Verify via CLI

```bash
# Dry run to check rules syntax
firebase emulators:start --only firestore

# Run in another terminal
npm run test:firestore-rules
```

---

## 📑 Required Indexes

Defined in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "favorites",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "providers",
      "fields": [
        { "fieldPath": "specialty", "order": "ASCENDING" },
        { "fieldPath": "city", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "providers",
      "fields": [
        { "fieldPath": "verificationStatus", "order": "ASCENDING" },
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "providerCategory", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

---

## 📦 Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Provider uploads (photos, licenses)
    match /providers/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profile avatars
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ☁️ Cloud Function: AI Chat

```bash
cd firebase-functions/ai-chat
npm install

# Set OpenAI API key
firebase functions:config:set openai.key="sk-..."

# Deploy function
firebase deploy --only functions:aiChat
```

---

## 👤 Create Admin User

In Firestore Console, create document:

```
Collection: user_roles
Document ID: {user_uid}_admin
Fields:
  - user_id: {user_uid}
  - role: "admin"
  - created_at: Timestamp
```

Or via Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
admin.firestore().collection('user_roles').doc(`${userId}_admin`).set({
  user_id: userId,
  role: 'admin',
  created_at: admin.firestore.FieldValue.serverTimestamp()
});
```

---

## ⚠️ Service Account Keys

**Never commit real service account keys to the repository.**

- `serviceAccountKey.example.json` is a template with empty values
- For local development, download your key from Firebase Console → Project Settings → Service Accounts
- Save it as `serviceAccountKey.json` (gitignored) or use `GOOGLE_APPLICATION_CREDENTIALS` env var
- For CI/CD, load keys from your CI secrets manager

---

## 🔄 Common Commands

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore
firebase deploy --only functions
firebase deploy --only hosting

# View logs
firebase functions:log

# Start local emulators
firebase emulators:start
```
