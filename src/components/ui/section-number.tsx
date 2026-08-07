import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionNumberProps extends React.HTMLAttributes<HTMLDivElement> {
  n: string;
  label?: string;
}

export function SectionNumber({ n, label, className, ...props }: SectionNumberProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-serif italic text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="text-base text-foreground/90">{n}</span>
      <span className="block h-px w-8 origin-left bg-rule animate-rule-grow" />
      {label ? <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground/80 not-italic">{label}</span> : null}
    </div>
  );
}
