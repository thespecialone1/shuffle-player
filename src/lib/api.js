const API_URL = 'http://localhost:3001/api';

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
