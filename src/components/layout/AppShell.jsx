import React from 'react';
import { Outlet } from 'react-router-dom';
import NavRail from './NavRail';
import PlayerBar from './PlayerBar';
import NowPlaying from './NowPlaying';
import QueueDrawer from './QueueDrawer';
import AudioPlayer from '../AudioPlayer';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function AppShell() {
  const isNowPlayingFullscreen = usePlayerStore(state => state.isNowPlayingFullscreen);

  return (
    <div className="flex h-screen w-full flex-col sm:flex-row bg-[var(--color-surface-0)] text-[var(--color-text-primary)] overflow-hidden">
      {/* Nav Rail on the left (desktop) or top/hidden (mobile, but we handle it via flex order/position) */}
      {/* Wait, standard App Shell has Nav Rail on left, Player Bar at bottom. Main content fills the rest. */}
      {/* On mobile, Nav Rail becomes a bottom tab bar just ABOVE the mini-player, or we can make Player Bar fixed at bottom and Nav Rail fixed above it. */}
      {/* For simplicity, let's make a grid or flex. flex-col on mobile, flex-row on desktop. */}
      <NavRail />
      
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pb-[160px] sm:pb-[88px] bg-gradient-to-b from-[var(--color-surface-1)] to-[var(--color-surface-0)]">
        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          <Outlet />
        </div>
      </main>

      {/* Slide-out Queue */}
      <QueueDrawer />

      {/* Fixed Player Bar at the bottom */}
      <PlayerBar />

      {/* Full Screen Now Playing Overlay */}
      {isNowPlayingFullscreen && <NowPlaying />}

      {/* Invisible Audio Engine */}
      <AudioPlayer />
    </div>
  );
}
