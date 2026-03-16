import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, FileText, BookOpen, Bot, Settings, LogOut, Menu, X, Github, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "./AnimatedPage";

const navItems = [
  { to: "/dashboard", label: "PRs", icon: FileText, end: true },
  { to: "/dashboard/rules", label: "Rules", icon: BookOpen },
  { to: "/dashboard/assistant", label: "Assistant", icon: MessageCircle },
  { to: "/dashboard/agents", label: "Agents", icon: Bot },
  { to: "/dashboard/github-setup", label: "GitHub", icon: Github },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const DashboardLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebar = (
    <div className="flex h-full flex-col border-r border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-6">
        <div className="relative">
          <img src="/assets/logo.png" alt="" className="h-6 w-6 object-contain" />
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full animate-glow-pulse" />
        </div>
        <span className="font-bold text-sm tracking-tight font-display text-white whitespace-nowrap">
          AgentGuard<span className="text-white/40">.ai</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "text-white bg-white/5 border border-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02] border border-transparent"
              )
            }
          >
            <item.icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110", "text-current")} />
            {item.label}
            {item.label === "Assistant" && (
              <Sparkles className="h-3 w-3 absolute right-3 text-white/20 animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/5 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-300 hover:bg-white/[0.02] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 md:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-50 h-full w-56"
            >
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none opacity-[0.03]" />
        
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 md:hidden glass z-20">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-white/60">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="" className="h-5 w-5 object-contain" />
              <span className="font-bold text-sm tracking-tight font-display text-white">AgentGuard</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 mesh-gradient">
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              <div className="max-w-7xl mx-auto h-full">
                <Outlet />
              </div>
            </AnimatedPage>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
