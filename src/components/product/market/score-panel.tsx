"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ShieldAlert, TrendingUp, Gauge, Percent } from "lucide-react";
import type { SimulationResult } from "@/lib/api";
import { LastSimulationCard } from "./last-simulation-card";

type Score = {
    total_score: number;
    demand_score: number;
    competition_score: number;
    margin_score: number;
    risk_score: number;
    classification: string;
    notes: string;
    sales_per_day?: number | null;
    sales_per_month?: number | null;
    visits?: number | null;
    estimated_margin_pct?: string | null;
};

function classificationLabel(classification: string) {
    switch (classification) {
        case "campeao": return "CAMPEÃO";
        case "bom": return "Bom para testar";
        case "arriscado": return "Arriscado";
        case "descartar": return "Descartar";
        default: return classification;
    }
}

function classificationClass(classification: string) {
    switch (classification) {
        case "campeao": return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40";
        case "bom": return "bg-sky-500/15 text-sky-300 border border-sky-500/40";
        case "arriscado": return "bg-amber-500/15 text-amber-300 border border-amber-500/40";
        case "descartar": return "bg-red-500/15 text-red-300 border border-red-500/40";
        default: return "bg-muted text-muted-foreground";
    }
}

function MiniMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-background/50 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <div className="text-base font-semibold mt-1">{value}</div>
        </div>
    );
}

export function ScorePanel({
                               loading,
                               score,
                               lastSimulation,
                               loadingLastSim,
                           }: {
    loading: boolean;
    score: Score | null;
    lastSimulation: SimulationResult | null;
    loadingLastSim: boolean;
}) {
    if (!score && !loading) {
        return (
            <div className="text-xs text-muted-foreground">
                Ainda não foi possível calcular o score. Verifique se existe ao menos uma simulação e alguns dados de mercado.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="bg-background/70 backdrop-blur border rounded-xl">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <div className="text-sm font-semibold">Score de viabilidade</div>
                            <div className="text-xs text-muted-foreground">
                                Interpretação rápida para decidir testar ou descartar.
                            </div>
                        </div>

                        {score ? (
                            <span className={"px-2 py-1 text-xs rounded-full border " + classificationClass(score.classification)}>
                {classificationLabel(score.classification)} · {score.total_score}
              </span>
                        ) : (
                            <Badge variant="outline">Sem score</Badge>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-xs text-muted-foreground">Calculando score…</div>
                    ) : null}

                    {score && !loading ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <MiniMetric icon={<TrendingUp className="h-4 w-4 text-sky-300" />} label="Demanda" value={`${score.demand_score}/100`} />
                                <MiniMetric icon={<BarChart3 className="h-4 w-4 text-cyan-300" />} label="Concorrência" value={`${score.competition_score}/100`} />
                                <MiniMetric icon={<Percent className="h-4 w-4 text-emerald-300" />} label="Margem" value={`${score.margin_score}/100`} />
                                <MiniMetric icon={<ShieldAlert className="h-4 w-4 text-amber-300" />} label="Risco" value={`${score.risk_score}/100`} />
                            </div>

                            {score.sales_per_day != null ? (
                                <div className="rounded-xl border bg-background/50 p-3 text-xs text-muted-foreground flex items-center gap-2">
                                    <Gauge className="h-4 w-4" />
                                    <span>
                    ~{score.sales_per_day} vendas/dia · {score.sales_per_month} vendas/mês · {score.visits} visitas
                  </span>
                                </div>
                            ) : null}

                            {score.estimated_margin_pct != null ? (
                                <div className="text-xs text-muted-foreground">
                                    Margem estimada na importação:{" "}
                                    <span className="font-medium text-foreground">
                    {Number(score.estimated_margin_pct).toFixed(1)}%
                  </span>
                                </div>
                            ) : null}

                            <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                                {score.notes}
                            </div>
                        </>
                    ) : null}
                </CardContent>
            </Card>

            <LastSimulationCard loading={loadingLastSim} sim={lastSimulation} />
        </div>
    );
}
