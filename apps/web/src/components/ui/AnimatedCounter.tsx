import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export const AnimatedCounter = ({
  value,
  suffix = '',
  className = ''
}: {
  value: number;
  suffix?: string;
  className?: string;
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.6, ease: 'easeOut' });
    return () => controls.stop();
  }, [count, value]);

  return (
    <motion.span className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  );
};
