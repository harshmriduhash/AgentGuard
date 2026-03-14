import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "success" | "error" | "warning";

interface StatusAnimationProps {
  type: StatusType;
  message?: string;
  className?: string;
}

const config = {
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
};

export const StatusAnimation = ({ type, message, className }: StatusAnimationProps) => {
  const { icon: Icon, color, bg, border } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("flex items-center gap-3 rounded-lg border p-4", bg, border, className)}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
      >
        <Icon className={cn("h-5 w-5", color)} />
      </motion.div>
      {message && <span className="text-sm text-foreground">{message}</span>}
    </motion.div>
  );
};
