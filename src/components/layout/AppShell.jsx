import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NavRail from './NavRail';
import PlayerBar from './PlayerBar';
import NowPlaying from './NowPlaying';
import QueueDrawer from './QueueDrawer';
import AudioPlayer from '../AudioPlayer';
import NowPlayingSidebar from './NowPlayingSidebar';
import MiniLyrics from '../player/MiniLyrics';
import { usePlayerStore } from '../../store/usePlayerStore';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Something went wrong rendering the UI.</div>;
    }
    return this.props.children;
  }
}

const TopAura = ({ currentTrack, isPlaying }) => {
  if (!currentTrack) return null;
  return (
    <div className="fixed top-0 left-0 w-full h-32 z-30 pointer-events-none overflow-visible sm:hidden" style={{ height: 'calc(40px + env(safe-area-inset-top))' }}>
      <motion.div 
        animate={{ 
          opacity: isPlaying ? [0.4, 0.8, 0.4] : 0,
          scale: isPlaying ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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

  React.useEffect(() => {
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
    <ErrorBoundary>
      <div 
        className="flex-1 w-full flex flex-col text-[var(--color-text-primary)] transition-colors duration-700 min-h-screen"
        style={{ backgroundColor: currentTrack ? 'color-mix(in srgb, var(--art-color) 30%, var(--color-surface-0))' : 'var(--color-surface-0)' }}
      >
        <div className="flex-1 flex flex-row relative w-full">
          {/* Desktop Nav: Sticky to keep it on screen while body scrolls */}
          <div className="hidden sm:block sticky top-0 h-screen shrink-0 pb-[90px]">
            <NavRail className="flex h-full" />
          </div>
          
          {/* Main content natively scrolls with the browser body */}
          <main className="flex-1 w-full relative z-10 pb-[180px] sm:pb-[120px]">
            <TopAura currentTrack={currentTrack} isPlaying={isPlaying} />
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="mx-auto max-w-7xl p-4 sm:p-8"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          <div className="hidden lg:block sticky top-0 h-screen shrink-0 pb-[90px]">
            <NowPlayingSidebar />
          </div>
        </div>

        {/* Desktop Bottom Bar */}
        <div className="hidden sm:block fixed bottom-0 left-0 w-full z-50">
          <PlayerBar isDesktop={true} />
        </div>

        {/* Mobile Unified Bottom Stack: Force fixed to bottom of viewport */}
        <div 
          className="sm:hidden fixed bottom-0 left-0 w-full flex flex-col z-50"
          style={{ 
            backgroundColor: 'var(--color-surface-1)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          {/* Top border edge lighting */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[rgba(255,255,255,0.05)] z-50 pointer-events-none" />
          
          <PlayerBar />
          
          <div className="w-full flex-shrink-0 flex items-center justify-center py-2 px-4 bg-transparent min-h-[48px]">
            <MiniLyrics />
          </div>
        </div>

        <NowPlaying />
        <AudioPlayer />
        <QueueDrawer />
      </div>
    </ErrorBoundary>
  );
}
