import React from 'react';
import { ChevronDown, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Drawer } from 'vaul';
import { motion } from 'framer-motion';

export default function NowPlaying() {
  const { currentTrack, isPlaying, togglePlay, progress, duration, setProgress, setSeekTo, isNowPlayingFullscreen, setIsNowPlayingFullscreen } = usePlayerStore();

  const progressPercent = duration ? (progress / duration) * 100 : 0;
  
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <Drawer.Root 
      open={isNowPlayingFullscreen} 
      onOpenChange={setIsNowPlayingFullscreen}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" />
        <Drawer.Content className="bg-[var(--color-surface-0)] flex flex-col rounded-t-[32px] h-[95vh] fixed bottom-0 left-0 right-0 z-50 text-[var(--color-text-primary)] outline-none">
          
          {/* Draggable Handle */}
          <div className="p-4 rounded-t-[32px] flex-shrink-0 flex items-center justify-center">
            <div className="w-12 h-1.5 rounded-full bg-[var(--color-text-secondary)]/30" />
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-12 overflow-y-auto hide-scrollbar">
            {/* Blurred Background inside the drawer for a glass effect */}
            <div 
              className="absolute inset-0 z-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `url(${currentTrack.coverArt})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px)',
              }}
            />

            {/* Top Bar (Optional, can just be the handle, but let's keep the chevron for explicit tap) */}
            <div className="absolute top-0 left-0 w-full px-6 py-2 flex justify-between items-center z-10">
              <button onClick={() => setIsNowPlayingFullscreen(false)} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer text-[var(--color-text-secondary)]">
                <ChevronDown size={28} />
              </button>
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)]">Now Playing</span>
              <div className="w-10" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md flex flex-col items-center mt-10">
              
              {/* Album Art with Vinyl Spin when playing */}
              <motion.div 
                layoutId="now-playing-art"
                className={`w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] mb-10 rounded-2xl shadow-2xl overflow-hidden ${isPlaying ? 'vinyl-spin rounded-full' : ''}`} 
                style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
              >
                <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
              </motion.div>

              {/* Metadata */}
              <div className="text-center w-full mb-8">
                <h2 className="text-[28px] sm:text-[36px] font-display font-bold tracking-tight mb-2 text-ellipsis-1">{currentTrack.title}</h2>
                <p className="text-[18px] sm:text-[20px] text-[var(--color-text-secondary)] text-ellipsis-1">{currentTrack.artist}</p>
              </div>

              {/* Scrubber */}
              <div className="w-full mb-8 relative group">
                <div className="w-full h-[6px] bg-[rgba(255,255,255,0.1)] rounded-full relative pointer-events-none overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-[var(--color-text-primary)] rounded-full transition-all duration-100 ease-linear" style={{ width: `${progressPercent}%` }} />
                </div>
                <input 
                  type="range" 
                  min="0" max={duration || 100} step="0.1" 
                  value={progress || 0}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setProgress(newTime);
                    setSeekTo(newTime);
                  }}
                  className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-[32px] opacity-0 cursor-pointer m-0 z-50"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mt-3 font-mono pointer-events-none">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between w-full px-2">
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={() => usePlayerStore.getState().toggleShuffle()}
                  className={`p-2 transition-colors cursor-pointer ${usePlayerStore.getState().isShuffle ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  <Shuffle size={24} />
                </motion.button>
                
                <div className="flex items-center gap-6 sm:gap-8">
                  <motion.button whileTap={{ scale: 0.8 }} className="text-[var(--color-text-primary)] hover:text-white transition-colors cursor-pointer" onClick={() => usePlayerStore.getState().prevTrack()}>
                    <SkipBack size={32} fill="currentColor" />
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay} 
                    className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface-0)] hover:scale-105 transition-transform cursor-pointer shadow-xl"
                  >
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.8 }} className="text-[var(--color-text-primary)] hover:text-white transition-colors cursor-pointer" onClick={() => usePlayerStore.getState().nextTrack()}>
                    <SkipForward size={32} fill="currentColor" />
                  </motion.button>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={() => usePlayerStore.getState().toggleRepeat()}
                  className={`p-2 relative transition-colors cursor-pointer ${usePlayerStore.getState().repeatMode !== 'off' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  <Repeat size={24} />
                  {usePlayerStore.getState().repeatMode === 'one' && <span className="absolute top-1 right-1 text-[8px] font-bold text-[var(--color-surface-0)] bg-[var(--color-accent)] rounded-full w-3 h-3 flex items-center justify-center">1</span>}
                </motion.button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
