import {ProductDecisionOut} from "@/types/decision";

export type TriageStatus = "ready" | "needs_simulation" | "needs_market" | "needs_costs";

export type SimulationSummaryOut = {
    id: number;
    created_at: string;
    approved: boolean;
    unit_cost_brl: string;
    target_sale_price_brl: string;
    estimated_margin_pct: string;
};

export type ScoreSummaryOut = {
    total_score: number;
    classification: string;

    demand_score: number;
    competition_score: number;
    margin_score: number;
    risk_score: number;

    sales_per_day?: number | null;
    sales_per_month?: number | null;
    visits?: number | null;
    competitor_count?: number | null;

    full_ratio?: string | null;
    price_average_brl?: string | null;
    estimated_margin_pct?: string | null;

    has_latest_simulation: boolean;

    reasons: string[];

    notes?: string | null;
};

export type ProductTriageOut = {
    product_id: number;
    product_name: string;
    category: string | null;
    created_at: string;

    fob_price_usd: string | null;
    freight_usd: string | null;
    insurance_usd: string | null;

    has_fob: boolean;
    has_freight: boolean;
    has_market_data: boolean;
    has_latest_simulation: boolean;

    status: TriageStatus;
    next_action: string;
    priority_rank: number;

    last_simulation: SimulationSummaryOut | null;
    score: ScoreSummaryOut | null;
    latest_decision?: ProductDecisionOut | null;

    alerts: string[];
};
