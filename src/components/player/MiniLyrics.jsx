import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function MiniLyrics() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const progress = usePlayerStore(state => state.progress);
  const lyricsCache = usePlayerStore(state => state.lyricsCache);
  const [activeLine, setActiveLine] = useState('');

  useEffect(() => {
    if (!currentTrack) {
      setActiveLine('');
      return;
    }

    const key = `${currentTrack.artist}-${currentTrack.title}`;
    const lyricsData = lyricsCache[key];

    if (!lyricsData || !lyricsData.synced) {
      setActiveLine('');
      return;
    }

    let foundLine = '';
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (progress >= lyricsData.lines[i].time) {
        foundLine = lyricsData.lines[i].text;
      } else {
        break;
      }
    }

    setActiveLine(foundLine);
  }, [currentTrack, progress, lyricsCache]);

  if (!activeLine) return null;

  return (
    <div className="w-full flex-shrink-0 flex items-center justify-center py-2 px-4 bg-transparent min-h-[48px] border-t border-[rgba(255,255,255,0.05)]">
      <div className="w-full h-full flex justify-center items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLine}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-[16px] sm:text-[17px] font-display font-extrabold text-[var(--color-text-primary)] text-center drop-shadow-lg px-2 leading-tight"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {activeLine}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
