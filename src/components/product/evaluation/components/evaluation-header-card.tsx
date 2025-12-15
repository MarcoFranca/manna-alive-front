"use client";

import type { ProductEvaluationResponse } from "@/types/evaluation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DecisionActions } from "@/components/product/evaluation/decision-actions";
import { Breadcrumbs } from "./breadcrumbs";
import { AlertTriangle, CheckCircle2, Info, TrendingUp } from "lucide-react";
import {decisionBadgeVariant, decisionLabel, neonRingForDecision, toneForPayback, toneForRoi} from "@/lib/tones";
import {fmtNumber, fmtPct} from "@/lib/format";

function highlightIcon(kind: "ok" | "warn" | "info") {
    if (kind === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
    if (kind === "warn") return <AlertTriangle className="h-4 w-4 text-amber-300" />;
    return <Info className="h-4 w-4 text-cyan-300" />;
}

export function EvaluationHeaderCard({
                                         header,
                                         completeness,
                                         decision,
                                         decision_reason,
                                         blockers,
                                         highlights,
                                         conservativeRoi,
                                         conservativePayback,
                                     }: {
    header: ProductEvaluationResponse["header"];
    completeness: ProductEvaluationResponse["completeness"];
    decision: ProductEvaluationResponse["decision"];
    decision_reason: string;
    blockers: ProductEvaluationResponse["blockers"];
    highlights: string[];
    conservativeRoi: number | null;
    conservativePayback: number | null;
}) {
    const roiTone = toneForRoi(conservativeRoi);
    const pbTone = toneForPayback(conservativePayback);

    return (
        <Card className={`bg-background/70 backdrop-blur border rounded-2xl ${neonRingForDecision(decision)}`}>
            <CardHeader className="space-y-4">
                <Breadcrumbs
                    items={[
                        { label: "Home", href: "/" },
                        { label: "Produtos", href: "/products" },
                        { label: "Avaliação" },
                    ]}
                />

                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Avaliação • ROI & Payback primeiro • Depois risco e operação
                        </div>

                        <CardTitle className="text-2xl">{header.product_name}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {header.category ?? "Sem categoria"} • ID {header.product_id}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={decisionBadgeVariant(decision)} className="text-xs">
                            Decisão: {decisionLabel(decision)}
                        </Badge>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <Badge variant={roiTone.variant} className="text-[10px]">
                                {roiTone.label} {conservativeRoi !== null ? `• ${fmtPct(conservativeRoi, 1)}` : ""}
                            </Badge>
                            <Badge variant={pbTone.variant} className="text-[10px]">
                                {conservativePayback !== null ? `${fmtNumber(conservativePayback, 1)} dias` : "Payback —"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                                Completude: {completeness.percent}%
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Resumo:</span>{" "}
                        <span className="font-medium text-foreground">{decision_reason}</span>
                    </div>
                    <div className="w-full md:w-auto">
                        <DecisionActions productId={header.product_id} latestDecision={header.latest_decision ?? null} />
                    </div>
                </div>

                {highlights.length > 0 ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                        <div className="text-sm font-medium mb-2">Leitura rápida</div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {highlights.map((h, idx) => (
                                <li key={`${h}-${idx}`} className="flex items-start gap-2">
                                    {highlightIcon(h.toLowerCase().includes("impedit") ? "warn" : h.toLowerCase().includes("falt") ? "info" : "ok")}
                                    <span>{h}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {blockers.length > 0 ? (
                    <div className="rounded-2xl border bg-background/50 p-4 space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-300" />
                            Impedimentos
                        </div>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {blockers.map((b) => (
                                <li key={b.key}>
                                    <span className="font-medium text-foreground">{b.title}:</span> {b.reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {completeness.missing.length > 0 ? (
                    <div className="rounded-2xl border bg-background/50 p-4 space-y-2">
                        <div className="text-sm font-medium">Faltando para decidir melhor</div>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {completeness.missing.map((m) => (
                                <li key={m}>{m}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </CardHeader>
        </Card>
    );
}
