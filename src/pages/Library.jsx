import React, { useEffect, useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { fetchTracks, syncMusic, getStreamUrl } from '../lib/api';

export default function Library() {
  const { setQueue, currentTrack, isPlaying } = usePlayerStore();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    loadTracks();
    return () => document.documentElement.classList.remove('page-active');
  }, []);

  const loadTracks = async () => {
    try {
      const data = await fetchTracks();
      // Map API tracks to the format expected by the store, adding streamUrl
      const mappedTracks = data.map(t => ({
        ...t,
        audioUrl: getStreamUrl(t.id)
      }));
      setTracks(mappedTracks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncMusic();
      await loadTracks();
    } catch (err) {
      console.error('Failed to sync', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePlay = (index) => {
    setQueue(tracks, index);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Your Library</h1>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync Music"}
        </button>
      </div>
      
      <div className="flex flex-col">
        {/* Comfortable list view */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider border-b border-[var(--color-border-subtle)] mb-2">
          <div className="w-10">#</div>
          <div>Title</div>
          <div className="text-right">Duration</div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)]">Loading your music...</div>
        ) : tracks.length === 0 ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)]">No music found. Click "Sync Music" to scan your directory.</div>
        ) : tracks.map((track, idx) => {
          const isCurrentlyPlaying = currentTrack?.id === track.id;
          return (
            <div 
              key={track.id}
              onDoubleClick={() => handlePlay(idx)}
              className="group grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
              style={isCurrentlyPlaying ? { background: 'rgba(255,255,255,0.03)' } : {}}
            >
              <div className="w-10 flex items-center justify-center text-[var(--color-text-secondary)] group-hover:hidden">
                {isCurrentlyPlaying && isPlaying ? (
                  <div className="flex items-end h-[14px] gap-[2px]">
                     <div className="w-[3px] bg-[var(--color-accent)] eq-bar-1 rounded-t" />
                     <div className="w-[3px] bg-[var(--color-accent)] eq-bar-2 rounded-t" />
                     <div className="w-[3px] bg-[var(--color-accent)] eq-bar-3 rounded-t" />
                  </div>
                ) : (
                  idx + 1
                )}
              </div>
              
              <div className="w-10 flex items-center justify-center hidden group-hover:flex">
                <button onClick={() => handlePlay(idx)} className="text-[var(--color-text-primary)] cursor-pointer">
                  <Play size={16} fill="currentColor" />
                </button>
              </div>

              <div className="flex items-center gap-4 min-w-0">
                <img src={track.coverArt} alt={track.title} className="w-10 h-10 rounded object-cover shadow" />
                <div className="flex flex-col min-w-0">
                  <span className={`text-[15px] font-medium text-ellipsis-1 ${isCurrentlyPlaying ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>{track.title}</span>
                  <span className="text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{track.artist}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 min-w-[80px]">
                <button 
                  onClick={(e) => { e.stopPropagation(); usePlayerStore.getState().addToQueue(track); }}
                  className="opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                  title="Add to queue"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
                <div className="text-sm text-[var(--color-text-secondary)] text-right font-mono">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
