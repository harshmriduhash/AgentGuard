## AgentGuard.ai

> **Control what AI agents ship.** Automated security review for AI-generated pull requests.

### What problem does it solve?

Modern teams are letting AI agents (Copilot, Cursor, Devin, etc.) open and update pull requests at a speed that humans can’t safely review. This creates several problems:

- **Security risk**: Secrets, insecure configs, or dangerous patterns can slip into PRs without being noticed.
- **Breaking changes**: AI refactors can accidentally break critical paths or contracts.
- **Compliance & policy drift**: Internal guidelines (e.g., no direct DB access from certain layers) are easy to violate.
- **Reviewer overload**: Human reviewers can’t deeply inspect every AI-generated change.

AgentGuard focuses on **guarding the boundary between AI-generated code and your protected branches**.

### How does this product solve the problem?

AgentGuard.ai plugs into your GitHub workflow and:

- **Analyzes each PR diff using an AI model** tuned for security and risk assessment.
- **Applies your custom rules** (file path restrictions, sensitive patterns, approval-required areas) per repository.
- **Computes a risk score and breakdown** (security, breaking changes, performance, compliance).
- **Tracks AI agents over time** so you can see which assistants are trustworthy.
- **Surfaces a clear report for humans** so reviewers can quickly approve, block, or request changes.

Concretely:

1. A PR is opened by an AI or human.
2. A GitHub Action sends the diff + metadata to the Supabase Edge Function `analyze-pr`.
3. The edge function:
   - Verifies the authenticated Supabase user and repository ownership.
   - Pulls the relevant rules from Postgres.
   - Calls the AI gateway (Gemini 2.5 Flash) with a structured prompt.
   - Parses the response into `pr_analyses` and `rule_violations`.
   - Updates agent statistics and subscription usage atomically.
4. The web dashboard shows all PR analyses, rules, agents, and usage.

### Key features

- **AI-Powered PR Analysis** — Risk scoring and category breakdown (security, breaking changes, performance, compliance) for every PR.
- **Custom Rules Engine** — File path restrictions, directory restrictions, sensitive pattern detection, and approval-required paths per repository.
- **Agent Trust Scores** — Track AI agents over time with trust scores based on historical violations and approvals.
- **GitHub Action Integration** — Drop-in workflow that triggers analysis on every PR.
- **Agentic Assistant** — An AI assistant with conversational and agentic modes to help plan mitigation steps and design safer review workflows.
- **Voice & Conversational AI** — Browser-based voice input/output and chat UI to discuss risky PRs, rules, and security posture.

### Does it save time?

Yes:

- **Faster reviews**: Reviewers skim a structured summary and risk breakdown instead of raw diffs.
- **Prioritization**: High-risk PRs are highlighted, low-risk ones are quick-approve.
- **Reusable rules**: Once rules are defined per repo, they apply automatically to every new PR.
- **Less back-and-forth**: AI-generated code that violates obvious policies is caught before humans spend time on it.

For a team handling dozens of AI-touched PRs per week, this can save **hours of senior engineer review time** and reduce context switching.

### Does it save money?

Indirectly but meaningfully:

- **Reduces expensive security incidents** by catching issues earlier.
- **Avoids rework** from merging problematic AI-generated changes and then rolling them back.
- **Improves engineer throughput** by focusing human time on truly risky PRs.
- **Provides a path to usage-based pricing** so you only pay more when you get more value (more analyzed PRs).

Even small reductions in production bugs or security fixes can quickly exceed the subscription cost.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI |
| **Backend** | Supabase (Postgres, Auth, Edge Functions) |
| **AI Engine** | Lovable AI Gateway (Gemini 2.5 Flash) |
| **Auth** | Supabase Auth (email/password) |
| **CI/CD** | GitHub Actions integration |

---

## Software Architecture & System Design

### High-level architecture

- **Client (SPA)**: A React + TypeScript single-page app served as static assets. It talks directly to Supabase (Postgres + Auth) from the browser.
- **Backend**:
  - **Supabase Postgres**: Stores users, repositories, rules, analyses, violations, agents, subscriptions.
  - **Supabase Auth**: Manages sessions and JWTs for the SPA and edge function.
  - **Supabase Edge Function `analyze-pr`**: Receives PR analyses requests from GitHub Actions, validates access, calls the AI gateway, and writes results.
- **External services**:
  - **GitHub**: PR webhooks and GitHub Actions workflow trigger.
  - **Lovable AI Gateway**: Wraps Gemini 2.5 Flash for risk analysis.

### Data model (simplified)

- `profiles`: basic user profile (display name, organization).
- `user_roles`: role-based access (admin, user) per Supabase user.
- `repositories`: GitHub repositories per user.
- `rules`: per-repo security/compliance rules with types and patterns.
- `agents`: AI agents (e.g., “copilot”, “cursor”) with trust metrics.
- `pr_analyses`: individual PR analyses, with risk score, breakdown, status.
- `rule_violations`: concrete rule violations found in each analysis.
- `subscriptions`: plan tier, usage counts, and check limits per user.

All tables have **row-level security (RLS)** enabled to enforce per-user data isolation.

### Request flow: PR analysis

1. A GitHub Action runs on PR events and calls the Supabase Edge Function `/functions/v1/analyze-pr` with:
   - `repository_id`, `pr_number`, `title`, `diff`, `agent_name`.
   - An Authorization header with the user’s Supabase JWT.
2. The edge function:
   - Uses the Supabase JS client with the JWT to get the authenticated user.
   - Uses a service role client to:
     - Ensure the `repository_id` belongs to that user.
     - Enforce a per-minute rate limit on analyses (by counting recent `pr_analyses`).
     - Verify `subscriptions` usage limits.
   - Fetches the set of active `rules` for the repository.
   - Builds a structured system prompt including the rules and diff (truncated to avoid huge payloads).
   - Calls the AI gateway and parses JSON safely (with a fallback if parsing fails).
   - Creates a `pr_analyses` record and associated `rule_violations`.
   - Atomically increments:
     - `agents.total_prs` and `agents.violations_count` via `increment_agent_stats`.
     - `subscriptions.pr_checks_used` via `increment_subscription_usage`.
3. A summarized JSON response is returned to the GitHub Action for use in workflows or PR comments.

### Frontend architecture

- **Routing & layout**:
  - `LandingPage`, `LoginPage`, `SignupPage` for marketing and auth.
  - `DashboardLayout` + `ProtectedRoute` wrap authenticated routes.
  - Dashboard sub-pages:
    - `PRsPage`: list of analyses and detail view.
    - `RulesPage`: CRUD for rules per repository.
    - `AgentsPage`: overview of AI agents and trust scores.
    - `GitHubSetupPage`: instructions for setting up the GitHub Action.
    - `SettingsPage`: profile, repositories, and subscription overview.

- **State & data fetching**:
  - Supabase client created in `src/integrations/supabase/client.ts`.
  - `AuthContext` subscribes to auth state and exposes `user`, `session`, and `signOut`.
  - Each page uses Supabase queries scoped by `user.id` with loading and error toasts.

### Non-functional design considerations

- **Security**:
  - RLS on all user-scoped tables.
  - Repository ownership check inside `analyze-pr`.
  - Service role key only used inside the edge function environment.
  - Error responses are generic; detailed errors stay in server logs.
  - CORS is configurable via `ALLOWED_ORIGIN`.

- **Performance & scalability**:
  - SPA + static hosting scale easily for 100–200+ users.
  - Key Postgres indexes added for common queries.
  - Atomic DB functions for counters prevent race conditions.
  - Diff payloads truncated to protect the AI gateway and function memory.

- **Reliability**:
  - Supabase-managed Postgres and Edge Functions.
  - GitHub Actions provide robust rerun behavior for PR analyses.
  - Checklists (`LAUNCH_CHECKLIST`, `PRODUCTION_CHECKLIST`, etc.) guide safe rollout.

---

## Project Structure

```text
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

---

## Getting Started

### Development

```sh
# Clone the repo
git clone <YOUR_GIT_URL>
cd agentguard

# Install dependencies
npm install

# Copy env sample and configure it
cp .env.example .env
# Then fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# Start development server
npm run dev
```

### Connect to Your Repos

1. Sign up at the app.
2. Go to **Settings → Connected Repositories** and add your GitHub repo.
3. Go to the GitHub setup instructions and install the GitHub Action in your repo.
4. Open a PR and watch AgentGuard analyze it automatically.

---

## API

### POST `/functions/v1/analyze-pr`

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

---

## License

MIT
