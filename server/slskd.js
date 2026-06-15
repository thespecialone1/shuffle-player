import crypto from 'crypto';

const SLSKD_URL = 'http://127.0.0.1:5030/api/v0';
const SLSKD_USERNAME = 'slskd';
const SLSKD_PASSWORD = 'slskd';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${SLSKD_URL}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: SLSKD_USERNAME, password: SLSKD_PASSWORD })
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Failed to authenticate with slskd (${response.status}): ${txt}`);
    }

    const data = await response.json();
    cachedToken = data.token;
    tokenExpiresAt = (data.expires * 1000) - 300000; 
    return cachedToken;
  } catch (err) {
    console.error("Slskd Auth Error:", err);
    throw err;
  }
}

export async function initiateSearch(query) {
  const token = await getToken();
  
  // Clear existing searches to avoid queueing up and hanging slskd
  try {
    const listRes = await fetch(`${SLSKD_URL}/searches`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (listRes.ok) {
      const searches = await listRes.json();
      for (const s of searches) {
        await fetch(`${SLSKD_URL}/searches/${s.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    }
  } catch (err) {
    console.error('Failed to clear previous slskd searches', err);
  }

  const searchId = crypto.randomUUID();
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  const response = await fetch(`${SLSKD_URL}/searches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: searchId,
      searchText: query,
      searchTimeout: 120000 // 2 minutes in milliseconds
    }),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`Failed to initiate search: ${response.statusText}`);
  }

  return searchId;
}

export async function getSearchResults(searchId) {
  const token = await getToken();
  
  const controller1 = new AbortController();
  const timeout1 = setTimeout(() => controller1.abort(), 5000);
  const statusRes = await fetch(`${SLSKD_URL}/searches/${searchId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    signal: controller1.signal
  });
  clearTimeout(timeout1);
  if (!statusRes.ok) {
    throw new Error(`Failed to fetch search status: ${statusRes.statusText}`);
  }
  const statusData = await statusRes.json();
  const searchState = statusData.state;

  const controller2 = new AbortController();
  const timeout2 = setTimeout(() => controller2.abort(), 5000);
  const response = await fetch(`${SLSKD_URL}/searches/${searchId}/responses`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    signal: controller2.signal
  });
  clearTimeout(timeout2);

  if (!response.ok) {
    throw new Error(`Failed to fetch search results: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Format into a flat list of files for the frontend
  const results = [];
  for (const userResponse of data) {
    for (const file of userResponse.files) {
      // Filter out non-audio files based on extension if we want, or just let UI show all
      if (file.filename.match(/\.(mp3|flac|m4a|wav|ogg)$/i)) {
        results.push({
          username: userResponse.username,
          filename: file.filename,
          size: file.size,
          bitRate: file.bitRate,
          length: file.length,
          hasFreeUploadSlot: userResponse.hasFreeUploadSlot,
          queueLength: userResponse.queueLength,
          uploadSpeed: userResponse.uploadSpeed,
          isLocked: file.isLocked
        });
      }
    }
  }

  // Sort by presence of free slot and upload speed for best results
  results.sort((a, b) => {
    if (a.hasFreeUploadSlot !== b.hasFreeUploadSlot) return a.hasFreeUploadSlot ? -1 : 1;
    return b.uploadSpeed - a.uploadSpeed;
  });

  return {
    state: searchState,
    results: results.slice(0, 100)
  };
}

export async function deleteSearch(searchId) {
  const token = await getToken();
  try {
    await fetch(`${SLSKD_URL}/searches/${searchId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    console.error(`Failed to delete search ${searchId}`, err);
  }
}

export async function queueDownload(username, filename, size) {
  const token = await getToken();
  const payload = [{ filename, size }];
  
  const response = await fetch(`${SLSKD_URL}/transfers/downloads/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  // If response has content (e.g., error string like "User is offline")
  const text = await response.text();
  
  if (!response.ok) {
    // Slskd often returns 400 for offline users with plain text
    throw new Error(`Download failed: ${text || response.statusText}`);
  }

  return { success: true, message: text || "Download queued successfully" };
}

export async function getDownloads() {
  const token = await getToken();
  
  const response = await fetch(`${SLSKD_URL}/transfers/downloads`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch downloads: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
