import { motion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Trader intermediário",
    quote: "O que mais gostei foi a transparência. Não tem promessa milagrosa, só execução bem feita.",
  },
  {
    name: "Fernanda R.",
    role: "Investidora",
    quote: "Consigo deixar rodando sem precisar acompanhar o tempo todo. Me dá mais controle.",
  },
  {
    name: "Lucas T.",
    role: "Iniciante em cripto",
    quote: "Os presets ajudam muito quem não sabe por onde começar.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Depoimentos</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            O que nossos usuários <span className="text-gradient">dizem</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <MessageSquareQuote className="w-8 h-8 text-primary/40 mb-4" />
              <p className="text-sm text-secondary-foreground mb-6 leading-relaxed italic">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
