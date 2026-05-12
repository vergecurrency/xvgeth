import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  delay?: number;
};

export function MetricCard({ icon, title, value, subtitle, delay = 0 }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay } }}>
      <Card className="overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,var(--farm-grid-line-strong),transparent)] before:content-['']">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base uppercase tracking-[0.18em] text-slate-300">
            <span className="farm-metric-icon inline-flex h-10 w-10 items-center justify-center rounded-2xl">
              {icon}
            </span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight sm:text-[2rem]">{value}</div>
          <div className="mt-2 text-sm text-slate-300/90">{subtitle}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
