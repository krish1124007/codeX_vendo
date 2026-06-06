"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction, quickLoginAction, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  { id: "u_officer", label: "Procurement Officer" },
  { id: "u_rahul", label: "Manager" },
  { id: "u_admin", label: "Admin" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Login"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="officer@vendorbridge.io"
            defaultValue="officer@vendorbridge.io"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            defaultValue="vendorbridge"
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="remember" className="accent-primary" defaultChecked />
          Remember me
        </label>

        {state.error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        or continue as
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((acct) => (
          <form key={acct.id} action={quickLoginAction.bind(null, acct.id)}>
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              {acct.label}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
