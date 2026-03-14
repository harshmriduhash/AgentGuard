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
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}
  >
    <div className="relative mb-6">
      {/* Glow behind icon */}
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-150" />
      <div className="relative rounded-2xl border border-border bg-card p-5">
        <Icon className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    {children && <div className="mt-6">{children}</div>}
  </motion.div>
);
