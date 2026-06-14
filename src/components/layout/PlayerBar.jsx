import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, ListMusic, Maximize2, Shuffle, Repeat, Mic2 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import MiniLyrics from '../player/MiniLyrics';

export default function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, progress, duration, toggleQueue, toggleNowPlaying } = usePlayerStore();

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div 
      className="fixed bottom-0 left-0 w-full z-40 px-2 sm:px-4 hover-glow backdrop-blur-xl transition-all duration-300"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full h-auto min-h-[64px] sm:h-[88px] bg-gradient-to-t from-[var(--color-surface-0)] to-[color-mix(in_srgb,var(--art-color)_18%,var(--color-surface-0))] border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between relative rounded-t-xl sm:rounded-none overflow-hidden pb-1 sm:pb-0">
        
        {/* Scrubber - Absolute top of bar */}
        <div className="absolute top-0 left-0 w-full h-[16px] group cursor-pointer flex items-center z-50">
          <div className="w-full h-[2px] group-hover:h-[4px] bg-[rgba(255,255,255,0.1)] overflow-hidden transition-all duration-200 relative pointer-events-none">
             <div className="absolute top-0 left-0 h-full bg-[var(--art-color)]" style={{ width: `${progressPercent}%` }} />
          </div>
          <input 
            type="range" 
            min="0" max={duration || 100} step="0.1" 
            value={progress || 0}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              usePlayerStore.getState().setProgress(newTime);
              usePlayerStore.getState().setSeekTo(newTime);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
          />
        </div>

        <div className="flex w-full items-center justify-between sm:justify-start px-2 pt-2 sm:pt-0">
          {/* Info */}
          <div className="flex items-center gap-3 w-[60%] sm:w-1/3 min-w-0 cursor-pointer" onClick={(e) => {
            if (window.innerWidth >= 1024) {
              usePlayerStore.getState().toggleSidebar();
            } else {
              usePlayerStore.getState().toggleNowPlaying();
            }
          }}>
             {currentTrack ? (
               <>
                <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-10 h-10 sm:w-14 sm:h-14 rounded bg-[var(--color-surface-2)] object-cover shadow-md shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-[14px] sm:text-[15px] text-[var(--color-text-primary)] text-ellipsis-1">{currentTrack.title}</span>
                  <span className="text-[12px] sm:text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{currentTrack.artist}</span>
                </div>
               </>
             ) : (
               <div className="flex items-center gap-3 opacity-50">
                 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded bg-[var(--color-surface-2)]" />
                 <div className="flex flex-col gap-1">
                   <div className="w-24 h-4 bg-[var(--color-surface-2)] rounded" />
                   <div className="w-16 h-3 bg-[var(--color-surface-2)] rounded" />
                 </div>
               </div>
             )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-end sm:justify-center sm:flex-1 w-[40%] sm:max-w-[400px]">
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => usePlayerStore.getState().toggleShuffle()}
            className={`hidden sm:block transition-colors cursor-pointer ${usePlayerStore.getState().isShuffle ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Shuffle size={18} />
          </button>
          <button className="text-[var(--color-text-primary)] hover:text-white transition-colors cursor-pointer" onClick={() => usePlayerStore.getState().prevTrack()}><SkipBack size={20} fill="currentColor" /></button>
          
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface-0)] hover:scale-105 transition-transform cursor-pointer shadow-lg">
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          
          <button className="text-[var(--color-text-primary)] hover:text-white transition-colors cursor-pointer" onClick={() => usePlayerStore.getState().nextTrack()}><SkipForward size={20} fill="currentColor" /></button>
          <button 
            onClick={() => usePlayerStore.getState().toggleRepeat()}
            className={`hidden sm:flex items-center justify-center relative transition-colors cursor-pointer ${usePlayerStore.getState().repeatMode !== 'off' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Repeat size={18} />
            {usePlayerStore.getState().repeatMode === 'one' && <span className="absolute text-[6px] font-bold text-[var(--color-surface-0)] bg-[var(--color-accent)] rounded-full w-2.5 h-2.5 flex items-center justify-center -top-1.5 -right-1.5">1</span>}
          </button>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end w-auto sm:w-1/3 gap-4">
        <div className="hidden lg:flex items-center gap-2 w-[100px]">
          <Volume2 size={18} className="text-[var(--color-text-secondary)] shrink-0" />
          <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={usePlayerStore.getState().volume}
            onChange={(e) => usePlayerStore.getState().setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-text-primary)] hover:[&::-webkit-slider-thumb]:bg-[var(--color-accent)]"
            style={{ backgroundSize: `${usePlayerStore.getState().volume * 100}% 100%`, backgroundImage: 'linear-gradient(var(--color-text-primary), var(--color-text-primary))', backgroundRepeat: 'no-repeat' }}
          />
        </div>
        <button 
          onClick={() => usePlayerStore.getState().toggleLyrics()} 
          className={`hidden sm:block transition-colors cursor-pointer ${usePlayerStore.getState().isLyricsOpen ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
        >
          <Mic2 size={18} />
        </button>
        <button onClick={toggleQueue} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer hidden sm:block">
          <ListMusic size={20} />
        </button>
        <button 
          onClick={() => {
            if (window.innerWidth >= 1024) {
              usePlayerStore.getState().toggleSidebar();
            } else {
              usePlayerStore.getState().toggleNowPlaying();
            }
          }} 
          className="hidden sm:block text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      </div>

      {/* Mini Lyrics below the controls row on mobile */}
      <div className="sm:hidden w-full flex-shrink-0 z-10 pointer-events-none mt-2 px-2 pb-2 overflow-hidden">
        <MiniLyrics />
      </div>

      </div>
    </div>
  );
}
