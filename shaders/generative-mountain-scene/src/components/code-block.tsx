import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  /** Tiny lozenge shown top-left (e.g. a filename or "bash"). */
  filename?: string;
  className?: string;
}

/**
 * A minimal, dependency-free code surface with a copy button. Source is shown
 * as plain monospace text (no highlighter dependency) so the panel stays
 * self-contained and offline.
 */
export function CodeBlock({ code, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked (e.g. insecure context) — silently ignore */
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-slate-line bg-ink-950/90",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-line bg-ink-900/70 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-haze/45">
          {filename ?? "source"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md border border-slate-line bg-ink-950 px-2.5 py-1 font-mono text-[11px] text-haze/70 transition-colors hover:border-glacier/60 hover:text-glacier"
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[480px] overflow-auto px-4 py-4 text-[12.5px] leading-relaxed">
        <code className="font-mono text-haze/85">{code}</code>
      </pre>
    </div>
  );
}
