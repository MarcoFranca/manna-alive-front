// src/app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold mb-4">
            Manna Alive · Sistema de Avaliação de Produtos
          </h1>

          <p className="text-gray-600 text-sm mb-6">
            Ferramenta interna para analisar se um produto vale a pena ser
            importado pela Manna Alive, começando pela Importação Simplificada.
            Aqui você cadastra o produto, simula o custo total (regra do ×2) e
            verifica margem estimada antes de fechar com o fornecedor.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
            >
              Ver produtos cadastrados
            </Link>

            <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Abrir API (Swagger)
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Dica: use esta home como atalho. Todo o fluxo começa pela tela de
            produtos, onde você seleciona o item e roda as simulações.
          </p>
        </div>
      </main>
  );
}
