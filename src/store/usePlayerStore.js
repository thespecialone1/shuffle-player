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
    let newQueue = [...tracks];
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
    queue: [...state.queue, track],
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
    if (state.repeatMode === 'one') {
      // Just restart the current track
      // The audio element will handle playing if we reset progress, but we need to trigger it.
      // Easiest is to keep same index. Audio element onEnded triggers this, we might need a signal to restart.
      return { progress: 0, isPlaying: true };
    }
    if (state.queueIndex < state.queue.length - 1) {
      const nextIndex = state.queueIndex + 1;
      return { queueIndex: nextIndex, currentTrack: state.queue[nextIndex], isPlaying: true, progress: 0 };
    } else if (state.repeatMode === 'all' && state.queue.length > 0) {
      return { queueIndex: 0, currentTrack: state.queue[0], isPlaying: true, progress: 0 };
    }
    return state;
  }),
  prevTrack: () => set((state) => {
    // If progress is more than 3 seconds, just restart track. Wait, keep it simple for now.
    if (state.progress > 3) {
      return { progress: 0 };
    }
    if (state.queueIndex > 0) {
      const prevIndex = state.queueIndex - 1;
      return { queueIndex: prevIndex, currentTrack: state.queue[prevIndex], isPlaying: true, progress: 0 };
    }
    return { progress: 0 };
  }),
  
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  
  setDominantColor: (color) => {
    set({ dominantColor: color });
    document.documentElement.style.setProperty('--art-color', color);
  },

  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
  toggleNowPlaying: () => set((state) => ({ isNowPlayingFullscreen: !state.isNowPlayingFullscreen })),
  closeNowPlaying: () => set({ isNowPlayingFullscreen: false }),
}));
