import { fetchProductEvaluation } from "@/lib/api";
import { EvaluationClient } from "@/components/product/evaluation/evaluation-client";

export const dynamic = "force-dynamic";

type PageProps = {
    params: { productId: string };
};

export default async function ProductEvaluationPage({ params }: PageProps) {
    const productId = Number(params.productId);
    const evaluation = await fetchProductEvaluation(productId);

    return (
        <div className="p-6 space-y-6">
            <EvaluationClient evaluation={evaluation} />
        </div>
    );
}
