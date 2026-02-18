import * as React from "react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  containerClassName?: string;
  wide?: boolean;
}

export function Section({
  className,
  containerClassName,
  wide = true,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("relative py-16 sm:py-20 lg:py-28", className)} {...props}>
      <Container className={containerClassName} wide={wide}>
        {children}
      </Container>
    </section>
  );
}

