"use client";

import type { ProductEvaluationResponse } from "@/types/evaluation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DecisionActions } from "@/components/product/evaluation/decision-actions";

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

export function EvaluationClient({ evaluation }: Props) {
    const { header, completeness, decision, decision_reason, pillars, scenarios, blockers, notes } = evaluation;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">{header.product_name}</CardTitle>
                            <div className="text-sm text-muted-foreground">{header.category ?? "Sem categoria"}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <Badge variant={decisionBadgeVariant(decision)} className="text-xs">
                                Decisão: {decision === "approve" ? "Aprovar" : decision === "reject" ? "Reprovar" : "Precisa de dados"}
                            </Badge>
                            <div className="text-xs text-muted-foreground">Completude: {completeness.percent}%</div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <DecisionActions productId={header.product_id} latestDecision={header.latest_decision ?? null}/>
                    </div>

                    <div className="text-sm">{decision_reason}</div>

                    {blockers.length > 0 && (
                        <div className="rounded-md border p-3 space-y-1">
                            <div className="text-sm font-medium">Impedimentos</div>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {blockers.map((b) => (
                                    <li key={b.key}>
                                        <span className="font-medium text-foreground">{b.title}:</span> {b.reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {completeness.missing.length > 0 && (
                        <div className="rounded-md border p-3 space-y-1">
                            <div className="text-sm font-medium">Faltando para decidir melhor</div>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {completeness.missing.map((m) => (
                                    <li key={m}>{m}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardHeader>
            </Card>

            {/* Pillars */}
            <div className="grid gap-4 md:grid-cols-2">
                {pillars.map((p) => (
                    <Card key={p.key}>
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
                            <div className="text-sm">{p.summary}</div>
                            {p.next_action ? (
                                <div className="text-xs text-muted-foreground">Próxima ação: {p.next_action}</div>
                            ) : null}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {p.metrics.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Sem métricas disponíveis.</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {p.metrics.map((m) => (
                                        <div key={m.key} className="rounded-md border p-2">
                                            <div className="text-xs text-muted-foreground">{m.label}</div>
                                            <div className="text-sm font-medium">
                                                {m.value === null ? "—" : m.unit === "bool" ? (m.value === 1 ? "Sim" : "Não") : `${m.value} ${m.unit ?? ""}`}
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

            {/* Scenarios */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Cenários</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        A decisão deve se sustentar no cenário <span className="font-medium text-foreground">Conservador</span>.
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                        {scenarios.map((s) => (
                            <div key={s.kind} className="rounded-md border p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">{s.name}</div>
                                    <Badge variant={s.approved ? "default" : "destructive"} className="text-xs">
                                        {s.approved ? "Aprovado" : "Reprovado"}
                                    </Badge>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    Qty {s.quantity} • Câmbio {s.exchange_rate}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Custo unit.</div>
                                        <div className="font-medium">{s.unit_cost_brl} BRL</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Margem</div>
                                        <div className="font-medium">{s.estimated_margin_pct}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Val. aduaneiro</div>
                                        <div className="font-medium">{s.customs_value_usd} USD</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Preço alvo</div>
                                        <div className="font-medium">{s.target_sale_price_brl} BRL</div>
                                    </div>
                                </div>

                                {!s.approved && s.reason ? (
                                    <div className="text-xs text-muted-foreground">Motivo: {s.reason}</div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            {notes.length > 0 && (
                <Card>
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
            )}
        </div>
    );
}
