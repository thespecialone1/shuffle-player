import React from 'react';
import { ChevronDown, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function NowPlaying() {
  const { currentTrack, isPlaying, togglePlay, closeNowPlaying } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-surface-0)] text-[var(--color-text-primary)] transition-opacity duration-300">
      
      {/* Blurred Background */}
      <div 
        className="absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `url(${currentTrack.coverArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px)',
        }}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <button onClick={closeNowPlaying} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer">
          <ChevronDown size={28} />
        </button>
        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)]">Now Playing</span>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 mt-12">
        {/* Album Art with Vinyl Spin when playing */}
        <div className={`w-64 h-64 sm:w-80 sm:h-80 mb-10 rounded shadow-2xl overflow-hidden ${isPlaying ? 'vinyl-spin rounded-full' : ''}`} style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
          <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
        </div>

        {/* Metadata */}
        <div className="text-center w-full mb-8">
          <h2 className="text-[32px] sm:text-[40px] font-display font-bold tracking-tight mb-1 text-ellipsis-1">{currentTrack.title}</h2>
          <p className="text-[18px] sm:text-[20px] text-[var(--color-text-secondary)] text-ellipsis-1">{currentTrack.artist}</p>
        </div>

        {/* Scrubber Placeholder */}
        <div className="w-full mb-8">
          <div className="w-full h-[4px] bg-[rgba(255,255,255,0.1)] rounded-full relative">
            <div className="absolute left-0 top-0 h-full bg-[var(--art-color)] rounded-full w-1/3" />
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mt-2 font-mono">
            <span>1:04</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full px-4">
          <button 
            onClick={() => usePlayerStore.getState().toggleShuffle()}
            className={`transition-colors cursor-pointer ${usePlayerStore.getState().isShuffle ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Shuffle size={24} />
          </button>
          
          <div className="flex items-center gap-6 sm:gap-8">
            <button className="text-[var(--color-text-primary)] hover:text-white transition-colors cursor-pointer" onClick={() => usePlayerStore.getState().prevTrack()}>
              <SkipBack size={32} fill="currentColor" />
            </button>
            <button onClick={togglePlay} className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface-0)] hover:scale-105 transition-transform cursor-pointer shadow-xl">
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
            </button>
            <button className="text-[var(--color-text-primary)] hover:text-white transition-colors cursor-pointer" onClick={() => usePlayerStore.getState().nextTrack()}>
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>

          <button 
            onClick={() => usePlayerStore.getState().toggleRepeat()}
            className={`transition-colors cursor-pointer ${usePlayerStore.getState().repeatMode !== 'off' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Repeat size={24} />
            {usePlayerStore.getState().repeatMode === 'one' && <span className="absolute text-[8px] font-bold text-[var(--color-surface-0)] bg-[var(--color-accent)] rounded-full w-3 h-3 flex items-center justify-center -mt-6 ml-4">1</span>}
          </button>
        </div>
      </div>

    </div>
  );
}
