import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NavRail from './NavRail';
import PlayerBar from './PlayerBar';
import NowPlaying from './NowPlaying';
import QueueDrawer from './QueueDrawer';
import AudioPlayer from '../AudioPlayer';
import LyricsView from './LyricsView';
import NowPlayingSidebar from './NowPlayingSidebar';
import { usePlayerStore } from '../../store/usePlayerStore';

const TopAura = ({ currentTrack, isPlaying }) => {
  if (!currentTrack) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full h-32 z-30 pointer-events-none overflow-visible sm:hidden" style={{ height: 'calc(40px + env(safe-area-inset-top))' }}>
      <motion.div 
        animate={{ 
          opacity: isPlaying ? [0.4, 0.8, 0.4] : 0,
          scale: isPlaying ? [1, 1.05, 1] : 1,
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150px]"
        style={{
          background: `radial-gradient(ellipse at top, var(--art-color) 0%, transparent 70%)`,
          filter: 'blur(30px)',
          mixBlendMode: 'screen'
        }}
      />
    </div>
  );
};

export default function AppShell() {
  const isNowPlayingFullscreen = usePlayerStore(state => state.isNowPlayingFullscreen);
  const location = useLocation();
  const outlet = useOutlet();

  React.useEffect(() => {
    // Close lyrics when navigating between pages (e.g., clicking Browse or Library)
    usePlayerStore.getState().closeLyrics();
  }, [location.pathname]);

  const dominantColor = usePlayerStore(state => state.dominantColor);
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);

  React.useEffect(() => {
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", currentTrack ? dominantColor : "#1A1A1A");
    }
  }, [dominantColor, currentTrack]);

  return (
    <div 
      className="flex h-[100dvh] w-full flex-col sm:flex-row text-[var(--color-text-primary)] overflow-hidden transition-colors duration-700"
      style={{ 
        backgroundColor: currentTrack ? 'color-mix(in srgb, var(--art-color) 30%, var(--color-surface-0))' : 'var(--color-surface-0)',
        paddingTop: 'env(safe-area-inset-top)' 
      }}
    >
      {/* Nav Rail on the left (desktop) or bottom tab bar (mobile logic inside NavRail) */}
      <NavRail className="hidden sm:flex" />
      
      {/* Dynamic Island Aura Effect */}
      <TopAura currentTrack={currentTrack} isPlaying={isPlaying} />
      
      {/* Main Content Area */}
      <main 
        className="flex-1 relative overflow-y-auto pb-[130px] sm:pb-[88px] bg-gradient-to-b from-[var(--color-surface-1)] to-[var(--color-surface-0)] hide-scrollbar"
      >
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

      {/* Desktop Right Sidebar */}
      <NowPlayingSidebar />

      {/* Slide-out Queue */}
      <QueueDrawer />

      {/* Desktop Player Bar */}
      <div className="hidden sm:block">
        <PlayerBar />
      </div>

      {/* Mobile Tab Bar & Player Stack */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full z-40 flex flex-col shadow-2xl">
        <NavRail />
        <PlayerBar />
      </div>

      {/* Full Screen Now Playing Drawer */}
      <NowPlaying />

      {/* Invisible Audio Engine */}
      <AudioPlayer />
    </div>
  );
}
