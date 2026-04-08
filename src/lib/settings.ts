const STORAGE_KEY = "crypto-db";

export function resetAccount() {
  const defaultData = {
    wallet: {
      balance: 100000,
      currency: "USD",
    },
    holdings: [],
    trades: [],
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
}

export function updateBalance(newBalance: number) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  data.wallet = data.wallet || {};
  data.wallet.balance = newBalance;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateCurrency(currency: "USD" | "BRL") {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  data.wallet = data.wallet || {};
  data.wallet.currency = currency;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearTrades() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  data.trades = [];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const trades = data.trades || [];

  if (trades.length === 0) {
    alert("Nenhum trade para exportar");
    return;
  }

  const headers = [
    "Data",
    "Ativo",
    "Tipo",
    "Preço",
    "Quantidade",
    "Total",
    "P&L",
    "Status",
  ];

  const rows = trades.map((t: any) => [
    new Date(t.date).toLocaleString("pt-BR"),
    t.symbol,
    t.type === "buy" ? "Compra" : "Venda",
    t.price,
    t.amount,
    t.total,
    t.pnl ?? "",
    t.status || "completed",
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.join(";"))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "trades.csv";
  a.click();
}