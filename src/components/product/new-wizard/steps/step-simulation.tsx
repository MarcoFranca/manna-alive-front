// src/components/product/new-wizard/steps/step-simulation.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { WizardSimulation, SimulationResult } from "../types";

type Props = {
    value: WizardSimulation;
    onChange: (v: WizardSimulation) => void;
    result: SimulationResult | null;
    onSimulate: () => void;
    loading?: boolean;
    error?: string | null;
};

export function StepSimulation({
                                   value,
                                   onChange,
                                   result,
                                   onSimulate,
                                   loading = false,
                                   error = null,
                               }: Props) {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="font-semibold">Simulação rápida (decisão)</h3>

            <div className="grid md:grid-cols-3 gap-4">
                <Input
                    placeholder="Quantidade"
                    value={value.quantity}
                    onChange={(e) => onChange({ ...value, quantity: e.target.value })}
                    inputMode="numeric"
                />
                <Input
                    placeholder="Preço alvo (R$)"
                    value={value.target_price_brl}
                    onChange={(e) => onChange({ ...value, target_price_brl: e.target.value })}
                    inputMode="decimal"
                />
                <Input
                    placeholder="Câmbio (opcional)"
                    value={value.exchange_rate}
                    onChange={(e) => onChange({ ...value, exchange_rate: e.target.value })}
                    inputMode="decimal"
                />
            </div>

            {error ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                    {error}
                </div>
            ) : null}

            <Button type="button" onClick={onSimulate} disabled={loading} className="cursor-pointer">
                {loading ? "Simulando..." : "Simular viabilidade"}
            </Button>

            {result && (
                <div className="rounded-lg border p-3 bg-muted/40 text-sm space-y-1">
                    <p>
                        <strong>Custo unitário:</strong>{" "}
                        R$ {Number(result.unit_cost_brl).toFixed(2)}
                    </p>
                    <p>
                        <strong>Margem:</strong>{" "}
                        {Number(result.estimated_margin_pct).toFixed(1)}%
                    </p>
                    <Badge variant={result.approved ? "default" : "destructive"}>
                        {result.approved ? "Viável" : "Não viável"}
                    </Badge>
                </div>
            )}
        </div>
    );
}
