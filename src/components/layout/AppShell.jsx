import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NavRail from './NavRail';
import PlayerBar from './PlayerBar';
import NowPlaying from './NowPlaying';
import QueueDrawer from './QueueDrawer';
import AudioPlayer from '../AudioPlayer';
import LyricsView from './LyricsView';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function AppShell() {
  const isNowPlayingFullscreen = usePlayerStore(state => state.isNowPlayingFullscreen);
  const location = useLocation();
  const outlet = useOutlet();

  React.useEffect(() => {
    // Close lyrics when navigating between pages (e.g., clicking Browse or Library)
    usePlayerStore.getState().closeLyrics();
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] w-full flex-col sm:flex-row bg-[var(--color-surface-0)] text-[var(--color-text-primary)] overflow-hidden">
      {/* Nav Rail on the left (desktop) or bottom tab bar (mobile logic inside NavRail) */}
      <NavRail />
      
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pb-[160px] sm:pb-[88px] bg-gradient-to-b from-[var(--color-surface-1)] to-[var(--color-surface-0)] hide-scrollbar">
        <LyricsView />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-7xl p-4 sm:p-8 min-h-full"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Slide-out Queue */}
      <QueueDrawer />

      {/* Fixed Player Bar at the bottom */}
      <PlayerBar />

      {/* Full Screen Now Playing Drawer */}
      <NowPlaying />

      {/* Invisible Audio Engine */}
      <AudioPlayer />
    </div>
  );
}
