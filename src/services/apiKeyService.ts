import { supabase } from "@/integrations/supabase/client";

export interface ApiKey {
  id: string;
  developer_id: string;
  key_suffix: string;
  app_name: string | null;
  app_description: string | null;
  plan: string;
  rate_limit_per_day: number;
  is_active: boolean;
  created_at: string;
}

export interface ApiUsage {
  date: string;
  request_count: number;
  endpoint: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number | null;
  created_at: string;
}

// SHA-256 hash in browser
async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate a new API key
export async function generateApiKey(
  developerId: string,
  appName: string,
  appDescription: string
): Promise<{ rawKey: string; apiKey: ApiKey }> {
  const rawKey = `ch_live_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await hashKey(rawKey);
  const keySuffix = `ch_live_****${rawKey.slice(-4)}`;

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      developer_id: developerId,
      key_hash: keyHash,
      key_suffix: keySuffix,
      app_name: appName,
      app_description: appDescription,
      plan: "free",
      rate_limit_per_day: 100,
    })
    .select()
    .single();

  if (error) throw error;
  return { rawKey, apiKey: data as ApiKey };
}

// Get developer's API keys
export async function getApiKeys(developerId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("developer_id", developerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ApiKey[];
}

// Deactivate an API key
export async function deactivateApiKey(keyId: string): Promise<void> {
  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", keyId);
  if (error) throw error;
}

// Regenerate an API key
export async function regenerateApiKey(keyId: string): Promise<{ rawKey: string }> {
  const rawKey = `ch_live_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await hashKey(rawKey);
  const keySuffix = `ch_live_****${rawKey.slice(-4)}`;

  const { error } = await supabase
    .from("api_keys")
    .update({ key_hash: keyHash, key_suffix: keySuffix, is_active: true })
    .eq("id", keyId);

  if (error) throw error;
  return { rawKey };
}

// Get usage for a key (last 7 days)
export async function getKeyUsage(apiKeyId: string): Promise<ApiUsage[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("api_usage")
    .select("date, request_count, endpoint")
    .eq("api_key_id", apiKeyId)
    .gte("date", sevenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return (data || []) as ApiUsage[];
}

// Get today's total usage for a key
export async function getTodayUsage(apiKeyId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("api_usage")
    .select("request_count")
    .eq("api_key_id", apiKeyId)
    .eq("date", today);

  if (error) throw error;
  return (data || []).reduce((sum, r) => sum + (r.request_count || 0), 0);
}

// Get recent logs for a key
export async function getKeyLogs(apiKeyId: string, limit = 50): Promise<ApiLog[]> {
  const { data, error } = await supabase
    .from("api_logs")
    .select("*")
    .eq("api_key_id", apiKeyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ApiLog[];
}

// ===== ADMIN FUNCTIONS =====

// Get all API keys (admin)
export async function getAllApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ApiKey[];
}

// Get global usage stats (admin)
export async function getGlobalUsageStats() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("api_usage")
    .select("date, request_count, endpoint")
    .gte("date", sevenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get recent logs (admin)
export async function getAllLogs(limit = 100): Promise<ApiLog[]> {
  const { data, error } = await supabase
    .from("api_logs")
    .select("*, api_keys(key_suffix, app_name, developer_id)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ApiLog[];
}
