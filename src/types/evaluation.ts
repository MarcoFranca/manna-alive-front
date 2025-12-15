export type PillarStatus = "green" | "yellow" | "red" | "unknown";
export type Decision = "approve" | "reject" | "needs_data";
export type ScenarioKind = "base" | "conservative" | "optimistic";
export type DecisionKind = "approve_test" | "approve_import" | "reject" | "needs_data";

export type ProductDecisionOut = {
    id: number;
    product_id: number;
    decision: DecisionKind;
    reason: string;
    decided_by: string | null;
    created_at: string;
};

export type Metric = {
    key: string;
    label: string;
    value: number | null;
    unit?: string | null;
    help?: string | null;
};

export type Pillar = {
    key: "market" | "unit_economics" | "operations" | "risk";
    title: string;
    status: PillarStatus;
    summary: string;
    next_action?: string | null;
    metrics: Metric[];
};

export type CompletenessItem = {
    key: string;
    label: string;
    is_complete: boolean;
};

export type Completeness = {
    percent: number;
    items: CompletenessItem[];
    missing: string[];
};

export type Blocker = {
    key: string;
    title: string;
    reason: string;
};

export type ScenarioResult = {
    kind: ScenarioKind;
    name: string;

    quantity: number;
    exchange_rate: number;

    fob_total_usd: number;
    freight_total_usd: number;
    insurance_total_usd: number;
    customs_value_usd: number;

    estimated_total_cost_usd: number;
    estimated_total_cost_brl: number;
    unit_cost_brl: number;

    target_sale_price_brl: number;
    estimated_margin_pct: number;

    approved: boolean;
    reason?: string | null;
};

export type EvaluationHeader = {
    product_id: number;
    product_name: string;
    category?: string | null;

    has_market_data: boolean;
    has_ncm: boolean;
    has_supplier: boolean;
    has_dimensions: boolean;
    latest_decision?: ProductDecisionOut | null;

    created_at: string;
    updated_at: string;
};

export type ProductEvaluationResponse = {
    header: EvaluationHeader;
    completeness: Completeness;

    decision: Decision;
    decision_reason: string;

    pillars: Pillar[];
    scenarios: ScenarioResult[];

    blockers: Blocker[];
    notes: string[];
};
