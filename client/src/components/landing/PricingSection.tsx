import { motion } from "framer-motion";
import { Zap, CheckCircle2 } from "lucide-react";

const PricingSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto text-center"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Modelo de cobrança</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Alinhado com seus <span className="text-gradient">resultados</span>
          </h2>
          <p className="text-muted-foreground mb-10">Você só paga quando o bot performa.</p>

          <div className="rounded-xl border border-primary/20 bg-card p-8 glow-box">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-4">
              {[
                "Comissão sobre lucro gerado",
                "Sem mensalidade fixa (fase MVP)",
                "Transparência total na cobrança",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
