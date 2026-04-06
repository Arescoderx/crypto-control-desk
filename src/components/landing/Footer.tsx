import { Bot } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container px-6">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg">CriptoBot</span>
        </div>
        <div className="max-w-xl mx-auto text-center text-xs text-muted-foreground leading-relaxed space-y-3">
          <p>
            CriptoBot é uma ferramenta de automação de estratégias. Não realizamos previsões de mercado.
          </p>
          <p>
            Todas as operações são baseadas em regras configuradas pelo usuário e dados históricos.
          </p>
          <p>
            O mercado de criptomoedas envolve riscos e pode resultar em perdas financeiras.
          </p>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} CriptoBot. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
