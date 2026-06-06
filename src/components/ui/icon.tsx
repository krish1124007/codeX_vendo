import {
  Activity,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Mail,
  Plus,
  Printer,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Activity,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Mail,
  Plus,
  Printer,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Users,
};

export function Icon({
  name,
  className,
  size = 18,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Cmp = ICONS[name] ?? FileText;
  return <Cmp className={className} size={size} />;
}
