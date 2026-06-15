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
      className="fixed top-0 left-0 h-dvh w-dvw flex flex-col text-[var(--color-text-primary)] overflow-hidden transition-colors duration-700"
      style={{ 
        backgroundColor: currentTrack ? 'color-mix(in srgb, var(--art-color) 30%, var(--color-surface-0))' : 'var(--color-surface-0)',
        paddingTop: 'env(safe-area-inset-top)' 
      }}
    >
      {/* MAIN ROW - Takes up all remaining vertical space above the PlayerBar */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        <NavRail className="hidden sm:flex shrink-0" />
        
        <main 
          className="flex-1 relative overflow-y-auto hide-scrollbar"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, var(--color-surface-1) 10%, var(--color-surface-0) 100%)`
          }}
        >
          <TopAura currentTrack={currentTrack} isPlaying={isPlaying} />
          <LyricsView />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto max-w-7xl p-4 sm:p-8 min-h-full pb-[40px]"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>

        <NowPlayingSidebar />
        <QueueDrawer />
      </div>

      {/* BOTTOM BARS - Fully static in flex column, completely prevents overlap bugs */}
      
      {/* Desktop Player Bar */}
      <div className="hidden sm:block shrink-0 relative z-40">
        <PlayerBar isDesktop={true} />
      </div>

      {/* Mobile: PlayerBar → NavRail (NavRail at absolute bottom edge) */}
      <div 
        className="sm:hidden shrink-0 flex flex-col z-40 relative"
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundColor: 'var(--color-surface-1)'
        }}
      >
        <PlayerBar />
        <NavRail />
      </div>

      {/* Full Screen Now Playing Drawer */}
      <NowPlaying />

      {/* Invisible Audio Engine */}
      <AudioPlayer />
    </div>
  );
}
