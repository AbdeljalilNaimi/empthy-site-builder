/**
 * Firebase Test Accounts Creation Script
 * 
 * This script creates test accounts for RBAC testing using Firebase Admin SDK.
 * 
 * USAGE:
 * 1. Download service account key from Firebase Console:
 *    - Go to Project Settings → Service Accounts → Generate New Private Key
 *    - Save as 'serviceAccountKey.json' in project root (gitignored)
 * 
 * 2. Run the script:
 *    npx ts-node src/scripts/createTestAccounts.ts
 * 
 * TEST ACCOUNTS CREATED:
 * - admin@test.com / Admin123! → Admin role
 * - provider@test.com / Provider123! → Provider role  
 * - client@test.com / Client123! → Citizen role
 */

import admin from 'firebase-admin';

// Type definitions for this script
type ServiceAccount = admin.ServiceAccount;

// Load service account - must be downloaded from Firebase Console
// eslint-disable-next-line @typescript-eslint/no-var-requires
let serviceAccount: ServiceAccount;
try {
  // Try to load from project root
  serviceAccount = require('../../../serviceAccountKey.json') as ServiceAccount;
} catch {
  console.error('❌ serviceAccountKey.json not found in project root.');
  console.error('   Download it from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

// Initialize Firebase Admin
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth(app);
const db = admin.firestore(app);
const FieldValue = admin.firestore.FieldValue;


interface TestAccount {
  email: string;
  password: string;
  displayName: string;
  userType: 'admin' | 'provider' | 'citizen';
  legacyRole: 'admin' | 'provider' | 'patient';
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    displayName: 'Admin Test',
    userType: 'admin',
    legacyRole: 'admin'
  },
  {
    email: 'provider@test.com',
    password: 'Provider123!',
    displayName: 'Provider Test',
    userType: 'provider',
    legacyRole: 'provider'
  },
  {
    email: 'client@test.com',
    password: 'Client123!',
    displayName: 'Client Test',
    userType: 'citizen',
    legacyRole: 'patient'
  }
];

async function deleteExistingUser(email: string): Promise<void> {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.deleteUser(user.uid);
    console.log(`  ✓ Deleted existing user: ${email}`);
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }
}

async function createAdminAccount(uid: string, account: TestAccount): Promise<void> {
  const batch = db.batch();

  // users/{uid}
  batch.set(db.collection('users').doc(uid), {
    email: account.email,
    userType: account.userType,
    createdAt: FieldValue.serverTimestamp()
  });

  // profiles/{uid}
  batch.set(db.collection('profiles').doc(uid), {
    id: uid,
    email: account.email,
    full_name: account.displayName,
    avatar_url: null,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  });

  // admins/{uid}
  batch.set(db.collection('admins').doc(uid), {
    permissions: ['full_access'],
    createdAt: FieldValue.serverTimestamp(),
    createdBy: 'setup_script'
  });

  // user_roles/{uid}_admin (legacy)
  batch.set(db.collection('user_roles').doc(`${uid}_admin`), {
    user_id: uid,
    role: 'admin',
    created_at: FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function createProviderAccount(uid: string, account: TestAccount): Promise<void> {
  const batch = db.batch();

  // users/{uid}
  batch.set(db.collection('users').doc(uid), {
    email: account.email,
    userType: account.userType,
    createdAt: FieldValue.serverTimestamp()
  });

  // profiles/{uid}
  batch.set(db.collection('profiles').doc(uid), {
    id: uid,
    email: account.email,
    full_name: account.displayName,
    avatar_url: null,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  });

  // providers/{providerId}
  batch.set(db.collection('providers').doc(`provider_${uid}`), {
    id: `provider_${uid}`,
    userId: uid,
    name: 'Test Medical Provider',
    type: 'Médecin généraliste',
    email: account.email,
    phone: '+237 600 000 000',
    address: '123 Rue de Test, Yaoundé',
    city: 'Yaoundé',
    coordinates: { lat: 3.848, lng: 11.5021 },
    verificationStatus: 'verified',
    isPublic: true,
    specialties: ['Médecine générale', 'Consultations'],
    services: ['Consultation générale', 'Bilans de santé'],
    description: 'Provider de test pour développement et tests RBAC.',
    openingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: null
    },
    rating: 4.5,
    reviewCount: 12,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // user_roles/{uid}_provider (legacy)
  batch.set(db.collection('user_roles').doc(`${uid}_provider`), {
    user_id: uid,
    role: 'provider',
    created_at: FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function createCitizenAccount(uid: string, account: TestAccount): Promise<void> {
  const batch = db.batch();

  // users/{uid}
  batch.set(db.collection('users').doc(uid), {
    email: account.email,
    userType: account.userType,
    createdAt: FieldValue.serverTimestamp()
  });

  // profiles/{uid}
  batch.set(db.collection('profiles').doc(uid), {
    id: uid,
    email: account.email,
    full_name: account.displayName,
    avatar_url: null,
    phone: '+237 600 000 001',
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  });

  // citizens/{uid}
  batch.set(db.collection('citizens').doc(uid), {
    name: account.displayName,
    email: account.email,
    phone: '+237 600 000 001',
    preferences: {
      language: 'fr',
      theme: 'system'
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // user_roles/{uid}_patient (legacy - maps to citizen)
  batch.set(db.collection('user_roles').doc(`${uid}_patient`), {
    user_id: uid,
    role: 'patient',
    created_at: FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function createTestAccount(account: TestAccount): Promise<void> {
  console.log(`\n📧 Creating ${account.userType.toUpperCase()}: ${account.email}`);

  // Delete existing user if exists
  await deleteExistingUser(account.email);

  // Create Firebase Auth user
  const userRecord = await auth.createUser({
    email: account.email,
    password: account.password,
    displayName: account.displayName,
    emailVerified: true
  });

  console.log(`  ✓ Created Auth user: ${userRecord.uid}`);

  // Create Firestore documents based on user type
  switch (account.userType) {
    case 'admin':
      await createAdminAccount(userRecord.uid, account);
      break;
    case 'provider':
      await createProviderAccount(userRecord.uid, account);
      break;
    case 'citizen':
      await createCitizenAccount(userRecord.uid, account);
      break;
  }

  console.log(`  ✓ Created Firestore documents`);
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════');
  console.log('   CityHealth - Test Accounts Creation Script');
  console.log('═══════════════════════════════════════════════════');

  try {
    for (const account of TEST_ACCOUNTS) {
      await createTestAccount(account);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   ✅ All test accounts created successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 Test Credentials:');
    console.log('┌─────────────┬───────────────────────┬───────────────┐');
    console.log('│ Role        │ Email                 │ Password      │');
    console.log('├─────────────┼───────────────────────┼───────────────┤');
    console.log('│ Admin       │ admin@test.com        │ Admin123!     │');
    console.log('│ Provider    │ provider@test.com     │ Provider123!  │');
    console.log('│ Client      │ client@test.com       │ Client123!    │');
    console.log('└─────────────┴───────────────────────┴───────────────┘');
    console.log('\n🔗 Login URLs:');
    console.log('   Admin:    /admin/login');
    console.log('   Provider: /provider/login');
    console.log('   Client:   /citizen/login');

  } catch (error) {
    console.error('\n❌ Error creating test accounts:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
