import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, PlusCircle } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import CreatePlaylistModal from '../components/CreatePlaylistModal';

export default function Playlists() {
  const { playlists } = usePlayerStore(useShallow(state => ({ playlists: state.playlists })));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-4 sm:px-8 pt-4 sm:pt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Playlists</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full text-sm font-medium transition-colors cursor-pointer"
        >
          <PlusCircle size={16} />
          Create
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {playlists.map(pl => (
          <Link 
            key={pl.id}
            to={`/playlist/${pl.id}`}
            className="group flex flex-col bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors rounded-xl p-4 cursor-pointer relative"
          >
            <div className="w-full aspect-square rounded-md bg-[var(--color-surface-3)] flex items-center justify-center mb-4 shadow-md">
              <Music size={40} className="text-[var(--color-text-tertiary)] opacity-50" />
            </div>
            <h3 className="font-semibold text-[15px] sm:text-[16px] text-[var(--color-text-primary)] text-ellipsis-1 mb-1">{pl.name}</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)]">{pl.trackIds?.length || 0} tracks</p>
          </Link>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
          <Music size={48} className="opacity-20 mb-4" />
          <p className="text-lg mb-2">No playlists yet</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            Create your first playlist
          </button>
        </div>
      )}

      {isCreateModalOpen && <CreatePlaylistModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
}
