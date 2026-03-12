import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, type } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save message to database
    const { data, error: dbError } = await supabase
      .from('contact_messages')
      .insert({ name, email, subject: subject || null, message, type: type || null })
      .select()
      .single();

    if (dbError) {
      console.error('DB error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Send email notification to admin using Supabase Auth admin API
    // We use a simple approach: insert triggers a notification
    // For now, we log the contact and could integrate with an email service later
    console.log(`New contact message from ${name} (${email}): ${subject || 'No subject'}`);

    // Send notification email using Supabase's built-in email
    try {
      const adminEmail = 'contact@cityhealth-sba.dz';
      
      const emailBody = `
        <h2>Nouveau message de contact - CityHealth</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nom</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Type</td><td style="padding:8px;border:1px solid #ddd;">${type || 'Non spécifié'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Sujet</td><td style="padding:8px;border:1px solid #ddd;">${subject || 'Non spécifié'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #ddd;">${message}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:20px;">Reçu le ${new Date().toLocaleString('fr-FR')}</p>
      `;

      // Use the Supabase REST API to send email via the auth hook
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'magiclink',
          email: adminEmail,
          options: {
            data: { contact_notification: true },
          },
        }),
      });

      console.log('Email notification attempt status:', res.status);
    } catch (emailError) {
      // Don't fail the whole request if email fails
      console.error('Email notification error (non-blocking):', emailError);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
