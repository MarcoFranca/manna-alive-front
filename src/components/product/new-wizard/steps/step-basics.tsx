"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardProduct } from "../types";
import { DhlFreightHelper } from "@/components/product/wizard/components/dhl-freight-helper";

type Props = {
    value: WizardProduct;
    onChange: (v: WizardProduct) => void;
};

const DHL_URL =
    "https://1drv.ms/x/c/3365433adbde8759/IQBMuFH8_cPzRaTt66gHjzMPAU4XIKABBMJ0ne_uBCD7DZ8?e=PxQNxx";

export function StepBasics({ value, onChange }: Props) {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="text-sm font-semibold">Dados essenciais</h3>

            <div className="grid gap-4">
                {/* Helper do DHL: calcula e aplica no campo freight_usd */}
                <DhlFreightHelper
                    dhlUrl={DHL_URL}
                    weightKg={value.weight_kg}
                    quantity={value.quantityForTest}
                    onApplyUnitFreightUsd={(unit) => onChange({ ...value, freight_usd: unit })}
                />

                {/* Nome/Categoria */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Nome do produto *</Label>
                        <Input
                            value={value.name}
                            onChange={(e) => onChange({ ...value, name: e.target.value })}
                            placeholder="Ex.: Balança digital de cozinha"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Categoria</Label>
                        <Input
                            value={value.category}
                            onChange={(e) => onChange({ ...value, category: e.target.value })}
                            placeholder="Casa, PET, Eletrônicos..."
                        />
                    </div>
                </div>

                {/* Custos / Peso / Qty teste */}
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <Label>FOB (USD)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={value.fob_price_usd}
                            onChange={(e) => onChange({ ...value, fob_price_usd: e.target.value })}
                            placeholder="2.50"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Frete unitário (USD)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={value.freight_usd}
                            onChange={(e) => onChange({ ...value, freight_usd: e.target.value })}
                            placeholder="0.80"
                            inputMode="decimal"
                        />
                        <div className="text-[11px] text-muted-foreground">
                            Campo “oficial”. O DHL Helper apenas preenche/sugere este valor.
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Peso (kg)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={value.weight_kg}
                            onChange={(e) => onChange({ ...value, weight_kg: e.target.value })}
                            placeholder="0.20"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Qtd. para teste</Label>
                        <Input
                            value={value.quantityForTest}
                            onChange={(e) => onChange({ ...value, quantityForTest: e.target.value })}
                            placeholder="100"
                            inputMode="numeric"
                        />
                        <div className="text-[11px] text-muted-foreground">
                            Usada no cálculo de frete total → unitário
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
