"use client";
import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant?: "default" | "secondary" | "destructive" | "outline" } & { className?: string } > = {
    open: { label: "Open", className: "bg-amber-100 text-amber-900 hover:bg-amber-100" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-900 hover:bg-blue-100" },
    resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100" },
    closed: { label: "Closed", className: "bg-zinc-200 text-zinc-900 hover:bg-zinc-200" },
  };
  const cfg = map[status] ?? { label: status };
  return <Badge className={`px-2 py-0.5 text-xs ${cfg.className ?? ""}`}>{cfg.label}</Badge>;
}