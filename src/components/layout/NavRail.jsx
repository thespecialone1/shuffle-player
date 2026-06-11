import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Library, Search, PlusCircle } from 'lucide-react';

export default function NavRail() {
  const navItems = [
    { name: 'Browse', path: '/browse', icon: Home },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Search', path: '/search', icon: Search },
  ];

  return (
    <nav className="fixed sm:relative bottom-[72px] sm:bottom-0 left-0 w-full sm:w-[64px] lg:w-[220px] h-[64px] sm:h-full bg-[var(--color-surface-1)] border-t sm:border-t-0 sm:border-r border-[var(--color-border-subtle)] z-20 flex sm:flex-col items-center lg:items-start p-2 lg:p-4 shrink-0 transition-all duration-300">
      
      {/* Brand - desktop only */}
      <div className="hidden lg:flex items-center gap-2 mb-8 px-2 w-full">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-accent)] to-[#E8A042] flex items-center justify-center shadow-lg">
          <span className="font-display font-bold text-[var(--color-surface-0)] text-sm">S</span>
        </div>
        <span className="font-display font-bold text-lg tracking-tight">Shuffle</span>
      </div>

      <div className="flex sm:flex-col items-center lg:items-start justify-around sm:justify-start w-full gap-2 lg:gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-3 py-3 w-full rounded-lg transition-colors group ${
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
      <div className="hidden lg:block mt-8 w-full">
        <div className="px-3 mb-2 flex items-center justify-between text-[var(--color-text-tertiary)] uppercase text-xs tracking-wider font-semibold">
          <span>Playlists</span>
          <button onClick={() => alert("Create Playlist feature coming soon!")} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"><PlusCircle size={16} /></button>
        </div>
        <div className="flex flex-col gap-1">
           <button className="text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-ellipsis-1 w-full rounded-md hover:bg-[rgba(255,255,255,0.03)] cursor-pointer">Late Night Drives</button>
           <button className="text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-ellipsis-1 w-full rounded-md hover:bg-[rgba(255,255,255,0.03)] cursor-pointer">Autumn Acoustic</button>
        </div>
      </div>
    </nav>
  );
}
