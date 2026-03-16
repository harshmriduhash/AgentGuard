import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./components/DashboardLayout";
import PRsPage from "./pages/dashboard/PRsPage";
import RulesPage from "./pages/dashboard/RulesPage";
import AgentsPage from "./pages/dashboard/AgentsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import GitHubSetupPage from "./pages/dashboard/GitHubSetupPage";
import AssistantPage from "./pages/dashboard/AssistantPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const ConfigError = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
    <div className="max-w-md w-full space-y-8 p-10 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-3xl shadow-2xl">
      <div className="space-y-4">
        <h1 className="text-2xl font-black font-display text-white tracking-tight uppercase">Config Incomplete</h1>
        <p className="text-sm text-white/40 leading-relaxed">
          The <code className="text-white/60 bg-white/5 px-1.5 py-0.5 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> is missing or set to the placeholder in your <code className="text-white/60">.env</code> file.
        </p>
      </div>
      <div className="pt-4">
        <a 
          href="https://dashboard.clerk.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-8 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-white/90 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          Get Keys from Clerk
        </a>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20 pt-4">
        Restart your dev server after updating .env
      </p>
    </div>
  </div>
);

const App = () => {
  const isConfigured = !!CLERK_PUBLISHABLE_KEY && !CLERK_PUBLISHABLE_KEY.includes("...");

  const AppContent = () => (
    <Routes>
      {/* Public Route - Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<NotFound />} />

      {/* Routes requiring Auth or Config Check */}
      <Route
        path="/login"
        element={isConfigured ? <LoginPage /> : <ConfigError />}
      />
      <Route
        path="/signup"
        element={isConfigured ? <SignupPage /> : <ConfigError />}
      />
      <Route
        path="/dashboard"
        element={
          isConfigured ? (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          ) : (
            <ConfigError />
          )
        }
      >
        <Route index element={<PRsPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="github-setup" element={<GitHubSetupPage />} />
      </Route>
    </Routes>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isConfigured ? (
            <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!}>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ClerkProvider>
          ) : (
            <AppContent />
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
