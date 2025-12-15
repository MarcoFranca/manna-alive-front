"use client";

import type { ProductEvaluationResponse } from "@/types/evaluation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DecisionActions } from "@/components/product/evaluation/decision-actions";
import { Button } from "@/components/ui/button";

type Props = {
    evaluation: ProductEvaluationResponse;
};

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    if (status === "green") return "default";
    if (status === "yellow") return "secondary";
    if (status === "red") return "destructive";
    return "outline";
}

function decisionBadgeVariant(decision: string): "default" | "secondary" | "destructive" | "outline" {
    if (decision === "approve") return "default";
    if (decision === "needs_data") return "secondary";
    if (decision === "reject") return "destructive";
    return "outline";
}

function decisionLabel(decision: string): string {
    if (decision === "approve") return "Aprovar";
    if (decision === "reject") return "Reprovar";
    return "Precisa de dados";
}

function clampPct(v: number): number {
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, v));
}

function ScoreBar({ label, value }: { label: string; value: number }) {
    const pct = clampPct(value);
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{pct}</div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export function EvaluationClient({ evaluation }: Props) {
    const { header, completeness, decision, decision_reason, pillars, scenarios, blockers, notes, score } = evaluation;

    const conservative = scenarios.find((s) => s.kind === "conservative") ?? null;
    const base = scenarios.find((s) => s.kind === "base") ?? null;
    const optimistic = scenarios.find((s) => s.kind === "optimistic") ?? null;

    const reasons = (score?.reasons ?? []).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Executive header */}
            <Card className="bg-background/70 backdrop-blur border ring-1 ring-fuchsia-400/10">
                <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl tracking-tight">{header.product_name}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {header.category ?? "Sem categoria"} • ID {header.product_id}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <Badge variant={decisionBadgeVariant(decision)} className="text-xs">
                                    Decisão: {decisionLabel(decision)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    Completude: {completeness.percent}%
                                </Badge>
                                {score ? (
                                    <Badge variant="outline" className="text-xs">
                                        Score: {score.total_score}/100 • {score.classification}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        Score: —
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-stretch gap-2 md:items-end">
                            <DecisionActions productId={header.product_id} latestDecision={header.latest_decision ?? null} />

                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        const el = document.getElementById("scenarios");
                                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                >
                                    Ver cenários
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const el = document.getElementById("pillars");
                                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                >
                                    Ver pilares
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Decision reason */}
                    <div className="rounded-lg border bg-background/50 p-3">
                        <div className="text-sm font-medium">Resumo da decisão</div>
                        <div className="text-sm text-muted-foreground mt-1">{decision_reason}</div>
                    </div>

                    {/* Reasons + Score breakdown */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border bg-background/50 p-3">
                            <div className="text-sm font-medium">Por que isso (explicação rápida)</div>
                            {reasons.length > 0 ? (
                                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    {reasons.map((r) => (
                                        <li key={r}>{r}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="mt-2 text-sm text-muted-foreground">
                                    Sem reasons ainda. Complete mercado/simulação para o sistema explicar melhor.
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border bg-background/50 p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">Score breakdown</div>
                                <div className="text-xs text-muted-foreground">0–100 (alto = melhor)</div>
                            </div>
                            {score ? (
                                <>
                                    <ScoreBar label="Demanda" value={score.demand_score} />
                                    <ScoreBar label="Concorrência" value={score.competition_score} />
                                    <ScoreBar label="Margem" value={score.margin_score} />
                                    <ScoreBar label="Risco" value={score.risk_score} />
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Score indisponível no momento.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Blockers */}
                    {blockers.length > 0 ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                            <div className="text-sm font-medium">Impedimentos (hard stops)</div>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                {blockers.map((b) => (
                                    <li key={b.key}>
                                        <span className="font-medium text-foreground">{b.title}:</span> {b.reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {/* Missing checklist */}
                    {completeness.missing.length > 0 ? (
                        <div className="rounded-lg border bg-background/50 p-3 space-y-2">
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

            {/* Pillars */}
            <div id="pillars" className="space-y-3">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-lg font-semibold">Pilares</div>
                        <div className="text-sm text-muted-foreground">
                            O objetivo é enxergar o “gargalo” e agir rapidamente.
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {pillars.map((p) => (
                        <Card key={p.key} className="bg-background/70 backdrop-blur">
                            <CardHeader className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{p.title}</CardTitle>
                                    <Badge variant={statusBadgeVariant(p.status)} className="text-xs">
                                        {p.status === "green"
                                            ? "Ok"
                                            : p.status === "yellow"
                                                ? "Atenção"
                                                : p.status === "red"
                                                    ? "Ruim"
                                                    : "Sem dados"}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">{p.summary}</div>
                                {p.next_action ? (
                                    <div className="text-xs text-muted-foreground">
                                        Próxima ação: <span className="text-foreground font-medium">{p.next_action}</span>
                                    </div>
                                ) : null}
                            </CardHeader>

                            <CardContent className="space-y-2">
                                {p.metrics.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Sem métricas disponíveis.</div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {p.metrics.map((m) => (
                                            <div key={m.key} className="rounded-md border bg-background/50 p-2">
                                                <div className="text-xs text-muted-foreground">{m.label}</div>
                                                <div className="text-sm font-medium">
                                                    {m.value === null || typeof m.value === "undefined"
                                                        ? "—"
                                                        : m.unit === "bool"
                                                            ? m.value === 1
                                                                ? "Sim"
                                                                : "Não"
                                                            : `${m.value} ${m.unit ?? ""}`}
                                                </div>
                                                {m.help ? <div className="text-xs text-muted-foreground">{m.help}</div> : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Scenarios */}
            <Card id="scenarios" className="bg-background/70 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-base">Cenários</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        A decisão deve se sustentar no cenário <span className="font-medium text-foreground">Conservador</span>.
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                        {[base, conservative, optimistic].filter(Boolean).map((s) => {
                            const scenario = s!;
                            const isConservative = scenario.kind === "conservative";

                            return (
                                <div
                                    key={scenario.kind}
                                    className={[
                                        "rounded-lg border p-3 space-y-2 bg-background/50",
                                        isConservative ? "ring-1 ring-fuchsia-400/20 border-fuchsia-400/20" : "",
                                    ].join(" ")}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">
                                            {scenario.name}
                                            {isConservative ? (
                                                <span className="ml-2 text-xs text-fuchsia-300">Fonte da verdade</span>
                                            ) : null}
                                        </div>
                                        <Badge variant={scenario.approved ? "default" : "destructive"} className="text-xs">
                                            {scenario.approved ? "Aprovado" : "Reprovado"}
                                        </Badge>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        Qty {scenario.quantity} • Câmbio {scenario.exchange_rate}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Custo unit.</div>
                                            <div className="font-medium">{scenario.unit_cost_brl} BRL</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Margem</div>
                                            <div className="font-medium">{scenario.estimated_margin_pct}%</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Val. aduaneiro</div>
                                            <div className="font-medium">{scenario.customs_value_usd} USD</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Preço alvo</div>
                                            <div className="font-medium">{scenario.target_sale_price_brl} BRL</div>
                                        </div>
                                    </div>

                                    {!scenario.approved && scenario.reason ? (
                                        <div className="text-xs text-muted-foreground">
                                            Motivo: <span className="text-foreground">{scenario.reason}</span>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            {notes.length > 0 ? (
                <Card className="bg-background/70 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-base">Premissas e observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {notes.map((n, idx) => (
                                <li key={idx}>{n}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
