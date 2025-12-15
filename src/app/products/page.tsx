import { fetchProductsTriage } from "@/lib/api";
import { ProductsClient } from "@/components/product/products-client";
import type { ProductTriageOut } from "@/types/triage";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const triage: ProductTriageOut[] = await fetchProductsTriage({
        limit: 250,
        include_score: true,
        include_notes: false,
    });

    return <ProductsClient triage={triage} />;
}
