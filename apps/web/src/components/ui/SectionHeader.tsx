export const SectionHeader = ({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <div className="space-y-3">
    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 shadow-[0_10px_22px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-white/5">
      <span className="h-2.5 w-2.5 rounded-full bg-[image:var(--accent)] shadow-[var(--glow)]" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-300">{eyebrow}</p>
    </div>
    <h2 className="max-w-4xl font-['Poppins',sans-serif] text-3xl font-semibold tracking-[-0.04em] text-[color:var(--text)] md:text-5xl">{title}</h2>
    {description ? <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)] md:text-base">{description}</p> : null}
  </div>
);
