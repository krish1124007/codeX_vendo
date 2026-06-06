import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, FileCheck2, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { getCurrentUser } from "@/lib/auth/session";

const FEATURES = [
  { icon: FileCheck2, label: "RFQ → Quotation → PO in one flow" },
  { icon: ShieldCheck, label: "Role-based approvals & immutable audit trail" },
  { icon: BarChart3, label: "Live procurement spend analytics" },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-pop lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-primary">
            VB
          </span>
          <span className="text-lg font-semibold tracking-tight">VendorBridge</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-2xl font-semibold leading-snug">
            Procurement & vendor management,
            <br />
            done right.
          </h2>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <f.icon size={16} />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © 2025 VendorBridge. Enterprise procurement suite.
        </p>
      </div>

      {/* Form panel */}
      <div className="p-8 sm:p-10">
        <div className="mb-7 lg:hidden">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-base font-bold text-white">
            VB
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to your VendorBridge workspace</p>

        <div className="mt-7">
          <LoginForm />
        </div>

        <p className="mt-7 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
