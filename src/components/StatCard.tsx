import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'profit' | 'loss' | 'neutral';
  icon: LucideIcon;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{title}</span>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold font-display">{value}</p>
          {change && (
            <span className={`text-xs font-mono ${changeType === 'profit' ? 'text-profit' : changeType === 'loss' ? 'text-loss' : 'text-muted-foreground'}`}>
              {change}
            </span>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
