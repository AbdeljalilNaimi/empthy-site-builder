/**
 * Firebase Cloud Function — Automated 24h Sync to Supabase Public API
 * 
 * This scheduled function runs every 24 hours and synchronizes all verified
 * providers from Firestore to the Supabase `providers_public` table via
 * the `sync-provider` Edge Function.
 * 
 * ============================================================
 * DEPLOYMENT INSTRUCTIONS
 * ============================================================
 * 
 * 1. Place this file in your Firebase Functions directory:
 *    firebase-functions/cron-sync/index.js
 * 
 * 2. Make sure firebase-functions/package.json includes:
 *    - "firebase-functions": "^4.x" (or latest)
 *    - "firebase-admin": "^12.x" (or latest)
 *    - "node-fetch": "^2.7.0" (Node 16 compatible, or use global fetch on Node 18+)
 * 
 * 3. Set the sync secret in Firebase environment config:
 *    firebase functions:config:set sync.secret="YOUR_SYNC_PROVIDER_SECRET"
 * 
 *    Or for Gen 2 functions, use .env file in firebase-functions/:
 *    SYNC_PROVIDER_SECRET=your_secret_here
 * 
 * 4. Update firebase.json to include this function directory if needed.
 * 
 * 5. Deploy:
 *    firebase deploy --only functions:cronSyncProviders
 * 
 * 6. Verify in Google Cloud Console > Cloud Scheduler that the job was created.
 * 
 * ============================================================
 * ENVIRONMENT VARIABLES REQUIRED
 * ============================================================
 * 
 * SYNC_PROVIDER_SECRET  — The x-sync-secret header value (must match Edge Function)
 * SUPABASE_URL          — Your Supabase project URL (e.g. https://xxxx.supabase.co)
 * 
 * ============================================================
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Maps a Firestore provider document to safe public fields
 * matching the `providers_public` Supabase table schema.
 */
function mapToPublicFields(docId, data) {
  return {
    id: docId,
    name: data.name || data.facilityNameFr || 'Sans nom',
    type: data.type || 'doctor',
    specialty: data.specialty || null,
    address: data.address || null,
    city: data.city || null,
    area: data.area || null,
    phone: data.phone || null,
    lat: data.lat || null,
    lng: data.lng || null,
    is_verified: true,
    is_24h: Boolean(data.is24_7 || data.emergency),
    is_open: data.isOpen !== false,
    rating: data.rating || 0,
    reviews_count: data.reviewsCount || 0,
    description: data.description || null,
    languages: data.languages || null,
    image_url: data.image || null,
    night_duty: Boolean(data.nightDuty),
  };
}

/**
 * Scheduled Cloud Function — Runs every 24 hours
 * 
 * Fetches all verified & public providers from Firestore,
 * maps them to the public schema, and POSTs them to the
 * Supabase sync-provider Edge Function.
 */
exports.cronSyncProviders = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Africa/Algiers') // Adjust to your timezone
  .onRun(async (context) => {
    console.log('[CRON SYNC] Starting 24h automated sync...');

    // Get secrets from environment config
    const syncSecret = process.env.SYNC_PROVIDER_SECRET 
      || functions.config().sync?.secret;
    const supabaseUrl = process.env.SUPABASE_URL 
      || functions.config().supabase?.url;

    if (!syncSecret || !supabaseUrl) {
      console.error('[CRON SYNC] Missing SYNC_PROVIDER_SECRET or SUPABASE_URL. Aborting.');
      return null;
    }

    try {
      // 1. Query Firestore for verified + public providers
      const snapshot = await db.collection('providers')
        .where('verificationStatus', '==', 'verified')
        .where('isPublic', '==', true)
        .get();

      if (snapshot.empty) {
        console.log('[CRON SYNC] No verified providers found. Nothing to sync.');
        return null;
      }

      console.log(`[CRON SYNC] Found ${snapshot.size} verified provider(s).`);

      // 2. Map to safe public fields
      const publicData = [];
      snapshot.forEach((doc) => {
        publicData.push(mapToPublicFields(doc.id, doc.data()));
      });

      // 3. POST to Supabase Edge Function
      // Using global fetch (Node 18+). For Node 16, use node-fetch.
      const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

      const response = await fetchFn(`${supabaseUrl}/functions/v1/sync-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sync-secret': syncSecret,
        },
        body: JSON.stringify(publicData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[CRON SYNC] Edge Function error:', result.error || result);
        return null;
      }

      const { upserted, removed, errors } = result.data || {};
      console.log(`[CRON SYNC] ✅ Sync complete:`);
      console.log(`  - Upserted: ${upserted?.length || 0}`);
      console.log(`  - Removed:  ${removed?.length || 0}`);
      if (errors?.length > 0) {
        console.warn(`  - Errors:   ${errors.join(', ')}`);
      }

      return null;
    } catch (error) {
      console.error('[CRON SYNC] Fatal error:', error);
      return null;
    }
  });
