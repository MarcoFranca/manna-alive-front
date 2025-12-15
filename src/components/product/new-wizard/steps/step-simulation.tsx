// steps/step-simulation.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function StepSimulation({ value, onChange, result, onSimulate }: any) {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="font-semibold">Simulação rápida (decisão)</h3>

            <div className="grid md:grid-cols-3 gap-4">
                <Input
                    placeholder="Quantidade"
                    value={value.quantity}
                    onChange={(e) => onChange({ ...value, quantity: e.target.value })}
                />
                <Input
                    placeholder="Preço alvo (R$)"
                    value={value.target_price_brl}
                    onChange={(e) =>
                        onChange({ ...value, target_price_brl: e.target.value })
                    }
                />
                <Input
                    placeholder="Câmbio (opcional)"
                    value={value.exchange_rate}
                    onChange={(e) =>
                        onChange({ ...value, exchange_rate: e.target.value })
                    }
                />
            </div>

            <Button onClick={onSimulate} className="cursor-pointer">
                Simular viabilidade
            </Button>

            {result && (
                <div className="rounded-lg border p-3 bg-muted/40 text-sm">
                    <p>
                        <strong>Custo unitário:</strong> R${" "}
                        {Number(result.unit_cost_brl).toFixed(2)}
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
