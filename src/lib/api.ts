// src/lib/api.ts

import type { ProductEvaluationResponse } from "@/types/evaluation";
import type { DecisionKind, ProductDecisionOut } from "@/types/evaluation";
import type { ProductTriageOut } from "@/types/triage";

export async function fetchProductEvaluation(productId: number) {
    if (!Number.isFinite(productId) || productId <= 0) {
        throw new Error("Invalid productId for evaluation fetch");
    }

    const res = await fetch(`${API_BASE_URL}/products/${productId}/evaluation`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch evaluation: ${res.status}`);
    }

    const data: unknown = await res.json();
    return data as ProductEvaluationResponse;
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type SimulationResult = {
    id: number;
    product_id: number;
    quantity: number;
    exchange_rate: string;
    fob_total_usd: string;
    freight_total_usd: string;
    insurance_total_usd: string;
    customs_value_usd: string;
    estimated_total_cost_usd: string;
    estimated_total_cost_brl: string;
    unit_cost_brl: string;
    target_sale_price_brl: string;
    estimated_margin_pct: string;
    approved: boolean;
    reason: string | null;
    created_at: string;
};

export async function fetchProductsTriage(params?: {
    limit?: number;
    include_score?: boolean;
    include_notes?: boolean;
}): Promise<ProductTriageOut[]> {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (typeof params?.include_score === "boolean") sp.set("include_score", String(params.include_score));
    if (typeof params?.include_notes === "boolean") sp.set("include_notes", String(params.include_notes));

    const qs = sp.toString();
    const res = await fetch(`${API_BASE_URL}/products/triage${qs ? `?${qs}` : ""}`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed to fetch products triage: ${res.status}`);

    const data: unknown = await res.json();
    return data as ProductTriageOut[];
}

export async function fetchLastSimulation(
    productId: number
): Promise<SimulationResult | null> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/simulations/last`, {
        cache: "no-store",
    });

    if (res.status === 404) {
        // Nenhuma simulação encontrada
        return null;
    }

    if (!res.ok) {
        throw new Error("Erro ao buscar última simulação");
    }

    return res.json();
}

export async function fetchProducts() {
    const res = await fetch(`${API_BASE_URL}/products`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Erro ao buscar produtos");
    }

    return res.json();
}

export async function createProduct(data: unknown) {
    const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro ao criar produto", body);
        throw new Error("Erro ao criar produto");
    }

    return res.json();
}

export async function updateProduct(id: number, data: unknown) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro ao atualizar produto", body);
        throw new Error("Erro ao atualizar produto");
    }

    return res.json();
}

export async function deleteProduct(id: number) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro ao deletar produto", body);
        throw new Error("Erro ao deletar produto");
    }

    return true;
}

export async function createProductDecision(
    productId: number,
    payload: { decision: DecisionKind; reason: string; decided_by?: string }
): Promise<ProductDecisionOut> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create decision: ${res.status}`);
    const data: unknown = await res.json();
    return data as ProductDecisionOut;
}

export async function simulateImport(productId: number, data: unknown) {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/simulate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro na simulação", body);
        throw new Error("Erro na simulação");
    }

    return res.json();
}

/* ========= NOVO: dados de mercado ========= */

export async function fetchMarketData(productId: number) {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/market-data`, {
        cache: "no-store",
    });

    if (res.status === 404) {
        // ainda não tem dados de mercado cadastrados
        return null;
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro ao buscar dados de mercado", body);
        throw new Error("Erro ao buscar dados de mercado");
    }

    return res.json();
}

export async function upsertMarketData(productId: number, data: unknown) {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/market-data`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro ao salvar dados de mercado", body);
        throw new Error("Erro ao salvar dados de mercado");
    }

    return res.json();
}

/* ========= NOVO: score ========= */

export async function fetchProductScore(productId: number) {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/score`, {
        cache: "no-store",
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro ao buscar score do produto", body);
        throw new Error("Erro ao buscar score do produto");
    }

    return res.json();
}

export async function fetchProductsRanking() {
    const res = await fetch(`${API_BASE_URL}/products/scores/ranking`, {
        cache: "no-store",
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Erro ao buscar ranking de produtos", body);
        throw new Error("Erro ao buscar ranking de produtos");
    }

    return res.json();
}


