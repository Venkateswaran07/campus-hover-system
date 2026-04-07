import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { request_id, status, student_name, request_type } = await req.json();

    if (!request_id || !status) {
      return new Response(
        JSON.stringify({ error: "Missing request_id or status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get the request to find the student
    const { data: requestData, error: reqError } = await supabase
      .from("requests")
      .select("student_id")
      .eq("id", request_id)
      .single();

    if (reqError || !requestData) {
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get student's email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      requestData.student_id
    );

    if (userError || !userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "Student email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const studentEmail = userData.user.email;
    const typeLabels: Record<string, string> = { od: "OD", leave: "Leave", outpass: "Outpass" };
    const typeLabel = typeLabels[request_type] || request_type;
    const statusLabel = status === "approved" ? "Approved ✅" : "Rejected ❌";

    // Send email via Supabase's built-in email (using auth admin)
    // We'll use a simple approach: send via the inbuilt SMTP
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Request ${statusLabel}</h2>
        <p style="color: #555; line-height: 1.6;">
          Hi <strong>${student_name || "Student"}</strong>,
        </p>
        <p style="color: #555; line-height: 1.6;">
          Your <strong>${typeLabel}</strong> request has been <strong>${status}</strong> by your coordinator.
        </p>
        <div style="background: ${status === "approved" ? "#e8f5e9" : "#ffebee"}; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${status === "approved" ? "#2e7d32" : "#c62828"};">
            ${statusLabel}
          </p>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
          Campus Governance System
        </p>
      </div>
    `;

    // Log the notification (we can't send raw emails without an email provider,
    // but we store notification records for the student to see in-app)
    await supabase.from("notifications").insert({
      user_id: requestData.student_id,
      title: `${typeLabel} Request ${statusLabel}`,
      message: `Your ${typeLabel} request has been ${status}.`,
      request_id,
      read: false,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Notification created" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Notification error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
