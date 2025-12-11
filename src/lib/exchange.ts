// src/lib/exchange.ts
export async function fetchUsdBrlRate(): Promise<number> {
    const res = await fetch(
        "https://economia.awesomeapi.com.br/json/last/USD-BRL"
    );

    if (!res.ok) {
        throw new Error("Erro ao consultar câmbio USD/BRL");
    }

    const data = await res.json();
    const bid = parseFloat(data.USDBRL?.bid);
    if (!bid || Number.isNaN(bid)) {
        throw new Error("Resposta de câmbio inválida");
    }

    return bid;
}
