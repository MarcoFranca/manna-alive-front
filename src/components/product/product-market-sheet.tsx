// src/components/product/product-market-sheet.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
    fetchMarketData,
    upsertMarketData,
    fetchProductScore,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { fetchLastSimulation, type SimulationResult } from "@/lib/api";

import type { ProductRow } from "./products-client";

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

type MarketDataPayload = {
    price_average_brl: number | null;
    sales_per_day: number | null;
    sales_per_month: number | null;
    visits: number | null;
    ranking_position: number | null;
    full_ratio: number | null;
    competitor_count: number | null;
    listing_age_days: number | null;
    avg_reviews: number | null;
};

export function ProductMarketSheet({ product }: { product: ProductRow }) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loadingMarket, setLoadingMarket] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingScore, setLoadingScore] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // campos do formulário
    const [priceAverage, setPriceAverage] = useState("");
    const [salesPerDay, setSalesPerDay] = useState("");
    const [salesPerMonth, setSalesPerMonth] = useState("");
    const [visits, setVisits] = useState("");
    const [rankingPosition, setRankingPosition] = useState("");
    const [fullRatio, setFullRatio] = useState("");
    const [competitorCount, setCompetitorCount] = useState("");
    const [listingAgeDays, setListingAgeDays] = useState("");
    const [avgReviews, setAvgReviews] = useState("");

    const [score, setScore] = useState<Score | null>(null);

    const [lastSimulation, setLastSimulation] = useState<SimulationResult | null>(null);
    const [loadingLastSim, setLoadingLastSim] = useState(false);

    // Carrega dados ao abrir o sheet
    useEffect(() => {
        if (!open) return;

        async function load() {
            setErrorMsg(null);
            setSuccessMsg(null);
            setLoadingMarket(true);

            try {
                const market = await fetchMarketData(product.id);
                setLoadingLastSim(true);
                const sim = await fetchLastSimulation(product.id);
                setLastSimulation(sim);

                if (market) {
                    setPriceAverage(market.price_average_brl ?? "");
                    setSalesPerDay(market.sales_per_day?.toString() ?? "");
                    setSalesPerMonth(market.sales_per_month?.toString() ?? "");
                    setVisits(market.visits?.toString() ?? "");
                    setRankingPosition(market.ranking_position?.toString() ?? "");
                    setFullRatio(market.full_ratio?.toString() ?? "");
                    setCompetitorCount(market.competitor_count?.toString() ?? "");
                    setListingAgeDays(market.listing_age_days?.toString() ?? "");
                    setAvgReviews(market.avg_reviews?.toString() ?? "");
                }

                await loadScore();
            } catch (err) {
                console.error(err);
                setErrorMsg("Erro ao carregar dados de mercado ou score.");
            } finally {
                setLoadingLastSim(false);
                setLoadingMarket(false);
            }
        }

        async function loadScore() {
            setLoadingScore(true);
            try {
                const s = await fetchProductScore(product.id);
                setScore(s);
            } catch (err) {
                console.error(err);
                // se não houver simulação, o backend pode lançar erro
            } finally {
                setLoadingScore(false);
            }
        }

        load();
    }, [open, product.id]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setSaving(true);

        try {
            const payload: MarketDataPayload = {
                price_average_brl: priceAverage
                    ? Number(priceAverage.replace(",", "."))
                    : null,
                sales_per_day: salesPerDay ? Number(salesPerDay) : null,
                sales_per_month: salesPerMonth ? Number(salesPerMonth) : null,
                visits: visits ? Number(visits) : null,
                ranking_position: rankingPosition ? Number(rankingPosition) : null,
                full_ratio: fullRatio ? Number(fullRatio.replace(",", ".")) : null,
                competitor_count: competitorCount ? Number(competitorCount) : null,
                listing_age_days: listingAgeDays ? Number(listingAgeDays) : null,
                avg_reviews: avgReviews ? Number(avgReviews.replace(",", ".")) : null,
            };

            await upsertMarketData(product.id, payload);
            setSuccessMsg("Dados de mercado salvos com sucesso.");

            // recarrega score após salvar
            try {
                const s = await fetchProductScore(product.id);
                setScore(s);
            } catch (err) {
                console.error(err);
            }

            router.refresh();
        } catch (err) {
            console.error(err);
            setErrorMsg("Erro ao salvar dados de mercado.");
        } finally {
            setSaving(false);
        }
    }

    function classificationLabel(classification: string) {
        switch (classification) {
            case "campeao":
                return "CAMPEÃO";
            case "bom":
                return "Bom para testar";
            case "arriscado":
                return "Arriscado";
            case "descartar":
                return "Descartar";
            default:
                return classification;
        }
    }

    function classificationClass(classification: string) {
        switch (classification) {
            case "campeao":
                return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40";
            case "bom":
                return "bg-sky-500/15 text-sky-300 border border-sky-500/40";
            case "arriscado":
                return "bg-amber-500/15 text-amber-300 border border-amber-500/40";
            case "descartar":
                return "bg-red-500/15 text-red-300 border border-red-500/40";
            default:
                return "bg-muted text-muted-foreground";
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    Mercado / Score
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="sm:max-w-2xl p-0 flex flex-col"
            >
                {/* Cabeçalho com borda e margens */}
                <SheetHeader className="px-6 pt-4 pb-3 border-b">
                    <SheetTitle>Dados de mercado · {product.name}</SheetTitle>
                    <SheetDescription>
                        Preencha os dados coletados no Avant Pro / Mercado Livre. O sistema
                        calculará o score de viabilidade automaticamente.
                    </SheetDescription>
                    <div className="mt-2">
                        <a
                            href="https://1drv.ms/x/c/3365433adbde8759/IQBMuFH8_cPzRaTt66gHjzMPAU4XIKABBMJ0ne_uBCD7DZ8?e=PxQNxx"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-300 hover:underline"
                        >
                            Abrir calculadora de frete DHL
                        </a>
                    </div>
                </SheetHeader>

                {/* Conteúdo com abas e scroll */}
                <Tabs defaultValue="market" className="flex-1 flex flex-col">
                    <TabsList className="mx-6 mt-3 mb-2">
                        <TabsTrigger value="market">Dados de mercado</TabsTrigger>
                        <TabsTrigger value="score">Score</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <div className="h-full rounded-lg bg-card border border-border shadow-sm p-4">
                            <TabsContent
                                value="market"
                                className="mt-0 space-y-4 data-[state=inactive]:hidden"
                            >
                                {loadingMarket && (
                                    <p className="text-xs text-muted-foreground">
                                        Carregando dados de mercado...
                                    </p>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Preço médio (R$)</Label>
                                            <Input
                                                value={priceAverage}
                                                onChange={(e) => setPriceAverage(e.target.value)}
                                                placeholder="Ex.: 21.90"
                                                inputMode="decimal"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Vendas por dia</Label>
                                            <Input
                                                value={salesPerDay}
                                                onChange={(e) => setSalesPerDay(e.target.value)}
                                                placeholder="Ex.: 80"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Vendas por mês</Label>
                                            <Input
                                                value={salesPerMonth}
                                                onChange={(e) => setSalesPerMonth(e.target.value)}
                                                placeholder="Ex.: 2400"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Visitas</Label>
                                            <Input
                                                value={visits}
                                                onChange={(e) => setVisits(e.target.value)}
                                                placeholder="Ex.: 7000"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Ranking (posição)</Label>
                                            <Input
                                                value={rankingPosition}
                                                onChange={(e) =>
                                                    setRankingPosition(e.target.value)
                                                }
                                                placeholder="Ex.: 1200"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>% vendedores FULL (0–100)</Label>
                                            <Input
                                                value={fullRatio}
                                                onChange={(e) => setFullRatio(e.target.value)}
                                                placeholder="Ex.: 60"
                                                inputMode="decimal"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Concorrentes relevantes</Label>
                                            <Input
                                                value={competitorCount}
                                                onChange={(e) =>
                                                    setCompetitorCount(e.target.value)
                                                }
                                                placeholder="Ex.: 12"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Idade do anúncio líder (dias)</Label>
                                            <Input
                                                value={listingAgeDays}
                                                onChange={(e) =>
                                                    setListingAgeDays(e.target.value)
                                                }
                                                placeholder="Ex.: 70"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="space-y-1 md:col-span-2">
                                            <Label>Média de avaliações (top vendedores)</Label>
                                            <Input
                                                value={avgReviews}
                                                onChange={(e) => setAvgReviews(e.target.value)}
                                                placeholder="Ex.: 4.8"
                                                inputMode="decimal"
                                            />
                                        </div>
                                    </div>

                                    {errorMsg && (
                                        <p className="text-sm text-red-500 border border-red-500/40 bg-red-500/5 rounded-md px-3 py-2">
                                            {errorMsg}
                                        </p>
                                    )}

                                    {successMsg && (
                                        <p className="text-sm text-emerald-400 border border-emerald-500/40 bg-emerald-500/5 rounded-md px-3 py-2">
                                            {successMsg}
                                        </p>
                                    )}

                                    <Button type="submit" disabled={saving}>
                                        {saving ? "Salvando..." : "Salvar dados de mercado"}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent
                                value="score"
                                className="mt-0 data-[state=inactive]:hidden"
                            >
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <h3 className="text-sm font-semibold">
                                            Score de viabilidade
                                        </h3>
                                        {score && (
                                            <span
                                                className={
                                                    "px-2 py-1 text-xs rounded-full " +
                                                    classificationClass(score.classification)
                                                }
                                            >
                                                 {classificationLabel(score.classification)} ·{" "}
                                                                    {score.total_score}
                                          </span>
                                                    )}
                                                </div>

                                            {loadingScore && (
                                                <p className="text-xs text-muted-foreground">
                                                    Calculando score...
                                                </p>
                                            )}

                                            {score && !loadingScore && (
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <p>
                                                            <span className="font-medium">Demanda:</span>{" "}
                                                            {score.demand_score}/100
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Concorrência:</span>{" "}
                                                            {score.competition_score}/100
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Margem:</span>{" "}
                                                            {score.margin_score}/100
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Risco:</span>{" "}
                                                            {score.risk_score}/100
                                                        </p>
                                                    </div>

                                                    {score.sales_per_day != null && (
                                                        <p className="text-muted-foreground">
                                                            ~{score.sales_per_day} vendas/dia ·{" "}
                                                            {score.sales_per_month} vendas/mês ·{" "}
                                                            {score.visits} visitas
                                                        </p>
                                                    )}

                                                    {score.estimated_margin_pct != null && (
                                                        <p className="text-muted-foreground">
                                                            Margem estimada na importação:{" "}
                                                            {Number(score.estimated_margin_pct).toFixed(1)}%
                                                        </p>
                                                    )}

                                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                                        {score.notes}
                                                    </p>
                                                    {/* RESUMO DA ÚLTIMA SIMULAÇÃO */}
                                                    <div className="mt-4 border border-border rounded-md bg-muted/40 p-3 text-xs space-y-1">
                                                        <h4 className="font-semibold">Última simulação de importação</h4>

                                                        {loadingLastSim && (
                                                            <p className="text-muted-foreground">
                                                                Carregando simulação...
                                                            </p>
                                                        )}

                                                        {!loadingLastSim && !lastSimulation && (
                                                            <p className="text-muted-foreground">
                                                                Ainda não há simulação registrada para este produto.
                                                            </p>
                                                        )}

                                                        {lastSimulation && !loadingLastSim && (
                                                            <>
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    Simulada em{" "}
                                                                    {new Date(lastSimulation.created_at).toLocaleString("pt-BR")}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Custo unitário estimado:</span>{" "}
                                                                    R$ {Number(lastSimulation.unit_cost_brl).toFixed(2)}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Preço alvo:</span> R${" "}
                                                                    {Number(lastSimulation.target_sale_price_brl).toFixed(2)}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Margem estimada:</span>{" "}
                                                                    {Number(lastSimulation.estimated_margin_pct).toFixed(1)}%
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Status:</span>{" "}
                                                                    {lastSimulation.approved ? "APROVADO" : "REPROVADO"} –{" "}
                                                                    {lastSimulation.reason}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>

                                                </div>
                                    )}

                                    {!score && !loadingScore && (
                                        <p className="text-xs text-muted-foreground">
                                            Ainda não foi possível calcular o score. Verifique se
                                            existe ao menos uma simulação de importação e alguns
                                            dados de mercado preenchidos.
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
