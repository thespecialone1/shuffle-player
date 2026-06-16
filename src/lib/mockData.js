// Mock Data for Demo Mode

export const DEMO_TRACKS = [
  {
    id: 'demo-local-1',
    title: 'SoundHelix Song 1',
    artist: 'T. Schürger (SoundHelix)',
    album: 'Electronic Elements',
    duration: 372,
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'demo-local-2',
    title: 'SoundHelix Song 2',
    artist: 'T. Schürger (SoundHelix)',
    album: 'Electronic Elements',
    duration: 425,
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  }
];

export const DEMO_SOULSEEK_RESULTS = [
  {
    username: 'DemoUser_HiRes',
    filename: 'C:\\Music\\RoyaltyFree\\SoundHelix - Song 3 (320kbps).mp3',
    size: 14400000,
    bitRate: 320,
    length: 200,
    hasFreeUploadSlot: true,
    queueLength: 0,
    uploadSpeed: 1500000,
    isLocked: false
  }
];

// We will mutate this array to simulate "syncing" new downloads
export const currentLibrary = [...DEMO_TRACKS];

export const DEMO_LYRICS = {
  syncedLyrics: `[00:00.00] (Demo Mode Audio Playing)
[00:05.00] This is a guided tour demonstration
[00:10.00] Real lyrics would sync exactly here
[00:15.00] Enjoy the beautiful PWA interface!
[00:20.00] You can try scrolling through these lyrics
[00:25.00] Notice how the app pauses auto-scroll when you interact?
[00:30.00] Thanks for checking out the portfolio!`,
  plainLyrics: `(Demo Mode Audio Playing)\nThis is a guided tour demonstration\nReal lyrics would sync exactly here\nEnjoy the beautiful PWA interface!\nYou can try scrolling through these lyrics\nNotice how the app pauses auto-scroll when you interact?\nThanks for checking out the portfolio!`,
  source: 'local'
};
