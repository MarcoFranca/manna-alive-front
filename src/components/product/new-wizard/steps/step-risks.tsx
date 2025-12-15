// src/components/product/new-wizard/steps/step-risks.tsx
"use client";

import type { WizardProduct } from "../types";

type Props = {
    value: WizardProduct;
    onChange: (v: WizardProduct) => void;
};

export function StepRisks({ value, onChange }: Props) {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="text-sm font-semibold">Riscos & operação</h3>

            <p className="text-xs text-muted-foreground">
                Marque apenas se aplicável. Esses fatores impactam risco e score.
            </p>

            <div className="flex flex-col gap-3 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value.fragile}
                        onChange={(e) =>
                            onChange({ ...value, fragile: e.target.checked })
                        }
                        className="h-4 w-4"
                    />
                    Produto frágil (risco logístico)
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value.is_famous_brand}
                        onChange={(e) =>
                            onChange({ ...value, is_famous_brand: e.target.checked })
                        }
                        className="h-4 w-4"
                    />
                    Marca famosa (atenção à propriedade intelectual)
                </label>
            </div>
        </div>
    );
}
