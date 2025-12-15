"use client";

export type SimResult = {
    unit_cost_brl: string;
    target_sale_price_brl: string;
    estimated_margin_pct: string;
    approved: boolean;
    reason: string | null;
};

export function NewProductSimResult({
                                        simInfo,
                                        simError,
                                        simResult,
                                    }: {
    simInfo: string | null;
    simError: string | null;
    simResult: SimResult | null;
}) {
    if (!simInfo && !simError && !simResult) return null;

    return (
        <div className="mt-4 border border-border rounded-lg p-3 bg-muted/40 text-xs space-y-2">
            <div className="font-semibold">Resultado da simulação rápida</div>

            {simInfo ? <p className="text-[11px] text-muted-foreground">{simInfo}</p> : null}
            {simError ? <p className="text-xs text-amber-400">{simError}</p> : null}

            {simResult ? (
                <>
                    <p><span className="font-medium">Custo unitário estimado:</span> R$ {Number(simResult.unit_cost_brl).toFixed(2)}</p>
                    <p><span className="font-medium">Preço alvo:</span> R$ {Number(simResult.target_sale_price_brl).toFixed(2)}</p>
                    <p><span className="font-medium">Margem estimada:</span> {Number(simResult.estimated_margin_pct).toFixed(1)}%</p>
                    <p><span className="font-medium">Status:</span> {simResult.approved ? "APROVADO" : "REPROVADO"} – {simResult.reason}</p>
                </>
            ) : null}
        </div>
    );
}
