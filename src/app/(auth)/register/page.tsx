import Link from "next/link";
import { Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <Card className="mx-auto w-full max-w-lg p-8 shadow-pop">
      <div className="mb-6 flex flex-col items-center text-center">
        <button
          type="button"
          className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted"
          aria-label="Upload photo"
        >
          <Camera size={20} />
        </button>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Join VendorBridge</p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
