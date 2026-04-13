import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const PrimaryButton = ({
  children,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
  onClick
}: {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}) => (
  <motion.button
    type={type}
    disabled={disabled}
    onClick={onClick}
    whileHover={{ scale: 1.03, y: -3, rotateX: -2 }}
    whileTap={{ scale: 0.96, y: 0 }}
    transition={{ type: 'spring', stiffness: 280, damping: 16 }}
    style={{ transformPerspective: 1200 }}
    className={`ripple-button inline-flex items-center justify-center gap-2 rounded-[22px] px-5 py-3 text-sm font-semibold transition-all duration-300 ${
      variant === 'primary'
        ? 'gradient-badge border border-white/20 text-white shadow-[var(--glow)]'
        : 'glass-panel text-[color:var(--text)] hover:shadow-[var(--shadow-soft)]'
    } ${disabled ? 'cursor-not-allowed opacity-60 saturate-75' : 'hover:-translate-y-0.5'} ${className}`}
  >
    {children}
  </motion.button>
);
