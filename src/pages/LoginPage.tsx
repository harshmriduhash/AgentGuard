import { Link } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { ParticleField } from "@/components/ParticleField";

const LoginPage = () => {
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
        className="relative z-10 w-full flex flex-col items-center"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-glow-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight font-display text-white">AgentGuard<span className="text-white/40">.ai</span></span>
          </Link>
        </div>

        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl p-4",
              headerTitle: "text-white font-black font-display uppercase tracking-tight",
              headerSubtitle: "text-white/40 font-light",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors rounded-xl",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-white text-black hover:bg-white/90 rounded-xl font-bold transition-all shadow-lg",
              formFieldLabel: "text-[10px] text-white/30 uppercase tracking-widest font-bold",
              formFieldInput: "bg-white/5 border-white/5 text-white rounded-xl focus:border-white/20 transition-all",
              footerActionText: "text-white/40",
              footerActionLink: "text-white hover:text-white underline underline-offset-4",
              dividerLine: "bg-white/5",
              dividerText: "text-white/20 text-[10px] uppercase font-bold",
              identityPreviewText: "text-white",
              formResendCodeLink: "text-white",
              otpCodeFieldInput: "bg-white/5 border-white/5 text-white rounded-xl",
            }
          }}
          routing="path"
          path="/login"
          signUpUrl="/signup"
          fallbackRedirectUrl="/dashboard"
        />
      </motion.div>
    </div>
  );
};

export default LoginPage;
