"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createRFQAction } from "@/actions/rfq";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { Vendor } from "@/types";

type Item = { name: string; quantity: number; unit: string };

const CATEGORIES = ["IT Hardware", "Furniture", "Construction", "Logistics", "Stationery"];
const STEPS = ["Details", "Items & Vendors", "Review"];

export function CreateRfqForm({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [items, setItems] = useState<Item[]>([{ name: "", quantity: 1, unit: "NOS" }]);
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const updateItem = (i: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems((p) => [...p, { name: "", quantity: 1, unit: "NOS" }]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const toggleVendor = (id: string) =>
    setVendorIds((p) => (p.includes(id) ? p.filter((v) => v !== id) : [...p, id]));

  function submit(publish: boolean) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("deadline", deadline);
      formData.append("publish", String(publish));
      formData.append("vendorIds", JSON.stringify(vendorIds));
      formData.append("items", JSON.stringify(items.filter((i) => i.name.trim())));
      files.forEach((file) => formData.append("attachments", file));

      const res = await createRFQAction(formData);
      if (res.error) setError(res.error);
      else router.push("/rfqs");
    });
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <button
              onClick={() => setStep(i)}
              className="flex items-center gap-2"
              type="button"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  i <= step ? "bg-primary text-white" : "bg-card text-muted",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("text-sm", i === step ? "text-foreground" : "text-muted")}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span className={cn("mx-3 h-px flex-1", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-5">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="title">RFQ title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Office Furniture Procurement Q2"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ergonomic chairs and standing desks for 3rd floor"
                />
              </div>
              <div>
                <Label htmlFor="attachments">Attachments (Optional)</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    }
                  }}
                  className="mt-1 block w-full text-sm text-muted
                    file:mr-4 file:rounded-full file:border-0
                    file:bg-primary/10 file:px-4
                    file:py-2 file:text-sm
                    file:font-semibold file:text-primary
                    hover:file:bg-primary/20"
                />
                {files.length > 0 && (
                  <ul className="mt-2 text-xs text-muted">
                    {files.map((f, i) => (
                      <li key={i}>• {f.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="mb-0">Line items</Label>
                  <Button type="button" size="sm" variant="secondary" onClick={addItem}>
                    <Plus size={14} /> Add item
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-wider text-muted px-1">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-3">Unit</div>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <Input
                        className="col-span-6"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(i, { name: e.target.value })}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                      />
                      <Input
                        className="col-span-3"
                        placeholder="Unit"
                        value={item.unit}
                        onChange={(e) => updateItem(i, { unit: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="col-span-1 flex items-center justify-center rounded-lg text-muted hover:text-danger"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2">Assign vendors</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vendors.map((v) => (
                    <label
                      key={v.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        vendorIds.includes(v.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-card-hover",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={vendorIds.includes(v.id)}
                        onChange={() => toggleVendor(v.id)}
                      />
                      <span>
                        <span className="block font-medium">{v.name}</span>
                        <span className="block text-xs text-muted">{v.category}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4 text-sm">
              <Row label="Title" value={title || "—"} />
              <Row label="Category" value={category} />
              <Row label="Deadline" value={deadline || "—"} />
              <Row label="Line items" value={`${items.filter((i) => i.name.trim()).length} item(s)`} />
              <Row label="Vendors" value={`${vendorIds.length} selected`} />
              {description && <Row label="Description" value={description} />}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => submit(false)}
                >
                  Save as draft
                </Button>
                <Button type="button" disabled={pending} onClick={() => submit(true)}>
                  {pending ? "Sending…" : "Save & send to vendors"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
