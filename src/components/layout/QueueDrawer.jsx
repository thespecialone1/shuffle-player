import React from 'react';
import { X, Play } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function QueueDrawer() {
  const { isQueueOpen, toggleQueue, queue, currentTrack, playTrack } = usePlayerStore();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-full sm:w-[360px] h-[calc(100vh-72px)] sm:h-[calc(100vh-88px)] bg-[var(--color-surface-1)] border-l border-[var(--color-border-subtle)] z-30 flex flex-col shadow-2xl transition-transform duration-300 transform translate-x-0">
      <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg text-[var(--color-text-primary)]">Up Next</h3>
        <button onClick={toggleQueue} className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {queue.length === 0 ? (
          <div className="p-4 text-center text-[var(--color-text-secondary)] text-sm">
            Your queue is empty.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {queue.map((track, idx) => {
              const isPlaying = currentTrack?.id === track.id;
              return (
                <div 
                  key={`${track.id}-${idx}`}
                  onDoubleClick={() => playTrack(track)}
                  className={`group flex items-center gap-3 p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer ${isPlaying ? 'bg-[rgba(255,255,255,0.03)] border-l-2 border-[var(--color-accent)]' : 'border-l-2 border-transparent'}`}
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                    <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                      <Play size={16} fill="currentColor" className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-[14px] font-medium text-ellipsis-1 ${isPlaying ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
                      {track.title}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-secondary)] text-ellipsis-1">
                      {track.artist}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
