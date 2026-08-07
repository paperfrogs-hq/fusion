import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface CopyBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
}

export function CopyBlock({ code, language = "bash", filename, className, ...props }: CopyBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // noop
    }
  }, [code]);

  const lines = code.split("\n");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-rule bg-graphite/80 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-rule px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="block h-2 w-2 rounded-full bg-ember/70" />
          <span className="block h-2 w-2 rounded-full bg-muted-foreground/40" />
          <span className="block h-2 w-2 rounded-full bg-muted-foreground/40" />
        </div>
        <div className="flex items-center gap-3">
          {filename ? (
            <span className="font-mono text-[11px] text-muted-foreground/70">{filename}</span>
          ) : null}
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            {language}
          </span>
        </div>
      </div>

      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-foreground/90">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line || "\u00A0"}
            </span>
          ))}
        </code>
      </pre>

      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy to clipboard"
        className={cn(
          "absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-rule bg-background/60 px-2.5 font-mono text-[11px] text-muted-foreground backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:text-foreground",
          copied && "border-primary/60 bg-primary/15 text-primary",
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
