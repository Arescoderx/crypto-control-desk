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
import {
  resetAccount,
  updateBalance,
  clearTrades,
  exportData,
  updateCurrency,
} from "@/lib/settings";

export default function SettingsPage() {
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("USD");

  const handleSetBalance = () => {
    const value = parseFloat(balance);

    if (!value || value <= 0) {
      toast.error("Valor inválido");
      return;
    }

    updateBalance(value);
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
          <Input
            placeholder="Novo saldo"
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
        </CardContent>
      </Card>
    </div>
  );
}