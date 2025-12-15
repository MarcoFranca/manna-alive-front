// src/components/product/new-wizard/steps/step-basics.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardProduct } from "../types";

type Props = {
    value: WizardProduct;
    onChange: (v: WizardProduct) => void;
};

export function StepBasics({ value, onChange }: Props) {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="text-sm font-semibold">Dados essenciais</h3>

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

            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label>FOB (USD)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={value.fob_price_usd}
                        onChange={(e) =>
                            onChange({ ...value, fob_price_usd: e.target.value })
                        }
                        placeholder="2.50"
                    />
                </div>

                <div className="space-y-1">
                    <Label>Frete unitário (USD)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={value.freight_usd}
                        onChange={(e) =>
                            onChange({ ...value, freight_usd: e.target.value })
                        }
                        placeholder="0.80"
                    />
                </div>

                <div className="space-y-1">
                    <Label>Peso (kg)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={value.weight_kg}
                        onChange={(e) =>
                            onChange({ ...value, weight_kg: e.target.value })
                        }
                        placeholder="0.20"
                    />
                </div>
            </div>
        </div>
    );
}
