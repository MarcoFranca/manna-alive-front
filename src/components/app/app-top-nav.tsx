"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, LayoutGrid, Trophy, Home, RefreshCcw } from "lucide-react";

function pageLabel(path: string) {
    if (path.startsWith("/products/") && path.endsWith("/evaluation")) return "Avaliação";
    if (path.startsWith("/products")) return "Produtos";
    return "Dashboard";
}

export function AppTopNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur">
            <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                    </Button>

                    <Badge variant="outline" className="hidden sm:inline-flex">
                        {pageLabel(pathname)}
                    </Badge>
                </div>

                <nav className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link href="/products">
                            <LayoutGrid className="h-4 w-4" />
                            Produtos
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link href="/products/ranking">
                            <Trophy className="h-4 w-4" />
                            Ranking
                        </Link>
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.refresh()}
                        className="gap-2"
                        title="Atualizar dados"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Atualizar
                    </Button>
                </nav>
            </div>
        </header>
    );
}
