import React, { useEffect, useState } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { addTrackToPlaylist } from '../lib/api';
import { usePlayerStore } from '../store/usePlayerStore';

export default function AddToPlaylistModal({ track, onClose }) {
  const { playlists, loadPlaylists } = usePlayerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await addTrackToPlaylist(playlistId, track.id);
      if (res.message === 'Already in playlist') {
        setSuccessMsg(`Already in ${playlistName}`);
      } else {
        setSuccessMsg(`Added to ${playlistName}`);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] shrink-0">
          <h2 className="font-semibold text-lg">Add to Playlist</h2>
          <button onClick={onClose} className="p-2 text-[var(--color-text-secondary)] hover:text-white rounded-full hover:bg-[var(--color-surface-2)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 shrink-0 flex items-center gap-3 bg-[var(--color-surface-2)]/50">
          <img src={track.coverArt} className="w-12 h-12 rounded object-cover shadow" alt="" />
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-medium text-[var(--color-text-primary)] text-ellipsis-1">{track.title}</span>
            <span className="text-[13px] text-[var(--color-text-secondary)] text-ellipsis-1">{track.artist}</span>
          </div>
        </div>

        <div className="overflow-y-auto p-2 flex-1">
          {successMsg ? (
            <div className="flex items-center justify-center py-12 text-[var(--color-accent)] font-medium animate-in fade-in zoom-in-50">
              {successMsg}
            </div>
          ) : playlists.length === 0 ? (
             <div className="py-12 text-center text-[var(--color-text-secondary)]">
               No playlists yet. Create one first!
             </div>
          ) : (
            playlists.map(pl => (
              <button 
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id, pl.name)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] shrink-0">
                  <Music size={18} />
                </div>
                <span className="font-medium flex-1 text-ellipsis-1">{pl.name}</span>
                <Plus size={18} className="text-[var(--color-text-secondary)] group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
