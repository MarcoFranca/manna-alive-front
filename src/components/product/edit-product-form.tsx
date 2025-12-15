"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ProductForEdit = {
    id: number;
    name: string;
    category: string | null;
    description: string | null;

    fob_price_usd: string | number | null;
    freight_usd: string | number | null;
    insurance_usd?: string | number | null;

    weight_kg?: string | number | null;
    fragile?: boolean | null;

    is_famous_brand?: boolean | null;
    has_brand_authorization?: boolean | null;
};

type ProductUpdatePayload = {
    name?: string;
    category?: string | null;
    description?: string | null;

    fob_price_usd?: number | null;
    freight_usd?: number | null;
    insurance_usd?: number | null;

    weight_kg?: number | null;
    fragile?: boolean;

    is_famous_brand?: boolean;
    has_brand_authorization?: boolean;
};

type Props = {
    product: ProductForEdit;
    onFinished?: () => void;
};

function toStr(v: string | number | null | undefined): string {
    if (v === null || v === undefined) return "";
    return String(v);
}

function toNumOrNull(v: string): number | null {
    const n = Number(String(v).replace(",", ".").trim());
    return Number.isFinite(n) ? n : null;
}

export function EditProductForm({ product, onFinished }: Props) {
    const router = useRouter();

    // básicos
    const [name, setName] = useState(product.name);
    const [category, setCategory] = useState(product.category ?? "");
    const [description, setDescription] = useState(product.description ?? "");

    // custos
    const [fobPriceUsd, setFobPriceUsd] = useState(toStr(product.fob_price_usd));
    const [freightUsd, setFreightUsd] = useState(toStr(product.freight_usd));
    const [insuranceUsd, setInsuranceUsd] = useState(toStr(product.insurance_usd ?? null));

    // riscos / operação
    const [weightKg, setWeightKg] = useState(toStr(product.weight_kg ?? null));
    const [fragile, setFragile] = useState(Boolean(product.fragile ?? false));

    const [isFamousBrand, setIsFamousBrand] = useState(Boolean(product.is_famous_brand ?? false));
    const [hasBrandAuthorization, setHasBrandAuthorization] = useState(
        Boolean(product.has_brand_authorization ?? false)
    );

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showBrandAuth = useMemo(() => isFamousBrand, [isFamousBrand]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            const payload: ProductUpdatePayload = {
                name: name.trim(),
                category: category.trim() ? category.trim() : null,
                description: description.trim() ? description.trim() : null,

                fob_price_usd: fobPriceUsd.trim() ? toNumOrNull(fobPriceUsd) : null,
                freight_usd: freightUsd.trim() ? toNumOrNull(freightUsd) : null,
                insurance_usd: insuranceUsd.trim() ? toNumOrNull(insuranceUsd) : null,

                weight_kg: weightKg.trim() ? toNumOrNull(weightKg) : null,
                fragile,

                is_famous_brand: isFamousBrand,
                has_brand_authorization: showBrandAuth ? hasBrandAuthorization : false,
            };

            await updateProduct(product.id, payload);

            setSuccessMsg("Produto atualizado com sucesso.");
            router.refresh();
            onFinished?.();
        } catch (err) {
            console.error(err);
            setErrorMsg("Erro ao atualizar produto.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 mt-4 bg-card space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Editar produto #{product.id}</h2>
            </div>

            {/* Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="edit-name">Nome do produto *</Label>
                    <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {/* Custos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="edit-fob">FOB unitário (USD)</Label>
                    <Input
                        id="edit-fob"
                        type="number"
                        step="0.01"
                        value={fobPriceUsd}
                        onChange={(e) => setFobPriceUsd(e.target.value)}
                        inputMode="decimal"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="edit-freight">Frete unitário (USD)</Label>
                    <Input
                        id="edit-freight"
                        type="number"
                        step="0.01"
                        value={freightUsd}
                        onChange={(e) => setFreightUsd(e.target.value)}
                        inputMode="decimal"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="edit-insurance">Seguro unitário (USD)</Label>
                    <Input
                        id="edit-insurance"
                        type="number"
                        step="0.01"
                        value={insuranceUsd}
                        onChange={(e) => setInsuranceUsd(e.target.value)}
                        inputMode="decimal"
                    />
                </div>
            </div>

            {/* Riscos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="edit-weight">Peso unitário (kg)</Label>
                    <Input
                        id="edit-weight"
                        type="number"
                        step="0.01"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        inputMode="decimal"
                    />
                </div>

                <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm select-none">
                        <input
                            type="checkbox"
                            checked={fragile}
                            onChange={(e) => setFragile(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <span>Produto frágil</span>
                    </label>
                </div>

                <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm select-none">
                        <input
                            type="checkbox"
                            checked={isFamousBrand}
                            onChange={(e) => setIsFamousBrand(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <span>Marca famosa</span>
                    </label>
                </div>
            </div>

            {showBrandAuth ? (
                <div className="rounded-lg border bg-muted/30 p-3">
                    <label className="inline-flex items-center gap-2 text-sm select-none">
                        <input
                            type="checkbox"
                            checked={hasBrandAuthorization}
                            onChange={(e) => setHasBrandAuthorization(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <span>Tenho autorização da marca</span>
                    </label>
                    <div className="text-xs text-muted-foreground mt-1">
                        Sem autorização, o produto pode ter risco de PI/apreensão (isso impacta a avaliação).
                    </div>
                </div>
            ) : null}

            {errorMsg ? (
                <p className="text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
                    {errorMsg}
                </p>
            ) : null}

            {successMsg ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 rounded-md px-3 py-2">
                    {successMsg}
                </p>
            ) : null}

            <div className="flex items-center gap-2">
                <Button type="submit" disabled={loading} className="cursor-pointer">
                    {loading ? "Salvando..." : "Salvar alterações"}
                </Button>
            </div>
        </form>
    );
}
