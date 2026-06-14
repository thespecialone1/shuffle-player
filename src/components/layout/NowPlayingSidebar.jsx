import React from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import Lyrics from './Lyrics';

export default function NowPlayingSidebar() {
  const { isSidebarOpen, closeSidebar, currentTrack, toggleLyrics, isLyricsOpen } = usePlayerStore(useShallow(state => ({ isSidebarOpen: state.isSidebarOpen, closeSidebar: state.closeSidebar, currentTrack: state.currentTrack, toggleLyrics: state.toggleLyrics, isLyricsOpen: state.isLyricsOpen })));

  if (!isSidebarOpen) return null;

  return (
    <div className="hidden lg:flex flex-col w-[350px] bg-[var(--color-surface-1)] border-l border-[var(--color-border-subtle)] overflow-hidden z-20 shrink-0">
      <div className="sticky top-0 p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface-1)] z-10 shrink-0">
        <h3 className="font-display font-semibold text-lg text-[var(--color-text-primary)]">Now Playing</h3>
        <button onClick={closeSidebar} className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
      </div>

      {currentTrack ? (
        <div className="p-6 flex flex-col items-center flex-1 overflow-y-auto hide-scrollbar min-h-0">
          <div className="w-full aspect-square rounded-xl shadow-2xl overflow-hidden mb-6 relative group shrink-0">
            <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>

          <div className="w-full text-center mb-6 shrink-0">
            <h2 className="text-2xl font-display font-bold tracking-tight mb-1 text-[var(--color-text-primary)] text-ellipsis-2">{currentTrack.title}</h2>
            <p className="text-[16px] text-[var(--color-text-secondary)] text-ellipsis-1">{currentTrack.artist}</p>
          </div>

          <div className="w-full flex-1 relative min-h-[400px] bg-[var(--color-surface-2)] rounded-xl overflow-hidden shadow-inner border border-[var(--color-border-subtle)]">
            <div className="absolute top-3 right-3 z-20">
              <button 
                onClick={toggleLyrics} 
                className="p-2 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                title={isLyricsOpen ? "Collapse Lyrics" : "Expand Lyrics"}
              >
                {isLyricsOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
            {!isLyricsOpen ? (
              <Lyrics compact={true} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full text-[var(--color-text-secondary)] opacity-50 px-6 text-center">
                <Minimize2 size={32} className="mb-4 opacity-50" />
                <p>Lyrics are expanded in the main view.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)] p-6 text-center">
          Play a song to see details here.
        </div>
      )}
    </div>
  );
}
