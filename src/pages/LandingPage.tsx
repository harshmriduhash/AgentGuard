import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, ArrowRight, Zap, Lock, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/ParticleField";
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img src="/assets/logo.png" alt="AgentGuard" className="h-8 w-8 object-contain transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/10 blur-xl rounded-full animate-glow-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight font-display text-white">
            AgentGuard<span className="text-white/40">.ai</span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-white/60 transition-colors hover:text-white">How it works</a>
          <a href="#pricing" className="text-sm text-white/60 transition-colors hover:text-white">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Button size="sm" className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 rounded-full h-9 px-5" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-white/60 hover:text-white" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 rounded-full h-9 px-5" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const { user } = useAuth();

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0 h-full w-full">
        <ParticleField className="absolute inset-0" />
      </div>
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient z-[1]" />
      {/* Brand Banner with parallax-like effect */}
      <div className="absolute inset-0 z-[1] overflow-hidden opacity-30">
        <img 
          src="/assets/banner.png" 
          alt="" 
          className="w-full h-full object-cover scale-110 blur-[2px]"
        />
      </div>
      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-20 z-[2]" />
      {/* Radial fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background z-[3]" />
      
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
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/80 backdrop-blur-md transition-colors hover:border-white/20"
          >
            <Zap className="h-3.5 w-3.5 text-white/60" />
            AI-Powered Code Review Guardian
            <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          </motion.div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.05] tracking-tight font-display md:text-6xl lg:text-7xl text-white">
            Control what AI{" "}
            <span className="bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">agents ship</span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed md:text-xl font-light">
            AI agents write code faster than humans can review. AgentGuard analyzes every AI-generated PR for security risks, breaking changes, and policy violations.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="h-14 gap-2 px-10 text-base bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] rounded-full" asChild>
              <Link to={user ? "/dashboard" : "/signup"}>
                {user ? "Go to Dashboard" : "Start Free"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-base border-white/10 hover:border-white/20 hover:bg-white/5 text-white/80 rounded-full" asChild>
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
          <div className="relative rounded-2xl border border-white/5 bg-white/5 backdrop-blur-2xl p-8 font-mono text-sm text-left shadow-[0_40px_80px_-40px_rgba(0,0,0,1)] group hover:border-white/10 transition-colors duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-white/10" />
                <div className="h-3 w-3 rounded-full bg-white/10" />
                <div className="h-3 w-3 rounded-full bg-white/10" />
                <span className="ml-3 text-xs text-white/40 font-medium">agentguard-analysis.yml</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted</span>
              </div>
            </div>
            <pre className="overflow-x-auto text-white/70 leading-relaxed custom-scrollbar">
{`- name: AgentGuard Analysis
  uses: agentguard/analyze@v1
  with:
    risk-threshold: medium
    block-on: [security, breaking-changes]
    
# ✅ PR #482 — Risk: Low — Pass
# ⚠️ PR #483 — Risk: High — Blocked
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
            className="text-center group"
          >
            <div className="text-4xl font-black font-display text-white md:text-5xl group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
            <div className="mt-2 text-[10px] uppercase font-black tracking-widest text-white/30 group-hover:text-white/60 transition-colors">{stat.label}</div>
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
  <section className="relative border-t border-white/5 py-32 overflow-hidden">
    <div className="absolute inset-0 mesh-gradient opacity-10" />
    <div className="container relative mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-4xl font-black font-display md:text-5xl lg:text-6xl text-white tracking-tighter">
          AI agents move fast. <br />
          <span className="bg-gradient-to-r from-white to-white/10 bg-clip-text text-transparent">Too fast.</span>
        </h2>
        <p className="mt-8 text-lg text-white/50 font-light leading-relaxed">
          Copilot, Cursor, Devin, and other AI agents generate thousands of lines daily. Without automated review, vulnerabilities slip through at machine speed.
        </p>
      </motion.div>
      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {problems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04]"
          >
            <div className="mb-6 inline-flex rounded-xl border border-white/10 bg-white/5 p-4 group-hover:bg-white transition-colors duration-500">
              <item.icon className="h-6 w-6 text-white group-hover:text-black transition-colors duration-500" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">{item.title}</h3>
            <p className="mt-4 text-sm text-white/40 leading-relaxed font-light">{item.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/20 group-hover:text-white/60 transition-colors">
              Critical Risk <ArrowRight className="h-3 w-3" />
            </div>
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
            className="relative rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-10 group hover:bg-white/[0.03] transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <span className="font-mono text-8xl font-black text-white/[0.02] absolute -right-4 -top-4 group-hover:text-white/[0.05] transition-colors">{item.step}</span>
            <h3 className="mt-4 text-2xl font-black font-display text-white relative z-10">{item.title}</h3>
            <p className="mt-4 text-white/40 leading-relaxed font-light relative z-10 text-sm group-hover:text-white/60 transition-colors">{item.desc}</p>
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
  <section id="pricing" className="relative border-t border-white/5 py-32 overflow-hidden">
    <div className="absolute inset-0 mesh-gradient opacity-5" />
    <div className="container relative mx-auto px-6">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="text-center text-4xl font-black font-display md:text-5xl text-white">Simple, <br /> <span className="text-gradient">Transparent.</span></h2>
        <p className="mx-auto mt-6 max-w-xl text-center text-white/50 font-light leading-relaxed">Protect your codebase from the next machine-generated error. Start free, scale instantly.</p>
      </motion.div>
      <div className="mt-20 grid gap-8 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            className={`relative rounded-3xl border p-10 transition-all duration-500 ${
              plan.featured
                ? "border-white/20 bg-white/[0.04] shadow-[0_0_50px_rgba(255,255,255,0.05)] backdrop-blur-3xl"
                : "border-white/5 bg-transparent hover:border-white/10"
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-black shadow-xl">
                Recommended
              </div>
            )}
            <h3 className="text-2xl font-black font-display text-white">{plan.name}</h3>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-black font-display text-white">{plan.price}</span>
              <span className="text-white/40 font-medium">{plan.period}</span>
            </div>
            <p className="mt-3 text-sm text-white/40 font-light">{plan.checks}</p>
            <ul className="mt-10 space-y-4">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-white/60 font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                  {f}
                </li>
              ))}
            </ul>
            <Button size="lg" className={`mt-10 w-full h-12 rounded-xl font-bold transition-all duration-500 ${
              plan.featured 
                ? "bg-white text-black hover:bg-white/90 shadow-xl" 
                : "border-white/10 bg-white/5 text-white hover:bg-white hover:text-black hover:border-white shadow-none"
            }`} asChild>
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
      <div className="flex items-center gap-3">
        <img src="/assets/logo.png" alt="" className="h-6 w-6 object-contain" />
        <span className="font-bold font-display text-white tracking-tight">AgentGuard.ai</span>
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
