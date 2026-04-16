import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const highlights = [
  'Sem "achismo" ou sinais mágicos',
  "Estratégias testadas com dados históricos",
  "Controle total do usuário",
  "Transparência nas operações",
];

const DifferentialSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Diferencial</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">
              Sem promessas. Apenas execução <span className="text-gradient">baseada em dados.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              O CriptoBot não tenta prever o mercado. Ele executa estratégias baseadas em condições previamente definidas e histórico validado.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DifferentialSection;
