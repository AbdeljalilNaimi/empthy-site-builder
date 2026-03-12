import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { providerId, userMessage } = await req.json();

    if (!providerId || !userMessage) {
      return new Response(
        JSON.stringify({ error: "providerId and userMessage are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // Strip "provider_" prefix since PDFs are stored by userId
    const userId = providerId.startsWith("provider_") ? providerId.slice("provider_".length) : providerId;
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/pdfs/${userId}.pdf`;

    // Fetch the PDF
    const pdfResp = await fetch(pdfUrl);
    if (!pdfResp.ok) {
      return new Response(
        JSON.stringify({ error: "NO_PDF", message: "Ce fournisseur n'a pas encore de document IA. L'assistant n'est pas disponible pour le moment." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfBytes = new Uint8Array(await pdfResp.arrayBuffer());
    const pdfBase64 = encode(pdfBytes);

    // 1. Default prompt (for clinics / providers)
    let systemInstruction = `Tu es l'assistant virtuel professionnel d'un fournisseur de santé sur la plateforme CityHealth. 

Tu dois OBLIGATOIREMENT répondre dans la langue exacte utilisée par le client (Arabe, Français ou Anglais).

RÈGLES :

1. POLITESSE : Salue poliment dans la langue du client.

2. SOURCE UNIQUE : Base ta réponse UNIQUEMENT sur le document fourni.

3. INCONNU : Si la réponse n'est pas dans le document, dis que tu n'as pas l'information et qu'il faut contacter le cabinet.`;

    // 2. Override prompt if this is the documentation chat
    if (providerId === "official_documentation") {
      systemInstruction = `Tu es l'Assistant IA du Centre d'Aide officiel de la plateforme CityHealth. Ton rôle est d'aider les utilisateurs (patients et professionnels) à comprendre comment utiliser la plateforme.

RÈGLE D'OR (TRADUCTION AUTOMATIQUE) : 

Tu dois OBLIGATOIREMENT répondre dans la langue exacte utilisée par l'utilisateur (Arabe, Français ou Anglais), MÊME SI le manuel officiel est écrit dans une autre langue.

RÈGLES DE RÉPONSE :

1. POLITESSE : Présente-toi comme l'Assistant du Centre d'Aide CityHealth.

2. SOURCE UNIQUE : Tes réponses doivent se baser STRICTEMENT et UNIQUEMENT sur la documentation officielle fournie. Ne donne aucune consigne technique qui ne figure pas dans ce texte.

3. FORMATAGE : Utilise le formatage Markdown (listes à puces, texte en gras) pour rendre tes tutoriels et explications faciles à lire.

4. INCONNU : Si la question ne concerne pas le fonctionnement de CityHealth, ou si la réponse ne se trouve pas dans le manuel, utilise exactement l'une de ces phrases selon la langue :

   - Français : "Je suis désolé, mais cette information ne figure pas dans la documentation officielle. Je vous invite à contacter le support technique de CityHealth."

   - Anglais : "I am sorry, but this information is not in the official documentation. Please contact CityHealth technical support."

   - Arabe : "عذراً، هذه المعلومة غير متوفرة في الوثائق الرسمية. يرجى التواصل مع الدعم الفني لمنصة CityHealth."`;
    }

    // Call Lovable AI Gateway (OpenAI-compatible API with Gemini model)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemInstruction },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                },
              },
              {
                type: "text",
                text: userMessage,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés. Veuillez contacter l'administrateur." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA. Veuillez réessayer." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chat-with-pdf error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
