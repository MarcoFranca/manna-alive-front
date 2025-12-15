export type MarketDataPayload = {
    price_average_brl: number | null;
    sales_per_day: number | null;
    sales_per_month: number | null;
    visits: number | null;
    ranking_position: number | null;
    full_ratio: number | null;
    competitor_count: number | null;
    listing_age_days: number | null;
    avg_reviews: number | null;
};

export function parseNumber(value: string): number | null {
    const v = value.trim();
    if (!v) return null;
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

export function parseIntNumber(value: string): number | null {
    const v = value.trim();
    if (!v) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
}
