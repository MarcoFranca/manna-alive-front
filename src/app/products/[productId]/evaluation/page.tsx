import { fetchProductEvaluation } from "@/lib/api";
import { EvaluationClient } from "@/components/product/evaluation/evaluation-client";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{ productId: string }>;
};

export default async function ProductEvaluationPage({ params }: PageProps) {
    const { productId } = await params;
    const id = Number(productId);

    if (!Number.isFinite(id)) {
        throw new Error(`Invalid productId: ${productId}`);
    }

    const evaluation = await fetchProductEvaluation(id);

    return (
        <main className="min-h-screen px-6 py-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <EvaluationClient evaluation={evaluation} />
            </div>
        </main>
    );
}
