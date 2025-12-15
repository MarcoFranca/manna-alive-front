// src/components/product/new-wizard/new-product-wizard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, simulateImport } from "@/lib/api";

import { StepBasics } from "./steps/step-basics";
import { StepRisks } from "./steps/step-risks";
import { StepSimulation } from "./steps/step-simulation";
import { StepReview } from "./steps/step-review";
import { WizardFooter } from "./wizard-footer";
import { WizardHeader } from "./wizard-header";

import type { WizardProduct, WizardSimulation, SimulationResult } from "./types";

function toNum(v: string): number | null {
    const n = Number(String(v).replace(",", ".").trim());
    return Number.isFinite(n) ? n : null;
}

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
        quantityForTest: "100",
    });

    const [sim, setSim] = useState<WizardSimulation>({
        quantity: "100",
        target_price_brl: "",
        exchange_rate: "",
        use_auto_fx: true,
    });

    const [draftProductId, setDraftProductId] = useState<number | null>(null);

    const [simResult, setSimResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const [simLoading, setSimLoading] = useState(false);
    const [simError, setSimError] = useState<string | null>(null);

    async function ensureDraftProduct(): Promise<number> {
        if (draftProductId) return draftProductId;

        // valida mínimo pra criar
        if (!product.name.trim()) {
            throw new Error("Informe o nome do produto para simular.");
        }

        const created = await createProduct({
            name: product.name.trim(),
            category: product.category.trim() ? product.category.trim() : null,
            fob_price_usd: toNum(product.fob_price_usd),
            freight_usd: toNum(product.freight_usd),
            weight_kg: toNum(product.weight_kg),
            fragile: product.fragile,
            is_famous_brand: product.is_famous_brand,
        });

        setDraftProductId(created.id);
        return created.id;
    }

    async function onSimulateClick() {
        setSimError(null);
        setSimLoading(true);

        try {
            const productId = await ensureDraftProduct();

            const qty = toNum(sim.quantity);
            const price = toNum(sim.target_price_brl);
            if (!qty || qty <= 0) throw new Error("Quantidade inválida.");
            if (!price || price <= 0) throw new Error("Preço alvo inválido.");

            const fx = sim.use_auto_fx ? null : toNum(sim.exchange_rate);
            if (!sim.use_auto_fx && (fx === null || fx <= 0)) {
                throw new Error("Informe um câmbio válido ou use automático.");
            }

            // exchange_rate null => backend pega o dólar do dia (se você implementou isso)
            const result = await simulateImport(productId, {
                quantity: qty,
                exchange_rate: fx,
                target_sale_price_brl: price,
                freight_total_usd: null,
                insurance_total_usd: null,
            });

            setSimResult(result as SimulationResult);
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : "Erro ao simular.";
            setSimError(msg);
            setSimResult(null);
        } finally {
            setSimLoading(false);
        }
    }

    async function finalize() {
        setLoading(true);
        try {
            // Se já existe draft, reaproveita e só vai para a avaliação.
            // (Opcional: se quiser “atualizar” os dados do produto antes de sair, aí você cria um updateProduct aqui.)
            if (draftProductId) {
                router.push(`/products/${draftProductId}/evaluation?from=wizard`);
                return;
            }

            // Se ainda não existe draft, cria agora
            const created = await createProduct({
                name: product.name.trim(),
                category: product.category.trim() ? product.category.trim() : null,
                fob_price_usd: toNum(product.fob_price_usd),
                freight_usd: toNum(product.freight_usd),
                weight_kg: toNum(product.weight_kg),
                fragile: product.fragile,
                is_famous_brand: product.is_famous_brand,
            });

            // Se preenchido, roda simulação uma vez
            const qty = toNum(sim.quantity);
            const price = toNum(sim.target_price_brl);
            if (qty && qty > 0 && price && price > 0) {
                const fx = sim.use_auto_fx ? null : toNum(sim.exchange_rate);
                await simulateImport(created.id, {
                    quantity: qty,
                    exchange_rate: fx,
                    target_sale_price_brl: price,
                    freight_total_usd: null,
                    insurance_total_usd: null,
                });
            }

            router.push(`/products/${created.id}/evaluation?from=wizard`);
        } finally {
            setLoading(false);
        }
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
                    onSimulate={onSimulateClick}
                    loading={simLoading}
                    error={simError}
                />
            )}
            {step === 3 && <StepReview product={product} simulation={sim} result={simResult} />}

            <WizardFooter
                step={step}
                onBack={() => setStep((s) => Math.max(0, s - 1))}
                onNext={() => setStep((s) => Math.min(3, s + 1))}
                onFinish={finalize}
                loading={loading}
            />
        </div>
    );
}
