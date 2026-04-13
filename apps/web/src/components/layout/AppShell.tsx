import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { ThemeToggle } from '../ui/ThemeToggle';
import { pushToast } from '../ui/ToastViewport';
import type { AuthRole } from '../../features/auth/authTypes';

type NavItem = {
  label: string;
  href: string;
  roles: AuthRole[];
};

const adminDesktopNav: NavItem[] = [
  { label: 'Dashboard', href: '/app', roles: ['ADMIN'] },
  { label: 'Donations', href: '/app/donations', roles: ['ADMIN'] },
  { label: 'Deliveries', href: '/app/deliveries', roles: ['ADMIN'] },
  { label: 'NGOs', href: '/app/ngo', roles: ['ADMIN'] },
  { label: 'Drivers', href: '/app/drivers', roles: ['ADMIN'] },
  { label: 'Map', href: '/app/map', roles: ['ADMIN'] },
  { label: 'Analytics', href: '/app/analytics', roles: ['ADMIN'] },
  { label: 'Control Room', href: '/app/control-room', roles: ['ADMIN'] },
  { label: 'Admin', href: '/app/admin', roles: ['ADMIN'] }
];

const driverMobileNav: NavItem[] = [
  { label: 'Home', href: '/app', roles: ['VOLUNTEER'] },
  { label: 'Map', href: '/app/map', roles: ['VOLUNTEER'] },
  { label: 'Current Run', href: '/app/driver', roles: ['VOLUNTEER'] }
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  return <AppShellLayout>{children}</AppShellLayout>;
};

const AppShellLayout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    pushToast('You have been logged out securely.', 'success');
    navigate('/login', { replace: true });
  };

  const currentRole: AuthRole = user?.role ?? 'DONOR';
  const isAdmin = currentRole === 'ADMIN';
  const isDriver = currentRole === 'VOLUNTEER';
  const allowedDesktopNav = adminDesktopNav.filter((item) => item.roles.includes(currentRole));
  const allowedMobileNav = driverMobileNav.filter((item) => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen px-4 pb-24 pt-4 text-[color:var(--text)] md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        
        {/* HEADER */}
        <header className="glass-panel-strong floating-card mb-6 flex items-center justify-between rounded-[34px] px-5 py-4 md:px-7 md:py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-emerald-500 dark:text-emerald-300">
              Waste Food ERP
            </p>
            <h1 className="mt-2 font-['Poppins',sans-serif] text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)] md:text-[2.1rem]">
              {isAdmin ? 'Control rescue operations with full visibility.' : 'Execute deliveries with speed and clarity.'}
            </h1>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="soft-chip rounded-full px-4 py-2.5 text-sm font-medium text-[color:var(--text)]">
              {isAdmin ? `${user?.name ?? 'Admin'}, you are coordinating the citywide rescue grid` : `${user?.name ?? 'Driver'}, your current route is live`}
            </div>

            <button
              onClick={handleLogout}
              className="soft-chip rounded-full px-4 py-2.5 text-sm font-semibold text-[color:var(--text)] transition hover:scale-105"
            >
              Logout
            </button>

            <ThemeToggle />
          </div>

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={handleLogout}
              className="soft-chip rounded-full px-3 py-2 text-xs font-semibold text-[color:var(--text)]"
            >
              Logout
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className={`grid gap-6 ${isAdmin ? 'lg:grid-cols-[260px,minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)]'}`}>
          
          {/* SIDEBAR */}
          <aside className={`hidden lg:block ${isAdmin ? '' : 'hidden'}`}>
            <div className="glass-panel-strong floating-card sticky top-6 rounded-[32px] p-5">
              
              <div className="hero-glow rounded-[28px] p-5 shadow-[var(--shadow-soft)]">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500 dark:text-slate-300">
                  {isAdmin ? 'Operations OS' : 'Driver mode'}
                </p>
                <h2 className="mt-2 font-['Poppins',sans-serif] text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-[color:var(--text)]">
                  {isAdmin ? 'Beautifully efficient rescue logistics.' : 'Minimal tools for field execution.'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  {isAdmin ? 'Track donations, assign NGOs, manage urgency, and celebrate impact.' : 'See the run, update status, and keep location synced in real time.'}
                </p>
              </div>

              <nav className="mt-5 space-y-2">
                {allowedDesktopNav.map(({ label, href }) => (
                  <NavLink key={href} to={href}>
                    {({ isActive }) => (
                      <motion.div
                        whileHover={{ x: 6, scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        className={`rounded-[22px] px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? 'bg-[image:var(--accent)] text-white shadow-[var(--glow)]'
                            : 'soft-chip text-[color:var(--muted)] hover:text-[color:var(--text)]'
                        }`}
                      >
                        {label}
                      </motion.div>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* MOBILE NAVBAR */}
      <nav className={`glass-panel-strong floating-card fixed inset-x-3 bottom-3 z-40 items-center justify-between rounded-[28px] px-3 py-3 lg:hidden ${isDriver ? 'flex' : 'hidden'}`}>
        {allowedMobileNav.map(({ label, href }) => (
          <NavLink key={href} to={href} className="flex-1">
            {({ isActive }) => (
              <div
                className={`mx-1 rounded-[20px] px-3 py-3 text-center text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[image:var(--accent)] text-white shadow-[var(--glow)]'
                    : 'soft-chip text-[color:var(--muted)]'
                }`}
              >
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
