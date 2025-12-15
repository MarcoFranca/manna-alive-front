"use client";

import type { ScenarioResult } from "@/types/evaluation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScenarioCard } from "./scenario-card";

export function ScenariosGrid({ scenarios }: { scenarios: ScenarioResult[] }) {
    // Ordem: conservador primeiro, depois base, depois otimista
    const ordered = [...scenarios].sort((a, b) => {
        const w = (k: string) => (k === "conservative" ? 0 : k === "base" ? 1 : 2);
        return w(a.kind) - w(b.kind);
    });

    return (
        <Card className="bg-background/70 backdrop-blur border rounded-2xl">
            <CardHeader className="space-y-2">
                <CardTitle className="text-base">Cenários (com ROI real)</CardTitle>
                <div className="text-sm text-muted-foreground">
                    A decisão deve se sustentar no cenário <span className="font-medium text-foreground">Conservador</span>.
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {ordered.map((s) => (
                        <ScenarioCard key={s.kind} {...s} />
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                        ROI considera preço líquido (taxas) + custo local/unidade
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        Ajuste taxas em EvalConfig (ml_fee_pct, ads_pct, local_cost_brl)
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
