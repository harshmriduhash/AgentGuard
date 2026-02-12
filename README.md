# AgentGuard.ai

> **Control what AI agents ship.** Automated security review for AI-generated pull requests.

## What is AgentGuard?

AgentGuard.ai is a SaaS platform that automatically analyzes AI-generated pull requests for security vulnerabilities, breaking changes, compliance gaps, and policy violations — before they reach production.

As AI coding agents (Copilot, Cursor, Devin, etc.) generate code at machine speed, human reviewers can't keep up. AgentGuard sits between the AI agent and your main branch, providing an automated safety layer.

## Who is this for?

- **Engineering teams** using AI coding assistants who want guardrails on what gets merged
- **Security-conscious organizations** that need automated compliance checks on AI-generated code
- **CTOs and tech leads** who want visibility into what AI agents are shipping across their repos

## How it works

1. **AI opens a PR** — An AI agent pushes code and opens a pull request on your repository
2. **AgentGuard analyzes** — Our engine scans the diff for security risks, breaking changes, pattern violations, and compliance issues using AI-powered analysis
3. **Human decides** — You get a detailed risk report with actionable insights. Approve, request changes, or block — you stay in control

## Features

- **AI-Powered PR Analysis** — Every PR gets a risk score (0–100), summary, and category breakdown (Security, Breaking Changes, Performance, Compliance)
- **Custom Rules Engine** — Define file path restrictions, directory restrictions, sensitive pattern detection, and approval-required paths per repository
- **Agent Trust Scores** — Track AI agents over time with trust scores based on historical violations and approvals
- **GitHub Action Integration** — Drop-in GitHub Action workflow that triggers analysis on every PR
- **Usage-Based Billing** — Free tier (10 checks/mo), Starter ($29/mo, 100 checks), Pro ($99/mo, unlimited)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Framer Motion |
| **Backend** | Supabase (Postgres, Auth, Edge Functions) |
| **AI Engine** | Lovable AI Gateway (Gemini 2.5 Flash) |
| **Auth** | Supabase Auth (email/password) |
| **Payments** | Stripe (planned) |
| **CI/CD** | GitHub Actions integration |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── DashboardLayout  # Sidebar + main content layout
│   └── ProtectedRoute   # Auth guard for dashboard routes
├── contexts/            # React context providers (Auth)
├── pages/
│   ├── LandingPage      # Marketing homepage
│   ├── LoginPage        # Email/password login
│   ├── SignupPage       # Registration with display name
│   └── dashboard/
│       ├── PRsPage      # PR analysis list + detail view
│       ├── RulesPage    # CRUD for security rules
│       ├── AgentsPage   # AI agent monitoring
│       ├── GitHubSetupPage # Integration setup guide
│       └── SettingsPage # Profile, repos, billing
├── integrations/
│   └── supabase/        # Auto-generated client + types
└── hooks/               # Custom React hooks

supabase/
├── functions/
│   └── analyze-pr/      # Edge function: AI-powered PR analysis
├── migrations/          # Database schema migrations
└── config.toml          # Supabase project config
```

## Database Schema

- **profiles** — User display name and organization
- **user_roles** — Role-based access (admin, user)
- **repositories** — Connected GitHub repos
- **agents** — AI agent identifiers with trust scores (0–100)
- **rules** — Per-repo security rules (file paths, patterns, restrictions)
- **pr_analyses** — PR analysis results with risk scores and breakdowns
- **rule_violations** — Violations detected per PR per rule
- **subscriptions** — Billing plan and usage tracking

## Getting Started

### Development

```sh
# Clone the repo
git clone <YOUR_GIT_URL>
cd agentguard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Connect to Your Repos

1. Sign up at the app
2. Go to **Settings → Connected Repositories** and add your GitHub repo
3. Go to **GitHub** tab and follow the setup guide to add the GitHub Action
4. Open a PR and watch AgentGuard analyze it automatically

## API

### POST /functions/v1/analyze-pr

Analyzes a PR diff and returns a risk assessment.

**Request body:**
```json
{
  "repository_id": "uuid",
  "pr_number": 123,
  "title": "Add new feature",
  "diff": "diff content...",
  "agent_name": "copilot" 
}
```

**Response:**
```json
{
  "id": "uuid",
  "summary": "This PR adds...",
  "risk_score": 45,
  "risk_breakdown": {
    "security": 60,
    "breaking_changes": 30,
    "performance": 40,
    "compliance": 50
  },
  "status": "needs_review",
  "violations": []
}
```

## License

MIT
