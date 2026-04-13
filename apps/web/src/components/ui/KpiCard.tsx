import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const KpiCard = ({
  title,
  value,
  subtitle,
  accent,
  children
}: {
  title: string;
  value: ReactNode;
  subtitle: string;
  accent: string;
  children?: ReactNode;
}) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02, rotateX: -2, rotateY: 2 }}
    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    style={{ transformPerspective: 1200 }}
    className="glass-panel interactive-card floating-card rounded-[30px] p-5 md:p-6"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[color:var(--muted)]">{title}</p>
        <div className={`mt-4 text-3xl font-semibold tracking-tight md:text-4xl ${accent}`}>{value}</div>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(56,189,248,0.16))] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_24px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(56,189,248,0.18))]">
        <div className="h-7 w-7 rounded-full bg-[image:var(--accent)] shadow-[var(--glow)]" />
      </div>
    </div>
    <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{subtitle}</p>
    {children ? <div className="mt-4">{children}</div> : null}
  </motion.div>
);
