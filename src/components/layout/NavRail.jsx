import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Library, Search, PlusCircle, Music, DownloadCloud } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import CreatePlaylistModal from '../CreatePlaylistModal';

export default function NavRail({ className = '' }) {
  const { playlists, loadPlaylists } = usePlayerStore(useShallow(state => ({ playlists: state.playlists, loadPlaylists: state.loadPlaylists })));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const lastPathRef = useRef(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const navItems = [
    { name: 'Browse', path: '/browse', icon: Home },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Downloads', path: '/downloads', icon: DownloadCloud },
  ];

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const navLink = element?.closest('a[data-path]');
    if (navLink) {
      const path = navLink.getAttribute('data-path');
      if (lastPathRef.current !== path) {
        lastPathRef.current = path;
        navigate(path);
      }
    }
  };

  return (
    <>
      <nav 
        className={`relative w-full sm:w-[64px] lg:w-[220px] h-[64px] sm:h-full bg-[var(--color-surface-1)] border-t sm:border-t-0 sm:border-r border-[var(--color-border-subtle)] z-20 flex sm:flex-col items-center justify-center lg:items-start px-2 lg:p-4 shrink-0 transition-all duration-300 ${className}`}
      >
        
        {/* Brand - desktop only */}
        <div className="hidden lg:flex items-center gap-2 mb-8 px-2 w-full">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-black overflow-hidden shrink-0">
             <img src="/logo.png" alt="Shuffle Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Shuffle</span>
        </div>

        <div 
          className="flex sm:flex-col items-center lg:items-start justify-center sm:justify-start w-full gap-8 sm:gap-2 lg:gap-1"
          onTouchMove={handleTouchMove}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              data-path={item.path}
              className={({ isActive }) => 
                `flex items-center justify-center sm:justify-start gap-4 px-3 py-3 w-auto sm:w-full rounded-lg transition-colors group ${
                  isActive ? 'text-[var(--color-accent)] bg-[rgba(255,255,255,0.05)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.03)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-7 h-7 sm:w-6 sm:h-6 shrink-0" strokeWidth={isActive ? 2.5 : 1.5} />
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
