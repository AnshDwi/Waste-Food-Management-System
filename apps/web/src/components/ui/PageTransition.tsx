import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 18, scale: 0.985, filter: 'blur(8px)' }}
    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -10, scale: 0.985, filter: 'blur(8px)' }}
    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);
