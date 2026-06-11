import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { mockPlaylists } from '../lib/mockData';
import { fetchTracks, getStreamUrl } from '../lib/api';

export default function Browse() {
  const { setQueue } = usePlayerStore();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredTrack = tracks.length > 0 ? tracks[0] : null;

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
          
          <div className="relative z-10 w-full flex justify-between items-end">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)] mb-2 block">Featured Release</span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-2 text-ellipsis-1">{featuredTrack.title}</h1>
              <p className="text-lg text-[var(--color-text-secondary)]">{featuredTrack.artist}</p>
            </div>
            <button 
              onClick={() => setQueue(tracks, 0)}
              className="w-14 h-14 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
            >
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-[30vh] min-h-[250px] rounded-2xl mb-12 bg-[var(--color-surface-1)] flex items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">{isLoading ? 'Loading...' : 'No music available'}</p>
        </div>
      )}

      <h2 className="text-2xl font-display font-bold mb-6">Trending Playlists</h2>
      
      {/* Grid utilizing Container Queries via Tailwind classes implicitly (e.g. grid-cols-2 to grid-cols-4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {mockPlaylists.map((playlist) => (
          <div key={playlist.id} className="group bg-[var(--color-surface-1)] p-4 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer flex flex-col">
            <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-md">
              <img src={playlist.coverArt} alt={playlist.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setQueue(tracks.slice(0, 5), 0); }}
                  className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer transform translate-y-4 group-hover:translate-y-0"
                >
                  <Play size={20} fill="currentColor" className="ml-1" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-[15px] text-[var(--color-text-primary)] text-ellipsis-1 mb-1">{playlist.title}</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-2">{playlist.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
