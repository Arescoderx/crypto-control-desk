import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Key, Bell, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie suas preferências e API keys</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Key className="h-4 w-4 text-primary" />API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Exchange</label>
            <Select defaultValue="binance">
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="bybit">Bybit</SelectItem>
                <SelectItem value="kucoin">KuCoin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">API Key</label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Cole sua API key" className="bg-secondary border-border font-mono" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">API Secret</label>
            <Input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="Cole sua API secret" className="bg-secondary border-border font-mono" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary p-3 rounded-lg">
            <Shield className="h-4 w-4 text-warning shrink-0" />
            <span>Suas chaves são armazenadas de forma segura e nunca compartilhadas.</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-primary" />Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notificações push</p>
              <p className="text-xs text-muted-foreground">Receba alertas no navegador</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alertas de trades</p>
              <p className="text-xs text-muted-foreground">Aviso a cada operação executada</p>
            </div>
            <Switch checked={tradeAlerts} onCheckedChange={setTradeAlerts} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4 text-primary" />Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Moeda de referência</label>
            <Select defaultValue="usd">
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="brl">BRL</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Fuso horário</label>
            <Select defaultValue="brt">
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brt">Brasília (BRT)</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">EST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">Salvar Configurações</Button>
    </div>
  );
}
