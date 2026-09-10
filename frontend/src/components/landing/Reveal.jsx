import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Reveal - wraps children with a scroll-triggered fade+slide animation.
 * Respects prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  direction = 'up', // 'up' | 'left' | 'right' | 'none'
  className = '',
  once = true,
  ...rest
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once]);

  const directionMap = {
    up: { y: 32, x: 0 },
    left: { y: 0, x: -32 },
    right: { y: 0, x: 32 },
    none: { y: 0, x: 0 },
  };

  const { x, y } = directionMap[direction] || directionMap.up;

  if (reducedMotion) {
    return (
      <div ref={ref} className={className} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y, x }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
