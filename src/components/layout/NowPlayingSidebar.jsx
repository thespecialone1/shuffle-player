import React from 'react';
import { X, Mic2 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function NowPlayingSidebar() {
  const { isSidebarOpen, closeSidebar, currentTrack, toggleLyrics, isLyricsOpen } = usePlayerStore();

  if (!isSidebarOpen) return null;

  return (
    <div className="hidden lg:flex flex-col w-[350px] bg-[var(--color-surface-1)] border-l border-[var(--color-border-subtle)] overflow-y-auto hide-scrollbar z-20 shrink-0">
      <div className="sticky top-0 p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-surface-1)] z-10">
        <h3 className="font-display font-semibold text-lg text-[var(--color-text-primary)]">Now Playing</h3>
        <button onClick={closeSidebar} className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
      </div>

      {currentTrack ? (
        <div className="p-6 flex flex-col items-center">
          <div className="w-full aspect-square rounded-xl shadow-2xl overflow-hidden mb-6 relative group">
            <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>

          <div className="w-full text-center mb-6">
            <h2 className="text-2xl font-display font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">{currentTrack.title}</h2>
            <p className="text-[16px] text-[var(--color-text-secondary)]">{currentTrack.artist}</p>
          </div>

          <div className="w-full bg-[var(--color-surface-2)] p-4 rounded-xl shadow-md border border-[var(--color-border-subtle)] mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">Lyrics View</span>
              <button 
                onClick={toggleLyrics} 
                className={`p-2 rounded-full transition-colors cursor-pointer ${isLyricsOpen ? 'bg-[var(--color-accent)] text-black' : 'hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] hover:text-white'}`}
              >
                <Mic2 size={18} />
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
              Toggle the lyrics in the main content area.
            </p>
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
