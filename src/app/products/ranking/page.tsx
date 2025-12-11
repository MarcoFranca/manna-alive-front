// src/app/products/ranking/page.tsx

import { fetchProductsRanking } from "@/lib/api";

type ProductScore = {
    product_id: number;
    product_name: string;
    total_score: number;
    demand_score: number;
    competition_score: number;
    margin_score: number;
    risk_score: number;
    classification: string;
    notes: string;
};

export const dynamic = "force-dynamic";

function classificationClass(classification: string) {
    switch (classification) {
        case "campeao":
            return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40";
        case "bom":
            return "bg-sky-500/15 text-sky-300 border border-sky-500/40";
        case "arriscado":
            return "bg-amber-500/15 text-amber-300 border border-amber-500/40";
        case "descartar":
            return "bg-red-500/15 text-red-300 border border-red-500/40";
        default:
            return "bg-muted text-muted-foreground";
    }
}

export default async function ProductsRankingPage() {
    const scores: ProductScore[] = await fetchProductsRanking();

    return (
        <main className="min-h-screen px-6 py-8 bg-background text-foreground">
            <h1 className="text-2xl font-bold mb-6">
                Ranking de produtos por viabilidade
            </h1>

            {scores.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Ainda não há produtos com score calculado. Cadastre produtos, simule
                    importações e preencha os dados de mercado.
                </p>
            ) : (
                <div className="overflow-x-auto border rounded-lg bg-card border-border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-muted">
                        <tr>
                            <th className="px-3 py-2 border-b text-left">Posição</th>
                            <th className="px-3 py-2 border-b text-left">Produto</th>
                            <th className="px-3 py-2 border-b text-right">Score</th>
                            <th className="px-3 py-2 border-b text-right">Demanda</th>
                            <th className="px-3 py-2 border-b text-right">Concorrência</th>
                            <th className="px-3 py-2 border-b text-right">Margem</th>
                            <th className="px-3 py-2 border-b text-right">Risco</th>
                            <th className="px-3 py-2 border-b text-left">Classificação</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scores.map((s, idx) => (
                            <tr key={s.product_id} className="hover:bg-muted/60">
                                <td className="px-3 py-2 border-b">{idx + 1}</td>
                                <td className="px-3 py-2 border-b">{s.product_name}</td>
                                <td className="px-3 py-2 border-b text-right">
                                    {s.total_score}
                                </td>
                                <td className="px-3 py-2 border-b text-right">
                                    {s.demand_score}
                                </td>
                                <td className="px-3 py-2 border-b text-right">
                                    {s.competition_score}
                                </td>
                                <td className="px-3 py-2 border-b text-right">
                                    {s.margin_score}
                                </td>
                                <td className="px-3 py-2 border-b text-right">
                                    {s.risk_score}
                                </td>
                                <td className="px-3 py-2 border-b">
                    <span
                        className={
                            "inline-flex items-center px-2 py-1 text-xs rounded-full " +
                            classificationClass(s.classification)
                        }
                    >
                      {s.classification.toUpperCase()}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
