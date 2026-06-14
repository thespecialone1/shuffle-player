import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/usePlayerStore';
import { fetchLyrics } from '../../lib/api';

export default function Lyrics({ compact = false }) {
  const { currentTrack, progress, lyricsCache, setLyricsCache } = usePlayerStore();
  const [lyricsData, setLyricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  useEffect(() => {
    if (!currentTrack) return;
    const key = `${currentTrack.artist}-${currentTrack.title}`;
    
    if (lyricsCache[key]) {
      setLyricsData(lyricsCache[key]);
      setError(false);
      return;
    }

    const loadLyrics = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchLyrics(currentTrack.artist, currentTrack.title);
        if (data && data.syncedLyrics) {
          // Parse synced lyrics
          const lines = data.syncedLyrics.split('\n').map(line => {
            const match = line.match(/^\[(\d{2,}):(\d{2}\.\d+)\](.*)/);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseFloat(match[2]);
              const time = minutes * 60 + seconds;
              const text = match[3].trim();
              return { time, text };
            }
            return null;
          }).filter(l => l !== null);
          
          const parsedData = { synced: true, lines };
          setLyricsCache(key, parsedData);
          setLyricsData(parsedData);
        } else if (data && data.plainLyrics) {
          // Fallback to plain lyrics
          const parsedData = { synced: false, lines: data.plainLyrics.split('\n').filter(l => l.trim() !== '') };
          setLyricsCache(key, parsedData);
          setLyricsData(parsedData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadLyrics();
  }, [currentTrack, lyricsCache, setLyricsCache]);

  if (!currentTrack) return null;

  // Determine active line index
  let activeIndex = -1;
  if (lyricsData?.synced) {
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (progress >= lyricsData.lines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, lyricsData]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full w-full ${compact ? 'py-12' : ''}`}>
        <div className="w-8 h-8 border-4 border-[var(--color-text-secondary)] border-t-[var(--art-color)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !lyricsData) {
    return (
      <div className={`flex flex-col items-center justify-center h-full w-full text-[var(--color-text-secondary)] ${compact ? 'py-12' : ''}`}>
        <p className="text-lg font-medium">No lyrics found for this song.</p>
        <p className="text-sm opacity-50 mt-2">Instrumental or unreleased</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-y-auto hide-scrollbar scroll-smooth ${compact ? 'px-6 py-8' : 'px-8 sm:px-16 py-24 sm:py-32'}`}
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
      }}
    >
      <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto pb-[50vh]">
        {lyricsData.synced ? (
          lyricsData.lines.map((line, index) => {
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;
            return (
              <motion.div
                key={index}
                ref={isActive ? activeLineRef : null}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isActive ? 1 : (isPassed ? 0.3 : 0.5), y: 0, scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
                className={`${compact ? 'text-[18px] sm:text-[22px]' : 'text-[24px] sm:text-[40px] md:text-[48px]'} font-bold font-display leading-tight transition-all duration-300 origin-left cursor-pointer hover:opacity-100 ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)] mix-blend-overlay'}`}
                onClick={() => usePlayerStore.getState().setSeekTo(line.time)}
              >
                {line.text}
              </motion.div>
            );
          })
        ) : (
          <div className="text-[20px] sm:text-[32px] font-bold font-display leading-relaxed text-[var(--color-text-primary)]">
            {lyricsData.lines.map((line, index) => (
              <p key={index} className="mb-4">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
