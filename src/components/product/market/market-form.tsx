"use client";

import { FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Save } from "lucide-react";
import { MarketDataPayload, parseIntNumber, parseNumber } from "./market-helpers";

type MarketFormState = {
    priceAverage: string;
    salesPerDay: string;
    salesPerMonth: string;
    visits: string;
    rankingPosition: string;
    fullRatio: string;
    competitorCount: string;
    listingAgeDays: string;
    avgReviews: string;
};

export function MarketForm({
                               loading,
                               saving,
                               errorMsg,
                               successMsg,
                               state,
                               setState,
                               onSubmit,
                           }: {
    loading: boolean;
    saving: boolean;
    errorMsg: string | null;
    successMsg: string | null;
    state: MarketFormState;
    setState: (patch: Partial<MarketFormState>) => void;
    onSubmit: (payload: MarketDataPayload) => Promise<void>;
}) {
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const payload: MarketDataPayload = {
            price_average_brl: parseNumber(state.priceAverage),
            sales_per_day: parseIntNumber(state.salesPerDay),
            sales_per_month: parseIntNumber(state.salesPerMonth),
            visits: parseIntNumber(state.visits),
            ranking_position: parseIntNumber(state.rankingPosition),
            full_ratio: parseNumber(state.fullRatio),
            competitor_count: parseIntNumber(state.competitorCount),
            listing_age_days: parseIntNumber(state.listingAgeDays),
            avg_reviews: parseNumber(state.avgReviews),
        };

        await onSubmit(payload);
    }

    return (
        <div className="space-y-4">
            {loading ? (
                <div className="text-xs text-muted-foreground">Carregando dados de mercado…</div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Preço médio (R$)</Label>
                        <Input
                            value={state.priceAverage}
                            onChange={(e) => setState({ priceAverage: e.target.value })}
                            placeholder="Ex.: 21,90"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Vendas por dia</Label>
                        <Input
                            value={state.salesPerDay}
                            onChange={(e) => setState({ salesPerDay: e.target.value })}
                            placeholder="Ex.: 80"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Vendas por mês</Label>
                        <Input
                            value={state.salesPerMonth}
                            onChange={(e) => setState({ salesPerMonth: e.target.value })}
                            placeholder="Ex.: 2400"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Visitas</Label>
                        <Input
                            value={state.visits}
                            onChange={(e) => setState({ visits: e.target.value })}
                            placeholder="Ex.: 7000"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Ranking (posição)</Label>
                        <Input
                            value={state.rankingPosition}
                            onChange={(e) => setState({ rankingPosition: e.target.value })}
                            placeholder="Ex.: 1200"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>% vendedores FULL (0–100)</Label>
                        <Input
                            value={state.fullRatio}
                            onChange={(e) => setState({ fullRatio: e.target.value })}
                            placeholder="Ex.: 60"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Concorrentes relevantes</Label>
                        <Input
                            value={state.competitorCount}
                            onChange={(e) => setState({ competitorCount: e.target.value })}
                            placeholder="Ex.: 12"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Idade do anúncio líder (dias)</Label>
                        <Input
                            value={state.listingAgeDays}
                            onChange={(e) => setState({ listingAgeDays: e.target.value })}
                            placeholder="Ex.: 70"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <Label>Média de avaliações (top vendedores)</Label>
                        <Input
                            value={state.avgReviews}
                            onChange={(e) => setState({ avgReviews: e.target.value })}
                            placeholder="Ex.: 4,8"
                            inputMode="decimal"
                        />
                    </div>
                </div>

                {errorMsg ? (
                    <div className="flex items-start gap-2 text-sm text-red-500 border border-red-500/40 bg-red-500/5 rounded-md px-3 py-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        <div>{errorMsg}</div>
                    </div>
                ) : null}

                {successMsg ? (
                    <div className="text-sm text-emerald-400 border border-emerald-500/40 bg-emerald-500/5 rounded-md px-3 py-2">
                        {successMsg}
                    </div>
                ) : null}

                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? "Salvando..." : "Salvar dados"}
                    </Button>

                    <div className="text-xs text-muted-foreground">
                        Dica: preencha ao menos preço médio, vendas/dia e concorrentes para o score ficar útil.
                    </div>
                </div>
            </form>
        </div>
    );
}
