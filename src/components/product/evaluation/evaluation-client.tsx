"use client";

import { useMemo } from "react";
import type { ProductEvaluationResponse } from "@/types/evaluation";

import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

import { EvaluationHeaderCard } from "@/components/product/evaluation/components/evaluation-header-card";
import { EvaluationKpis } from "@/components/product/evaluation/components/evaluation-kpis";
import { PillarsGrid } from "@/components/product/evaluation/components/pillars-grid";
import { ScenariosGrid } from "@/components/product/evaluation/components/scenarios-grid";
import { NotesCard } from "@/components/product/evaluation/components/notes-card";
import {fmtMoney, fmtNumber, fmtPct} from "@/lib/format";

type Props = { evaluation: ProductEvaluationResponse };

function buildSmartHighlights(e: ProductEvaluationResponse): string[] {
    const out: string[] = [];
    const cons = e.scenarios.find((s) => s.kind === "conservative");

    if (cons) {
        out.push(`Lucro unitário (conservador): ${fmtMoney(cons.profit_unit_brl, "BRL")}.`);
        out.push(`ROI unitário (conservador): ${fmtPct(cons.roi_unit_pct, 1)}.`);
        out.push(
            cons.payback_days !== null
                ? `Payback estimado: ${fmtNumber(cons.payback_days, 1)} dias (exige vendas/dia).`
                : "Payback: precisa vendas/dia + lucro positivo."
        );
    }

    if (e.blockers.length > 0) out.push("Existem impeditivos: resolva antes de avançar.");
    if (e.completeness.missing.length > 0) out.push(`Faltam dados críticos: ${e.completeness.missing.slice(0, 3).join(", ")}.`);

    return out.slice(0, 4);
}

export function EvaluationClient({ evaluation }: Props) {
    const { header, completeness, decision, decision_reason, pillars, scenarios, blockers, notes } = evaluation;

    const highlights = useMemo(() => buildSmartHighlights(evaluation), [evaluation]);

    const conservative = scenarios.find((s) => s.kind === "conservative") ?? null;
    const conservativeRoi =
        conservative && typeof conservative.roi_unit_pct === "number" && Number.isFinite(conservative.roi_unit_pct)
            ? conservative.roi_unit_pct
            : null;

    const conservativePayback =
        conservative && typeof conservative.payback_days === "number" && Number.isFinite(conservative.payback_days)
            ? conservative.payback_days
            : null;

    return (
        <div className="space-y-6">
            <EvaluationHeaderCard
                header={header}
                completeness={completeness}
                decision={decision}
                decision_reason={decision_reason}
                blockers={blockers}
                highlights={highlights}
                conservativeRoi={conservativeRoi}
                conservativePayback={conservativePayback}
            />

            <EvaluationKpis
                decision={decision}
                decision_reason={decision_reason}
                conservativeRoi={conservativeRoi}
                conservativePayback={conservativePayback}
            />

            <PillarsGrid pillars={pillars} />

            <ScenariosGrid scenarios={scenarios} />

            <div className="flex justify-end">
                <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Voltar ao topo
                </Button>
            </div>

            <NotesCard notes={notes} />
        </div>
    );
}
