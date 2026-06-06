"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Camera } from "lucide-react";
import { registerAction, type RegisterState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";

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
  
  const [role, setRole] = useState("PROCUREMENT_OFFICER");
  
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col items-center mb-4">
        <input 
          type="file" 
          name="photo" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handlePhotoChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-background text-muted transition-colors hover:bg-card-hover"
          aria-label="Upload photo"
        >
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <Camera size={24} />
          )}
        </button>
        <span className="mt-2 text-xs text-muted">Upload Photo (Optional)</span>
      </div>

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
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+91 98XXXXXXXX" />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" placeholder="India" defaultValue="India" />
        </div>
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ADMIN">Admin</option>
          <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
          <option value="MANAGER">Manager</option>
          <option value="VENDOR">Vendor</option>
        </Select>
      </div>

      {role === "VENDOR" && (
        <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold text-foreground">Vendor Profile Details</p>
          <div>
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" name="companyName" placeholder="TechCorp Supplies" required={role === "VENDOR"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gstNumber">GST number</Label>
              <Input id="gstNumber" name="gstNumber" placeholder="GST123456789" required={role === "VENDOR"} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" defaultValue="IT Hardware">
                <option value="IT Hardware">IT Hardware</option>
                <option value="Furniture">Furniture</option>
                <option value="Logistics">Logistics</option>
                <option value="Stationery">Stationery</option>
                <option value="Construction">Construction</option>
              </Select>
            </div>
          </div>
        </div>
      )}

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
