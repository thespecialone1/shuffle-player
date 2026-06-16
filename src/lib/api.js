const API_URL = '/api';
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

import { DEMO_TRACKS, DEMO_SOULSEEK_RESULTS, DEMO_LYRICS, currentLibrary } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));export async function fetchTracks() {
  if (isDemoMode) {
    await delay(300);
    return [...currentLibrary];
  }
  const response = await fetch(`${API_URL}/tracks`);
  if (!response.ok) throw new Error('Failed to fetch tracks');
  return response.json();
}

export async function searchTracks(query) {
  if (isDemoMode) {
    await delay(300);
    return currentLibrary.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) || 
      t.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search');
  return response.json();
}

export async function syncMusic() {
  if (isDemoMode) {
    await delay(1000);
    // Simulate syncing the downloaded track
    const newTrack = {
      id: 'demo-local-3',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 200,
      coverArt: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400',
      audioUrl: 'https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg'
    };
    if (!currentLibrary.find(t => t.id === newTrack.id)) {
      currentLibrary.push(newTrack);
    }
    return { success: true };
  }
  const response = await fetch(`${API_URL}/sync`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to sync');
  return response.json();
}

export async function slskdSearch(query) {
  if (isDemoMode) {
    await delay(500);
    return { id: 'demo-search-id' };
  }
  const response = await fetch(`${API_URL}/slskd/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to initiate slskd search');
  return response.json();
}

export async function slskdStopSearch(id) {
  const response = await fetch(`${API_URL}/slskd/search/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to stop slskd search');
  return response.json();
}

export async function getSlskdResults(id) {
  if (isDemoMode) {
    await delay(500);
    return {
      state: 'InProgress',
      results: DEMO_SOULSEEK_RESULTS
    };
  }
  const response = await fetch(`${API_URL}/slskd/results?id=${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Failed to fetch slskd results');
  return response.json();
}

export async function slskdDownload(username, filename, size) {
  if (isDemoMode) {
    await delay(800);
    return { success: true, message: 'Mock download queued successfully' };
  }
  const response = await fetch(`${API_URL}/slskd/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, filename, size })
  });
  if (!response.ok) throw new Error('Failed to queue download');
  return response.json();
}

export async function fetchSlskdDownloads() {
  const response = await fetch(`${API_URL}/slskd/downloads`);
  if (!response.ok) throw new Error('Failed to fetch slskd downloads');
  return response.json();
}

export function getStreamUrl(id) {
  if (isDemoMode) {
    const track = currentLibrary.find(t => t.id === id);
    return track ? track.audioUrl : '';
  }
  return `${API_URL}/stream/${id}`;
}

// Playlists

export async function fetchPlaylists() {
  const response = await fetch(`${API_URL}/playlists`);
  if (!response.ok) throw new Error('Failed to fetch playlists');
  return response.json();
}

export async function createPlaylist(name) {
  const response = await fetch(`${API_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!response.ok) throw new Error('Failed to create playlist');
  return response.json();
}

export async function fetchPlaylistDetails(id) {
  const response = await fetch(`${API_URL}/playlists/${id}`);
  if (!response.ok) throw new Error('Failed to fetch playlist details');
  return response.json();
}

export async function addTrackToPlaylist(playlistId, trackId) {
  const response = await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackId })
  });
  if (!response.ok) throw new Error('Failed to add track to playlist');
  return response.json();
}

// Play History
export async function recordPlay(id) {
  await fetch(`${API_URL}/tracks/play/${id}`, { method: 'POST' });
}

export async function fetchRecentTracks() {
  const response = await fetch(`${API_URL}/tracks/recent`);
  if (!response.ok) throw new Error('Failed to fetch recent tracks');
  return response.json();
}

export async function fetchMostPlayedTracks() {
  const response = await fetch(`${API_URL}/tracks/most-played`);
  if (!response.ok) throw new Error('Failed to fetch most played tracks');
  return response.json();
}

export async function fetchNewestTracks() {
  const response = await fetch(`${API_URL}/tracks/newest`);
  if (!response.ok) throw new Error('Failed to fetch newest tracks');
  return response.json();
}

// Lyrics

export async function fetchLyrics(artistName, trackName) {
  if (isDemoMode) {
    await delay(300);
    return DEMO_LYRICS;
  }
  const params = new URLSearchParams({
    artist_name: artistName,
    track_name: trackName
  });
  const response = await fetch(`${API_URL}/lyrics?${params}`);
  if (response.status === 404) return null; // No lyrics found
  if (!response.ok) throw new Error('Failed to fetch lyrics');
  return response.json();
}
