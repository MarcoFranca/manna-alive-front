"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProductTriageOut, TriageStatus } from "@/types/triage";
import type { DecisionKind, ProductDecisionOut } from "@/types/decision";
import { deleteProduct } from "@/lib/api";

import { NewProductSheet } from "@/components/product/new-product-sheet";
import { ProductMarketSheet } from "@/components/product/product-market-sheet";
import { EditProductForm, ProductForEdit } from "@/components/product/edit-product-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
    triage: ProductTriageOut[];
};

type FilterKey = "all" | TriageStatus;
type SortKey = "recommended" | "score_desc" | "newest" | "name_az";

type DecisionFilter =
    | "all_decisions"
    | "no_decision"
    | "needs_data"
    | "approved"
    | "rejected";

function parseDateMs(isoLike: string): number {
    const t = Date.parse(isoLike);
    return Number.isFinite(t) ? t : 0;
}

function isNew(createdAt: string): boolean {
    const now = Date.now();
    const created = parseDateMs(createdAt);
    const days7 = 7 * 24 * 60 * 60 * 1000;
    return created > 0 && now - created <= days7;
}

function statusBadge(status: TriageStatus): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
} {
    switch (status) {
        case "ready":
            return { label: "Pronto p/ decidir", variant: "default" };
        case "needs_simulation":
            return { label: "Falta simulação", variant: "secondary" };
        case "needs_market":
            return { label: "Falta mercado", variant: "outline" };
        case "needs_costs":
            return { label: "Falta custos", variant: "destructive" };
    }
}

function statusAccentRing(status: TriageStatus): string {
    switch (status) {
        case "ready":
            return "ring-1 ring-emerald-400/20";
        case "needs_simulation":
            return "ring-1 ring-cyan-400/15";
        case "needs_market":
            return "ring-1 ring-amber-300/15";
        case "needs_costs":
            return "ring-1 ring-rose-400/15";
    }
}

function scoreTone(totalScore: number | null): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
} {
    if (totalScore === null) return { label: "Sem score", variant: "outline" };
    if (totalScore >= 80) return { label: "Excelente", variant: "default" };
    if (totalScore >= 60) return { label: "Bom", variant: "secondary" };
    if (totalScore >= 40) return { label: "Arriscado", variant: "outline" };
    return { label: "Fraco", variant: "destructive" };
}

function clampPct(v: number): number {
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, v));
}

function ScoreBar({ label, value, hint }: { label: string; value: number; hint?: string }) {
    const pct = clampPct(value);
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">
                    {pct}
                    {hint ? <span className="text-muted-foreground"> • {hint}</span> : null}
                </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function decisionLabel(decision: DecisionKind): string {
    switch (decision) {
        case "approve_test":
            return "Aprovado p/ teste";
        case "approve_import":
            return "Aprovado p/ importar";
        case "needs_data":
            return "Precisa de dados";
        case "reject":
            return "Reprovado";
    }
}

function decisionBadgeVariant(decision: DecisionKind): "default" | "secondary" | "destructive" | "outline" {
    if (decision === "approve_test" || decision === "approve_import") return "default";
    if (decision === "needs_data") return "secondary";
    if (decision === "reject") return "destructive";
    return "outline";
}

function decisionRank(d: ProductDecisionOut | null | undefined): number {
    if (!d) return 0; // sem decisão = topo
    if (d.decision === "needs_data") return 1;
    if (d.decision === "approve_test") return 2;
    if (d.decision === "approve_import") return 3;
    if (d.decision === "reject") return 9;
    return 5;
}

function toLegacyProductShape(p: ProductTriageOut) {
    return {
        id: p.product_id,
        name: p.product_name,
        category: p.category,
        description: null as string | null,
        fob_price_usd: p.fob_price_usd,
        freight_usd: p.freight_usd,
        created_at: p.created_at,
    };
}

function buildReasons(p: ProductTriageOut): string[] {
    const serverReasons = p.score?.reasons ?? [];
    if (serverReasons.length > 0) return serverReasons.slice(0, 5);

    const reasons: string[] = [];
    reasons.push(`Próxima ação: ${p.next_action}`);
    if (p.last_simulation?.estimated_margin_pct) {
        reasons.push(`Margem: ~${p.last_simulation.estimated_margin_pct}%`);
    }
    if (p.alerts.length > 0) reasons.push(`Atenção: ${p.alerts[0]}`);
    return reasons.slice(0, 4);
}

function matchesDecisionFilter(p: ProductTriageOut, f: DecisionFilter): boolean {
    if (f === "all_decisions") return true;

    const d = p.latest_decision?.decision ?? null;

    if (f === "no_decision") return d === null;
    if (f === "needs_data") return d === "needs_data";
    if (f === "rejected") return d === "reject";
    if (f === "approved") return d === "approve_test" || d === "approve_import";

    return true;
}

export function ProductsClient({ triage }: Props) {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<FilterKey>("all");
    const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("all_decisions");
    const [sort, setSort] = useState<SortKey>("recommended");

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<ProductForEdit | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingLoading, setDeletingLoading] = useState(false);

    async function handleDelete(id: number) {
        try {
            setDeletingLoading(true);
            await deleteProduct(id);
            setDeletingId(null);
            router.refresh();
        } catch (err) {
            console.error(err);
            setDeletingLoading(false);
        }
    }

    const stats = useMemo(() => {
        const total = triage.length;
        const ready = triage.filter((p) => p.status === "ready").length;
        const needSim = triage.filter((p) => p.status === "needs_simulation").length;
        const needMarket = triage.filter((p) => p.status === "needs_market").length;
        const needCosts = triage.filter((p) => p.status === "needs_costs").length;

        const noDecision = triage.filter((p) => !p.latest_decision).length;
        const needsData = triage.filter((p) => p.latest_decision?.decision === "needs_data").length;
        const approved = triage.filter(
            (p) => p.latest_decision?.decision === "approve_test" || p.latest_decision?.decision === "approve_import"
        ).length;
        const rejected = triage.filter((p) => p.latest_decision?.decision === "reject").length;

        const topScore =
            triage
                .map((p) => p.score?.total_score ?? null)
                .filter((x): x is number => typeof x === "number")
                .sort((a, b) => b - a)[0] ?? null;

        return { total, ready, needSim, needMarket, needCosts, topScore, noDecision, needsData, approved, rejected };
    }, [triage]);

    const list = useMemo(() => {
        const q = query.trim().toLowerCase();

        const filtered = triage.filter((p) => {
            const matchesText = !q
                ? true
                : `${p.product_name} ${p.category ?? ""}`.toLowerCase().includes(q);

            const matchesFilter = filter === "all" ? true : p.status === filter;

            const matchesDecision = matchesDecisionFilter(p, decisionFilter);

            return matchesText && matchesFilter && matchesDecision;
        });

        const sorted = [...filtered].sort((a, b) => {
            if (sort === "recommended") {
                const da = decisionRank(a.latest_decision ?? null);
                const db = decisionRank(b.latest_decision ?? null);
                if (da !== db) return da - db;

                if (a.priority_rank !== b.priority_rank) return a.priority_rank - b.priority_rank;

                const sa = a.score?.total_score ?? -1;
                const sb = b.score?.total_score ?? -1;
                if (sa !== sb) return sb - sa;

                return parseDateMs(b.created_at) - parseDateMs(a.created_at);
            }

            if (sort === "score_desc") {
                const sa = a.score?.total_score ?? -1;
                const sb = b.score?.total_score ?? -1;
                if (sa !== sb) return sb - sa;
                return parseDateMs(b.created_at) - parseDateMs(a.created_at);
            }

            if (sort === "newest") return parseDateMs(b.created_at) - parseDateMs(a.created_at);
            if (sort === "name_az") return a.product_name.localeCompare(b.product_name, "pt-BR");

            return 0;
        });

        return sorted;
    }, [triage, query, filter, decisionFilter, sort]);

    const spotlight = list[0] ?? null;

    return (
        <main className="min-h-screen px-6 py-8 bg-background text-foreground">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                        Workbench • Triagem → Avaliar → Decidir
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
                    <p className="text-sm text-muted-foreground">
                        Prioridade, alertas, score e (agora) decisão registrada — tudo num só lugar.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <NewProductSheet />
                    <Button variant="secondary" onClick={() => router.refresh()}>
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-5 mb-6">
                <Card className="bg-background/70 backdrop-blur border ring-1 ring-cyan-400/15">
                    <CardContent className="p-4 space-y-1">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="text-2xl font-semibold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">no pipeline</div>
                    </CardContent>
                </Card>

                <Card className="bg-background/70 backdrop-blur border ring-1 ring-emerald-400/20">
                    <CardContent className="p-4 space-y-1">
                        <div className="text-xs text-muted-foreground">Prontos</div>
                        <div className="text-2xl font-semibold">{stats.ready}</div>
                        <div className="text-xs text-muted-foreground">decisão possível</div>
                    </CardContent>
                </Card>

                <Card className="bg-background/70 backdrop-blur border ring-1 ring-fuchsia-400/12">
                    <CardContent className="p-4 space-y-1">
                        <div className="text-xs text-muted-foreground">Sem decisão</div>
                        <div className="text-2xl font-semibold">{stats.noDecision}</div>
                        <div className="text-xs text-muted-foreground">fila de trabalho</div>
                    </CardContent>
                </Card>

                <Card className="bg-background/70 backdrop-blur border ring-1 ring-amber-300/12">
                    <CardContent className="p-4 space-y-1">
                        <div className="text-xs text-muted-foreground">Precisa de dados</div>
                        <div className="text-2xl font-semibold">{stats.needsData}</div>
                        <div className="text-xs text-muted-foreground">pendências</div>
                    </CardContent>
                </Card>

                <Card className="bg-background/70 backdrop-blur border ring-1 ring-rose-400/12">
                    <CardContent className="p-4 space-y-1">
                        <div className="text-xs text-muted-foreground">Reprovados</div>
                        <div className="text-2xl font-semibold">{stats.rejected}</div>
                        <div className="text-xs text-muted-foreground">no fim da fila</div>
                    </CardContent>
                </Card>
            </div>

            {/* Spotlight */}
            <Card className="mb-6 bg-background/70 backdrop-blur border ring-1 ring-fuchsia-400/12">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Abrir primeiro</div>

                            {spotlight ? (
                                <>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="text-sm font-medium">{spotlight.product_name}</div>

                                        {isNew(spotlight.created_at) ? (
                                            <Badge variant="outline" className="border-fuchsia-400/30 text-fuchsia-300">
                                                Novo
                                            </Badge>
                                        ) : null}

                                        <Badge variant={statusBadge(spotlight.status).variant}>
                                            {statusBadge(spotlight.status).label}
                                        </Badge>

                                        {spotlight.latest_decision ? (
                                            <Badge variant={decisionBadgeVariant(spotlight.latest_decision.decision)} className="text-xs">
                                                {decisionLabel(spotlight.latest_decision.decision)}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">
                                                Sem decisão
                                            </Badge>
                                        )}

                                        {spotlight.score?.total_score != null ? (
                                            <Badge variant={scoreTone(spotlight.score.total_score).variant}>
                                                {spotlight.score.total_score} • {scoreTone(spotlight.score.total_score).label}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">Sem score</Badge>
                                        )}
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        Próxima ação:{" "}
                                        <span className="font-medium text-foreground">{spotlight.next_action}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">Nada encontrado com os filtros atuais.</div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            {spotlight ? (
                                <>
                                    <Button
                                        onClick={() => router.push(`/products/${spotlight.product_id}/evaluation`)}
                                        disabled={spotlight.status === "needs_costs"}
                                        title={spotlight.status === "needs_costs" ? "Complete custos mínimos antes de avaliar" : "Abrir avaliação"}
                                        className="shadow-[0_0_28px_-14px_rgba(217,70,239,0.9)]"
                                    >
                                        Abrir avaliação
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            const legacy = toLegacyProductShape(spotlight);
                                            setEditing({
                                                id: legacy.id,
                                                name: legacy.name,
                                                category: legacy.category,
                                                description: legacy.description,
                                                fob_price_usd: legacy.fob_price_usd,
                                                freight_usd: legacy.freight_usd,
                                            });
                                            setEditOpen(true);
                                        }}
                                    >
                                        Ajustar dados
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {spotlight ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border bg-background/50 p-3">
                                <div className="text-sm font-medium mb-2">Por que abrir agora</div>
                                <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                                    {buildReasons(spotlight).map((r) => (
                                        <li key={r}>{r}</li>
                                    ))}
                                </ul>

                                {spotlight.latest_decision ? (
                                    <div className="mt-3 rounded-md border bg-background/60 p-3">
                                        <div className="text-xs text-muted-foreground">Decisão registrada</div>
                                        <div className="text-sm font-medium">
                                            {decisionLabel(spotlight.latest_decision.decision)}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">{spotlight.latest_decision.reason}</div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-lg border bg-background/50 p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">Breakdown</div>
                                    <div className="text-xs text-muted-foreground">(quanto mais alto, melhor)</div>
                                </div>

                                {spotlight.score ? (
                                    <>
                                        <ScoreBar label="Demanda" value={spotlight.score.demand_score} />
                                        <ScoreBar label="Concorrência" value={spotlight.score.competition_score} />
                                        <ScoreBar label="Margem" value={spotlight.score.margin_score} />
                                        <ScoreBar label="Risco" value={spotlight.score.risk_score} hint="alto = melhor (menos risco)" />
                                    </>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        Sem score ainda. Preencha mercado e/ou simulação para habilitar a recomendação completa.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {spotlight && spotlight.alerts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {spotlight.alerts.slice(0, 6).map((a) => (
                                <Badge key={a} variant="outline" className="text-xs">
                                    {a}
                                </Badge>
                            ))}
                            {spotlight.alerts.length > 6 ? (
                                <Badge variant="outline" className="text-xs">
                                    +{spotlight.alerts.length - 6} alertas
                                </Badge>
                            ) : null}
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {/* Controls */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar por nome ou categoria..."
                        className="w-full md:w-[360px]"
                    />

                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                            Todos
                        </Button>
                        <Button size="sm" variant={filter === "ready" ? "default" : "outline"} onClick={() => setFilter("ready")}>
                            Prontos
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "needs_simulation" ? "default" : "outline"}
                            onClick={() => setFilter("needs_simulation")}
                        >
                            Falta simulação
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "needs_market" ? "default" : "outline"}
                            onClick={() => setFilter("needs_market")}
                        >
                            Falta mercado
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "needs_costs" ? "default" : "outline"}
                            onClick={() => setFilter("needs_costs")}
                        >
                            Falta custos
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
                    <Select value={decisionFilter} onValueChange={(v) => setDecisionFilter(v as DecisionFilter)}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Decisão" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_decisions">Decisão: todas</SelectItem>
                            <SelectItem value="no_decision">Sem decisão</SelectItem>
                            <SelectItem value="needs_data">Precisa de dados</SelectItem>
                            <SelectItem value="approved">Aprovados</SelectItem>
                            <SelectItem value="rejected">Reprovados</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Ordenação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recommended">Recomendado (fila)</SelectItem>
                            <SelectItem value="score_desc">Maior score</SelectItem>
                            <SelectItem value="newest">Mais recentes</SelectItem>
                            <SelectItem value="name_az">Nome (A–Z)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List */}
            {list.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>
            ) : (
                <div className="space-y-3">
                    {list.map((p, idx) => {
                        const badge = statusBadge(p.status);
                        const score = p.score?.total_score ?? null;

                        return (
                            <Card
                                key={p.product_id}
                                className={[
                                    "bg-background/70 backdrop-blur border",
                                    "transition hover:bg-background/80",
                                    statusAccentRing(p.status),
                                ].join(" ")}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="text-xs text-muted-foreground w-7">#{idx + 1}</div>
                                                <div className="text-sm font-medium">{p.product_name}</div>

                                                {isNew(p.created_at) ? (
                                                    <Badge variant="outline" className="border-fuchsia-400/30 text-fuchsia-300">
                                                        Novo
                                                    </Badge>
                                                ) : null}

                                                <Badge variant={badge.variant}>{badge.label}</Badge>

                                                {p.latest_decision ? (
                                                    <Badge variant={decisionBadgeVariant(p.latest_decision.decision)} className="text-xs">
                                                        {decisionLabel(p.latest_decision.decision)}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs">
                                                        Sem decisão
                                                    </Badge>
                                                )}

                                                {score !== null ? (
                                                    <Badge variant={scoreTone(score).variant}>
                                                        {score} • {scoreTone(score).label}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Sem score</Badge>
                                                )}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {p.category ?? "Sem categoria"} • {new Date(p.created_at).toLocaleDateString("pt-BR")}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                Próxima ação: <span className="font-medium text-foreground">{p.next_action}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <Badge variant="outline" className="text-xs">FOB: {p.fob_price_usd ?? "—"}</Badge>
                                                <Badge variant="outline" className="text-xs">Frete: {p.freight_usd ?? "—"}</Badge>
                                                {p.last_simulation ? (
                                                    <Badge variant="outline" className="text-xs">
                                                        Simulação: {p.last_simulation.approved ? "Aprovada" : "Reprovada"} • margem ~{" "}
                                                        {p.last_simulation.estimated_margin_pct}%
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs">Simulação: —</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <ProductMarketSheet product={toLegacyProductShape(p)} />

                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    const legacy = toLegacyProductShape(p);
                                                    setEditing({
                                                        id: legacy.id,
                                                        name: legacy.name,
                                                        category: legacy.category,
                                                        description: legacy.description,
                                                        fob_price_usd: legacy.fob_price_usd,
                                                        freight_usd: legacy.freight_usd,
                                                    });
                                                    setEditOpen(true);
                                                }}
                                            >
                                                Editar
                                            </Button>

                                            <Button
                                                size="sm"
                                                disabled={p.status === "needs_costs"}
                                                title={p.status === "needs_costs" ? "Complete custos mínimos antes de avaliar" : "Abrir avaliação"}
                                                onClick={() => router.push(`/products/${p.product_id}/evaluation`)}
                                                className={p.status === "ready" ? "shadow-[0_0_24px_-14px_rgba(52,211,153,0.9)]" : ""}
                                            >
                                                Avaliar
                                            </Button>

                                            <AlertDialog
                                                open={deletingId === p.product_id}
                                                onOpenChange={(open) => setDeletingId(open ? p.product_id : null)}
                                            >
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="destructive">
                                                        Excluir
                                                    </Button>
                                                </AlertDialogTrigger>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Apagar o produto &quot;{p.product_name}&quot;? Essa ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel disabled={deletingLoading}>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(p.product_id)}
                                                            disabled={deletingLoading}
                                                        >
                                                            {deletingLoading ? "Excluindo..." : "Excluir"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    <details className="rounded-lg border bg-background/50 p-3">
                                        <summary className="cursor-pointer select-none text-sm font-medium">
                                            Detalhes (por que vale atenção)
                                            <span className="ml-2 text-xs text-muted-foreground">
                        • explicação, alertas, decisão e breakdown
                      </span>
                                        </summary>

                                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Resumo estratégico</div>
                                                <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                                                    {buildReasons(p).map((r) => (
                                                        <li key={r}>{r}</li>
                                                    ))}
                                                </ul>

                                                {p.latest_decision ? (
                                                    <div className="pt-2 rounded-lg border bg-background/60 p-3">
                                                        <div className="text-xs text-muted-foreground">Decisão registrada</div>
                                                        <div className="flex flex-wrap gap-2 items-center mt-1">
                                                            <Badge variant={decisionBadgeVariant(p.latest_decision.decision)} className="text-xs">
                                                                {decisionLabel(p.latest_decision.decision)}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                {new Date(p.latest_decision.created_at).toLocaleString("pt-BR")}
                                                                {p.latest_decision.decided_by ? ` • por ${p.latest_decision.decided_by}` : ""}
                              </span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-2">{p.latest_decision.reason}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-muted-foreground pt-2">
                                                        Sem decisão registrada ainda.
                                                    </div>
                                                )}

                                                {p.alerts.length > 0 ? (
                                                    <div className="pt-2 flex flex-wrap gap-2">
                                                        {p.alerts.slice(0, 8).map((a) => (
                                                            <Badge key={a} variant="outline" className="text-xs">
                                                                {a}
                                                            </Badge>
                                                        ))}
                                                        {p.alerts.length > 8 ? (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{p.alerts.length - 8} alertas
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-muted-foreground pt-2">
                                                        Sem alertas relevantes detectados.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium">Score breakdown</div>
                                                    <div className="text-xs text-muted-foreground">0–100</div>
                                                </div>

                                                {p.score ? (
                                                    <>
                                                        <ScoreBar label="Demanda" value={p.score.demand_score} />
                                                        <ScoreBar label="Concorrência" value={p.score.competition_score} />
                                                        <ScoreBar label="Margem" value={p.score.margin_score} />
                                                        <ScoreBar label="Risco" value={p.score.risk_score} hint="alto = melhor" />
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">
                                                        Sem score ainda. Complete mercado/simulação para enriquecer a recomendação.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </details>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent side="right" className="sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Editar produto</SheetTitle>
                    </SheetHeader>

                    {editing ? (
                        <EditProductForm product={editing} onFinished={() => setEditOpen(false)} />
                    ) : null}
                </SheetContent>
            </Sheet>
        </main>
    );
}
