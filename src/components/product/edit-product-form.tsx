// src/components/product/edit-product-form.tsx
"use client";

import { FormEvent, useState } from "react";
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
    fob_price_usd: string | null;
    freight_usd: string | null;
};

type Props = {
    product: ProductForEdit;
    onFinished?: () => void;
};

export function EditProductForm({ product, onFinished }: Props) {
    const router = useRouter();

    const [name, setName] = useState(product.name);
    const [category, setCategory] = useState(product.category ?? "");
    const [description, setDescription] = useState(product.description ?? "");
    const [fobPriceUsd, setFobPriceUsd] = useState(
        product.fob_price_usd ?? ""
    );
    const [freightUsd, setFreightUsd] = useState(
        product.freight_usd ?? ""
    );

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            const payload: any = {
                name,
                category: category || null,
                description: description || null,
                fob_price_usd: fobPriceUsd ? Number(fobPriceUsd) : null,
                freight_usd: freightUsd ? Number(freightUsd) : null,
            };

            await updateProduct(product.id, payload);

            setSuccessMsg("Produto atualizado com sucesso.");
            router.refresh();

            if (onFinished) {
                onFinished();
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Erro ao atualizar produto.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border border-border rounded-lg p-4 mt-4 bg-card space-y-4"
        >
            <h2 className="text-lg font-semibold">
                Editar produto #{product.id}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="edit-name">Nome do produto *</Label>
                    <Input
                        id="edit-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Input
                        id="edit-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="edit-fob">FOB unitário (USD)</Label>
                    <Input
                        id="edit-fob"
                        type="number"
                        step="0.01"
                        value={fobPriceUsd}
                        onChange={(e) => setFobPriceUsd(e.target.value)}
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
                    />
                </div>
            </div>

            {errorMsg && (
                <p className="text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
                    {errorMsg}
                </p>
            )}

            {successMsg && (
                <p className="text-sm text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 rounded-md px-3 py-2">
                    {successMsg}
                </p>
            )}

            <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
        </form>
    );
}
