import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { fetchRecentTracks, fetchMostPlayedTracks, fetchNewestTracks, getStreamUrl } from '../lib/api';

export default function Browse() {
  const { setQueue } = usePlayerStore(useShallow(state => ({ setQueue: state.setQueue })));
  
  const [recentTracks, setRecentTracks] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);
  const [newestTracks, setNewestTracks] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [featuredTrack, setFeaturedTrack] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    loadTracks();
    return () => document.documentElement.classList.remove('page-active');
  }, []);

  const loadTracks = async () => {
    try {
      const [recent, most, newest] = await Promise.all([
        fetchRecentTracks(),
        fetchMostPlayedTracks(),
        fetchNewestTracks()
      ]);
      
      const mapTrack = t => ({ ...t, audioUrl: getStreamUrl(t.id) });
      
      setRecentTracks(recent.map(mapTrack));
      setMostPlayed(most.map(mapTrack));
      setNewestTracks(newest.map(mapTrack));
      
      // Feature a track from most played or newest
      const candidates = [...most, ...newest];
      if (candidates.length > 0) {
        const featured = candidates[Math.floor(Math.random() * candidates.length)];
        setFeaturedTrack(mapTrack(featured));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

const TrackRow = ({ title, tracks, limit, showRank, onPlay }) => {
  if (!tracks || tracks.length === 0) return null;
  const displayTracks = limit ? tracks.slice(0, limit) : tracks;
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-display font-bold mb-6 px-4 sm:px-8">{title}</h2>
      <div className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 px-4 sm:px-8 pb-4 snap-x snap-mandatory">
        {displayTracks.map((track, idx) => (
          <div 
            key={`${track.id}-${idx}`} 
            onDoubleClick={() => onPlay(displayTracks, idx)} 
            className="snap-start shrink-0 w-[140px] sm:w-[180px] group bg-[var(--color-surface-1)] p-4 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer flex flex-col relative"
          >
            <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-md">
              <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPlay(displayTracks, idx); }}
                  className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer transform translate-y-4 group-hover:translate-y-0"
                >
                  <Play size={20} fill="currentColor" className="ml-1" />
                </button>
              </div>
              {showRank && (
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white font-bold text-xs px-2 py-1 rounded-md shadow-lg">
                  #{idx + 1}
                </div>
              )}
            </div>
            <h3 className="font-semibold text-[14px] sm:text-[15px] text-[var(--color-text-primary)] text-ellipsis-1 mb-1">{track.title}</h3>
            <p className="text-[12px] sm:text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{track.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-8">
      
      {/* Hero Section */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-8">
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
                onClick={() => setQueue([featuredTrack], 0)}
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
      </div>

      <TrackRow title="Recently Played" tracks={recentTracks} limit={2} onPlay={setQueue} />
      <TrackRow title="Most Played" tracks={mostPlayed} showRank={true} onPlay={setQueue} />
      <TrackRow title="Recently Added" tracks={newestTracks} limit={8} onPlay={setQueue} />

    </div>
  );
}
