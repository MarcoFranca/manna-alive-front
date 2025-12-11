// src/components/product/new-product-sheet.tsx
"use client";

import { NewProductForm } from "@/components/product/new-product-form";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";

export function NewProductSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>+ Novo produto</Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="sm:max-w-xl p-0 flex flex-col"
            >
                {/* Cabeçalho com padding e borda inferior */}
                <SheetHeader className="px-6 pt-4 pb-3 border-b">
                    <SheetTitle>Novo produto</SheetTitle>
                    <SheetDescription>
                        Cadastre um produto para avaliar a viabilidade de importação.
                    </SheetDescription>
                </SheetHeader>

                {/* Área de conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* O formulário já é um card (border, bg-card, rounded) */}
                    <NewProductForm />
                </div>
            </SheetContent>
        </Sheet>
    );
}
