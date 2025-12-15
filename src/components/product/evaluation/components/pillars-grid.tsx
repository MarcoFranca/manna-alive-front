"use client";

import type { Pillar } from "@/types/evaluation";
import { PillarCard } from "./pillar-card";

export function PillarsGrid({ pillars }: { pillars: Pillar[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((p) => {
                const { key, ...rest } = p;
                return <PillarCard key={key} {...rest} pillarKey={key} />;
            })}
        </div>
    );
}

