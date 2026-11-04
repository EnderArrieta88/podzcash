import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-[#17130a] hover:bg-brand-strong shadow-[0_0_0_1px_rgba(244,183,40,0.35),0_8px_30px_-12px_rgba(244,183,40,0.55)]",
  secondary:
    "bg-surface-2 text-text hover:bg-border border border-border",
  ghost: "text-muted hover:text-text hover:bg-surface-2",
};

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: Variant;
  size?: "sm" | "md";
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
        size === "md" ? "h-11 px-6 text-sm" : "h-9 px-4 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
