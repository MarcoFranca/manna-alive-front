// src/components/product/products-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewProductSheet } from "@/components/product/new-product-sheet";
import { EditProductForm, ProductForEdit } from "@/components/product/edit-product-form";
import { Button } from "@/components/ui/button";
import { ProductMarketSheet } from "@/components/product/product-market-sheet";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProduct } from "@/lib/api";

export type ProductRow = {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
    fob_price_usd: string | null;
    freight_usd: string | null;
    created_at: string;
};

type Props = {
    products: ProductRow[];
};

export function ProductsClient({ products }: Props) {
    const router = useRouter();

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<ProductForEdit | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingLoading, setDeletingLoading] = useState(false);

    async function handleDelete(id: number) {
        try {
            setDeletingLoading(true);
            await deleteProduct(id);
            setDeletingId(null);
            router.refresh();
        } catch (err) {
            console.error(err);
            setDeletingLoading(false);
        }
    }

    return (
        <main className="min-h-screen px-6 py-8 bg-background text-foreground">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">
                    Produtos cadastrados (backend Manna)
                </h1>

                <NewProductSheet />
            </div>

            {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Nenhum produto cadastrado ainda.
                </p>
            ) : (
                <div className="overflow-x-auto border rounded-lg bg-card border-border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-muted">
                        <tr>
                            <th className="px-3 py-2 border-b text-left">ID</th>
                            <th className="px-3 py-2 border-b text-left">Nome</th>
                            <th className="px-3 py-2 border-b text-left">Categoria</th>
                            <th className="px-3 py-2 border-b text-right">FOB (USD)</th>
                            <th className="px-3 py-2 border-b text-right">Frete (USD)</th>
                            <th className="px-3 py-2 border-b text-left">Criado em</th>
                            <th className="px-3 py-2 border-b text-right">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-muted/60">
                                <td className="px-3 py-2 border-b">{p.id}</td>
                                <td className="px-3 py-2 border-b">{p.name}</td>
                                <td className="px-3 py-2 border-b">
                                    {p.category ?? (
                                        <span className="text-muted-foreground">–</span>
                                    )}
                                </td>
                                <td className="px-3 py-2 border-b text-right">
                                    {p.fob_price_usd ?? "–"}
                                </td>
                                <td className="px-3 py-2 border-b text-right">
                                    {p.freight_usd ?? "–"}
                                </td>
                                <td className="px-3 py-2 border-b">
                                    {new Date(p.created_at).toLocaleString("pt-BR")}
                                </td>
                                <td className="px-3 py-2 border-b text-right space-x-2">
                                    <ProductMarketSheet product={p} />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditing({
                                                id: p.id,
                                                name: p.name,
                                                category: p.category,
                                                description: p.description,
                                                fob_price_usd: p.fob_price_usd,
                                                freight_usd: p.freight_usd,
                                            });
                                            setEditOpen(true);
                                        }}
                                    >
                                        Editar
                                    </Button>

                                    <AlertDialog
                                        open={deletingId === p.id}
                                        onOpenChange={(open) =>
                                            setDeletingId(open ? p.id : null)
                                        }
                                    >
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                Excluir
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Confirmar exclusão
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tem certeza que deseja apagar o produto &quot;
                                                    {p.name}&quot; (ID {p.id})? Esta ação não pode ser
                                                    desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel disabled={deletingLoading}>
                                                    Cancelar
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(p.id)}
                                                    disabled={deletingLoading}
                                                >
                                                    {deletingLoading ? "Excluindo..." : "Sim, excluir"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent side="right" className="sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Editar produto</SheetTitle>
                    </SheetHeader>

                    {editing && (
                        <EditProductForm
                            product={editing}
                            onFinished={() => setEditOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </main>
    );
}
