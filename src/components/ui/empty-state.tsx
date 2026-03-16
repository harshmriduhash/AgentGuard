import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, className, children }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className={cn("flex flex-col items-center justify-center py-24 px-6 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/10", className)}
  >
    <div className="relative mb-8">
      <div className="absolute inset-0 rounded-full bg-white/5 blur-3xl scale-[2.5]" />
      <div className="relative rounded-3xl border border-white/5 bg-black p-8 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
        <Icon className="h-12 w-12 text-white/20 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
      </div>
    </div>
    <h3 className="text-xl font-black font-display text-white tracking-tight">{title}</h3>
    <p className="mt-3 max-w-sm text-sm text-white/40 font-light leading-relaxed">{description}</p>
    {children && <div className="mt-8">{children}</div>}
  </motion.div>
);
