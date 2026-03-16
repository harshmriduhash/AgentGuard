import { motion } from "framer-motion";

const AIThinkingAnimation = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-24 h-24">
        {/* Central core */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            filter: ["blur(8px)", "blur(12px)", "blur(8px)"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 m-auto w-8 h-8 bg-white rounded-full"
        />
        
        {/* Orbital rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 border border-white/10 rounded-full"
            style={{
              margin: `${i * 12}px`,
            }}
          >
            <motion.div
              animate={{
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
            />
          </motion.div>
        ))}
        
        {/* Neural pulses */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border border-white/5 rounded-full animate-glow-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AIThinkingAnimation;
