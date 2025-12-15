"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SimulationResult } from "@/lib/api";
import { PackageCheck, PackageX } from "lucide-react";

export function LastSimulationCard({
                                       loading,
                                       sim,
                                   }: {
    loading: boolean;
    sim: SimulationResult | null;
}) {
    return (
        <Card className="bg-background/70 backdrop-blur border rounded-xl">
            <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">Última simulação</div>

                    {sim ? (
                        <Badge variant={sim.approved ? "default" : "destructive"} className="gap-1">
                            {sim.approved ? <PackageCheck className="h-3.5 w-3.5" /> : <PackageX className="h-3.5 w-3.5" />}
                            {sim.approved ? "Aprovada" : "Reprovada"}
                        </Badge>
                    ) : (
                        <Badge variant="outline">Sem simulação</Badge>
                    )}
                </div>

                {loading ? (
                    <div className="text-xs text-muted-foreground">Carregando simulação…</div>
                ) : null}

                {!loading && !sim ? (
                    <div className="text-xs text-muted-foreground">
                        Ainda não há simulação registrada para este produto.
                    </div>
                ) : null}

                {sim && !loading ? (
                    <div className="text-xs space-y-1">
                        <div className="text-muted-foreground">
                            {new Date(sim.created_at).toLocaleString("pt-BR")}
                        </div>

                        <div>
                            <span className="text-muted-foreground">Custo unitário:</span>{" "}
                            <span className="font-medium">R$ {Number(sim.unit_cost_brl).toFixed(2)}</span>
                        </div>

                        <div>
                            <span className="text-muted-foreground">Preço alvo:</span>{" "}
                            <span className="font-medium">R$ {Number(sim.target_sale_price_brl).toFixed(2)}</span>
                        </div>

                        <div>
                            <span className="text-muted-foreground">Margem:</span>{" "}
                            <span className="font-medium">{Number(sim.estimated_margin_pct).toFixed(1)}%</span>
                        </div>

                        <div className="text-muted-foreground">
                            {sim.reason}
                        </div>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
