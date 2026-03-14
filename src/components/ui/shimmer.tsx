import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

export const Shimmer = ({ className }: ShimmerProps) => (
  <div className={cn("shimmer rounded-md", className)} />
);

export const ShimmerCard = () => (
  <div className="rounded-lg border border-border bg-card p-6 space-y-4">
    <Shimmer className="h-4 w-2/3" />
    <Shimmer className="h-3 w-full" />
    <Shimmer className="h-3 w-4/5" />
    <div className="flex gap-3 pt-2">
      <Shimmer className="h-8 w-20 rounded-full" />
      <Shimmer className="h-8 w-16 rounded-full" />
    </div>
  </div>
);

export const ShimmerTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-lg border border-border overflow-hidden">
    <div className="bg-muted/30 p-4">
      <div className="flex gap-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Shimmer key={i} className="h-3 w-20" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="border-t border-border p-4">
        <div className="flex gap-8 items-center">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-12" />
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-5 w-14 rounded-full" />
          <Shimmer className="h-3 w-16" />
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
