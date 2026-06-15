import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, ListMusic, Maximize2, Shuffle, Repeat, Mic2 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import MiniLyrics from '../player/MiniLyrics';

const Scrubber = () => {
  const { progress, duration, setProgress, setSeekTo } = usePlayerStore(useShallow(state => ({ progress: state.progress, duration: state.duration, setProgress: state.setProgress, setSeekTo: state.setSeekTo })));
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  
  return (
    <div className="absolute top-0 left-0 w-full h-[16px] group cursor-pointer flex items-center z-50">
      <div className="w-full h-[2px] group-hover:h-[4px] bg-[rgba(255,255,255,0.1)] transition-all duration-200 pointer-events-none relative">
        <div 
          className="absolute left-0 top-0 h-full bg-[var(--color-accent)] transition-all duration-100 ease-linear flex justify-end items-center" 
          style={{ width: `${progressPercent}%` }} 
        >
          <div className="w-[10px] h-[10px] bg-[var(--color-text-primary)] rounded-full translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" />
        </div>
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
      />
    </div>
  );
};

export default function PlayerBar({ className = '', isDesktop = false }) {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const togglePlay = usePlayerStore(state => state.togglePlay);
  const nextTrack = usePlayerStore(state => state.nextTrack);
  const previousTrack = usePlayerStore(state => state.previousTrack);
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);
  const seekTo = usePlayerStore(state => state.seekTo);
  const toggleLyrics = usePlayerStore(state => state.toggleLyrics);
  const isLyricsOpen = usePlayerStore(state => state.isLyricsOpen);
  const openNowPlaying = usePlayerStore(state => state.openNowPlaying);
  const toggleQueue = usePlayerStore(state => state.toggleQueue);

  const [isHovering, setIsHovering] = React.useState(false);
  const playerRef = React.useRef(null);

  React.useEffect(() => {
    if (!playerRef.current) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--player-bar-height', `${playerRef.current.offsetHeight}px`);
    });
    observer.observe(playerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!currentTrack) return null;

  return (
    <div 
      ref={playerRef}
      className={`w-full z-40 px-0 sm:px-4 liquid-glass border-[var(--color-border-subtle)] ${isDesktop ? 'border-t relative' : 'relative'} ${className}`}
    >
      <div className="w-full h-auto min-h-[64px] sm:h-[88px] flex flex-col sm:flex-row items-center justify-between relative overflow-hidden pb-0">
        
        {/* Ambient background that fills the entire bar securely */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `linear-gradient(to top, var(--color-surface-0), var(--art-color))` }}
        />

        {/* Scrubber - Absolute top of bar */}
        <Scrubber />

        <div className="flex w-full items-center justify-between sm:justify-start px-4 pt-4 sm:pt-0 pb-1 relative z-10">
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
      <div 
        className="sm:hidden w-full flex-shrink-0 relative z-10 pointer-events-none px-3 overflow-hidden flex items-center justify-center"
        style={{ 
          height: 'calc(44px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <MiniLyrics />
      </div>

      </div>
    </div>
  );
}
