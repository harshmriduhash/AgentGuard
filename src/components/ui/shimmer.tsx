import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  key?: string | number;
}

export const Shimmer = ({ className }: ShimmerProps) => (
  <div className={cn("animate-skeleton-shimmer rounded-md bg-white/[0.03] overflow-hidden relative", className)}>
    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-[shimmer_2s_infinite]" />
  </div>
);

export const ShimmerCard = () => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 space-y-5 shadow-2xl">
    <Shimmer className="h-5 w-2/3 opacity-80" />
    <Shimmer className="h-4 w-full opacity-40" />
    <Shimmer className="h-4 w-4/5 opacity-40" />
    <div className="flex gap-4 pt-4">
      <Shimmer className="h-10 w-24 rounded-xl opacity-60" />
      <Shimmer className="h-10 w-20 rounded-xl opacity-40" />
    </div>
  </div>
);

export const ShimmerTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01] shadow-2xl">
    <div className="bg-white/[0.02] p-5 border-b border-white/5">
      <div className="flex gap-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <Shimmer key={i} className="h-3 w-20 opacity-20" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="border-b border-white/5 p-5 last:border-0 hover:bg-white/[0.02] transition-colors">
        <div className="flex gap-10 items-center">
          <Shimmer className="h-3 w-24 opacity-20" />
          <Shimmer className="h-3 w-12 opacity-50" />
          <Shimmer className="h-4 w-48 opacity-60" />
          <Shimmer className="h-6 w-16 rounded-full opacity-30" />
          <Shimmer className="h-3 w-20 opacity-10" />
        </div>
      </div>
    ))}
  </div>
);

export const ShimmerList = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
        <Shimmer className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-1/3" />
          <Shimmer className="h-2 w-2/3" />
        </div>
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);
