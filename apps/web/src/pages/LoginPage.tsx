import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/authSlice';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { pushToast } from '../components/ui/ToastViewport';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const redirectByRole = (role: string) => {
  if (role === 'ADMIN') return '/app';
  if (role === 'NGO') return '/app/ngo';
  if (role === 'DONOR') return '/app/donations';
  if (role === 'VOLUNTEER') return '/app/driver';
  return '/app';
};

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const validation = useMemo(() => {
    if (!email) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address.';
    if (password.length < 10) return 'Password must be at least 10 characters.';
    return null;
  }, [email, password]);

  useEffect(() => {
    if (user) {
      const destination = (location.state as { from?: string } | null)?.from ?? redirectByRole(user.role);
      navigate(destination, { replace: true });
      pushToast('Welcome back. You are securely signed in.', 'success');
    }
  }, [location.state, navigate, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (validation) {
      pushToast(validation, 'error');
      return;
    }

    const result = await dispatch(login({ email, password, rememberMe }));
    if (login.rejected.match(result)) {
      pushToast(result.payload ?? 'Login failed.', 'error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 md:px-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr,0.92fr]">
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className="floating-card relative overflow-hidden rounded-[40px] border border-white/50 bg-[linear-gradient(145deg,rgba(255,251,247,0.98),rgba(245,248,255,0.96)_38%,rgba(236,253,245,0.94)_70%,rgba(255,237,213,0.98))] p-8 shadow-[var(--shadow-deep)] dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(8,17,31,0.98),rgba(15,23,42,0.94)_44%,rgba(13,148,136,0.2)_78%,rgba(251,113,133,0.08))] md:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_24%),linear-gradient(transparent_96%,rgba(148,163,184,0.08)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_24%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-10" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/78 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-white/5 dark:text-emerald-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[image:var(--accent)]" />
              Secure access
            </p>
            <h1 className="mt-5 max-w-2xl font-['Poppins',sans-serif] text-4xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-slate-50 md:text-6xl">
              Beautiful operations begin with trusted access.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-700 dark:text-slate-300">
              Log in to manage donations, dispatch faster, monitor fraud, and keep every rescue action accountable.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="floating-card rounded-[28px] border border-white/55 bg-white/74 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Short-lived access token</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">15 min</p>
            </div>
            <div className="floating-card rounded-[28px] border border-white/55 bg-white/74 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Idle timeout</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">30 min</p>
            </div>
            <div className="floating-card rounded-[28px] border border-white/55 bg-white/74 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Role-aware entry</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">Instant</p>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.08, type: 'spring', stiffness: 140, damping: 18 }} className="glass-panel-strong floating-card rounded-[40px] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-300">Login</p>
              <h2 className="mt-2 font-['Poppins',sans-serif] text-3xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">Welcome back</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm text-[color:var(--muted)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="theme-input mt-2 w-full rounded-[26px] px-4 py-4 text-base outline-none ring-0 transition-all"
              />
            </label>
            <label className="block">
              <span className="text-sm text-[color:var(--muted)]">Password</span>
              <div className="theme-input mt-2 flex items-center rounded-[26px] px-4 py-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent py-2 text-base text-[color:var(--text)] outline-none"
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-sm font-medium text-[color:var(--muted)]">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-[color:var(--muted)]">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-500" />
                Remember me
              </label>
              <a href="#" className="font-medium text-emerald-600 dark:text-emerald-300">Forgot password?</a>
            </div>

            {validation ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">{validation}</div> : null}
            {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</div> : null}

            <PrimaryButton className="w-full justify-center" type="submit" disabled={Boolean(validation) || isLoading}>
              {isLoading ? 'Signing you in...' : 'Login securely'}
            </PrimaryButton>
          </form>

          <div className="mt-5">
            <button className="soft-chip w-full rounded-[26px] px-4 py-4 text-sm font-semibold text-[color:var(--text)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
            New here? <Link to="/app/donations" className="font-semibold text-emerald-600 dark:text-emerald-300">Explore the platform</Link>
          </p>
        </motion.section>
      </div>
    </div>
  );
};
