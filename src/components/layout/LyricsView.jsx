import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/usePlayerStore';
import Lyrics from './Lyrics';

export default function LyricsView() {
  const { isLyricsOpen, currentTrack } = usePlayerStore();

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

        {/* Left side: Song Details */}
        <div className="w-1/3 min-w-[300px] h-full flex flex-col justify-center items-end p-12 lg:p-24 relative z-10">
          <div className="w-full max-w-[400px]">
            <motion.img 
              layoutId="lyrics-art"
              src={currentTrack?.coverArt} 
              alt={currentTrack?.title} 
              className="w-full aspect-square object-cover rounded-xl shadow-2xl mb-8"
            />
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">{currentTrack?.title}</h1>
            <p className="text-xl lg:text-2xl text-white/60">{currentTrack?.artist}</p>
          </div>
        </div>

        {/* Right side: Lyrics Container */}
        <div className="flex-1 h-full relative z-10">
          <Lyrics />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
