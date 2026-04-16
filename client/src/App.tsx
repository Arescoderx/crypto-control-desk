import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Trading from "./pages/Trading";
import Analysis from "./pages/Analysis";
import Strategies from "./pages/Strategies";
import TradeHistory from "./pages/TradeHistory";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";
import { startBot } from "@/lib/botRunner";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

const queryClient = new QueryClient();

function App() {
  const { prices } = useCryptoPrices();

  // 🔥 BOT GLOBAL (AGORA FUNCIONA)
  useEffect(() => {
    if (!prices || Object.keys(prices).length === 0) return;

    startBot(prices);
  }, [prices]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Index />} />

            {/* APP */}
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/trading"
              element={
                <AppLayout>
                  <Trading />
                </AppLayout>
              }
            />
            <Route
              path="/analysis"
              element={
                <AppLayout>
                  <Analysis />
                </AppLayout>
              }
            />
            <Route
              path="/strategies"
              element={
                <AppLayout>
                  <Strategies />
                </AppLayout>
              }
            />
            <Route
              path="/history"
              element={
                <AppLayout>
                  <TradeHistory />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;