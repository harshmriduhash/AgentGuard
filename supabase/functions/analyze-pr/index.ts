import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabasePublishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyzeRequest {
  repository_id: string;
  pr_number: number;
  title: string;
  diff: string;
  agent_name?: string;
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

    // Auth with user token
    const userClient = createClient(supabaseUrl, supabasePublishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: AnalyzeRequest = await req.json();
    const { repository_id, pr_number, title, diff, agent_name } = body;

    if (!repository_id || !pr_number || !title || !diff) {
      return new Response(JSON.stringify({ error: "Missing required fields: repository_id, pr_number, title, diff" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Ensure repository belongs to the authenticated user
    const { data: repo, error: repoError } = await adminClient
      .from("repositories")
      .select("id, user_id, full_name")
      .eq("id", repository_id)
      .single();

    if (repoError || !repo || repo.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Repository not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic per-user rate limiting: max 20 analyses per minute
    const { count: recentCount } = await adminClient
      .from("pr_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString());

    if ((recentCount ?? 0) >= 20) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check usage limits
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subscription && subscription.pr_checks_used >= subscription.pr_checks_limit) {
      return new Response(JSON.stringify({ error: "PR check limit reached. Please upgrade your plan." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch rules for this repo
    const { data: rules } = await adminClient
      .from("rules")
      .select("*")
      .eq("repository_id", repository_id)
      .eq("is_active", true);

    // Build AI prompt
    const rulesContext = (rules || []).map(
      (r) => `- [${r.rule_type}] Pattern: "${r.pattern}" — ${r.description || "No description"}`
    ).join("\n");

    const systemPrompt = `You are AgentGuard, an AI code review security analyzer. Analyze the following PR diff and return a JSON object with:
- "summary": A 2-3 sentence summary of what the PR does and key concerns.
- "risk_score": Integer 0-100 (0=safe, 100=critical risk).
- "risk_breakdown": Object with categories "security", "breaking_changes", "performance", "compliance" each scored 0-100.
- "status": One of "pass" (score<=33), "needs_review" (score<=66), "blocked" (score>66).
- "violations": Array of objects with "rule_pattern" and "details" for each rule violated.

Rules to check against:
${rulesContext || "No custom rules defined."}

Return ONLY valid JSON, no markdown fences.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `PR #${pr_number}: ${title}\n\nDiff:\n${diff.substring(0, 30000)}` },
        ],
        temperature: 0.2,
      }),
    });

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "{}";

    let analysis;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        summary: "Failed to parse AI analysis. Raw output: " + rawContent.substring(0, 200),
        risk_score: 50,
        risk_breakdown: { security: 50, breaking_changes: 50, performance: 50, compliance: 50 },
        status: "needs_review",
        violations: [],
      };
    }

    // Handle agent
    let agent_id: string | null = null;
    if (agent_name) {
      const { data: existingAgent } = await adminClient
        .from("agents")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", agent_name)
        .single();

      if (existingAgent) {
        agent_id = existingAgent.id;
        await adminClient.rpc("increment_agent_stats", {
          p_agent_id: agent_id,
          p_violations_delta: analysis.violations?.length || 0,
        });
      } else {
        const { data: newAgent } = await adminClient
          .from("agents")
          .insert({ user_id: user.id, name: agent_name, total_prs: 1, violations_count: analysis.violations?.length || 0 })
          .select("id")
          .single();
        if (newAgent) agent_id = newAgent.id;
      }
    }

    // Store analysis
    const { data: prAnalysis, error: insertError } = await adminClient
      .from("pr_analyses")
      .insert({
        user_id: user.id,
        repository_id,
        pr_number,
        title,
        summary: analysis.summary,
        risk_score: analysis.risk_score,
        risk_breakdown: analysis.risk_breakdown,
        status: analysis.status || "needs_review",
        agent_id,
      })
      .select("id")
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store violations
    if (analysis.violations?.length && prAnalysis && rules?.length) {
      const violationInserts = [];
      for (const v of analysis.violations) {
        const matchedRule = rules.find((r) => r.pattern === v.rule_pattern);
        if (matchedRule) {
          violationInserts.push({
            pr_analysis_id: prAnalysis.id,
            rule_id: matchedRule.id,
            details: v.details,
          });
        }
      }
      if (violationInserts.length) {
        await adminClient.from("rule_violations").insert(violationInserts);
      }
    }

    // Increment usage (avoid stale values in application code)
    if (subscription) {
      await adminClient.rpc("increment_subscription_usage", {
        p_subscription_id: subscription.id,
      });
    }

    return new Response(JSON.stringify({
      id: prAnalysis?.id,
      summary: analysis.summary,
      risk_score: analysis.risk_score,
      risk_breakdown: analysis.risk_breakdown,
      status: analysis.status,
      violations: analysis.violations || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-pr error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
