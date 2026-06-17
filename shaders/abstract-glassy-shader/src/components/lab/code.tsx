import { useState } from "react";
import { CopyButton } from "@/components/lab/controls";
import { cn } from "@/lib/utils";

export interface CodeTab {
  id: string;
  label: string;
  code: string;
}

function Pre({ code }: { code: string }) {
  return (
    <pre className="max-h-[360px] overflow-auto px-4 py-3.5 text-[12.5px] leading-relaxed">
      <code className="font-mono text-foreground/85 [&_*]:font-mono">{code}</code>
    </pre>
  );
}

/** Single framed code block with a filename bar and copy affordance. */
export function CodeBlock({ filename, code }: { filename: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black/45">
      <div className="flex items-center justify-between border-b border-border bg-white/[0.03] px-4 py-2">
        <span className="font-mono text-[11px] text-muted-foreground">{filename}</span>
        <CopyButton value={code} />
      </div>
      <Pre code={code} />
    </div>
  );
}

/** Tabbed source viewer. */
export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black/45">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-white/[0.03] pr-3">
        <div className="flex min-w-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-2.5 font-mono text-[11px] transition-colors",
                t.id === current.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground/80",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton value={current.code} />
      </div>
      <Pre code={current.code} />
    </div>
  );
}
