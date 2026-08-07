import * as React from "react";

import { cn } from "@/lib/utils";

interface NoteProps extends React.HTMLAttributes<HTMLParagraphElement> {
  marker?: string;
}

export function Note({ marker = "tl;dr", className, children, ...props }: NoteProps) {
  return (
    <p
      className={cn(
        "font-serif text-sm italic leading-relaxed text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="not-italic text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground/80">
        {marker}
      </span>
      <span className="mt-2 block">{children}</span>
    </p>
  );
}
