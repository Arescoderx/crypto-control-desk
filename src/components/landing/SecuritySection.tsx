import { motion } from "framer-motion";
import { Shield, Key, User, Lock } from "lucide-react";

const points = [
  { icon: Key, text: "Conexão via API (sem acesso direto aos seus fundos)" },
  { icon: Shield, text: "Permissões configuráveis" },
  { icon: User, text: "Você mantém controle total da conta" },
  { icon: Lock, text: "Dados protegidos e criptografados" },
];

const SecuritySection = () => {
  return (
    <section className="py-24 md:py-32 bg-surface">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Segurança</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            Segurança em <span className="text-gradient">primeiro lugar</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{p.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
