import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("animate-skeleton-shimmer rounded-md bg-white/[0.03] overflow-hidden relative", className)} 
      {...props} 
    >
      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
}

export { Skeleton };
