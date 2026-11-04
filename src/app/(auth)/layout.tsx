export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 glow-brand" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
