export type DecisionKind = "approve_test" | "approve_import" | "reject" | "needs_data";

export type ProductDecisionCreate = {
    decision: DecisionKind;
    reason: string;
    decided_by?: string | null;
};

export type ProductDecisionOut = {
    id: number;
    product_id: number;
    decision: DecisionKind;
    reason: string;
    decided_by?: string | null;
    created_at: string;
};
