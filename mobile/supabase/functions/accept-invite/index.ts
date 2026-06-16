import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { invite_code } = body;

    if (!invite_code) {
      return new Response(JSON.stringify({ error: "Invite code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client using Anon Key to get the user context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client using Service Role Key to bypass RLS and insert into trusted_contacts
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the invite
    const { data: invite, error: fetchError } = await serviceClient
      .from("contact_invites")
      .select("*")
      .eq("invite_code", invite_code)
      .single();

    if (fetchError || !invite) {
      return new Response(JSON.stringify({ error: "Convite não encontrado ou inválido" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.status !== "pending") {
      return new Response(JSON.stringify({ error: "Este convite já foi utilizado ou expirou." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(invite.expires_at) < new Date()) {
      await serviceClient.from("contact_invites").update({ status: "expired" }).eq("id", invite.id);
      return new Response(JSON.stringify({ error: "Este convite expirou." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.inviter_user_id === user.id) {
      return new Response(JSON.stringify({ error: "Você não pode aceitar seu próprio convite." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: If invited_email is set, check it
    if (invite.invited_email && invite.invited_email !== user.email) {
      return new Response(JSON.stringify({ error: "Este convite não é para o seu e-mail." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert bidirectional contact relation
    const { error: insertError } = await serviceClient.from("trusted_contacts").upsert([
      { user_id: invite.inviter_user_id, contact_user_id: user.id },
      { user_id: user.id, contact_user_id: invite.inviter_user_id }
    ]);

    if (insertError) throw insertError;

    // Mark as accepted
    await serviceClient.from("contact_invites").update({ status: "accepted" }).eq("id", invite.id);

    // Get inviter's display_name to show in UI
    const { data: inviterProfile } = await serviceClient
      .from("user_profiles")
      .select("display_name")
      .eq("id", invite.inviter_user_id)
      .single();

    return new Response(JSON.stringify({ success: true, inviterName: inviterProfile?.display_name || "Usuário" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
