import { db } from "../../src/db";
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { messages, mode = "conversational" } = req.body;
    
    const systemPrompt = mode === "agentic" 
      ? "You are AgentGuard Assistant (Agentic Mode). Provide summary and plan." 
      : "You are AgentGuard Assistant (Conversational Mode).";

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.4
      })
    });

    const aiData = await aiRes.json();
    return res.status(200).json({ 
      reply: aiData?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.",
      mode 
    });

  } catch (error) {
    return res.status(500).json({ error: "Assistant failed" });
  }
}
