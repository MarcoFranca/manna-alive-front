"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewProductBasicFields(props: {
    name: string; setName: (v: string) => void;
    category: string; setCategory: (v: string) => void;
    description: string; setDescription: (v: string) => void;
    fobPriceUsd: string; setFobPriceUsd: (v: string) => void;
    freightUsd: string; setFreightUsd: (v: string) => void;
    weightKg: string; setWeightKg: (v: string) => void;
    fragile: boolean; setFragile: (v: boolean) => void;
    isFamousBrand: boolean; setIsFamousBrand: (v: boolean) => void;
}) {
    const {
        name, setName,
        category, setCategory,
        description, setDescription,
        fobPriceUsd, setFobPriceUsd,
        freightUsd, setFreightUsd,
        weightKg, setWeightKg,
        fragile, setFragile,
        isFamousBrand, setIsFamousBrand,
    } = props;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Nome do produto *</Label>
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Balança digital de cozinha" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="category">Categoria</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: Casa e cozinha, PET..." />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Resumo rápido: tamanho, uso, diferenciais..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="fob">FOB unitário (USD)</Label>
                    <Input id="fob" type="number" step="0.01" value={fobPriceUsd} onChange={(e) => setFobPriceUsd(e.target.value)} placeholder="Ex.: 2.50" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="freight">Frete unitário estimado (USD)</Label>
                    <Input id="freight" type="number" step="0.01" value={freightUsd} onChange={(e) => setFreightUsd(e.target.value)} placeholder="Ex.: 0.80" />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="weight">Peso unitário (kg)</Label>
                    <Input id="weight" type="number" step="0.01" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Ex.: 0.20" />
                </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
                <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="h-4 w-4" />
                    <span>Produto frágil</span>
                </label>

                <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={isFamousBrand} onChange={(e) => setIsFamousBrand(e.target.checked)} className="h-4 w-4" />
                    <span>Marca famosa (PI)</span>
                </label>
            </div>
        </div>
    );
}
