import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle } from "lucide-react";

const ResultsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-surface">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Resultados</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">
            Veja como as estratégias se comportaram <span className="text-gradient">no passado</span>
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Antes de ativar, você pode analisar o desempenho histórico das estratégias e entender como elas reagiram em diferentes cenários de mercado.
          </p>

          {/* Simulated chart area */}
          <div className="rounded-xl border border-border bg-card p-8 glow-box mb-8">
            <div className="flex items-center gap-2 mb-6 justify-center text-primary">
              <TrendingUp className="w-5 h-5" />
              <span className="font-display font-semibold">Backtesting de Estratégia</span>
            </div>
            <div className="h-48 flex items-end justify-center gap-2">
              {[35, 50, 42, 65, 58, 72, 68, 80, 75, 88, 82, 95].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="w-6 md:w-8 rounded-t bg-gradient-to-t from-primary/40 to-primary/80"
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-muted-foreground font-mono">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dez</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Resultados passados não garantem resultados futuros.
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ResultsSection;
