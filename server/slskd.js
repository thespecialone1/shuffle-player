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
}
export async function initiateSearch(query) {
  const token = await getToken();
  const searchId = crypto.randomUUID();
  
  const response = await fetch(`${SLSKD_URL}/searches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: searchId,
      searchText: query,
      searchTimeout: 10 // Slskd handles the timeout
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to initiate search: ${response.statusText}`);
  }

  return searchId;
}

export async function getSearchResults(searchId) {
  const token = await getToken();
  const response = await fetch(`${SLSKD_URL}/searches/${searchId}/responses`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

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

  return results.slice(0, 100); // Return top 100 to avoid overwhelming UI
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
