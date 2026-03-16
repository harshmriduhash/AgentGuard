# AgentGuard.ai
![AgentGuard Banner](/assets/banner.png)

> **Control what AI agents ship.** Automated security and risk governance for AI-generated pull requests.

## 🛡️ product Discovery

### Who is this for?
AgentGuard is designed for **modern engineering teams** that are rapidly adopting AI coding assistants (Copilot, Cursor, Devin, etc.). It's especially valuable for:
- **Security Teams** who need to ensure AI doesn't leak secrets or introduce vulnerabilities.
- **Engineering Managers** who want to maintain code quality while scaling with AI.
- **Open Source Maintainers** receiving high volumes of AI-generated contributions.

### What is the use case?
As AI agents write code faster than humans can review, AgentGuard acts as an **automated first responder**. It catches:
- **Security Risks**: API key leaks, SQL injection vectors, and insecure dependency additions.
- **Breaking Changes**: Accidental schema alterations or interface breaks.
- **Compliance Violations**: Code that drifts from internal architectural standards (e.g., "no direct DB access from the UI layer").

### How does it work?
AgentGuard plugs into your source control and CI/CD pipeline:
1. **Trigger**: A Pull Request is opened (usually by an AI agent).
2. **Analysis**: A GitHub Action sends the PR diff to our Vercel-hosted API.
3. **Intelligence**: Our AI engine (powered by Lovable AI Gateway) analyzes the code against your custom-defined rules.
4. **Action**: You get a detailed risk report in your dashboard and a status update directly on the PR. Reviewers can then make informed decisions in seconds.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Branding** | "Neural Noir" Aesthetic (Monochrome, Glassmorphism) |
| **Database** | Vercel Postgres (via Drizzle ORM) |
| **Auth** | Clerk (Identity & Session Management) |
| **API** | Vercel Serverless Functions |
| **AI Engine** | Lovable AI Gateway (Gemini 2.5 Flash) |

---

## 🛠️ Configuration

### Environment Variables (.env)
Copy the placeholders from `.env.example` and populate:
- `VITE_CLERK_PUBLISHABLE_KEY`: From your Clerk Dashboard.
- `POSTGRES_URL`: From Vercel Postgres storage settings.
- `LOVABLE_API_KEY`: Your gateway to high-performance AI analysis.

### Swapping AI Providers
While we use the **Lovable AI Gateway** by default for its optimized security prompts, you can easily swap it:
1.  Navigate to `api/analyze-pr/index.ts` and `api/chat-assistant/index.ts`.
2.  Replace the `fetch("https://ai.gateway.lovable.dev/v1/...")` call with your preferred provider's SDK (OpenAI, Anthropic, or direct Google Gemini).
3.  Ensure your system prompts remain structured for the best risk analysis performance.

---

## 📱 Mobile Responsiveness
The "Neural Noir" dashboard is designed to be high-performance. We are actively refining mobile layout breakpoints to ensure you can review PR risks on the go.

## 🔐 Auth Persistence
We use Clerk for state-of-the-art session management. If you experience logouts on refresh during local development, ensure your browser isn't blocking third-party cookies and that the `ClerkProvider` is correctly wrapping your root component.

---

## License
MIT © 2026 AgentGuard.ai
isk_breakdown": {
    "security": 60,
    "breaking_changes": 30,
    "performance": 40,
    "compliance": 50
  },
  "status": "needs_review",
  "violations": []
}
```

---

## License

MIT
