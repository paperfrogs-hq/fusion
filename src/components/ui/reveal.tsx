import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  y?: number;
}

export function Reveal({ className, delay = 0, y = 16, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

