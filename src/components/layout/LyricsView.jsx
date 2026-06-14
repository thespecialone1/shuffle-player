import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import Lyrics from './Lyrics';

export default function LyricsView() {
  const { isLyricsOpen, currentTrack } = usePlayerStore(useShallow(state => ({ isLyricsOpen: state.isLyricsOpen, currentTrack: state.currentTrack })));

  if (!isLyricsOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-30 flex bg-black/40 backdrop-blur-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface-0)' }}
      >
        {/* Background color bleed */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none" 
          style={{ 
            background: `radial-gradient(circle at center, var(--art-color) 0%, transparent 70%)`,
            filter: 'blur(100px)' 
          }} 
        />

        {/* Full width Lyrics Container */}
        <div className="w-full h-full relative z-10 flex items-center justify-center">
          <Lyrics />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
