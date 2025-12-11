// src/app/products/page.tsx

import { fetchProducts } from "@/lib/api";
import { ProductsClient, ProductRow } from "@/components/product/products-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const products: ProductRow[] = await fetchProducts();

    return <ProductsClient products={products} />;
}
