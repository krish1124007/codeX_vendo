/**
 * Formatting helpers — currency is rendered in the Indian numbering system
 * (lakh/crore) to match the procurement wireframes (₹, "12.4 L").
 */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,69,500 */
export function formatCurrency(amount: number): string {
  return INR.format(amount);
}

/** Compact lakh/crore label, e.g. 1240000 -> "12.4L", 24500000 -> "2.45Cr". */
export function formatCompactINR(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)}Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Title-case a snake/UPPER enum value, e.g. PENDING_PAYMENT -> "Pending Payment". */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
