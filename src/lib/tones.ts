export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function statusBadgeVariant(status: string): BadgeVariant {
    if (status === "green") return "default";
    if (status === "yellow") return "secondary";
    if (status === "red") return "destructive";
    return "outline";
}

export function decisionBadgeVariant(decision: string): BadgeVariant {
    if (decision === "approve") return "default";
    if (decision === "needs_data") return "secondary";
    if (decision === "reject") return "destructive";
    return "outline";
}

export function decisionLabel(decision: string): string {
    if (decision === "approve") return "Aprovar";
    if (decision === "reject") return "Reprovar";
    return "Precisa de dados";
}

export function toneForRoi(roiPct: number | null): { label: string; variant: BadgeVariant; ring: string } {
    if (roiPct === null || !Number.isFinite(roiPct)) return { label: "ROI —", variant: "outline", ring: "ring-1 ring-border" };
    if (roiPct >= 40) return { label: "ROI excelente", variant: "default", ring: "ring-1 ring-emerald-400/20" };
    if (roiPct >= 25) return { label: "ROI bom", variant: "secondary", ring: "ring-1 ring-cyan-400/15" };
    if (roiPct >= 15) return { label: "ROI baixo", variant: "outline", ring: "ring-1 ring-amber-300/15" };
    return { label: "ROI ruim", variant: "destructive", ring: "ring-1 ring-rose-400/20" };
}

export function toneForPayback(days: number | null): { label: string; variant: BadgeVariant } {
    if (days === null || !Number.isFinite(days)) return { label: "Payback —", variant: "outline" };
    if (days <= 30) return { label: "Payback rápido", variant: "default" };
    if (days <= 60) return { label: "Payback ok", variant: "secondary" };
    if (days <= 90) return { label: "Payback lento", variant: "outline" };
    return { label: "Payback muito lento", variant: "destructive" };
}

export function neonRingForDecision(decision: string): string {
    if (decision === "approve") return "ring-1 ring-emerald-400/20 shadow-[0_0_46px_-26px_rgba(52,211,153,0.9)]";
    if (decision === "reject") return "ring-1 ring-rose-400/20 shadow-[0_0_46px_-26px_rgba(244,63,94,0.9)]";
    return "ring-1 ring-cyan-400/15 shadow-[0_0_46px_-30px_rgba(34,211,238,0.85)]";
}

export function kpiCardClass(neon: "cyan" | "emerald" | "fuchsia" | "amber" | "rose"): string {
    const base = "bg-background/70 backdrop-blur border rounded-xl shadow-sm transition";
    const neonMap: Record<typeof neon, string> = {
        cyan: "ring-1 ring-cyan-400/15 shadow-[0_0_44px_-30px_rgba(34,211,238,0.9)]",
        emerald: "ring-1 ring-emerald-400/18 shadow-[0_0_44px_-30px_rgba(52,211,153,0.9)]",
        fuchsia: "ring-1 ring-fuchsia-400/14 shadow-[0_0_44px_-30px_rgba(217,70,239,0.9)]",
        amber: "ring-1 ring-amber-300/14 shadow-[0_0_44px_-30px_rgba(252,211,77,0.85)]",
        rose: "ring-1 ring-rose-400/16 shadow-[0_0_44px_-30px_rgba(244,63,94,0.85)]",
    };
    return `${base} ${neonMap[neon]}`;
}
