import { Code2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

export function EmbedCode({
  code,
  labels,
  defaultOpen = false,
}: {
  code: string;
  labels: {
    title: string;
    hint: string;
    copy: string;
    copied: string;
  };
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
        <Code2 size={15} className="text-brand" />
        {labels.title}
      </summary>

      <p className="mt-2 text-xs leading-relaxed text-muted">{labels.hint}</p>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3">
        <code className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-text">
          {code}
        </code>
        <CopyButton
          value={code}
          copyLabel={labels.copy}
          copiedLabel={labels.copied}
        />
      </div>
    </details>
  );
}
