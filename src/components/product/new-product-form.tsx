// src/components/product/new-product-form.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createProduct, simulateImport } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchUsdBrlRate } from "@/lib/exchange";

/** Tipos alinhados com o schema do backend (ProductCreate) */
type ProductCreatePayload = {
    name: string;
    category: string | null;
    description: string | null;
    fob_price_usd: number | null;
    freight_usd: number | null;
    weight_kg: number | null;
    fragile: boolean;
    is_famous_brand: boolean;
};

/** Tipos alinhados com SimulationInput no backend */
type SimulationPayload = {
    quantity: number;
    exchange_rate: number;
    target_sale_price_brl: number;
    freight_total_usd: number | null;
    insurance_total_usd: number | null;
};

type SimulationResult = {
    id: number;
    product_id: number;
    quantity: number;
    exchange_rate: string;
    fob_total_usd: string;
    freight_total_usd: string;
    insurance_total_usd: string;
    customs_value_usd: string;
    estimated_total_cost_usd: string;
    estimated_total_cost_brl: string;
    unit_cost_brl: string;
    target_sale_price_brl: string;
    estimated_margin_pct: string;
    approved: boolean;
    reason: string | null;
    created_at: string;
};

export function NewProductForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    const [fobPriceUsd, setFobPriceUsd] = useState("");
    const [freightUsd, setFreightUsd] = useState("");

    const [weightKg, setWeightKg] = useState("");
    const [fragile, setFragile] = useState(false);
    const [isFamousBrand, setIsFamousBrand] = useState(false);

    // Campos para simulação rápida
    const [quantityForTest, setQuantityForTest] = useState("100");
    const [targetPriceBrl, setTargetPriceBrl] = useState("");
    const [manualExchangeRate, setManualExchangeRate] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [simResult, setSimResult] = useState<SimulationResult | null>(null);
    const [simError, setSimError] = useState<string | null>(null);
    const [simInfo, setSimInfo] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setSimResult(null);
        setSimError(null);
        setSimInfo(null);
        setLoading(true);

        try {
            // 1) Monta o payload do produto (TIPADO)
            const payload: ProductCreatePayload = {
                name,
                category: category || null,
                description: description || null,
                fob_price_usd: fobPriceUsd ? Number(fobPriceUsd) : null,
                freight_usd: freightUsd ? Number(freightUsd) : null,
                weight_kg: weightKg ? Number(weightKg) : null,
                fragile,
                is_famous_brand: isFamousBrand,
            };

            // 2) Cria o produto no backend
            const createdProduct = await createProduct(payload);

            setSuccessMsg("Produto cadastrado com sucesso.");

            // Limpa campos principais (se quiser manter alguns, é só adaptar)
            setName("");
            setCategory("");
            setDescription("");
            setFobPriceUsd("");
            setFreightUsd("");
            setWeightKg("");
            setFragile(false);
            setIsFamousBrand(false);

            // 3) Se tiver dados para simulação rápida, roda a simulação
            const hasViabilityData =
                quantityForTest.trim() !== "" && targetPriceBrl.trim() !== "";

            if (hasViabilityData) {
                let exchangeRate: number | null = null;

                // Se usuário informou câmbio manual, usar ele
                if (manualExchangeRate.trim() !== "") {
                    exchangeRate = Number(
                        manualExchangeRate.replace(",", ".").trim()
                    );
                } else {
                    // Senão, tentar buscar dólar do dia via API
                    try {
                        const rate = await fetchUsdBrlRate();
                        exchangeRate = rate;
                        setSimInfo(
                            `Simulação feita com câmbio automático USD/BRL ≈ R$ ${rate.toFixed(
                                4
                            )}.`
                        );
                    } catch (err) {
                        console.error(err);
                        setSimError(
                            "Não foi possível consultar o dólar do dia. Informe o câmbio manualmente para simular com mais precisão."
                        );
                    }
                }

                if (exchangeRate !== null) {
                    try {
                        const simPayload: SimulationPayload = {
                            quantity: Number(quantityForTest),
                            exchange_rate: exchangeRate,
                            target_sale_price_brl: Number(
                                targetPriceBrl.replace(",", ".").trim()
                            ),
                            // Se você quiser, pode permitir frete total diferente aqui.
                            // Se não enviar, o backend usa frete unitário do produto.
                            freight_total_usd: null,
                            insurance_total_usd: null,
                        };

                        const sim = (await simulateImport(
                            createdProduct.id,
                            simPayload
                        )) as SimulationResult;
                        setSimResult(sim);
                    } catch (err) {
                        console.error(err);
                        setSimError(
                            "Erro ao rodar a simulação de viabilidade. Verifique os dados."
                        );
                    }
                }
            }

            // 4) Atualiza lista
            router.refresh();
        } catch (err) {
            console.error(err);
            setErrorMsg("Erro ao cadastrar produto. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border border-border rounded-lg p-4 mb-8 bg-card space-y-4 shadow-sm"
        >
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Novo produto para avaliação</h2>
                <p className="text-xs text-muted-foreground">
                    Cadastre os dados básicos do produto e, se quiser, já faça uma
                    simulação rápida de viabilidade usando a regra da importação
                    simplificada.
                </p>
            </div>

            {/* Link para planilha DHL */}
            <div className="rounded-md border border-blue-500/40 bg-blue-500/5 p-3 text-xs">
                <p className="font-medium">Calculadora de frete DHL (planilha)</p>
                <p className="text-xs text-muted-foreground mb-1">
                    Use esta planilha para estimar o frete por kg e obter o frete unitário
                    (USD) do produto antes de cadastrar:
                </p>
                <a
                    href="https://1drv.ms/x/c/3365433adbde8759/IQBMuFH8_cPzRaTt66gHjzMPAU4XIKABBMJ0ne_uBCD7DZ8?e=PxQNxx"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-300 hover:underline font-medium"
                >
                    Abrir planilha de frete DHL
                </a>
            </div>

            {/* Dados básicos do produto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Nome do produto *</Label>
                    <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex.: Balança digital de cozinha"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex.: Casa e cozinha, PET..."
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Resumo rápido sobre o produto, tamanho, uso, diferenciais, etc."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="fob">FOB unitário (USD)</Label>
                    <Input
                        id="fob"
                        type="number"
                        step="0.01"
                        value={fobPriceUsd}
                        onChange={(e) => setFobPriceUsd(e.target.value)}
                        placeholder="Ex.: 2.50"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="freight">Frete unitário estimado (USD)</Label>
                    <Input
                        id="freight"
                        type="number"
                        step="0.01"
                        value={freightUsd}
                        onChange={(e) => setFreightUsd(e.target.value)}
                        placeholder="Ex.: 0.80"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="weight">Peso unitário (kg)</Label>
                    <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        placeholder="Ex.: 0.20"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fragile}
                        onChange={(e) => setFragile(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <span>Produto frágil</span>
                </label>

                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isFamousBrand}
                        onChange={(e) => setIsFamousBrand(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <span>Marca famosa (requer cuidado com PI)</span>
                </label>
            </div>

            {/* BLOCO: Simulação rápida de viabilidade */}
            <div className="mt-4 border-t border-border pt-4 space-y-3">
                <h3 className="text-sm font-semibold">
                    Simulação rápida de viabilidade (opcional)
                </h3>
                <p className="text-xs text-muted-foreground">
                    Se você informar uma quantidade para teste e um preço de venda alvo
                    em R$, o sistema vai rodar a simulação de importação usando a regra
                    rápida (custo aduaneiro × 2) e, se possível, o dólar do dia.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="qtyTest">Quantidade para teste</Label>
                        <Input
                            id="qtyTest"
                            value={quantityForTest}
                            onChange={(e) => setQuantityForTest(e.target.value)}
                            placeholder="Ex.: 100"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="targetPrice">
                            Preço de venda alvo (R$ / unidade)
                        </Label>
                        <Input
                            id="targetPrice"
                            value={targetPriceBrl}
                            onChange={(e) => setTargetPriceBrl(e.target.value)}
                            placeholder="Ex.: 49.90"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="exchange">
                            Câmbio USD/BRL (opcional – se vazio, usa dólar do dia)
                        </Label>
                        <Input
                            id="exchange"
                            value={manualExchangeRate}
                            onChange={(e) => setManualExchangeRate(e.target.value)}
                            placeholder="Ex.: 5.20"
                            inputMode="decimal"
                        />
                    </div>
                </div>
            </div>

            {/* Mensagens de erro/sucesso do cadastro */}
            {errorMsg && (
                <p className="text-sm text-red-500 border border-red-500/40 bg-red-500/5 rounded-md px-3 py-2">
                    {errorMsg}
                </p>
            )}

            {successMsg && (
                <p className="text-sm text-emerald-400 border border-emerald-500/40 bg-emerald-500/5 rounded-md px-3 py-2">
                    {successMsg}
                </p>
            )}

            <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Cadastrar produto e (opcional) simular"}
            </Button>

            {/* Resultado da simulação */}
            {(simResult || simError || simInfo) && (
                <div className="mt-4 border border-border rounded-lg p-3 bg-muted/40 text-xs space-y-2">
                    <h4 className="font-semibold">Resultado da simulação rápida</h4>

                    {simInfo && (
                        <p className="text-[11px] text-muted-foreground">{simInfo}</p>
                    )}

                    {simError && (
                        <p className="text-xs text-amber-400">{simError}</p>
                    )}

                    {simResult && (
                        <>
                            <p>
                                <span className="font-medium">Custo unitário estimado:</span>{" "}
                                R$ {Number(simResult.unit_cost_brl).toFixed(2)}
                            </p>
                            <p>
                                <span className="font-medium">Preço alvo:</span> R${" "}
                                {Number(simResult.target_sale_price_brl).toFixed(2)}
                            </p>
                            <p>
                                <span className="font-medium">Margem estimada:</span>{" "}
                                {Number(simResult.estimated_margin_pct).toFixed(1)}%
                            </p>
                            <p>
                                <span className="font-medium">Status:</span>{" "}
                                {simResult.approved ? "APROVADO" : "REPROVADO"} –{" "}
                                {simResult.reason}
                            </p>
                        </>
                    )}

                    {!simResult && !simError && !simInfo && (
                        <p className="text-muted-foreground">
                            Preencha quantidade e preço alvo para simular automaticamente.
                        </p>
                    )}
                </div>
            )}
        </form>
    );
}
