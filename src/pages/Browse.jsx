import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { fetchTracks, getStreamUrl } from '../lib/api';

export default function Browse() {
  const { setQueue } = usePlayerStore();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [featuredTrack, setFeaturedTrack] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    loadTracks();
    return () => document.documentElement.classList.remove('page-active');
  }, []);

  const loadTracks = async () => {
    try {
      const data = await fetchTracks();
      const mappedTracks = data.map(t => ({
        ...t,
        audioUrl: getStreamUrl(t.id)
      }));
      setTracks(mappedTracks);
      if (mappedTracks.length > 0) {
        setFeaturedTrack(mappedTracks[Math.floor(Math.random() * Math.min(10, mappedTracks.length))]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      {featuredTrack ? (
        <div className="relative w-full h-[30vh] min-h-[250px] rounded-2xl overflow-hidden mb-12 shadow-2xl flex items-end p-8 group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url(${featuredTrack.coverArt})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-0)] via-black/50 to-transparent" />
          
          <div className="relative z-10 w-full flex justify-between items-end gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)] mb-2 block">Featured Song</span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-2 truncate">{featuredTrack.title}</h1>
              <p className="text-lg text-[var(--color-text-secondary)] truncate">{featuredTrack.artist}</p>
            </div>
            <button 
              onClick={() => setQueue(tracks, tracks.findIndex(t => t.id === featuredTrack.id))}
              className="w-14 h-14 shrink-0 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
            >
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-[30vh] min-h-[250px] rounded-2xl mb-12 bg-[var(--color-surface-1)] flex items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">{isLoading ? 'Loading...' : 'No music available to feature. Sync your library!'}</p>
        </div>
      )}

      {/* Since we don't have algorithmic playlists yet, let's just show some recently added tracks here as a grid */}
      <h2 className="text-2xl font-display font-bold mb-6">Recently Added</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {tracks.slice(0, 10).map((track, idx) => (
          <div key={track.id} onDoubleClick={() => setQueue(tracks, idx)} className="group bg-[var(--color-surface-1)] p-4 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer flex flex-col">
            <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-md">
              <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setQueue(tracks, idx); }}
                  className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer transform translate-y-4 group-hover:translate-y-0"
                >
                  <Play size={20} fill="currentColor" className="ml-1" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-[15px] text-[var(--color-text-primary)] text-ellipsis-1 mb-1">{track.title}</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{track.artist}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
