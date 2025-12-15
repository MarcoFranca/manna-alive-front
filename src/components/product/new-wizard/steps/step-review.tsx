// src/components/product/new-wizard/steps/step-review.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import type { WizardProduct, WizardSimulation } from "../types";

type Props = {
    product: WizardProduct;
    simulation: WizardSimulation;
    result: any | null;
};

export function StepReview({ product, simulation, result }: Props) {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="text-sm font-semibold">Revisão final</h3>

            <div className="text-sm space-y-1">
                <p><strong>Produto:</strong> {product.name}</p>
                <p><strong>Categoria:</strong> {product.category || "—"}</p>
                <p>
                    <strong>Custos:</strong> FOB {product.fob_price_usd || "—"} USD • Frete{" "}
                    {product.freight_usd || "—"} USD
                </p>
            </div>

            {result ? (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                    <p>
                        <strong>Custo unitário:</strong> R${" "}
                        {Number(result.unit_cost_brl).toFixed(2)}
                    </p>
                    <p>
                        <strong>Margem estimada:</strong>{" "}
                        {Number(result.estimated_margin_pct).toFixed(1)}%
                    </p>
                    <Badge variant={result.approved ? "default" : "destructive"}>
                        {result.approved ? "Viável para avançar" : "Alto risco"}
                    </Badge>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    Nenhuma simulação foi executada.
                </p>
            )}
        </div>
    );
}
