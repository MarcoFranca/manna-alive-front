// src/components/product/new-product-sheet.tsx
"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { SheetShell } from "@/components/common/sheet-shell";

// ✅ Troque o form antigo pelo wizard
import { NewProductWizard } from "@/components/product/new-wizard/new-product-wizard";

export function NewProductSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo produto
                </Button>
            </SheetTrigger>

            <SheetShell
                title="Novo produto"
                description="Cadastre um produto para avaliar viabilidade. Comece pelo essencial e complete depois."
            >
                <NewProductWizard />
            </SheetShell>
        </Sheet>
    );
}
