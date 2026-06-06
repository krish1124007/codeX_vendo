"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    
    startTransition(async () => {
      const result = await forgotPasswordAction(email);
      if (result.error) {
        toast.error(result.error);
      }
      setStatus(result);
    });
  };

  return (
    <Card className="mx-auto w-full max-w-sm p-8 shadow-pop">
      <div className="mb-6 flex flex-col items-center text-center">
        <h1 className="text-xl font-semibold">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted">Enter your email to reset your password</p>
      </div>

      {status?.ok ? (
        <div className="text-center">
          <p className="mb-6 text-sm text-success">
            If an account exists with this email, a reset link has been sent.
          </p>
          <Link
            href="/login"
            className="inline-flex h-10 w-full select-none items-center justify-center gap-2 rounded-lg border border-border-strong bg-transparent px-4 text-sm font-medium text-foreground transition-all duration-150 hover:bg-card-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
          >
            Return to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>

          {status?.error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {status.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending..." : "Send reset link"}
          </Button>

          <p className="mt-6 text-center text-sm text-muted">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </Card>
  );
}
