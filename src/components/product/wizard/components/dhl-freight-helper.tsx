"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Copy, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Props = {
    weightKg: string;          // do wizard
    quantity: string;          // qty de teste (para dividir total → unitário)
    dhlUrl: string;

    // aplica o valor no campo freight_usd do wizard (fonte única da verdade)
    onApplyUnitFreightUsd: (unitFreightUsd: string) => void;
};

function safeNum(v: string): number | null {
    const n = Number(String(v).replace(",", ".").trim());
    return Number.isFinite(n) ? n : null;
}

export function DhlFreightHelper({
                                     weightKg,
                                     quantity,
                                     dhlUrl,
                                     onApplyUnitFreightUsd,
                                 }: Props) {
    const [freightTotalUsd, setFreightTotalUsd] = useState("");

    const qty = useMemo(() => safeNum(quantity), [quantity]);
    const total = useMemo(() => safeNum(freightTotalUsd), [freightTotalUsd]);

    const computedUnit = useMemo(() => {
        if (!qty || !total || qty <= 0) return null;
        const unit = total / qty;
        return Number.isFinite(unit) ? Number(unit.toFixed(2)) : null;
    }, [qty, total]);

    const suggestedUnitByWeight = useMemo(() => {
        const w = safeNum(weightKg);
        if (w === null) return null;

        // heurística simples (placeholder): USD/kg ~ 12.5 e mínimo por unidade ~ 0.6
        const usdPerKg = 12.5;
        const minUnit = 0.6;
        const est = Math.max(minUnit, w * usdPerKg);
        return Number(est.toFixed(2));
    }, [weightKg]);

    async function copyTemplate() {
        const text = "peso_kg,qtd,frete_total_usd";
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // silencioso (sem travar UX)
        }
    }

    function applyComputed() {
        if (computedUnit === null) return;
        onApplyUnitFreightUsd(computedUnit.toFixed(2));
    }

    function applySuggested() {
        if (suggestedUnitByWeight === null) return;
        onApplyUnitFreightUsd(suggestedUnitByWeight.toFixed(2));
    }

    return (
        <div className="rounded-2xl border bg-background/60 backdrop-blur p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="text-sm font-semibold">Frete (DHL) — atalho rápido</div>
                    <div className="text-xs text-muted-foreground">
                        Cole o frete total (USD) e aplique o frete unitário no produto. O campo oficial fica abaixo.
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer">
                        <a href={dhlUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            DHL
                        </a>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyTemplate}
                        className="gap-2 cursor-pointer"
                    >
                        <Copy className="h-4 w-4" />
                        Template
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1 md:col-span-2">
                    <div className="text-xs text-muted-foreground">Frete total (USD) vindo da planilha</div>
                    <Input
                        value={freightTotalUsd}
                        onChange={(e) => setFreightTotalUsd(e.target.value)}
                        placeholder="Ex.: 85.40"
                        inputMode="decimal"
                    />
                </div>

                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Unitário calculado</div>
                    <div className="h-10 rounded-md border bg-background/40 px-3 flex items-center justify-between">
                        <div className="text-sm font-semibold">
                            {computedUnit !== null ? `${computedUnit.toFixed(2)} USD/un` : "—"}
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                            qty: {qty ?? "—"}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    onClick={applyComputed}
                    disabled={computedUnit === null}
                    className="gap-2 cursor-pointer"
                >
                    <Wand2 className="h-4 w-4" />
                    Aplicar unitário calculado
                </Button>

                {suggestedUnitByWeight !== null ? (
                    <>
                        <Badge variant="outline" className="text-xs">
                            Sugestão por peso: ~{suggestedUnitByWeight.toFixed(2)} USD/un
                        </Badge>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={applySuggested}
                            className="cursor-pointer"
                        >
                            Aplicar sugestão
                        </Button>
                    </>
                ) : (
                    <Badge variant="outline" className="text-xs">
                        Informe o peso para sugerirmos um frete
                    </Badge>
                )}
            </div>
        </div>
    );
}
