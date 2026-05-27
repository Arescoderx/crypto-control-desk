import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { getDB } from "@/lib/db";
import { convertToUsd, formatMoney, getCurrency, getCurrencyLabel } from "@/lib/currency";
import {
  resetAccount,
  updateBalance,
  clearTrades,
  clearSignals,
  exportData,
  exportJson,
  importJson,
  updateCurrency,
} from "@/lib/settings";

export default function SettingsPage() {
  const initialDB = getDB();
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState<"USD" | "BRL">(getCurrency(initialDB));
  const [currentBalance, setCurrentBalance] = useState(initialDB.wallet.balance);
  const [jsonText, setJsonText] = useState("");

  const handleSetBalance = () => {
    const value = parseFloat(balance);

    if (!value || value <= 0) {
      toast.error("Valor inválido");
      return;
    }

    updateBalance(convertToUsd(value, currency));
    setCurrentBalance(convertToUsd(value, currency));
    toast.success("Saldo atualizado!");
    setBalance("");
  };

  const handleCurrencyChange = (value: "USD" | "BRL") => {
    setCurrency(value);
    updateCurrency(value);
    toast.success("Moeda atualizada!");
  };

  const handleReset = () => {
    resetAccount();
    toast.success("Conta resetada!");
  };

  const handleClearTrades = () => {
    clearTrades();
    toast.success("Histórico apagado!");
  };

  const handleExport = () => {
    exportData();
    toast.success("CSV exportado!");
  };

  const handleExportJson = () => {
    exportJson();
    toast.success("JSON exportado!");
  };

  const handleImportJson = () => {
    try {
      importJson(jsonText);
      const db = getDB();
      setCurrency(getCurrency(db));
      setCurrentBalance(db.wallet.balance);
      setJsonText("");
      toast.success("JSON importado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "JSON invalido");
    }
  };

  const handleClearSignals = () => {
    clearSignals();
    toast.success("Sinais apagados!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie seu sistema
        </p>
      </div>

      {/* 💰 SALDO */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Saldo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Saldo atual: {formatMoney(currentBalance, currency)}
          </p>
          <Input
            placeholder={`Novo saldo em ${getCurrencyLabel(currency)}`}
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          <Button onClick={handleSetBalance} className="w-full">
            Atualizar saldo
          </Button>
        </CardContent>
      </Card>

      {/* 💱 MOEDA */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Moeda</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="BRL">BRL (R$)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ⚙️ AÇÕES */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="destructive"
            onClick={handleReset}
            className="w-full"
          >
            Resetar conta
          </Button>

          <Button
            variant="outline"
            onClick={handleClearTrades}
            className="w-full"
          >
            Limpar histórico
          </Button>

          <Button
            variant="secondary"
            onClick={handleExport}
            className="w-full"
          >
            Exportar CSV
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportJson}
            className="w-full"
          >
            Exportar JSON
          </Button>

          <Button
            variant="outline"
            onClick={handleClearSignals}
            className="w-full"
          >
            Limpar sinais
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Importar JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Cole aqui o JSON exportado pelo sistema"
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
          />
          <Button
            onClick={handleImportJson}
            className="w-full"
            disabled={!jsonText.trim()}
          >
            Importar JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
