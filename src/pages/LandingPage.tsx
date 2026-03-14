import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, ArrowRight, Zap, Lock, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/ParticleField";
import { useRef } from "react";

const Navbar = () => (
  <motion.nav
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-2xl"
  >
    <div className="container mx-auto flex h-16 items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="relative">
          <Shield className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
        </div>
        <span className="text-lg font-bold tracking-tight font-display">
          AgentGuard<span className="text-primary">.ai</span>
        </span>
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
        <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
          <Link to="/login">Log in</Link>
        </Button>
        <Button size="sm" className="glow-primary" asChild>
          <Link to="/signup">Get Started</Link>
        </Button>
      </div>
    </div>
  </motion.nav>
);

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Particle background */}
      <div className="absolute inset-0 z-0">
        <ParticleField className="absolute inset-0" />
      </div>
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient z-[1]" />
      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-20 z-[2]" />
      {/* Radial fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-[3]" />
      
      <motion.div style={{ y, opacity }} className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm text-primary backdrop-blur-sm"
          >
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Code Review Guardian
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight font-display md:text-7xl lg:text-8xl">
            Control what AI{" "}
            <span className="text-gradient">agents ship</span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
            AI agents write code faster than humans can review. AgentGuard analyzes every AI-generated PR for security risks, breaking changes, and policy violations.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="gap-2 px-8 text-base glow-primary hover:glow-primary-intense transition-shadow" asChild>
              <Link to="/signup">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 text-base border-border/50 hover:border-primary/30 hover:bg-primary/5" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto mt-24 max-w-3xl"
        >
          <div className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 font-mono text-sm text-left glow-primary">
            <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive/40" />
              <div className="h-3 w-3 rounded-full bg-warning/40" />
              <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              <span className="ml-3 text-xs text-muted-foreground">agentguard-analysis.yml</span>
            </div>
            <pre className="overflow-x-auto text-muted-foreground leading-relaxed">
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
      </motion.div>
    </section>
  );
};

const stats = [
  { value: "10K+", label: "PRs Analyzed" },
  { value: "99.2%", label: "Threat Detection" },
  { value: "<2s", label: "Analysis Time" },
  { value: "500+", label: "Teams Protected" },
];

const StatsSection = () => (
  <section className="relative border-t border-border/30 py-16">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold font-display text-gradient md:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const problems = [
  { title: "Security Blind Spots", desc: "AI can inadvertently introduce API key leaks, SQL injection vectors, or insecure dependencies.", icon: Lock },
  { title: "Breaking Changes", desc: "Schema changes, removed endpoints, altered interfaces — shipped before anyone notices.", icon: Zap },
  { title: "Compliance Gaps", desc: "Regulatory requirements, internal policies, and code standards bypassed at machine speed.", icon: BarChart3 },
];

const ProblemSection = () => (
  <section className="relative border-t border-border/30 py-24">
    <div className="absolute inset-0 mesh-gradient opacity-30" />
    <div className="container relative mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-3xl font-bold font-display md:text-5xl">
          AI agents move fast. <span className="text-gradient">Too fast.</span>
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Copilot, Cursor, Devin, and other AI agents generate thousands of lines daily. Without automated review, vulnerabilities slip through.
        </p>
      </motion.div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {problems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-colors hover:border-primary/30 hover:bg-card/80"
          >
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/40 transition-all duration-500" />
            <div className="mb-5 inline-flex rounded-lg border border-border bg-muted/50 p-3">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold font-display">{item.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  { step: "01", title: "AI opens a PR", desc: "An AI agent pushes code and opens a pull request on your repository." },
  { step: "02", title: "AgentGuard analyzes", desc: "Our engine scans the diff for security risks, breaking changes, and compliance issues." },
  { step: "03", title: "Human decides", desc: "Get a detailed risk report. Approve, request changes, or block — you stay in control." },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="relative border-t border-border/30 py-24">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-center text-3xl font-bold font-display md:text-5xl">How it works</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Three steps to automated AI code review governance.
        </p>
      </motion.div>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {steps.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:border-primary/20 transition-colors"
          >
            <span className="font-mono text-5xl font-bold text-primary/10">{item.step}</span>
            <h3 className="mt-4 text-xl font-semibold font-display">{item.title}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const plans = [
  { name: "Free", price: "$0", period: "/mo", checks: "10 PR checks/mo", features: ["1 repository", "Basic risk analysis", "Email notifications"], featured: false },
  { name: "Starter", price: "$29", period: "/mo", checks: "100 PR checks/mo", features: ["5 repositories", "Full risk breakdown", "Custom rules", "Agent tracking"], featured: true },
  { name: "Pro", price: "$99", period: "/mo", checks: "Unlimited PR checks", features: ["Unlimited repositories", "Advanced analytics", "Priority support", "SSO & audit logs"], featured: false },
];

const PricingSection = () => (
  <section id="pricing" className="relative border-t border-border/30 py-24">
    <div className="absolute inset-0 mesh-gradient opacity-20" />
    <div className="container relative mx-auto px-6">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="text-center text-3xl font-bold font-display md:text-5xl">Simple, transparent pricing</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">Start free. Scale as your team grows.</p>
      </motion.div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`relative rounded-xl border p-8 transition-all ${
              plan.featured
                ? "border-primary/40 bg-card/80 glow-primary backdrop-blur-xl"
                : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20"
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                Popular
              </div>
            )}
            <h3 className="text-xl font-semibold font-display">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold font-display">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.checks}</p>
            <ul className="mt-8 space-y-3">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={plan.featured ? "default" : "outline"} asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border/30 py-12">
    <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold font-display">AgentGuard.ai</span>
      </div>
      <p className="text-sm text-muted-foreground">© 2026 AgentGuard. All rights reserved.</p>
    </div>
  </footer>
);

const LandingPage = () => (
  <div className="min-h-screen bg-background noise-overlay relative">
    <Navbar />
    <HeroSection />
    <StatsSection />
    <ProblemSection />
    <HowItWorksSection />
    <PricingSection />
    <Footer />
  </div>
);

export default LandingPage;
