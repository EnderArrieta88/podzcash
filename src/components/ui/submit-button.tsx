"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary";
  name?: string;
  value?: string;
  disabled?: boolean;
};

export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  className,
  variant = "primary",
  name,
  value,
  disabled,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "bg-brand text-[#17130a] hover:bg-brand-strong"
          : "border border-border bg-surface-2 text-text hover:bg-border",
        className,
      )}
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
