const API_URL = '/api';

export async function fetchTracks() {
  const response = await fetch(`${API_URL}/tracks`);
  if (!response.ok) throw new Error('Failed to fetch tracks');
  return response.json();
}

export async function searchTracks(query) {
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search');
  return response.json();
}

export async function syncMusic() {
  const response = await fetch(`${API_URL}/sync`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to sync');
  return response.json();
}

export async function slskdSearch(query) {
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
  const response = await fetch(`${API_URL}/slskd/results?id=${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Failed to fetch slskd results');
  return response.json();
}

export async function slskdDownload(username, filename, size) {
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
  const params = new URLSearchParams({
    artist_name: artistName,
    track_name: trackName
  });
  const response = await fetch(`${API_URL}/lyrics?${params}`);
  if (response.status === 404) return null; // No lyrics found
  if (!response.ok) throw new Error('Failed to fetch lyrics');
  return response.json();
}
