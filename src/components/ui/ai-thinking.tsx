import { cn } from "@/lib/utils";

interface AIThinkingProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AIThinking = ({ label = "Analyzing", size = "md", className }: AIThinkingProps) => {
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-3 w-3" : "h-2 w-2";
  const orbitSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("relative flex items-center justify-center", orbitSize)}>
        {/* Center pulsing core */}
        <div className={cn("rounded-full bg-primary ai-dot", dotSize)} />
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center ai-orbit"
            style={{ animationDelay: `${i * -1}s`, animationDuration: `${2.5 + i * 0.5}s` }}
          >
            <div
              className={cn(
                "rounded-full",
                i === 0 ? "h-1.5 w-1.5 bg-primary/80" : i === 1 ? "h-1 w-1 bg-primary/50" : "h-1 w-1 bg-primary/30"
              )}
            />
          </div>
        ))}
        {/* Glow ring */}
        <div className={cn("absolute inset-0 rounded-full border border-primary/20 animate-glow-pulse")} />
      </div>
      {label && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-mono">{label}</span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-primary ai-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
};

export const AIThinkingInline = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-1", className)}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-primary ai-dot"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
);
