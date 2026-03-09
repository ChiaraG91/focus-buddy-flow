import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================
// Email Template Registry
// Add new templates here for easy extension
// ============================================
interface EmailTemplate {
  brevoTemplateId: number;
  requiredParams: string[];
}

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    brevoTemplateId: 1, // Replace with your actual Brevo template ID
    requiredParams: ["nome"],
  },
  premium_activated: {
    brevoTemplateId: 2,
    requiredParams: ["nome", "plan_name"],
  },
  subscription_canceled: {
    brevoTemplateId: 3,
    requiredParams: ["nome"],
  },
  payment_failed: {
    brevoTemplateId: 4,
    requiredParams: ["nome", "amount"],
  },
};

// ============================================
// Brevo API Client
// ============================================
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface SendEmailPayload {
  templateId: number;
  to: Array<{ email: string; name?: string }>;
  params: Record<string, string>;
}

async function sendViaBrev(apiKey: string, payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      templateId: payload.templateId,
      to: payload.to,
      params: payload.params,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[send-email] Brevo API error:", response.status, JSON.stringify(data));
    return { success: false, error: `Brevo API error [${response.status}]: ${data.message || JSON.stringify(data)}` };
  }

  console.log("[send-email] Email sent successfully:", data.messageId);
  return { success: true, messageId: data.messageId };
}

// ============================================
// Input Validation
// ============================================
interface EmailRequest {
  template_id: string;
  to: string;
  params: Record<string, string>;
}

function validateRequest(body: unknown): { valid: true; data: EmailRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const { template_id, to, params } = body as Record<string, unknown>;

  if (!template_id || typeof template_id !== "string") {
    return { valid: false, error: "template_id is required and must be a string" };
  }

  if (!to || typeof to !== "string") {
    return { valid: false, error: "to is required and must be a valid email string" };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return { valid: false, error: `Invalid email address: ${to}` };
  }

  if (!params || typeof params !== "object") {
    return { valid: false, error: "params is required and must be an object" };
  }

  // Check template exists
  const template = EMAIL_TEMPLATES[template_id];
  if (!template) {
    return { valid: false, error: `Unknown template_id: ${template_id}. Available: ${Object.keys(EMAIL_TEMPLATES).join(", ")}` };
  }

  // Check required params
  const missingParams = template.requiredParams.filter((p) => !(p in (params as Record<string, unknown>)));
  if (missingParams.length > 0) {
    return { valid: false, error: `Missing required params for template "${template_id}": ${missingParams.join(", ")}` };
  }

  return { valid: true, data: { template_id, to, params: params as Record<string, string> } };
}

// ============================================
// Edge Function Handler
// ============================================
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check API key
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      console.error("[send-email] BREVO_API_KEY is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      console.error("[send-email] Validation error:", validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { template_id, to, params } = validation.data;
    const template = EMAIL_TEMPLATES[template_id];

    console.log(`[send-email] Sending "${template_id}" email to ${to}`);

    // Send via Brevo
    const result = await sendViaBrev(BREVO_API_KEY, {
      templateId: template.brevoTemplateId,
      to: [{ email: to }],
      params,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-email] Unexpected error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
