import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coins } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const coinsInfo = coins
      .map(
        (c: { symbol: string; price: number; change24h: number }) =>
          `${c.symbol}: $${c.price.toFixed(2)} (variação 24h: ${c.change24h >= 0 ? "+" : ""}${c.change24h.toFixed(2)}%)`
      )
      .join("\n");

    const systemPrompt = `Você é um analista de mercado de criptomoedas experiente. 
Analise os dados fornecidos e forneça insights úteis em português brasileiro.
Seja direto, use dados concretos, e NUNCA faça promessas de lucro ou previsões garantidas.
Sempre inclua o aviso: "Esta análise é meramente informativa e não constitui recomendação de investimento."
Formate a resposta em markdown com seções claras.`;

    const userPrompt = `Analise o mercado atual de criptomoedas com base nos seguintes preços em tempo real:

${coinsInfo}

Forneça:
1. **Resumo do Mercado** - Visão geral do momento atual
2. **Destaques** - Moedas com movimentações interessantes
3. **Tendências** - O que os dados sugerem sobre o curto prazo
4. **Pontos de Atenção** - Riscos e cuidados

Lembre-se: baseie-se apenas nos dados fornecidos, sem inventar informações.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com a IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("market-analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
