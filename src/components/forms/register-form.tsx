"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Register"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    registerAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" placeholder="Priya" required />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" placeholder="Shah" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+91 98XXXXXXXX" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" defaultValue="PROCUREMENT_OFFICER">
            <option value="ADMIN">Admin</option>
            <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
            <option value="MANAGER">Manager</option>
            <option value="VENDOR">Vendor</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" placeholder="India" defaultValue="India" />
        </div>
      </div>

      <div>
        <Label htmlFor="about">Additional information</Label>
        <Textarea id="about" name="about" placeholder="Department, designation…" />
      </div>

      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
