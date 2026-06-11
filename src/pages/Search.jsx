import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchTracks, getStreamUrl } from '../lib/api';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setQueue, currentTrack } = usePlayerStore();

  const [trackToAdd, setTrackToAdd] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    
    // Check if there's a search query in the URL
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }

    return () => document.documentElement.classList.remove('page-active');
  }, []);

  const performSearch = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchTracks(q);
      const mappedTracks = data.map(t => ({
        ...t,
        audioUrl: getStreamUrl(t.id)
      }));
      setResults(mappedTracks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    
    // Update URL without reloading
    const newUrl = new URL(window.location);
    if (q) {
      newUrl.searchParams.set('q', q);
    } else {
      newUrl.searchParams.delete('q');
    }
    window.history.replaceState({}, '', newUrl);

    performSearch(q);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="relative mb-8 group">
        <SearchIcon size={28} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-text-primary)] transition-colors" />
        <input 
          type="text" 
          value={query}
          onChange={handleSearch}
          placeholder="What do you want to listen to?" 
          className="w-full bg-transparent border-b border-[var(--color-border-subtle)] py-6 pl-12 pr-6 text-2xl sm:text-3xl font-display font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-secondary)] transition-colors placeholder-[var(--color-text-tertiary)]"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        {isSearching ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)] animate-pulse">Searching...</div>
        ) : query && results.length === 0 ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)]">No results found for "{query}"</div>
        ) : (
          results.map((track, idx) => {
            const isCurrentlyPlaying = currentTrack?.id === track.id;
            return (
              <div 
                key={track.id}
                onClick={() => setQueue(results, idx)}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-surface-1)] transition-colors cursor-pointer"
                style={isCurrentlyPlaying ? { background: 'rgba(255,255,255,0.03)' } : {}}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-12 h-12 shrink-0">
                    <img src={track.coverArt} className="w-full h-full rounded object-cover shadow" alt="" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                      <button onClick={(e) => { e.stopPropagation(); setQueue(results, idx); }} className="text-white hover:scale-110 transition-transform cursor-pointer">
                        <Play size={20} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[15px] font-medium text-ellipsis-1 ${isCurrentlyPlaying ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>{track.title}</span>
                    <span className="text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{track.artist}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-[var(--color-text-secondary)] hover:text-white transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {trackToAdd && <AddToPlaylistModal track={trackToAdd} onClose={() => setTrackToAdd(null)} />}
    </div>
  );
}
