"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Item = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Item[] }) {
    return (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {items.map((it, i) => (
                <div key={`${it.label}-${i}`} className="flex items-center gap-2">
                    {it.href ? (
                        <Link href={it.href} className="hover:text-foreground transition">
                            {it.label}
                        </Link>
                    ) : (
                        <span className="text-foreground">{it.label}</span>
                    )}
                    {i < items.length - 1 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" /> : null}
                </div>
            ))}
        </div>
    );
}
