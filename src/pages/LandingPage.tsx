import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
    <div className="container mx-auto flex h-16 items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">AgentGuard<span className="text-primary">.ai</span></span>
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
        <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Log in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/signup">Get Started</Link>
        </Button>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
    <div className="grid-pattern absolute inset-0 opacity-40" />
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    <div className="container relative z-10 mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Shield className="h-4 w-4" />
          AI Code Review Guardian
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Control what AI agents{" "}
          <span className="text-gradient">ship</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          AI agents write code faster than humans can review. AgentGuard analyzes every AI-generated PR for security risks, breaking changes, and policy violations — before it reaches production.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 px-8 text-base" asChild>
            <Link to="/signup">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 text-base" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mx-auto mt-20 max-w-3xl"
      >
        <div className="glow-primary rounded-xl border border-border bg-card p-6 font-mono text-sm text-left">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-warning/60" />
            <div className="h-3 w-3 rounded-full bg-primary/60" />
            <span className="ml-2 text-xs text-muted-foreground">agentguard-analysis.yml</span>
          </div>
          <pre className="overflow-x-auto text-muted-foreground">
{`- name: AgentGuard Analysis
  uses: agentguard/analyze@v1
  with:
    risk-threshold: medium
    block-on: [security, breaking-changes]
    
# ✅ PR #482 — Risk: Low — Status: Passed
# ⚠️ PR #483 — Risk: High — Status: Blocked
#    → Detected: API key in plaintext (line 42)`}</pre>
        </div>
      </motion.div>
    </div>
  </section>
);

const ProblemSection = () => (
  <section className="border-t border-border py-24">
    <div className="container mx-auto px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          AI agents move fast. <span className="text-gradient">Too fast.</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Copilot, Cursor, Devin, and other AI agents generate thousands of lines of code daily. Without automated review, security flaws, breaking changes, and policy violations slip through.
        </p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { title: "Security Blind Spots", desc: "AI can inadvertently introduce API key leaks, SQL injection vectors, or insecure dependencies.", icon: "🔓" },
          { title: "Breaking Changes", desc: "Schema changes, removed endpoints, altered interfaces — shipped before anyone notices.", icon: "💥" },
          { title: "Compliance Gaps", desc: "Regulatory requirements, internal policies, and code standards bypassed at machine speed.", icon: "📋" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 text-3xl">{item.icon}</div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="border-t border-border py-24">
    <div className="container mx-auto px-6">
      <h2 className="text-center text-3xl font-bold md:text-4xl">How it works</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Three steps to automated AI code review governance.
      </p>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          { step: "01", title: "AI opens a PR", desc: "An AI agent pushes code and opens a pull request on your repository." },
          { step: "02", title: "AgentGuard analyzes", desc: "Our engine scans the diff for security risks, breaking changes, pattern violations, and compliance issues." },
          { step: "03", title: "Human decides", desc: "Get a detailed risk report with actionable insights. Approve, request changes, or block — you stay in control." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative rounded-xl border border-border bg-card p-8"
          >
            <span className="font-mono text-4xl font-bold text-primary/20">{item.step}</span>
            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const PricingSection = () => (
  <section id="pricing" className="border-t border-border py-24">
    <div className="container mx-auto px-6">
      <h2 className="text-center text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Start free. Scale as your team grows.
      </p>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { name: "Free", price: "$0", period: "/mo", checks: "10 PR checks/mo", features: ["1 repository", "Basic risk analysis", "Email notifications"], cta: "Get Started", featured: false },
          { name: "Starter", price: "$29", period: "/mo", checks: "100 PR checks/mo", features: ["5 repositories", "Full risk breakdown", "Custom rules", "Agent tracking"], cta: "Get Started", featured: true },
          { name: "Pro", price: "$99", period: "/mo", checks: "Unlimited PR checks", features: ["Unlimited repositories", "Advanced analytics", "Priority support", "SSO & audit logs", "Custom integrations"], cta: "Get Started", featured: false },
        ].map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-xl border p-8 ${plan.featured ? "border-primary bg-primary/5 glow-primary" : "border-border bg-card"}`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Popular
              </div>
            )}
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.checks}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={plan.featured ? "default" : "outline"} asChild>
              <Link to="/signup">{plan.cta}</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold">AgentGuard.ai</span>
      </div>
      <p className="text-sm text-muted-foreground">© 2026 AgentGuard. All rights reserved.</p>
    </div>
  </footer>
);

const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <ProblemSection />
    <HowItWorksSection />
    <PricingSection />
    <Footer />
  </div>
);

export default LandingPage;
