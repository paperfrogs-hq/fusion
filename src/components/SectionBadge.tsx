import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
  children: ReactNode;
  className?: string;
}

const SectionBadge = ({ children, className }: SectionBadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default SectionBadge;
