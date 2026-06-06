export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Faint grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #eceef2 1px, transparent 1px), linear-gradient(to bottom, #eceef2 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%)",
        }}
      />
      <div className="animate-fade-up relative w-full">{children}</div>
    </div>
  );
}
