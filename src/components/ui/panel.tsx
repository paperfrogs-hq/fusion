import * as React from "react";

import { cn } from "@/lib/utils";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Panel({ className, interactive = true, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/90 p-6 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-7",
        interactive && "transition-all duration-300 hover:border-primary/35 hover:shadow-[0_0_36px_-18px_rgba(182,255,0,0.75)]",
        className,
      )}
      {...props}
    />
  );
}

