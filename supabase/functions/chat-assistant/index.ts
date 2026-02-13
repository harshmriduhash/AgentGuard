import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabasePublishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  role: Role;
  content: string;
}

interface ChatRequest {
  mode?: "conversational" | "agentic";
  messages: ChatMessage[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabasePublishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as ChatRequest;
    const messages = body.messages || [];
    const mode: "conversational" | "agentic" =
      body.mode === "agentic" ? "agentic" : "conversational";

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "Missing messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt =
      mode === "agentic"
        ? `You are AgentGuard, an agentic AI assistant that helps engineering teams safely adopt AI-generated code.
Think step-by-step about security, breaking changes, compliance, and risk.
Then respond with:

Summary:
- 1–3 bullets summarizing the situation.

Plan:
1. A concrete, ordered list of actions the user can take next.
2. Focus on actions that improve safety and speed up reviews.

Be decisive, practical, and concise.`
        : `You are AgentGuard, a conversational AI assistant for software teams using AI-generated code.
Explain things clearly and concisely. Avoid code unless it directly helps answer the question.
Focus on security, PR review best practices, and how to use AgentGuard effectively.`;

    const modelMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: (m.role === "assistant" || m.role === "system" ? m.role : "user") as Role,
        content: m.content,
      })),
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: modelMessages,
        temperature: mode === "agentic" ? 0.3 : 0.4,
      }),
    });

    const aiData = await aiResponse.json();
    const reply: string =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      "I'm not sure how to respond to that. Try rephrasing your question.";

    return new Response(
      JSON.stringify({
        reply,
        mode,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("chat-assistant error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

