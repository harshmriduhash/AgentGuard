import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export const SuccessAnimation = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center p-8 space-y-4"
  >
    <div className="relative">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-0 bg-white/20 rounded-full"
      />
      <CheckCircle2 className="h-16 w-16 text-white relative z-10" />
    </div>
    <div className="text-center">
      <h3 className="text-xl font-black uppercase tracking-widest text-white">Protocol Success</h3>
      <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-tighter">Baseline Synchronized</p>
    </div>
  </motion.div>
);

export const ErrorAnimation = () => (
  <motion.div
    initial={{ x: -10, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 15 }}
    className="flex flex-col items-center justify-center p-8 space-y-4"
  >
    <div className="relative">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-white/10 rounded-full blur-xl"
      />
      <XCircle className="h-16 w-16 text-white relative z-10" />
    </div>
    <div className="text-center">
      <h3 className="text-xl font-black uppercase tracking-widest text-white">Anomaly Detected</h3>
      <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-tighter">Protocol Terminated</p>
    </div>
  </motion.div>
);
