"use client";

import type { Pillar, Metric } from "@/types/evaluation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { BarChart3, Shield, Truck, DollarSign } from "lucide-react";
import { statusBadgeVariant } from "@/lib/tones";
import { fmtNumber } from "@/lib/format";

type PillarCardProps = Omit<Pillar, "key"> & {
    pillarKey: Pillar["key"];
};

function iconForPillar(key: Pillar["key"]) {
    if (key === "market") return <BarChart3 className="h-4 w-4 text-cyan-300" />;
    if (key === "unit_economics") return <DollarSign className="h-4 w-4 text-emerald-300" />;
    if (key === "operations") return <Truck className="h-4 w-4 text-amber-300" />;
    return <Shield className="h-4 w-4 text-rose-300" />;
}

function statusLabel(status: Pillar["status"]) {
    if (status === "green") return "Ok";
    if (status === "yellow") return "Atenção";
    if (status === "red") return "Ruim";
    return "Sem dados";
}

export function PillarCard({
                               pillarKey,
                               title,
                               status,
                               summary,
                               next_action,
                               metrics,
                           }: PillarCardProps) {
    return (
        <Card className="bg-background/70 backdrop-blur border rounded-2xl">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {iconForPillar(pillarKey)}
                        <CardTitle className="text-base">{title}</CardTitle>
                    </div>

                    <Badge variant={statusBadgeVariant(status)} className="text-xs">
                        {statusLabel(status)}
                    </Badge>
                </div>

                <div className="text-sm">{summary}</div>

                {next_action ? (
                    <div className="text-xs text-muted-foreground">Próxima ação: {next_action}</div>
                ) : null}
            </CardHeader>

            <CardContent className="space-y-2">
                {metrics.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sem métricas disponíveis.</div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {metrics.map((m: Metric) => (
                            <div key={m.key} className="rounded-xl border bg-background/50 p-3">
                                <div className="text-xs text-muted-foreground">{m.label}</div>

                                <div className="text-sm font-semibold">
                                    {m.value === null || m.value === undefined
                                        ? "—"
                                        : m.unit === "bool"
                                            ? m.value === 1
                                                ? "Sim"
                                                : "Não"
                                            : `${fmtNumber(m.value, 2)} ${m.unit ?? ""}`}
                                </div>

                                {m.help ? (
                                    <div className="text-xs text-muted-foreground mt-1">{m.help}</div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
