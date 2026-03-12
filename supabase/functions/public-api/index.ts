import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// SHA-256 hash helper
async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Standard response helpers
function success(data: unknown, meta?: Record<string, unknown>) {
  return new Response(
    JSON.stringify({ success: true, data, meta: meta || {} }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function error(code: number, message: string, extraHeaders?: Record<string, string>) {
  return new Response(
    JSON.stringify({ success: false, error: { code, message } }),
    { status: code, headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders } }
  );
}

// Validate API key & rate limit
async function validateApiKey(apiKey: string, endpoint: string, skipRateLimit = false) {
  const keyHash = await hashKey(apiKey);

  const { data: keyRow, error: keyErr } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .single();

  if (keyErr || !keyRow) return { valid: false, code: 401, message: "Invalid API key." };
  if (!keyRow.is_active) return { valid: false, code: 401, message: "API key is deactivated." };

  let remaining = keyRow.rate_limit_per_day;

  if (!skipRateLimit) {
    // Get today's total usage
    const today = new Date().toISOString().split("T")[0];
    const { data: usageRows } = await supabase
      .from("api_usage")
      .select("request_count")
      .eq("api_key_id", keyRow.id)
      .eq("date", today);

    const totalUsed = (usageRows || []).reduce((sum: number, r: { request_count: number }) => sum + r.request_count, 0);
    remaining = keyRow.rate_limit_per_day - totalUsed;

    if (remaining <= 0) {
      return {
        valid: false,
        code: 429,
        message: "Daily rate limit exceeded.",
        headers: {
          "X-RateLimit-Limit": String(keyRow.rate_limit_per_day),
          "X-RateLimit-Remaining": "0",
        },
      };
    }
  }

  return {
    valid: true,
    keyRow,
    remaining,
    headers: {
      "X-RateLimit-Limit": String(keyRow.rate_limit_per_day),
      "X-RateLimit-Remaining": String(Math.max(0, remaining - 1)),
    },
  };
}

// Log request & upsert usage
async function logRequest(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number
) {
  const today = new Date().toISOString().split("T")[0];

  // Upsert usage
  const { data: existing } = await supabase
    .from("api_usage")
    .select("id, request_count")
    .eq("api_key_id", apiKeyId)
    .eq("date", today)
    .eq("endpoint", endpoint)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("api_usage")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("api_usage").insert({
      api_key_id: apiKeyId,
      date: today,
      endpoint,
      request_count: 1,
    });
  }

  // Insert log
  await supabase.from("api_logs").insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
  });
}

// Parse URL path
function parsePath(url: string): { segments: string[]; searchParams: URLSearchParams } {
  const u = new URL(url);
  // Path after /public-api
  const fullPath = u.pathname.replace(/^\/public-api/, "");
  const segments = fullPath.split("/").filter(Boolean);
  return { segments, searchParams: u.searchParams };
}

// Provider categories
const CATEGORIES = [
  { id: "hospital", label: "Hôpital", label_ar: "مستشفى" },
  { id: "clinic", label: "Clinique", label_ar: "عيادة" },
  { id: "doctor", label: "Médecin", label_ar: "طبيب" },
  { id: "pharmacy", label: "Pharmacie", label_ar: "صيدلية" },
  { id: "lab", label: "Laboratoire", label_ar: "مختبر" },
  { id: "radiology_center", label: "Centre de Radiologie", label_ar: "مركز الأشعة" },
  { id: "dentist", label: "Dentiste", label_ar: "طبيب أسنان" },
  { id: "birth_hospital", label: "Maternité", label_ar: "مستشفى ولادة" },
  { id: "blood_cabin", label: "Cabine de Don de Sang", label_ar: "كابينة التبرع بالدم" },
];

// Public fields only
const PUBLIC_FIELDS = "id, name, type, specialty, address, city, area, phone, lat, lng, is_verified, is_24h, is_open, rating, reviews_count, description, languages, image_url, night_duty";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return error(405, "Method not allowed.");
  }

  const startTime = Date.now();
  const { segments, searchParams } = parsePath(req.url);

  // Route: /v1/categories — no API key required
  if (req.method === "GET" && segments[0] === "v1" && segments[1] === "categories" && segments.length === 2) {
    return success(CATEGORIES, { total: CATEGORIES.length });
  }

  // All other routes require API key
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return error(401, "Missing x-api-key header.");

  const isEmergency = segments[0] === "v1" && segments[1] === "emergency";
  const validation = await validateApiKey(apiKey, `/${segments.join("/")}`, isEmergency);

  if (!validation.valid) {
    return error(validation.code!, validation.message!, validation.headers);
  }

  const { keyRow, headers: rateLimitHeaders } = validation;
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");
  const clampedLimit = Math.min(Math.max(1, limit), 100);

  let responseStatus = 200;
  let responseData: unknown = null;
  let responseMeta: Record<string, unknown> = {};

  try {
    // ===== POST ROUTES =====
    if (req.method === "POST") {
      // POST /v1/providers/:id/reviews
      if (segments[0] === "v1" && segments[1] === "providers" && segments.length === 4 && segments[3] === "reviews") {
        const providerId = segments[2];

        // Verify provider exists
        const { data: provider, error: provErr } = await supabase
          .from("providers_public")
          .select("id, name")
          .eq("id", providerId)
          .single();
        if (provErr || !provider) {
          responseStatus = 404;
          throw new Error("Provider not found.");
        }

        // Parse & validate body
        let body: Record<string, unknown>;
        try {
          body = await req.json();
        } catch {
          responseStatus = 400;
          throw new Error("Invalid JSON body.");
        }

        const patientName = typeof body.patient_name === "string" ? body.patient_name.trim() : "";
        const rating = typeof body.rating === "number" ? body.rating : NaN;
        const comment = typeof body.comment === "string" ? body.comment.trim() : null;

        if (!patientName || patientName.length < 2 || patientName.length > 100) {
          responseStatus = 400;
          throw new Error("patient_name is required (2-100 characters).");
        }
        if (isNaN(rating) || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
          responseStatus = 400;
          throw new Error("rating is required (integer 1-5).");
        }
        if (comment && comment.length > 1000) {
          responseStatus = 400;
          throw new Error("comment must be 1000 characters or fewer.");
        }

        // Use the developer_id from the API key as patient_id
        const { data: review, error: insertErr } = await supabase
          .from("provider_reviews")
          .insert({
            provider_id: providerId,
            patient_id: `api:${keyRow!.developer_id}`,
            patient_name: patientName,
            rating,
            comment: comment || null,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        responseStatus = 201;
        responseData = {
          id: review.id,
          provider_id: review.provider_id,
          patient_name: review.patient_name,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
        };
        responseMeta = { remaining_requests: validation.remaining! - 1 };
      }
      // Unknown POST route
      else {
        responseStatus = 404;
        throw new Error(`Unknown endpoint: POST /${segments.join("/")}`);
      }
    }
    // ===== GET ROUTES =====
    // GET /v1/providers/:id/reviews
    else if (segments[0] === "v1" && segments[1] === "providers" && segments.length === 4 && segments[3] === "reviews") {
      const providerId = segments[2];
      const { data, count, error: qErr } = await supabase
        .from("provider_reviews")
        .select("id, patient_name, rating, comment, created_at", { count: "exact" })
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false })
        .range(offset, offset + clampedLimit - 1);
      if (qErr) throw qErr;
      responseData = data;
      responseMeta = { total: count || 0, limit: clampedLimit, offset, remaining_requests: validation.remaining! - 1 };
    }
    // GET /v1/providers
    else if (segments[0] === "v1" && segments[1] === "providers" && segments.length === 2) {
      let query = supabase.from("providers_public").select(PUBLIC_FIELDS, { count: "exact" });

      const q = searchParams.get("q");
      const type = searchParams.get("type");
      const city = searchParams.get("city");
      const verifiedOnly = searchParams.get("verified_only") !== "false";

      if (q) query = query.or(`name.ilike.%${q}%,specialty.ilike.%${q}%,address.ilike.%${q}%`);
      if (type) query = query.eq("type", type);
      if (city) query = query.ilike("city", `%${city}%`);
      if (verifiedOnly) query = query.eq("is_verified", true);

      const { data, count, error: qErr } = await query.range(offset, offset + clampedLimit - 1).order("rating", { ascending: false });
      if (qErr) throw qErr;

      responseData = data;
      responseMeta = { total: count || 0, limit: clampedLimit, offset, remaining_requests: validation.remaining! - 1 };
    }
    // GET /v1/providers/:id
    else if (segments[0] === "v1" && segments[1] === "providers" && segments.length === 3) {
      const { data, error: qErr } = await supabase
        .from("providers_public")
        .select(PUBLIC_FIELDS)
        .eq("id", segments[2])
        .single();
      if (qErr || !data) {
        responseStatus = 404;
        throw new Error("Provider not found.");
      }
      responseData = data;
      responseMeta = { remaining_requests: validation.remaining! - 1 };
    }
    // GET /v1/emergency
    else if (segments[0] === "v1" && segments[1] === "emergency" && segments.length === 2) {
      const { data, error: qErr } = await supabase
        .from("providers_public")
        .select(PUBLIC_FIELDS)
        .eq("is_24h", true)
        .eq("is_verified", true)
        .order("rating", { ascending: false });
      if (qErr) throw qErr;
      responseData = data;
      responseMeta = { total: (data || []).length, remaining_requests: "unlimited (emergency)" };
    }
    // GET /v1/pharmacies
    else if (segments[0] === "v1" && segments[1] === "pharmacies" && segments.length === 2) {
      const { data, count, error: qErr } = await supabase
        .from("providers_public")
        .select(PUBLIC_FIELDS, { count: "exact" })
        .eq("type", "pharmacy")
        .eq("is_verified", true)
        .range(offset, offset + clampedLimit - 1)
        .order("rating", { ascending: false });
      if (qErr) throw qErr;
      responseData = data;
      responseMeta = { total: count || 0, limit: clampedLimit, offset, remaining_requests: validation.remaining! - 1 };
    }
    // GET /v1/search
    else if (segments[0] === "v1" && segments[1] === "search" && segments.length === 2) {
      const q = searchParams.get("q");
      if (!q) {
        responseStatus = 400;
        throw new Error("Query parameter 'q' is required.");
      }
      const { data, count, error: qErr } = await supabase
        .from("providers_public")
        .select(PUBLIC_FIELDS, { count: "exact" })
        .or(`name.ilike.%${q}%,specialty.ilike.%${q}%,address.ilike.%${q}%,city.ilike.%${q}%`)
        .eq("is_verified", true)
        .range(offset, offset + clampedLimit - 1)
        .order("rating", { ascending: false });
      if (qErr) throw qErr;
      responseData = data;
      responseMeta = { total: count || 0, limit: clampedLimit, offset, remaining_requests: validation.remaining! - 1 };
    }
    // Unknown route
    else {
      responseStatus = 404;
      throw new Error(`Unknown endpoint: /${segments.join("/")}`);
    }
  } catch (e) {
    const elapsed = Date.now() - startTime;
    await logRequest(keyRow!.id, `/${segments.join("/")}`, req.method, responseStatus >= 400 ? responseStatus : 500, elapsed);
    return error(responseStatus >= 400 ? responseStatus : 500, (e as Error).message, rateLimitHeaders);
  }

  const elapsed = Date.now() - startTime;
  await logRequest(keyRow!.id, `/${segments.join("/")}`, req.method, responseStatus, elapsed);

  return new Response(
    JSON.stringify({ success: true, data: responseData, meta: responseMeta }),
    {
      status: responseStatus,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...rateLimitHeaders,
      },
    }
  );
});
