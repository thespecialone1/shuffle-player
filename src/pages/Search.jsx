import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search as SearchIcon, Play, Download, Check, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { searchTracks, getStreamUrl, slskdSearch, getSlskdResults, slskdDownload } from '../lib/api';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setQueue, currentTrack } = usePlayerStore(useShallow(state => ({ setQueue: state.setQueue, currentTrack: state.currentTrack })));

  const [trackToAdd, setTrackToAdd] = useState(null);

  // Slskd State
  const [slskdSearchId, setSlskdSearchId] = useState(null);
  const [slskdResults, setSlskdResults] = useState([]);
  const [isSlskdSearching, setIsSlskdSearching] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({}); // filename -> 'downloading' | 'success' | 'error'
  const debounceRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }

    return () => document.documentElement.classList.remove('page-active');
  }, []);

  // Poll Slskd Results
  useEffect(() => {
    let interval;
    if (slskdSearchId) {
      interval = setInterval(async () => {
        try {
          const data = await getSlskdResults(slskdSearchId);
          setSlskdResults(data.results);
          setIsSlskdSearching(data.state === 'InProgress' || data.state === 'Queued');
          
          if (data.state === 'Completed' || data.state === 'Cancelled' || data.state === 'Faulted') {
            clearInterval(interval);
          }
        } catch (e) {
          console.error('Failed to poll slskd results', e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [slskdSearchId]);

  const performSearch = async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSlskdResults([]);
      setSlskdSearchId(null);
      setIsSlskdSearching(false);
      return;
    }

    setIsSearching(true);
    setIsSlskdSearching(true);
    setSlskdResults([]);
    
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

    try {
      const { id } = await slskdSearch(q);
      setSlskdSearchId(id);
    } catch (err) {
      console.error("Failed to start slskd search", err);
      setIsSlskdSearching(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    
    const newUrl = new URL(window.location);
    if (q) {
      newUrl.searchParams.set('q', q);
    } else {
      newUrl.searchParams.delete('q');
    }
    window.history.replaceState({}, '', newUrl);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!q.trim()) {
      performSearch('');
    } else {
      debounceRef.current = setTimeout(() => {
        performSearch(q);
      }, 500);
    }
  };

  const handleDownload = async (username, filename, size) => {
    setDownloadStatus(prev => ({ ...prev, [filename]: 'downloading' }));
    try {
      await slskdDownload(username, filename, size);
      setDownloadStatus(prev => ({ ...prev, [filename]: 'success' }));
      setTimeout(() => setDownloadStatus(prev => ({ ...prev, [filename]: null })), 5000);
    } catch (e) {
      console.error("Download error", e);
      setDownloadStatus(prev => ({ ...prev, [filename]: 'error' }));
      setTimeout(() => setDownloadStatus(prev => ({ ...prev, [filename]: null })), 5000);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

      <div className="flex flex-col gap-8">
        
        {/* Local Library Section */}
        <div>
          <h2 className="text-xl font-display font-medium mb-4 text-[var(--color-text-secondary)]">Local Library</h2>
          <div className="flex flex-col gap-2">
            {isSearching ? (
              <div className="py-8 text-center text-[var(--color-text-secondary)] animate-pulse">Searching library...</div>
            ) : query && results.length === 0 ? (
              <div className="py-8 text-center text-[var(--color-text-secondary)]">No local results</div>
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
        </div>

        {/* Soulseek Network Section */}
        {query && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-display font-medium text-[var(--color-text-secondary)]">Soulseek Network</h2>
              {isSlskdSearching && <div className="w-4 h-4 rounded-full border-2 border-[var(--color-text-secondary)] border-t-[var(--color-accent)] animate-spin"></div>}
            </div>
            
            <div className="flex flex-col gap-2">
              {slskdResults.length === 0 ? (
                <div className="py-8 text-center text-[var(--color-text-secondary)]">
                  {isSlskdSearching ? "Connecting to peers..." : "No Soulseek results found"}
                </div>
              ) : (
                slskdResults.map((file, idx) => {
                  const status = downloadStatus[file.filename];
                  const basename = file.filename.split('\\').pop() || file.filename.split('/').pop();
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-1)]/50 hover:bg-[var(--color-surface-1)] transition-colors">
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-[14px] font-medium text-[var(--color-text-primary)] truncate" title={basename}>{basename}</span>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-[var(--color-text-secondary)]">
                          <span>{formatSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.bitRate || '? '} kbps</span>
                          <span>•</span>
                          <span className={file.hasFreeUploadSlot ? "text-green-500" : "text-yellow-500"}>
                            {file.hasFreeUploadSlot ? 'Free Slot' : `Queue: ${file.queueLength}`}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDownload(file.username, file.filename, file.size)}
                        disabled={!!status}
                        className={`shrink-0 p-2.5 rounded-full flex items-center justify-center transition-all ${
                          status === 'success' ? 'bg-green-500/20 text-green-400' :
                          status === 'error' ? 'bg-red-500/20 text-red-400' :
                          status === 'downloading' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] cursor-wait' :
                          'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)] hover:text-white cursor-pointer'
                        }`}
                      >
                        {status === 'success' ? <Check size={18} /> :
                         status === 'error' ? <AlertCircle size={18} /> :
                         status === 'downloading' ? <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin"></div> :
                         <Download size={18} />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {trackToAdd && <AddToPlaylistModal track={trackToAdd} onClose={() => setTrackToAdd(null)} />}
    </div>
  );
}
