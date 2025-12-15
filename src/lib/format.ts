export function fmtMoney(v: number | null | undefined, currency: "BRL" | "USD"): string {
    if (typeof v !== "number" || !Number.isFinite(v)) return "—";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency, maximumFractionDigits: 2 }).format(v);
}

export function fmtNumber(v: number | null | undefined, digits = 0): string {
    if (typeof v !== "number" || !Number.isFinite(v)) return "—";
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(v);
}

export function fmtPct(v: number | null | undefined, digits = 1): string {
    if (typeof v !== "number" || !Number.isFinite(v)) return "—";
    return `${fmtNumber(v, digits)}%`;
}
