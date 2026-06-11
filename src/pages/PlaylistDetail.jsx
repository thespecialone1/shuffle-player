import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Clock, Plus } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { fetchPlaylistDetails, getStreamUrl } from '../lib/api';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlaylistDetail() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setQueue, currentTrack, isPlaying, play, pause } = usePlayerStore();
  const [trackToAdd, setTrackToAdd] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('page-active');
    loadPlaylist();
    return () => document.documentElement.classList.remove('page-active');
  }, [id]);

  const loadPlaylist = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPlaylistDetails(id);
      setPlaylist(data);
      setTracks(data.tracks.map(t => ({
        ...t,
        audioUrl: getStreamUrl(t.id)
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
        Playlist not found.
      </div>
    );
  }

  const coverArt = tracks.length > 0 ? tracks[0].coverArt : '/logo.png';

  const handlePlayPlaylist = () => {
    if (tracks.length === 0) return;
    setQueue(tracks, 0);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-end gap-6 sm:gap-8 mb-12">
        <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 shadow-2xl rounded-xl overflow-hidden bg-[var(--color-surface-2)]">
          <img 
            src={coverArt} 
            alt="Playlist Cover" 
            className={`w-full h-full object-cover ${tracks.length === 0 ? 'opacity-20 p-8' : ''}`}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <span className="text-sm font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">Playlist</span>
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white text-ellipsis-1 mb-4">{playlist.name}</h1>
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm font-medium">
             <span>{tracks.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handlePlayPlaylist}
          disabled={tracks.length === 0}
          className="w-14 h-14 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
        >
          <Play size={24} fill="currentColor" className="ml-1" />
        </button>
      </div>

      {/* Tracklist */}
      <div className="w-full">
        <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] uppercase text-xs tracking-wider font-semibold mb-4">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="hidden sm:block">Album</div>
          <div className="w-8"></div>
          <div className="w-12 text-right flex justify-end"><Clock size={16} /></div>
        </div>

        <div className="flex flex-col gap-1">
          {tracks.map((track, index) => {
            const isActive = currentTrack?.id === track.id;
            return (
              <div 
                key={track.id + index}
                onDoubleClick={() => setQueue(tracks, index)}
                className={`grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-lg items-center group transition-colors cursor-default select-none ${
                  isActive ? 'bg-[rgba(255,255,255,0.1)]' : 'hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <div className="w-8 text-center text-[var(--color-text-secondary)] group-hover:hidden">
                  {isActive ? (
                    <Play size={14} fill="currentColor" className="text-[var(--color-accent)] mx-auto animate-pulse" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="w-8 text-center hidden group-hover:flex items-center justify-center">
                  <button onClick={() => setQueue(tracks, index)} className="text-white hover:scale-110 transition-transform cursor-pointer">
                     <Play size={14} fill="currentColor" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 min-w-0">
                  <img src={track.coverArt} className="w-10 h-10 rounded object-cover shadow-md shrink-0 hidden sm:block" alt="" />
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[15px] font-medium text-ellipsis-1 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
                      {track.title}
                    </span>
                    <span className="text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{track.artist}</span>
                  </div>
                </div>

                <div className="hidden sm:block text-[14px] text-[var(--color-text-secondary)] text-ellipsis-1 pr-4">
                  {track.album}
                </div>
                
                <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setTrackToAdd(track)}
                    className="text-[var(--color-text-tertiary)] hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="w-12 text-right text-[14px] text-[var(--color-text-secondary)] tracking-variant-numeric">
                  {formatDuration(track.duration)}
                </div>
              </div>
            );
          })}
          {tracks.length === 0 && (
             <div className="py-12 text-center text-[var(--color-text-secondary)]">
               This playlist is empty.
             </div>
          )}
        </div>
      </div>

      {trackToAdd && <AddToPlaylistModal track={trackToAdd} onClose={() => setTrackToAdd(null)} />}
    </div>
  );
}
