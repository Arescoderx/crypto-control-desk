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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing page - no sidebar */}
          <Route path="/" element={<Index />} />
          
          {/* Dashboard pages - with sidebar layout */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/trading" element={<AppLayout><Trading /></AppLayout>} />
          <Route path="/analysis" element={<AppLayout><Analysis /></AppLayout>} />
          <Route path="/strategies" element={<AppLayout><Strategies /></AppLayout>} />
          <Route path="/history" element={<AppLayout><TradeHistory /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
