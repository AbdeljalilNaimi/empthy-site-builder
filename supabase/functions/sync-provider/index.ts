import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function error(code: number, message: string) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status: code,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function success(data: unknown) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate via shared secret
  const secret = req.headers.get("x-sync-secret");
  const expectedSecret = Deno.env.get("SYNC_PROVIDER_SECRET");
  if (!secret || secret !== expectedSecret) {
    return error(401, "Unauthorized: invalid sync secret.");
  }

  const url = new URL(req.url);
  const pathSegments = url.pathname.replace(/^\/sync-provider/, "").split("/").filter(Boolean);

  // DELETE /sync-provider/:id — remove provider from public table
  if (req.method === "DELETE") {
    const providerId = pathSegments[0];
    if (!providerId) return error(400, "Missing provider ID in path.");

    const { error: delErr } = await supabase
      .from("providers_public")
      .delete()
      .eq("id", providerId);

    if (delErr) return error(500, delErr.message);
    return success({ action: "deleted", id: providerId });
  }

  // POST /sync-provider — upsert or remove based on verification status
  if (req.method === "POST") {
    const body = await req.json();

    // Support batch sync: accept array or single object
    const providers: unknown[] = Array.isArray(body) ? body : [body];

    const upserted: string[] = [];
    const removed: string[] = [];
    const errors: string[] = [];

    for (const raw of providers) {
      const p = raw as Record<string, unknown>;

      if (!p.id || !p.name || !p.type) {
        errors.push(`Skipped: missing required fields (id, name, type) for ${p.id || "unknown"}`);
        continue;
      }

      // If not verified, remove from public table (kill switch)
      if (!p.is_verified) {
        const { error: delErr } = await supabase
          .from("providers_public")
          .delete()
          .eq("id", String(p.id));
        if (delErr) errors.push(`Delete error for ${p.id}: ${delErr.message}`);
        else removed.push(String(p.id));
        continue;
      }

      // Upsert only safe, public fields
      const publicRecord = {
        id: String(p.id),
        name: String(p.name),
        type: String(p.type),
        specialty: p.specialty ? String(p.specialty) : null,
        address: p.address ? String(p.address) : null,
        city: p.city ? String(p.city) : null,
        area: p.area ? String(p.area) : null,
        phone: p.phone ? String(p.phone) : null,
        lat: typeof p.lat === "number" ? p.lat : null,
        lng: typeof p.lng === "number" ? p.lng : null,
        is_verified: true,
        is_24h: Boolean(p.is_24h),
        is_open: p.is_open !== false, // default true
        rating: typeof p.rating === "number" ? p.rating : 0,
        reviews_count: typeof p.reviews_count === "number" ? p.reviews_count : 0,
        description: p.description ? String(p.description) : null,
        languages: Array.isArray(p.languages) ? p.languages : null,
        image_url: p.image_url ? String(p.image_url) : null,
        night_duty: Boolean(p.night_duty),
      };

      const { error: upsertErr } = await supabase
        .from("providers_public")
        .upsert(publicRecord, { onConflict: "id" });

      if (upsertErr) errors.push(`Upsert error for ${p.id}: ${upsertErr.message}`);
      else upserted.push(String(p.id));
    }

    return success({ upserted, removed, errors, total: providers.length });
  }

  return error(405, "Method not allowed. Use POST or DELETE.");
});
