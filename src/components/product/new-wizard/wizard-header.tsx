// src/components/product/new-wizard/wizard-header.tsx
"use client";

import { Badge } from "@/components/ui/badge";

const steps = [
    "Produto",
    "Riscos",
    "Simulação",
    "Revisão",
];

export function WizardHeader({ step }: { step: number }) {
    return (
        <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                Novo produto • Avaliação guiada
            </div>

            <div className="flex items-center gap-2">
                {steps.map((label, i) => (
                    <Badge
                        key={label}
                        variant={i === step ? "default" : i < step ? "secondary" : "outline"}
                    >
                        {i + 1}. {label}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
