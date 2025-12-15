import Link from "next/link";
import { fetchProducts, fetchProductsRanking } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: number;
  name: string;
  category: string | null;
  fob_price_usd: number | null;
  created_at: string;
};

type ProductScore = {
  product_id: number;
  product_name: string;
  total_score: number;
  classification: string;
  estimated_margin_pct?: number | null;
  has_latest_simulation: boolean;
  sales_per_day?: number | null;
  competitor_count?: number | null;
};

function classificationBadgeVariant(
    c: string
): "default" | "secondary" | "destructive" | "outline" {
  const v = (c ?? "").toLowerCase();
  if (v.includes("campe")) return "default";
  if (v.includes("bom")) return "secondary";
  if (v.includes("arrisc")) return "outline";
  if (v.includes("desc")) return "destructive";
  return "outline";
}

function kpiBadgeVariant(value: number): "default" | "secondary" | "destructive" | "outline" {
  if (value <= 0) return "outline";
  if (value <= 2) return "secondary";
  return "default";
}

/**
 * Wrapper para “glow neon premium” que funciona sempre:
 * - ring + border suave
 * - glow por trás via um overlay absoluto com blur
 */
function NeonCard({
                    children,
                    variant,
                    className = "",
                  }: {
  children: React.ReactNode;
  variant: "cyan" | "fuchsia" | "emerald" | "amber";
  className?: string;
}) {
  const ring =
      variant === "cyan"
          ? "ring-cyan-400/30 border-cyan-500/20"
          : variant === "fuchsia"
              ? "ring-fuchsia-400/25 border-fuchsia-500/15"
              : variant === "emerald"
                  ? "ring-emerald-400/25 border-emerald-500/15"
                  : "ring-amber-300/20 border-amber-400/10";

  const glow =
      variant === "cyan"
          ? "bg-cyan-500/12"
          : variant === "fuchsia"
              ? "bg-fuchsia-500/10"
              : variant === "emerald"
                  ? "bg-emerald-500/10"
                  : "bg-amber-500/8";

  return (
      <Card
          className={[
            "relative overflow-hidden bg-background/70 backdrop-blur",
            "border ring-1 shadow-sm",
            ring,
            className,
          ].join(" ")}
      >
        {/* Glow layer */}
        <div
            className={[
              "pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl",
              glow,
            ].join(" ")}
        />
        {/* Subtle noise-ish overlay (optional) */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative">{children}</div>
      </Card>
  );
}

export default async function Home() {
  const [products, ranking]: [ProductRow[], ProductScore[]] = await Promise.all([
    fetchProducts()
        .then((r) => r as ProductRow[])
        .catch(() => [] as ProductRow[]),
    fetchProductsRanking()
        .then((r) => r as ProductScore[])
        .catch(() => [] as ProductScore[]),
  ]);

  const totalProducts = products.length;
  const productsMissingFOB = products.filter((p: ProductRow) => !p.fob_price_usd).length;
  const productsWithFOB = totalProducts - productsMissingFOB;

  const top = ranking.slice(0, 5);
  const bestCandidate = top[0] ?? null;

  return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="relative isolate overflow-hidden">
          {/* Neon background (dark-first, but looks nice in light too) */}
          <div className="-z-10 pointer-events-none absolute inset-0">
            {/* Base */}
            <div className="absolute inset-0 bg-background" />

            {/* Big neon glows */}
            <div className="absolute -top-44 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-500/18 blur-[140px] dark:bg-cyan-400/20" />
            <div className="absolute -top-20 right-[-180px] h-[520px] w-[520px] rounded-full bg-fuchsia-500/14 blur-[140px] dark:bg-fuchsia-400/18" />
            <div className="absolute bottom-[-260px] left-[-220px] h-[620px] w-[620px] rounded-full bg-emerald-500/12 blur-[160px] dark:bg-emerald-400/14" />

            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:72px_72px]" />

            {/* Fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/75 to-background" />
          </div>

          <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                  Operação interna • Triagem → Simulação → Decisão
                </div>

                <h1 className="text-3xl font-semibold tracking-tight">
                  Manna Alive · Avaliação de Produtos
                </h1>

                <p className="text-sm text-muted-foreground max-w-2xl">
                  Central de trabalho para identificar quais produtos valem a pena importar para vender.
                  Decida com clareza: demanda, concorrência, margem e risco.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* CTA premium: neon ring + glow */}
                <Button
                    asChild
                    className="relative shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_28px_-14px_rgba(34,211,238,0.9)]"
                >
                  <Link href="/products">Abrir produtos</Link>
                </Button>

                <Button asChild variant="secondary" className="border border-white/5">
                  <Link href="/products/ranking">Ver ranking</Link>
                </Button>
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <NeonCard variant="cyan">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Produtos cadastrados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-3xl font-semibold">{totalProducts}</div>
                  <div className="text-xs text-muted-foreground">
                    Base para triagem e priorização.
                  </div>
                </CardContent>
              </NeonCard>

              <NeonCard variant="amber">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Prontidão (mínimo)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Com FOB</div>
                    <Badge variant={kpiBadgeVariant(productsWithFOB)}>{productsWithFOB}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">Sem FOB</div>
                    <Badge variant={productsMissingFOB > 0 ? "destructive" : "secondary"}>
                      {productsMissingFOB}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Sem FOB, qualquer simulação fica fraca.
                  </div>
                </CardContent>
              </NeonCard>

              <NeonCard variant="emerald">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Próxima ação recomendada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Abra um produto e complete o essencial:
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li>Mercado: preço médio, vendas/dia, concorrência</li>
                      <li>Simulação: qty, câmbio, preço alvo</li>
                      <li>Risco: NCM e marca</li>
                    </ul>
                  </div>

                  <Button asChild className="w-full">
                    <Link href="/products">Ir para triagem</Link>
                  </Button>
                </CardContent>
              </NeonCard>
            </div>

            {/* Spotlight */}
            <div className="grid gap-4 md:grid-cols-2">
              <NeonCard variant="fuchsia">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">Meu próximo produto para abrir</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Sugestão baseada no ranking atual (se disponível).
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {!bestCandidate ? (
                      <div className="text-sm text-muted-foreground">
                        Ainda não há ranking suficiente. Comece preenchendo dados de mercado e rodando simulações.
                      </div>
                  ) : (
                      <div className="rounded-md border bg-background/50 p-3 ring-1 ring-fuchsia-400/15">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{bestCandidate.product_name}</div>

                            <div className="text-xs text-muted-foreground">
                              Score: {bestCandidate.total_score} •{" "}
                              <Badge
                                  variant={classificationBadgeVariant(bestCandidate.classification)}
                                  className="text-[10px]"
                              >
                                {bestCandidate.classification}
                              </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {bestCandidate.has_latest_simulation ? "Tem simulação recente" : "Sem simulação recente"}
                              {typeof bestCandidate.estimated_margin_pct === "number"
                                  ? ` • margem ~ ${bestCandidate.estimated_margin_pct}%`
                                  : ""}
                            </div>
                          </div>

                          <Button asChild size="sm" variant="secondary" className="ring-1 ring-white/5">
                            <Link href={`/products/${bestCandidate.product_id}/evaluation`}>Avaliar</Link>
                          </Button>
                        </div>
                      </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Regra prática: só aprovar se o conservador “fecha” e risco é aceitável.
                  </div>
                </CardContent>
              </NeonCard>

              <NeonCard variant="cyan">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">Como eu decido (rápido e claro)</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    O sistema deve explicar o porquê, não só dar um número.
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">1)</span> Mercado: demanda real vs concorrência.
                  </div>
                  <div>
                    <span className="font-medium text-foreground">2)</span> Margem: 3 cenários, conservador manda.
                  </div>
                  <div>
                    <span className="font-medium text-foreground">3)</span> Risco: marca/NCM/compliance não-negociáveis.
                  </div>

                  <div className="pt-2">
                    <Button asChild variant="outline" className="w-full ring-1 ring-cyan-400/15">
                      <Link href="/products/ranking">Abrir ranking completo</Link>
                    </Button>
                  </div>
                </CardContent>
              </NeonCard>
            </div>

            {/* Top candidates */}
            <NeonCard variant="emerald" className="bg-background/65">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Top candidatos (ranking atual)</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Use como fila de trabalho: abrir, completar dados e decidir.
                </div>
              </CardHeader>

              <CardContent>
                {top.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Sem candidatos no ranking ainda. Comece preenchendo market data e simulações.
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {top.map((p: ProductScore, idx: number) => {
                        const accent =
                            idx === 0 ? "ring-1 ring-cyan-400/15" : idx === 1 ? "ring-1 ring-fuchsia-400/12" : "ring-1 ring-emerald-400/10";

                        return (
                            <div
                                key={p.product_id}
                                className={[
                                  "rounded-md border bg-background/50 p-3 flex items-start justify-between gap-3",
                                  "transition hover:bg-background/60",
                                  accent,
                                ].join(" ")}
                            >
                              <div className="space-y-1">
                                <div className="text-sm font-medium">{p.product_name}</div>

                                <div className="text-xs text-muted-foreground">
                                  Score: {p.total_score} •{" "}
                                  <Badge
                                      variant={classificationBadgeVariant(p.classification)}
                                      className="text-[10px]"
                                  >
                                    {p.classification}
                                  </Badge>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {p.has_latest_simulation ? "Tem simulação recente" : "Sem simulação recente"}
                                  {typeof p.estimated_margin_pct === "number"
                                      ? ` • margem ~ ${p.estimated_margin_pct}%`
                                      : ""}
                                </div>
                              </div>

                              <Button asChild size="sm" variant="secondary" className="ring-1 ring-white/5">
                                <Link href={`/products/${p.product_id}/evaluation`}>Avaliar</Link>
                              </Button>
                            </div>
                        );
                      })}
                    </div>
                )}
              </CardContent>
            </NeonCard>

            <div className="text-xs text-muted-foreground">
              Dica: trate o ranking como fila. Abra, complete dados mínimos e registre a decisão.
            </div>
          </div>
        </div>
      </main>
  );
}
