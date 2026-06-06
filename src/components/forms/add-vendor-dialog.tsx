"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { createVendorAction, type VendorFormState } from "@/actions/vendors";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const CATEGORIES = ["IT Hardware", "Furniture", "Construction", "Logistics", "Stationery"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Add vendor"}
    </Button>
  );
}

export function AddVendorDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<VendorFormState, FormData>(
    createVendorAction,
    {},
  );

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add Vendor
      </Button>

      {open && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
          <div className="animate-fade-up w-full max-w-lg rounded-[var(--radius-card)] border border-border bg-card shadow-pop">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Add vendor</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-card-hover hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form action={formAction} className="space-y-4 p-5">
              <div>
                <Label htmlFor="name">Vendor name</Label>
                <Input id="name" name="name" placeholder="Acme Supplies Pvt Ltd" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="gstNumber">GST number</Label>
                  <Input id="gstNumber" name="gstNumber" placeholder="27AABCXXXXX1Z" required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select id="category" name="category" defaultValue={CATEGORIES[0]}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="sales@acme.in" />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact</Label>
                  <Input id="contactNumber" name="contactNumber" placeholder="+91 90000 00000" />
                </div>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Ahmedabad" />
              </div>

              {state.error && (
                <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
