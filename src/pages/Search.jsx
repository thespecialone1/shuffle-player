import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchTracks, getStreamUrl } from '../lib/api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setQueue, currentTrack } = usePlayerStore();

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    return () => document.documentElement.classList.remove('page-active');
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const data = await searchTracks(query);
          const mapped = data.map(t => ({...t, audioUrl: getStreamUrl(t.id)}));
          setResults(mapped);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handlePlay = (index) => {
    setQueue(results, index);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="sticky top-0 z-10 bg-[var(--color-surface-0)]/90 backdrop-blur-xl pt-4 pb-6 px-1">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={24} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border-subtle)] rounded-full py-4 pl-12 pr-6 text-lg focus:outline-none focus:border-[var(--color-text-secondary)] focus:bg-[rgba(255,255,255,0.08)] transition-all placeholder:text-[var(--color-text-tertiary)]"
            autoFocus
          />
        </div>
      </div>

      <div className="mt-6">
        {isSearching && <div className="text-center py-10 text-[var(--color-text-secondary)]">Searching...</div>}
        
        {!isSearching && query && results.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No results found for "{query}"</h3>
            <p className="text-[var(--color-text-secondary)]">Please make sure your words are spelled correctly or use fewer or different keywords.</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold mb-4 px-2">Songs</h2>
            {results.map((track, idx) => (
              <div
                key={track.id}
                onDoubleClick={() => handlePlay(idx)}
                className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
              >
                <img src={track.coverArt} alt={track.title} className="w-12 h-12 rounded object-cover shadow" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[15px] font-medium text-[var(--color-text-primary)] text-ellipsis-1">{track.title}</span>
                  <span className="text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{track.artist} · {track.album}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); usePlayerStore.getState().addToQueue(track); }}
                    className="opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                    title="Add to queue"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                  <span className="text-sm text-[var(--color-text-secondary)] font-mono">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
