// types.ts
export type WizardProduct = {
    name: string;
    category: string;
    fob_price_usd: string;
    freight_usd: string;
    weight_kg: string;
    fragile: boolean;
    is_famous_brand: boolean;
};

export type WizardSimulation = {
    quantity: string;
    target_price_brl: string;
    exchange_rate: string;
};
