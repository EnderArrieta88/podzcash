"use client";

export function OfflineRetry({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
    >
      {label}
    </button>
  );
}
