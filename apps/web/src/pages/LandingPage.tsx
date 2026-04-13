import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const stats = [
  { label: 'Meals saved', value: 54600, suffix: '+' },
  { label: 'NGOs helped', value: 124, suffix: '' },
  { label: 'Cities active', value: 18, suffix: '' }
];

export const LandingPage = () => (
  <div className="min-h-screen overflow-hidden px-4 pb-12 pt-4 md:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="glass-panel-strong sticky top-4 z-30 flex items-center justify-between rounded-[30px] px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-300">Waste Food Management</p>
          <h1 className="mt-1 text-lg font-semibold md:text-xl">Save Food. Save Lives.</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/app">
            <PrimaryButton>Open Platform</PrimaryButton>
          </Link>
        </div>
      </header>

      <section className="relative mt-6 overflow-hidden rounded-[36px] px-6 py-10 md:px-10 md:py-16">
        <div className="hero-glow absolute inset-0 rounded-[36px]" />
        <div className="grid-noise absolute inset-0 rounded-[36px] opacity-70" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-200">
                Emotion-led operations for real-world impact
              </p>
              <h2 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-7xl">
                Rescue surplus food with the calm precision of a world-class product.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700/85 dark:text-slate-200 md:text-lg">
                A premium operating system for donors, NGOs, volunteers, and enterprise teams. One-click donations, intelligent routing, live maps, and beautiful reporting in a single seamless experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/app/donations">
                <PrimaryButton className="w-full sm:w-auto">Donate now</PrimaryButton>
              </Link>
              <a href="#impact">
                <PrimaryButton className="w-full sm:w-auto" variant="secondary">See the impact</PrimaryButton>
              </a>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 + index * 0.08 }}
                  className="glass-panel rounded-[28px] p-5"
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white" />
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-panel-strong rounded-[34px] p-5"
          >
            <div className="rounded-[30px] bg-slate-950 p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Live rescue board</p>
                  <h3 className="mt-2 text-2xl font-semibold">Today's city pulse</h3>
                </div>
                <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">Realtime</div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Near-expiry batches</p>
                  <p className="mt-3 text-3xl font-semibold">08</p>
                </div>
                <div className="rounded-[26px] bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Drivers in motion</p>
                  <p className="mt-3 text-3xl font-semibold">42</p>
                </div>
                <div className="rounded-[26px] bg-gradient-to-r from-green-500/20 to-teal-500/20 p-4 sm:col-span-2">
                  <p className="text-sm text-emerald-100">Auto-match confidence</p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: '86%' }} transition={{ duration: 1.1, delay: 0.4 }} className="h-full rounded-full bg-gradient-to-r from-green-400 to-teal-300" />
                  </div>
                  <p className="mt-3 text-sm text-slate-200">The system has already suggested the fastest NGO routes for the next 12 pickups.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="impact" className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="glass-panel interactive-card rounded-[32px] p-6 lg:col-span-2">
          <SectionHeader
            eyebrow="Why it feels different"
            title="Designed like a beloved consumer app, built for critical operations."
            description="Generous spacing, soft glass surfaces, thumb-friendly flows, contextual automation, and motion that guides attention without noise."
          />
        </div>
        <div className="glass-panel interactive-card rounded-[32px] p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">Friction reduced</p>
          <p className="mt-4 text-4xl font-semibold">1 tap</p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">One-click donation shortcuts, smart autofill, drag-and-drop uploads, and voice capture keep the experience fast under pressure.</p>
        </div>
      </section>
    </div>
  </div>
);
