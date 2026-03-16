# AgentGuard AI Swapping Guide

AgentGuard is designed with an abstraction-first approach. While it uses the **Lovable AI Gateway** by default for its security-optimized prompts and low-latency delivery, you can swap it for any provider in under 5 minutes.

## Option 1: Direct Google Gemini (Vertex AI / Generative AI)
If you already have a Google Cloud or AI Studio key, you can bypass the gateway.

### 1. Update `.env`
Add your key:
```env
GOOGLE_GEMINI_API_KEY=your_key_here
```

### 2. Modify `api/analyze-pr/index.ts`
Replace the Lovable fetch with the Gemini SDK:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// In your handler:
const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();
```

## Option 2: OpenAI (GPT-4o)
To use OpenAI for even deeper reasoning on complex diffs:

### 1. Update `.env`
```env
OPENAI_API_KEY=sk-...
```

### 2. Modify `api/analyze-pr/index.ts`
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: diff }]
  })
});
```

## Why use an AI Gateway?
We recommend sticking with a gateway (like Lovable's or your own) because it allows you to:
- **Switch providers** without changing code.
- **Cache results** to save money on identical PR analyses.
- **Observability**: Track token usage and costs in one place.
