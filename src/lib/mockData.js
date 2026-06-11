export const mockTracks = [
  {
    id: '1',
    title: 'Neon Dreamscape',
    artist: 'Aether Echo',
    album: 'Original Synthwave 2024',
    coverArt: '/images/synthwave.png',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372
  },
  {
    id: '2',
    title: 'Wandering Paths',
    artist: 'Ember & Ochre',
    album: 'Indie Folk Tracks',
    coverArt: '/images/indie.png',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 425
  },
  {
    id: '3',
    title: 'Infinite Drift',
    artist: 'Aethereal',
    album: 'Ambient Cuts',
    coverArt: '/images/electronic.png',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 345
  }
];

export const mockPlaylists = [
  {
    id: 'p1',
    title: 'Late Night Drives',
    description: 'Perfect for hitting the road after midnight.',
    coverArt: '/images/synthwave.png',
    trackIds: ['1', '3']
  },
  {
    id: 'p2',
    title: 'Autumn Acoustic',
    description: 'Warm folk tracks for cold days.',
    coverArt: '/images/indie.png',
    trackIds: ['2']
  }
];
