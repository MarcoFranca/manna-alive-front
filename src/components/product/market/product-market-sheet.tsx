"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchMarketData, upsertMarketData, fetchProductScore, fetchLastSimulation, type SimulationResult } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { ExternalLink, LineChart } from "lucide-react";
import { MarketForm } from "./market-form";
import { ScorePanel } from "./score-panel";
import type { MarketDataPayload } from "./market-helpers";

type ProductRef = { id: number; name: string };

type Score = {
    product_id: number;
    product_name: string;
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
    price_average_brl?: string | null;
    estimated_margin_pct?: string | null;
    has_latest_simulation: boolean;
};

export function ProductMarketSheet({ product }: { product: ProductRef }) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"market" | "score">("market");

    const [loadingMarket, setLoadingMarket] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingScore, setLoadingScore] = useState(false);
    const [loadingLastSim, setLoadingLastSim] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [score, setScore] = useState<Score | null>(null);
    const [lastSimulation, setLastSimulation] = useState<SimulationResult | null>(null);

    const [form, setForm] = useState({
        priceAverage: "",
        salesPerDay: "",
        salesPerMonth: "",
        visits: "",
        rankingPosition: "",
        fullRatio: "",
        competitorCount: "",
        listingAgeDays: "",
        avgReviews: "",
    });

    const kpi = useMemo(() => {
        if (!score) return null;
        return { total: score.total_score, classification: score.classification };
    }, [score]);

    useEffect(() => {
        if (!open) return;

        async function loadAll() {
            setErrorMsg(null);
            setSuccessMsg(null);

            setLoadingMarket(true);
            setLoadingScore(true);
            setLoadingLastSim(true);

            try {
                const [market, sc, sim] = await Promise.allSettled([
                    fetchMarketData(product.id),
                    fetchProductScore(product.id),
                    fetchLastSimulation(product.id),
                ]);

                if (market.status === "fulfilled" && market.value) {
                    const m = market.value;
                    setForm({
                        priceAverage: m.price_average_brl ?? "",
                        salesPerDay: m.sales_per_day?.toString() ?? "",
                        salesPerMonth: m.sales_per_month?.toString() ?? "",
                        visits: m.visits?.toString() ?? "",
                        rankingPosition: m.ranking_position?.toString() ?? "",
                        fullRatio: m.full_ratio?.toString() ?? "",
                        competitorCount: m.competitor_count?.toString() ?? "",
                        listingAgeDays: m.listing_age_days?.toString() ?? "",
                        avgReviews: m.avg_reviews?.toString() ?? "",
                    });
                }

                if (sc.status === "fulfilled") setScore(sc.value as Score);
                if (sim.status === "fulfilled") setLastSimulation(sim.value as SimulationResult);
            } catch (err) {
                console.error(err);
                setErrorMsg("Erro ao carregar dados de mercado, score ou simulação.");
            } finally {
                setLoadingLastSim(false);
                setLoadingScore(false);
                setLoadingMarket(false);
            }
        }

        loadAll();
    }, [open, product.id]);

    async function saveMarket(payload: MarketDataPayload) {
        setErrorMsg(null);
        setSuccessMsg(null);
        setSaving(true);

        try {
            await upsertMarketData(product.id, payload);
            setSuccessMsg("Dados de mercado salvos com sucesso.");

            // Recalcula score após salvar (mantém o “Score” sempre atual)
            setLoadingScore(true);
            try {
                const sc = await fetchProductScore(product.id);
                setScore(sc as Score);
            } finally {
                setLoadingScore(false);
            }

            router.refresh();
            setTab("score"); // UX: salvou → leva para Score
        } catch (err) {
            console.error(err);
            setErrorMsg("Erro ao salvar dados de mercado.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                    Mercado / Score
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="sm:max-w-2xl p-0 flex flex-col">
                {/* Header fixo */}
                <SheetHeader className="px-6 pt-4 pb-3 border-b">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <SheetTitle>Dados de mercado · {product.name}</SheetTitle>
                            <SheetDescription>
                                Preencha Avant Pro / Mercado Livre. O score atualiza automaticamente.
                            </SheetDescription>
                        </div>

                        {kpi ? (
                            <Badge variant="outline" className="text-xs">
                                <LineChart className="h-3.5 w-3.5 mr-1" />
                                Score: {kpi.total}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs">Sem score</Badge>
                        )}
                    </div>

                    <div className="mt-2">
                        <a
                            href="https://1drv.ms/x/c/3365433adbde8759/IQBMuFH8_cPzRaTt66gHjzMPAU4XIKABBMJ0ne_uBCD7DZ8?e=PxQNxx"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 hover:underline"
                        >
                            Abrir calculadora de frete DHL <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </SheetHeader>

                {/* Tabs + conteúdo scroll */}
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col">
                    <TabsList className="mx-6 mt-3 mb-2">
                        <TabsTrigger value="market">Dados de mercado</TabsTrigger>
                        <TabsTrigger value="score">Score</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto px-6 pb-24">
                        <div className="rounded-2xl bg-card border border-border shadow-sm p-4">
                            <TabsContent value="market" className="mt-0 data-[state=inactive]:hidden">
                                <MarketForm
                                    loading={loadingMarket}
                                    saving={saving}
                                    errorMsg={errorMsg}
                                    successMsg={successMsg}
                                    state={form}
                                    setState={(patch) => setForm((s) => ({ ...s, ...patch }))}
                                    onSubmit={saveMarket}
                                />
                            </TabsContent>

                            <TabsContent value="score" className="mt-0 data-[state=inactive]:hidden">
                                <ScorePanel
                                    loading={loadingScore}
                                    score={score}
                                    lastSimulation={lastSimulation}
                                    loadingLastSim={loadingLastSim}
                                />
                            </TabsContent>
                        </div>
                    </div>

                    {/* Footer fixo com CTA */}
                    <div className="border-t bg-background/80 backdrop-blur px-6 py-3 flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                            {tab === "market" ? "Salve para atualizar o score automaticamente." : "Score e simulação ajudam a decidir o próximo passo."}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
                                Fechar
                            </Button>
                            {tab === "market" ? (
                                <Button
                                    onClick={() => {
                                        // submit manual: dispara submit via form? simples: trocar para button type submit fica dentro do form.
                                        // Aqui deixamos só um CTA duplicado opcional.
                                        const el = document.querySelector<HTMLButtonElement>('button[type="submit"]');
                                        el?.click();
                                    }}
                                    disabled={saving}
                                    className="cursor-pointer"
                                >
                                    {saving ? "Salvando..." : "Salvar"}
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
