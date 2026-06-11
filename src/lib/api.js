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
