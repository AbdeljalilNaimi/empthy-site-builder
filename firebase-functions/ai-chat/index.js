// Firebase Cloud Function for AI Chat
// Deploy with: firebase deploy --only functions:aiChat
// Config: firebase functions:config:set lovable.api_key="YOUR_KEY"

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Strict CORS: exact domain match only
const ALLOWED_ORIGINS = [
  'https://cityhealth-ec7e7.web.app',
  'https://cityhealth-ec7e7.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
}

// Firestore-backed rate limiting: 100 requests/user/hour
const MAX_REQUESTS_PER_HOUR = 100;

async function checkAndIncrementQuota(userId) {
  const now = Date.now();
  const hourAgo = now - 3600000;
  const quotaRef = db.collection('user_quotas').doc(userId);

  return db.runTransaction(async (transaction) => {
    const quotaDoc = await transaction.get(quotaRef);

    if (!quotaDoc.exists) {
      transaction.set(quotaRef, { requests: [now] });
      return true;
    }

    const data = quotaDoc.data();
    const recentRequests = (data.requests || []).filter(t => t > hourAgo);

    if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
      return false;
    }

    recentRequests.push(now);
    transaction.update(quotaRef, { requests: recentRequests });
    return true;
  });
}

exports.aiChat = functions.https.onRequest(async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // 1. Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Token verification failed:', authError.message);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    const userId = decodedToken.uid;

    // 2. Check Firestore-backed rate limit
    const allowed = await checkAndIncrementQuota(userId);
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests. You have reached the limit of 100 requests per hour.' });
      return;
    }

    // 3. Validate request body
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid request: messages array required' });
      return;
    }

    if (messages.length > 50) {
      res.status(400).json({ error: 'Too many messages in conversation' });
      return;
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        res.status(400).json({ error: 'Invalid message format: role and content required' });
        return;
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        res.status(400).json({ error: 'Invalid message role' });
        return;
      }
      if (typeof msg.content !== 'string' || msg.content.length > 10000) {
        res.status(400).json({ error: 'Invalid message content' });
        return;
      }
    }

    // 4. Call AI Gateway
    const apiKey = functions.config().lovable?.api_key;
    if (!apiKey) {
      console.error('Missing lovable.api_key in functions config');
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical assistant for CityHealth, a healthcare platform in Algeria. Provide health information in French or Arabic as appropriate. Always recommend consulting a real doctor for medical decisions. Never diagnose or prescribe.'
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        res.status(429).json({ error: 'AI service rate limited. Please try again later.' });
        return;
      }
      if (aiResponse.status === 402) {
        res.status(402).json({ error: 'AI service credits exhausted.' });
        return;
      }

      res.status(502).json({ error: 'AI gateway error' });
      return;
    }

    // 5. Stream response back to client
    res.set('Content-Type', 'text/event-stream');
    res.set('Cache-Control', 'no-cache');
    res.set('Connection', 'keep-alive');

    // Pipe the SSE stream directly
    const reader = aiResponse.body.getReader();
    const push = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(Buffer.from(value));
      }
    };

    await push();

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
