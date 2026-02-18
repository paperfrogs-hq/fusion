import * as React from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  wide?: boolean;
}

export function Container({ className, wide = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        wide ? "max-w-[1400px]" : "max-w-[1240px]",
        className,
      )}
      {...props}
    />
  );
}

