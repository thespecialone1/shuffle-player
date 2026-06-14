import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createPlaylist } from '../lib/api';
import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';

export default function CreatePlaylistModal({ onClose }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loadPlaylists } = usePlayerStore(useShallow(state => ({ loadPlaylists: state.loadPlaylists })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createPlaylist(name.trim());
      await loadPlaylists();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="font-semibold text-lg">Create Playlist</h2>
          <button onClick={onClose} className="p-2 text-[var(--color-text-secondary)] hover:text-white rounded-full hover:bg-[var(--color-surface-2)] transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <input 
            type="text" 
            placeholder="Playlist name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors mb-6"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-full font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!name.trim() || isSubmitting}
              className="px-6 py-2 rounded-full font-semibold bg-[var(--color-accent)] text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
