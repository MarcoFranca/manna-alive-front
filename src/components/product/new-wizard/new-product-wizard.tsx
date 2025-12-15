// new-product-wizard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, simulateImport } from "@/lib/api";
import { fetchUsdBrlRate } from "@/lib/exchange";

import { StepBasics } from "./steps/step-basics";
import { StepRisks } from "./steps/step-risks";
import { StepSimulation } from "./steps/step-simulation";
import { StepReview } from "./steps/step-review";
import { WizardFooter } from "./wizard-footer";
import { WizardHeader } from "./wizard-header";

import type { WizardProduct, WizardSimulation } from "./types";

export function NewProductWizard() {
    const router = useRouter();

    const [step, setStep] = useState(0);

    const [product, setProduct] = useState<WizardProduct>({
        name: "",
        category: "",
        fob_price_usd: "",
        freight_usd: "",
        weight_kg: "",
        fragile: false,
        is_famous_brand: false,
    });

    const [sim, setSim] = useState<WizardSimulation>({
        quantity: "100",
        target_price_brl: "",
        exchange_rate: "",
    });

    const [simResult, setSimResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    async function runSimulation() {
        let rate =
            sim.exchange_rate !== ""
                ? Number(sim.exchange_rate.replace(",", "."))
                : await fetchUsdBrlRate();

        const result = await simulateImport(0 as any, {
            quantity: Number(sim.quantity),
            exchange_rate: rate,
            target_sale_price_brl: Number(sim.target_price_brl.replace(",", ".")),
            freight_total_usd: null,
            insurance_total_usd: null,
        });

        setSimResult(result);
    }

    async function finalize() {
        setLoading(true);

        const created = await createProduct({
            name: product.name,
            category: product.category || null,
            fob_price_usd: Number(product.fob_price_usd),
            freight_usd: Number(product.freight_usd),
            weight_kg: product.weight_kg ? Number(product.weight_kg) : null,
            fragile: product.fragile,
            is_famous_brand: product.is_famous_brand,
        });

        await simulateImport(created.id, {
            quantity: Number(sim.quantity),
            exchange_rate:
                sim.exchange_rate !== ""
                    ? Number(sim.exchange_rate.replace(",", "."))
                    : await fetchUsdBrlRate(),
            target_sale_price_brl: Number(sim.target_price_brl.replace(",", ".")),
            freight_total_usd: null,
            insurance_total_usd: null,
        });

        router.push(`/products/${created.id}/evaluation`);
    }

    return (
        <div className="space-y-6">
            <WizardHeader step={step} />

            {step === 0 && <StepBasics value={product} onChange={setProduct} />}
            {step === 1 && <StepRisks value={product} onChange={setProduct} />}
            {step === 2 && (
                <StepSimulation
                    value={sim}
                    onChange={setSim}
                    result={simResult}
                    onSimulate={runSimulation}
                />
            )}
            {step === 3 && (
                <StepReview
                    product={product}
                    simulation={sim}
                    result={simResult}
                />
            )}

            <WizardFooter
                step={step}
                onBack={() => setStep((s) => Math.max(0, s - 1))}
                onNext={() => setStep((s) => s + 1)}
                onFinish={finalize}
                loading={loading}
            />
        </div>
    );
}
