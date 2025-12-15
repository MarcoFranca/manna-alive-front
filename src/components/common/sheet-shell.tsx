"use client";

import { ReactNode } from "react";
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function SheetShell({
                               title,
                               description,
                               children,
                               footer,
                               sizeClass = "sm:max-w-xl",
                           }: {
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    sizeClass?: string;
}) {
    return (
        <SheetContent side="right" className={`${sizeClass} p-0 flex flex-col`}>
            <SheetHeader className="px-6 pt-4 pb-3 border-b">
                <SheetTitle>{title}</SheetTitle>
                {description ? <SheetDescription>{description}</SheetDescription> : null}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

            {footer ? <div className="border-t px-6 py-4 bg-background/70 backdrop-blur">{footer}</div> : null}
        </SheetContent>
    );
}
