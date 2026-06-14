import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function MiniLyrics() {
  const { currentTrack, progress, lyricsCache } = usePlayerStore();
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
    <div className="w-full flex justify-center pb-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLine}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-[14px] sm:text-[15px] font-medium text-[var(--color-text-primary)] text-center drop-shadow-md px-4 truncate max-w-full"
        >
          {activeLine}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
