import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ParticleField } from "@/components/ParticleField";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0">
        <ParticleField className="absolute inset-0 opacity-40" />
      </div>
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm space-y-8"
      >
        <div className="rounded-3xl border border-white/5 bg-black/40 backdrop-blur-2xl p-10 shadow-[0_40px_80px_-40px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative">
                <Shield className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-glow-pulse" />
              </div>
              <span className="text-2xl font-black tracking-tight font-display text-white">AgentGuard<span className="text-white/40">.ai</span></span>
            </Link>
            <p className="mt-4 text-sm text-white/40 font-light uppercase tracking-widest px-4">Secure Access Gateway</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold ml-1">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required className="h-12 bg-white/[0.03] border-white/5 focus:border-white/20 focus:ring-0 transition-all rounded-xl placeholder:text-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" colonial-Label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold ml-1">Key Phrase</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-12 bg-white/[0.03] border-white/5 focus:border-white/20 focus:ring-0 transition-all rounded-xl placeholder:text-white/10 text-white" />
            </div>
            <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : "Initialize Session"}
            </Button>
          </form>
          
          <p className="text-center text-xs text-white/30 mt-8 font-light">
            New operative?{" "}
            <Link to="/signup" className="text-white hover:text-white font-medium underline underline-offset-4 transition-colors">Create credentials</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
