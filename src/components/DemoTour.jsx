import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoTour() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="bg-[var(--color-surface-2)]/90 backdrop-blur-md border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] px-4 py-2 rounded-full shadow-lg font-display text-sm font-medium">
            <span className="text-[var(--color-accent)] font-bold mr-2">DEMO MODE</span>
            Explore the interface
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
