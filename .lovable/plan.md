

# AgentGuard.ai — Full-Stack MVP Build Plan

## 1. Landing Page
A developer-focused, modern landing page with:
- Hero section: tagline ("Control what AI agents ship"), CTA to sign up
- Problem/solution section explaining the risks of unreviewed AI-generated PRs
- How it works: 3-step visual flow (AI opens PR → AgentGuard analyzes → Human decides)
- Pricing cards: Free (10 PR checks/mo), Starter ($29/mo), Pro ($99/mo)
- Footer with links
- Clean, dark-mode-first design inspired by Linear/Vercel

## 2. Authentication
- Email/password sign-up and login using Supabase Auth
- User profiles table for display name and organization
- Protected dashboard routes — unauthenticated users redirected to login
- Logout functionality

## 3. Database Schema (Supabase)
Tables to store all AgentGuard data:
- **profiles** — user display name, organization
- **user_roles** — role-based access (admin, user)
- **repositories** — connected GitHub repos (owner, name, install status)
- **agents** — AI agent identifiers, trust scores (0–100), historical stats
- **rules** — per-repo rules (file path restrictions, pattern detection, approval-required paths, rule type, active/inactive)
- **pr_analyses** — PR analysis results (repo, PR number, summary, risk score, risk breakdown by category, status: pass/needs review/blocked)
- **rule_violations** — violations per PR per rule (rule ID, PR analysis ID, details)
- **agent_activity** — agent action log (agent ID, PR analysis ID, action type, score delta)
- **subscriptions** — billing plan tracking (user, plan tier, PR checks used/remaining)
- All tables with proper RLS policies

## 4. Web Dashboard
Three main pages plus settings:

### 4a. PRs Page
- Table listing all analyzed PRs: repo name, PR number, title, risk level (Low/Medium/High badge), status (pass/needs review/blocked), date
- Click a PR to see detail view: full summary, file-level explanations, risk breakdown by category (Security, Breaking Changes, Performance, Compliance), rule violations list
- Filters by repo, risk level, status

### 4b. Rules Page
- List of rules per repository with type, pattern, and active/inactive toggle
- Create/edit rule form: select repo, rule type (file path restriction, directory restriction, sensitive pattern detection, approval-required path), pattern input, description
- Delete rule with confirmation

### 4c. Agents Page
- Table of known AI agents: name, trust score (0–100 with visual indicator), total PRs, violations count, approvals count
- Click agent to see activity history timeline
- Trust score auto-calculated from historical data

### 4d. Settings Page
- Profile management (display name, organization)
- Connected repositories list
- Billing/subscription status and plan management

## 5. Backend Edge Functions
Supabase Edge Functions to power the platform:

- **analyze-pr** — accepts a GitHub PR URL, fetches diff via GitHub API, generates structured analysis (summary, file-level explanations, risk classification), evaluates rules, stores results, posts back. This is the core endpoint the GitHub Action will call.
- **manage-subscription** — handles Stripe webhook events and plan enforcement
- **check-usage** — validates user hasn't exceeded their plan's PR check limit before analysis

## 6. Stripe Billing Integration
- Three pricing tiers: Free, Starter ($29/mo), Pro ($99/mo)
- Stripe Checkout for upgrades
- Usage tracking (PR checks per month)
- Graceful blocking when limit exceeded with upgrade prompt

## 7. GitHub Integration Setup Page
- Instructions page showing users how to add the AgentGuard GitHub Action to their repos
- YAML snippet they can copy-paste into their `.github/workflows/`
- GitHub personal access token input (stored securely as a secret per user in the DB, encrypted)

