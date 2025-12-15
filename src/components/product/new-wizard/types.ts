// src/components/product/new-wizard/types.ts

export type WizardProduct = {
    name: string;
    category: string;

    fob_price_usd: string;
    freight_usd: string;
    weight_kg: string;

    fragile: boolean;
    is_famous_brand: boolean;

    // usado pelo helper DHL / conversões
    quantityForTest: string;
};

export type WizardSimulation = {
    quantity: string;
    target_price_brl: string;

    // vazio = automático
    exchange_rate: string;
    use_auto_fx: boolean;
};

// retorno do backend /simulate
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
