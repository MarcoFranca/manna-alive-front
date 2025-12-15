"use client";

import { Card, CardContent } from "@/components/ui/card";

import { Banknote, Clock, ShieldCheck, Target } from "lucide-react";
import {kpiCardClass} from "@/lib/tones";
import {fmtNumber, fmtPct} from "@/lib/format";

export function EvaluationKpis({
                                   decision,
                                   decision_reason,
                                   conservativeRoi,
                                   conservativePayback,
                               }: {
    decision: "approve" | "reject" | "needs_data";
    decision_reason: string;
    conservativeRoi: number | null;
    conservativePayback: number | null;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className={kpiCardClass("emerald")}>
                <CardContent className="p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Cenário referência
                    </div>
                    <div className="text-base font-semibold">Conservador</div>
                    <div className="text-xs text-muted-foreground">decisão deve se sustentar aqui</div>
                </CardContent>
            </Card>

            <Card className={kpiCardClass("cyan")}>
                <CardContent className="p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Banknote className="h-4 w-4" />
                        ROI unitário
                    </div>
                    <div className="text-2xl font-semibold">{conservativeRoi !== null ? fmtPct(conservativeRoi, 1) : "—"}</div>
                    <div className="text-xs text-muted-foreground">lucro / custo</div>
                </CardContent>
            </Card>

            <Card className={kpiCardClass("fuchsia")}>
                <CardContent className="p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Payback
                    </div>
                    <div className="text-2xl font-semibold">
                        {conservativePayback !== null ? `${fmtNumber(conservativePayback, 1)}d` : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">depende de vendas/dia</div>
                </CardContent>
            </Card>

            <Card className={kpiCardClass(decision === "reject" ? "rose" : decision === "approve" ? "emerald" : "amber")}>
                <CardContent className="p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        Status
                    </div>
                    <div className="text-base font-semibold">
                        {decision === "approve" ? "Aprovar" : decision === "reject" ? "Reprovar" : "Precisa de dados"}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{decision_reason}</div>
                </CardContent>
            </Card>
        </div>
    );
}
