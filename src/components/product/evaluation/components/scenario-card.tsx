"use client";

import { Badge } from "@/components/ui/badge";

import { Banknote, Package, Percent, TrendingUp } from "lucide-react";
import {toneForPayback, toneForRoi} from "@/lib/tones";
import {fmtMoney, fmtNumber, fmtPct} from "@/lib/format";

type Scenario = {
    name: string;
    kind: "base" | "conservative" | "optimistic";
    approved: boolean;
    reason?: string | null;

    quantity: number;
    exchange_rate: number;
    customs_value_usd: number;

    unit_cost_brl: number;
    target_sale_price_brl: number;
    net_sale_price_brl: number;

    estimated_margin_pct: number;

    profit_unit_brl: number;
    roi_unit_pct: number;
    payback_days: number | null;
};

function accentFor(kind: Scenario["kind"]) {
    if (kind === "conservative") return "border-emerald-400/20 ring-1 ring-emerald-400/18 shadow-[0_0_52px_-34px_rgba(52,211,153,0.75)]";
    if (kind === "optimistic") return "border-fuchsia-400/18 ring-1 ring-fuchsia-400/14";
    return "border-cyan-400/14 ring-1 ring-cyan-400/12";
}

export function ScenarioCard(s: Scenario) {
    const roiTone = toneForRoi(Number.isFinite(s.roi_unit_pct) ? s.roi_unit_pct : null);
    const pbTone = toneForPayback(s.payback_days);

    const isHero = s.kind === "conservative";

    return (
        <div
            className={[
                "rounded-2xl border bg-background/60 backdrop-blur p-5 space-y-4",
                accentFor(s.kind),
                isHero ? "md:col-span-2" : "",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="text-base font-semibold">{s.name}</div>
                        {s.kind === "conservative" ? (
                            <Badge variant="default" className="text-[10px]">
                                Mandatório
                            </Badge>
                        ) : null}
                    </div>

                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              Qty {fmtNumber(s.quantity)}
            </span>
                        <span>•</span>
                        <span>Câmbio {fmtNumber(s.exchange_rate, 2)}</span>
                        <span>•</span>
                        <span>Val. aduaneiro {fmtNumber(s.customs_value_usd, 2)} USD</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Badge variant={s.approved ? "default" : "destructive"} className="text-xs">
                        {s.approved ? "Aprovado" : "Reprovado"}
                    </Badge>
                    <Badge variant={roiTone.variant} className="text-[10px]">
                        {roiTone.label}
                    </Badge>
                </div>
            </div>

            {/* Área principal MAIS espaçada (evita espremido) */}
            <div className={isHero ? "grid gap-4 md:grid-cols-3" : "grid gap-3 md:grid-cols-3"}>
                <div className="rounded-2xl border bg-background/50 p-4">
                    <div className="text-xs text-muted-foreground">Custo unit. (estim.)</div>
                    <div className="text-xl font-semibold mt-1">{fmtMoney(s.unit_cost_brl, "BRL")}</div>
                    <div className="text-xs text-muted-foreground mt-2">Baseado em (aduaneiro ×2)</div>
                </div>

                <div className="rounded-2xl border bg-background/50 p-4">
                    <div className="text-xs text-muted-foreground">Venda (alvo / líquida)</div>
                    <div className="text-xl font-semibold mt-1">{fmtMoney(s.target_sale_price_brl, "BRL")}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                        Líquida: <span className="font-medium text-foreground">{fmtMoney(s.net_sale_price_brl, "BRL")}</span>
                    </div>
                </div>

                <div className={`rounded-2xl border bg-background/50 p-4 ${roiTone.ring}`}>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Lucro / ROI / Payback
                    </div>
                    <div className="text-xl font-semibold mt-1">{fmtMoney(s.profit_unit_brl, "BRL")}</div>
                    <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center gap-1">
              <Banknote className="h-3.5 w-3.5" />
              ROI <span className="font-medium text-foreground">{fmtPct(s.roi_unit_pct, 1)}</span>
            </span>

                        <Badge variant={pbTone.variant} className="text-[10px]">
                            {s.payback_days ? `${fmtNumber(s.payback_days, 1)} dias` : "Payback —"}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs inline-flex items-center gap-1">
                    <Percent className="h-3.5 w-3.5" />
                    Margem: {fmtPct(s.estimated_margin_pct, 1)}
                </Badge>
                <Badge variant="outline" className="text-xs">ROI unit: {fmtPct(s.roi_unit_pct, 1)}</Badge>
                <Badge variant="outline" className="text-xs">
                    Payback: {s.payback_days ? `${fmtNumber(s.payback_days, 1)} dias` : "precisa vendas/dia + lucro positivo"}
                </Badge>
            </div>

            {!s.approved && s.reason ? (
                <div className="text-xs text-muted-foreground">
                    Motivo: <span className="text-foreground">{s.reason}</span>
                </div>
            ) : null}
        </div>
    );
}
