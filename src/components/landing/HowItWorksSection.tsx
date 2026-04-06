import { motion } from "framer-motion";
import { Link2, Layers, Play, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Conecte sua exchange",
    desc: "Integração simples via API com plataformas como Binance",
  },
  {
    icon: Layers,
    title: "Escolha um preset",
    desc: "Selecione estratégias pré-configuradas com base em dados históricos",
  },
  {
    icon: Play,
    title: "Ative o bot",
    desc: "Ele executa automaticamente compra, venda ou espera",
  },
  {
    icon: BarChart3,
    title: "Acompanhe os resultados",
    desc: "Visualize todas as operações com transparência",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 md:py-32 bg-surface">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Como funciona</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            Automação inteligente, <span className="text-gradient">sob seu controle</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">Passo {i + 1}</span>
                <h3 className="text-lg font-semibold mt-1 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
