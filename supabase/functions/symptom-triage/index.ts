import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userSymptoms, availableDoctors, language } = await req.json();

    if (!userSymptoms || !availableDoctors) {
      return new Response(JSON.stringify({ error: "Missing userSymptoms or availableDoctors" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ar" ? "arabe" : language === "en" ? "anglais" : "français";

    const systemPrompt = `Tu es l'Assistant de Triage Médical de la plateforme CityHealth (située en Algérie). Ton rôle est d'orienter le patient vers le bon spécialiste en fonction de ses symptômes.

RÈGLES VITALES :

1. DÉNI DE RESPONSABILITÉ : Rappelle toujours brièvement que tu n'es pas médecin et qu'il s'agit d'une simple orientation.

2. ANALYSE : Identifie la spécialité médicale la plus logique pour les symptômes décrits (ex: Cardiologie, Dentiste, Pédiatre, etc.).

3. RECHERCHE : Voici la liste des médecins actuellement disponibles sur CityHealth : ${JSON.stringify(availableDoctors)}. Trouve TOUS les médecins (jusqu'à un maximum de 5) dont la spécialité correspond à ton analyse. Renvoie bien tous leurs IDs.

4. FORMAT DE SORTIE STRICT : Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte autour (pas de balises markdown \`\`\`json).

Le format JSON exact doit être :
{
  "analysis": "Ton explication amicale, professionnelle et rassurante en expliquant pourquoi cette spécialité est recommandée. Adapte la langue : ${lang}.",
  "recommendedSpecialty": "La spécialité identifiée (ex: Ophtalmologie)",
  "urgencyLevel": "low | medium | high",
  "doctorIds": ["id_du_docteur_1", "id_du_docteur_2"]
}

Pour urgencyLevel :
- "low" : symptômes bénins, pas de danger immédiat (ex: rhume, douleur légère)
- "medium" : symptômes modérés nécessitant une consultation rapide (ex: fièvre persistante, douleur intense)
- "high" : symptômes graves nécessitant une attention urgente (ex: douleur thoracique, difficulté respiratoire, saignement abondant)

Ne mets que les ID exacts trouvés dans la liste fournie. Tableau vide [] si aucun médecin ne correspond.
Ne recommande pas plus de 5 médecins.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userSymptoms },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "Réponse IA vide" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from AI response (handle markdown code blocks)
    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI JSON:", content);
      return new Response(JSON.stringify({
        analysis: content,
        recommendedSpecialty: "",
        doctorIds: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("symptom-triage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
