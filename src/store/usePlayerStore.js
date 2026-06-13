import { create } from 'zustand';
import { fetchPlaylists } from '../lib/api';

export const usePlayerStore = create((set, get) => ({
  // Audio State
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isBuffering: false,
  volume: 1,
  progress: 0,
  duration: 0,
  isMuted: false,
  seekTo: null,
  
  // UI State
  isQueueOpen: false,
  isNowPlayingFullscreen: false,
  dominantColor: '#1A1A1A', // fallback
  isShuffle: false,
  repeatMode: 'off', // 'off', 'all', 'one'
  
  // App State
  playlists: [],

  // Actions
  loadPlaylists: async () => {
    try {
      const playlists = await fetchPlaylists();
      set({ playlists });
    } catch (err) {
      console.error(err);
    }
  },
  playTrack: (track) => set({ 
    currentTrack: track, 
    isPlaying: true, 
    isNowPlayingFullscreen: false 
  }),
  setQueue: (tracks, startIndex = 0) => set((state) => {
    let newQueue = tracks.map(t => ({ ...t, queueId: crypto.randomUUID() }));
    let newIndex = startIndex;
    if (state.isShuffle) {
      const current = newQueue[startIndex];
      newQueue = newQueue.sort(() => Math.random() - 0.5);
      newIndex = newQueue.findIndex(t => t.id === current.id);
    }
    return {
      queue: newQueue,
      queueIndex: newIndex,
      currentTrack: newQueue[newIndex],
      isPlaying: true
    };
  }),
  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, { ...track, queueId: crypto.randomUUID() }],
    // if queue was empty, maybe we should auto-play? Let's just add for now.
  })),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleShuffle: () => set((state) => {
    const newShuffle = !state.isShuffle;
    if (newShuffle && state.queue.length > 0) {
      // shuffle remaining queue
      const current = state.queue[state.queueIndex];
      const remaining = state.queue.filter(t => t.id !== current.id).sort(() => Math.random() - 0.5);
      const newQueue = [current, ...remaining];
      return { isShuffle: true, queue: newQueue, queueIndex: 0 };
    }
    return { isShuffle: newShuffle };
  }),
  toggleRepeat: () => set((state) => {
    const modes = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
    return { repeatMode: nextMode };
  }),
  
  nextTrack: () => set((state) => {
    if (state.repeatMode === 'one' || state.queue.length === 0 || (state.queueIndex >= state.queue.length - 1 && state.repeatMode !== 'all')) {
      // Just restart the current track
      return { progress: 0, seekTo: 0, isPlaying: true };
    }
    if (state.queueIndex < state.queue.length - 1) {
      const nextIndex = state.queueIndex + 1;
      return { queueIndex: nextIndex, currentTrack: state.queue[nextIndex], isPlaying: true, progress: 0, seekTo: 0 };
    } else if (state.repeatMode === 'all' && state.queue.length > 0) {
      return { queueIndex: 0, currentTrack: state.queue[0], isPlaying: true, progress: 0, seekTo: 0 };
    }
    return state;
  }),
  prevTrack: () => set((state) => {
    // Restart if we are past 3 seconds, or if there's no previous track
    if (state.progress > 3 || state.queueIndex === 0 || state.queue.length === 0) {
      return { progress: 0, seekTo: 0, isPlaying: true };
    }
    if (state.queueIndex > 0) {
      const prevIndex = state.queueIndex - 1;
      return { queueIndex: prevIndex, currentTrack: state.queue[prevIndex], isPlaying: true, progress: 0, seekTo: 0 };
    }
    return { progress: 0, seekTo: 0, isPlaying: true };
  }),
  
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  setSeekTo: (time) => set({ seekTo: time }),
  
  setDominantColor: (color) => {
    set({ dominantColor: color });
    document.documentElement.style.setProperty('--art-color', color);
  },

  // Queue and Now Playing toggles
  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
  
  isNowPlayingFullscreen: false, // For mobile drawer
  toggleNowPlaying: () => set((state) => ({ isNowPlayingFullscreen: !state.isNowPlayingFullscreen })),
  closeNowPlaying: () => set({ isNowPlayingFullscreen: false }),

  isSidebarOpen: false, // For desktop right sidebar
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  
  // Drag and Drop Queue
  reorderQueue: (startIndex, endIndex) => set((state) => {
    const newQueue = Array.from(state.queue);
    const [removed] = newQueue.splice(startIndex, 1);
    newQueue.splice(endIndex, 0, removed);
    
    // Update queueIndex if the current track moved or if elements shifted around it
    const currentTrackId = state.currentTrack?.id;
    const newIndex = newQueue.findIndex(t => t.id === currentTrackId);
    
    return { queue: newQueue, queueIndex: newIndex !== -1 ? newIndex : state.queueIndex };
  }),

  // Lyrics State
  isLyricsOpen: false,
  lyricsCache: {}, // { 'artist-title': lyricsData }
  toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),
  closeLyrics: () => set({ isLyricsOpen: false }),
  setLyricsCache: (key, data) => set((state) => ({
    lyricsCache: { ...state.lyricsCache, [key]: data }
  })),

}));
