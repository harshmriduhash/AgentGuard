import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

interface HoverCardInfoProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const HoverCardInfo = ({ trigger, children, className }: HoverCardInfoProps) => (
  <HoverCard openDelay={200} closeDelay={100}>
    <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
    <HoverCardContent
      className={cn(
        "w-72 border-border bg-card/95 backdrop-blur-xl text-sm",
        className
      )}
      sideOffset={8}
    >
      {children}
    </HoverCardContent>
  </HoverCard>
);
