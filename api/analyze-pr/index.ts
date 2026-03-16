import { db } from "../../src/db";
import { repositories, prAnalyses, rules, subscriptions, agents } from "../../src/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";


export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // In a real Vercel app with Clerk, we'd use getAuth(req)
    // For this migration, we'll assume the userId is passed or retrieved via clerk helper
    const userId = req.headers["x-user-id"]; 
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { repository_id, pr_number, title, diff, agent_name } = req.body;

    if (!repository_id || !pr_number || !title || !diff) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Check repository ownership
    const repo = await db.query.repositories.findFirst({
      where: and(eq(repositories.id, repository_id), eq(repositories.userId, userId))
    });

    if (!repo) {
      return res.status(403).json({ error: "Repository access denied" });
    }

    // 2. usage checks
    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId)
    });

    if (sub && (sub.prChecksUsed ?? 0) >= (sub.prChecksLimit ?? 0)) {
      return res.status(403).json({ error: "Usage limit exceeded" });
    }

    // 3. Fetch Rules
    const activeRules = await db.query.rules.findMany({
      where: eq(rules.repoId, repository_id)
    });

    const rulesContext = activeRules.map(r => `- [${r.type}] ${r.pattern}: ${r.description}`).join("\n");

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // 4. AI Analysis
    const systemPrompt = `Analyze PR #${pr_number}: ${title}. Focus on Security, Performance, and Breaking Changes. Rules:
${rulesContext}
Return ONLY a raw JSON object with: summary, risk_score (0-100), status (pass/needs_review/blocked), breakdown, violations.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt }, 
          { role: "user", content: diff.substring(0, 30000) }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error("OpenAI Error:", errorText);
      throw new Error(`OpenAI API failed: ${errorText}`);
    }

    const aiData = await aiRes.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // 5. Update DB
    const [insertedAnalysis] = await db.insert(prAnalyses).values({
      repoId: repository_id,
      prNumber: pr_number,
      title,
      summary: analysis.summary,
      riskScore: analysis.risk_score,
      status: analysis.status,
    }).returning();

    // Usage Increment
    if (sub) {
      await db.update(subscriptions)
        .set({ prChecksUsed: (sub.prChecksUsed ?? 0) + 1 })
        .where(eq(subscriptions.id, sub.id));
    }

    return res.status(200).json({ id: insertedAnalysis.id, ...analysis });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
