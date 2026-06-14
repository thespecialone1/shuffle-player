import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Library, Search, PlusCircle, Music, DownloadCloud } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import CreatePlaylistModal from '../CreatePlaylistModal';

export default function NavRail() {
  const { playlists, loadPlaylists } = usePlayerStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const navItems = [
    { name: 'Browse', path: '/browse', icon: Home },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Downloads', path: '/downloads', icon: DownloadCloud },
  ];

  return (
    <>
      <nav 
        className="fixed sm:relative left-0 w-full sm:w-[64px] lg:w-[220px] h-[64px] sm:h-full bg-[var(--color-surface-1)] border-t sm:border-t-0 sm:border-r border-[var(--color-border-subtle)] z-20 flex sm:flex-col items-center justify-center lg:items-start px-2 lg:p-4 shrink-0 transition-all duration-300"
        style={{
          bottom: window.innerWidth < 640 ? 'var(--player-height, 90px)' : '0'
        }}
      >
        
        {/* Brand - desktop only */}
        <div className="hidden lg:flex items-center gap-2 mb-8 px-2 w-full">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-black overflow-hidden shrink-0">
             <img src="/logo.png" alt="Shuffle Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Shuffle</span>
        </div>

        <div className="flex sm:flex-col items-center lg:items-start justify-center sm:justify-start w-full gap-8 sm:gap-2 lg:gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center justify-center sm:justify-start gap-4 px-3 py-3 w-auto sm:w-full rounded-lg transition-colors group ${
                  isActive ? 'text-[var(--color-accent)] bg-[rgba(255,255,255,0.05)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.03)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0" />
                  <span className={`hidden lg:block font-medium text-sm ${isActive ? 'text-[var(--color-text-primary)]' : ''}`}>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Playlist Section - desktop only */}
        <div className="hidden lg:flex flex-col mt-8 w-full flex-1 min-h-0">
          <div className="px-3 mb-2 flex items-center justify-between text-[var(--color-text-tertiary)] uppercase text-xs tracking-wider font-semibold shrink-0">
            <span>Playlists</span>
            <button onClick={() => setIsCreateModalOpen(true)} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer" title="Create Playlist"><PlusCircle size={16} /></button>
          </div>
          
          <div className="flex flex-col gap-1 overflow-y-auto w-full pb-4">
             {playlists.map(pl => (
               <NavLink 
                 key={pl.id}
                 to={`/playlist/${pl.id}`}
                 className={({ isActive }) => `flex items-center gap-2 text-left px-3 py-2 text-sm transition-colors text-ellipsis-1 w-full rounded-md cursor-pointer ${isActive ? 'text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.05)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.03)]'}`}
               >
                 <Music size={14} className="shrink-0 opacity-50" />
                 <span className="text-ellipsis-1">{pl.name}</span>
               </NavLink>
             ))}
          </div>
        </div>
      </nav>
      {isCreateModalOpen && <CreatePlaylistModal onClose={() => setIsCreateModalOpen(false)} />}
    </>
  );
}
