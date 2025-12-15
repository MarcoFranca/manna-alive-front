"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewProductQuickSim(props: {
    quantityForTest: string; setQuantityForTest: (v: string) => void;
    targetPriceBrl: string; setTargetPriceBrl: (v: string) => void;
    manualExchangeRate: string; setManualExchangeRate: (v: string) => void;
}) {
    const {
        quantityForTest, setQuantityForTest,
        targetPriceBrl, setTargetPriceBrl,
        manualExchangeRate, setManualExchangeRate,
    } = props;

    return (
        <div className="space-y-3 border-t border-border pt-4">
            <div>
                <div className="text-sm font-semibold">Simulação rápida (opcional)</div>
                <div className="text-xs text-muted-foreground">
                    Informe quantidade e preço alvo. Se o câmbio estiver vazio, tentamos USD/BRL automático.
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="qtyTest">Quantidade para teste</Label>
                    <Input id="qtyTest" value={quantityForTest} onChange={(e) => setQuantityForTest(e.target.value)} placeholder="Ex.: 100" inputMode="numeric" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="targetPrice">Preço de venda alvo (R$ / un.)</Label>
                    <Input id="targetPrice" value={targetPriceBrl} onChange={(e) => setTargetPriceBrl(e.target.value)} placeholder="Ex.: 49,90" inputMode="decimal" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="exchange">Câmbio USD/BRL (opcional)</Label>
                    <Input id="exchange" value={manualExchangeRate} onChange={(e) => setManualExchangeRate(e.target.value)} placeholder="Ex.: 5,20" inputMode="decimal" />
                </div>
            </div>
        </div>
    );
}
