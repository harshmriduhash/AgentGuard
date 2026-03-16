import { db } from "../../src/db";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { messages, mode = "conversational" } = req.body;
    
    const systemPrompt = mode === "agentic" 
      ? "You are AgentGuard Assistant (Agentic Mode). Provide summary and plan." 
      : "You are AgentGuard Assistant (Conversational Mode).";

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.4
      })
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error("OpenAI Error:", errorText);
      throw new Error(`OpenAI API failed: ${errorText}`);
    }

    const aiData = await aiRes.json();
    return res.status(200).json({ 
      reply: aiData?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.",
      mode 
    });

  } catch (error) {
    return res.status(500).json({ error: "Assistant failed" });
  }
}
