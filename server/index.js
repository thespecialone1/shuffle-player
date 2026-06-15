import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { syncMusicFolder } from './sync.js';
import * as slskd from './slskd.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure covers directory exists
const coversDir = path.join(__dirname, '../public/covers');
try {
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
} catch (e) {
  console.error("Failed to create covers dir on startup:", e);
}

// Serve covers statically
app.use('/covers', express.static(coversDir));

// Fallback dummy cover art
const fallbackCover = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400';

// API: Debug covers
app.get('/api/debug-covers', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, title, coverArt, filePath FROM tracks');
    const tracks = stmt.all();
    const coversOnDisk = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
    
    res.json({
      tracks: tracks.map(t => ({
        ...t, 
        diskExists: t.coverArt ? coversOnDisk.includes(t.coverArt.replace('/covers/', '')) : false
      })),
      coversFolder: {
        path: coversDir,
        exists: fs.existsSync(coversDir),
        contents: coversOnDisk
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Slskd API Routes ---
app.get('/api/slskd/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const id = await slskd.initiateSearch(query);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/slskd/search/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Search ID is required' });
    await slskd.deleteSearch(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/slskd/results', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'Search ID is required' });
    const results = await slskd.getSearchResults(id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/slskd/download', async (req, res) => {
  try {
    const { username, filename, size } = req.body;
    if (!username || !filename || !size) return res.status(400).json({ error: 'Missing required parameters' });
    const result = await slskd.queueDownload(username, filename, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/slskd/downloads', async (req, res) => {
  try {
    const results = await slskd.getDownloads();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Sync music folder
app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncMusicFolder();
    res.json(result);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// API: Get Library (all tracks)
app.get('/api/tracks', (req, res) => {
  try {
    // Pagination could be added here, but for a personal library, returning all is usually fine unless > 10k tracks
    const stmt = db.prepare('SELECT id, title, artist, album, duration, coverArt FROM tracks ORDER BY artist, album, title');
    const rows = stmt.all();
    
    // Add fake coverart for UI testing if track has no coverArt
    const tracks = rows.map(r => ({ ...r, coverArt: r.coverArt || fallbackCover }));
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/tracks/newest', (req, res) => {
  try {
    const tracks = db.prepare('SELECT id, title, artist, album, duration, coverArt FROM tracks ORDER BY createdAt DESC LIMIT 8').all().map(r => ({ ...r, coverArt: r.coverArt || fallbackCover }));
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Search (using FTS5)
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json([]);
  }

  try {
    // FTS5 syntax: append * for prefix matching
    // We sanitize input by replacing non-alphanumeric chars to prevent SQL errors
    const safeQuery = query.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).map(term => `"${term}"*`).join(" AND ");
    
    if (!safeQuery) return res.json([]);

    const stmt = db.prepare(`
      SELECT tracks.id, tracks.title, tracks.artist, tracks.album, tracks.duration, tracks.coverArt
      FROM tracks_fts
      JOIN tracks ON tracks.rowid = tracks_fts.rowid
      WHERE tracks_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `);
    
    const rows = stmt.all(safeQuery);
    const results = rows.map(r => ({ ...r, coverArt: r.coverArt || fallbackCover }));
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Playlists API

app.get('/api/playlists', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM playlists ORDER BY createdAt DESC');
    const playlists = stmt.all();
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

app.post('/api/playlists', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const stmt = db.prepare('INSERT INTO playlists (id, name) VALUES (?, ?)');
    stmt.run(id, name);
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

app.get('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  try {
    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    if (!playlist) return res.status(404).json({ error: 'Not found' });
    
    const tracks = db.prepare(`
      SELECT tracks.id, tracks.title, tracks.artist, tracks.album, tracks.duration, tracks.coverArt, pt.position
      FROM playlist_tracks pt
      JOIN tracks ON pt.trackId = tracks.id
      WHERE pt.playlistId = ?
      ORDER BY pt.position ASC
    `).all(id).map(r => ({ ...r, coverArt: r.coverArt || fallbackCover }));
    
    res.json({ ...playlist, tracks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

app.post('/api/playlists/:id/tracks', (req, res) => {
  const { id } = req.params;
  const { trackId } = req.body;
  if (!trackId) return res.status(400).json({ error: 'Track ID required' });
  
  try {
    const currentMax = db.prepare('SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlistId = ?').get(id);
    const position = (currentMax.maxPos || 0) + 1;
    
    const stmt = db.prepare('INSERT INTO playlist_tracks (playlistId, trackId, position) VALUES (?, ?, ?)');
    stmt.run(id, trackId, position);
    res.json({ success: true });
  } catch (error) {
    // Ignore duplicate inserts gracefully
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
       return res.json({ success: true, message: 'Already in playlist' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to add track' });
  }
});

app.delete('/api/playlists/:id/tracks/:trackId', (req, res) => {
  const { id, trackId } = req.params;
  try {
    db.prepare('DELETE FROM playlist_tracks WHERE playlistId = ? AND trackId = ?').run(id, trackId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove track' });
  }
});

// API: Stream Audio file
app.get('/api/stream/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare('SELECT filePath FROM tracks WHERE id = ?');
    const track = stmt.get(id);
    
    if (!track) {
      return res.status(404).send('Track not found');
    }

    const filePath = track.filePath;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Proper HTTP Range support (Required for iOS Safari and scrubbing)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg', // Could use path.extname to be precise
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).send('Error streaming file');
  }
});

// Play History & Analytics API

app.post('/api/tracks/play/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE tracks SET playCount = playCount + 1, lastPlayed = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update play history' });
  }
});

app.get('/api/tracks/recent', (req, res) => {
  try {
    const tracks = db.prepare('SELECT id, title, artist, album, duration, coverArt, lastPlayed FROM tracks WHERE lastPlayed IS NOT NULL ORDER BY lastPlayed DESC LIMIT 20').all().map(r => ({ ...r, coverArt: r.coverArt || fallbackCover }));
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/tracks/most-played', (req, res) => {
  try {
    const tracks = db.prepare('SELECT id, title, artist, album, duration, coverArt, playCount FROM tracks WHERE playCount > 0 ORDER BY playCount DESC LIMIT 20').all().map(r => ({ ...r, coverArt: r.coverArt || fallbackCover }));
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Lyrics API (with DB Caching)

app.get('/api/lyrics', async (req, res) => {
  const { artist_name, track_name } = req.query;
  if (!artist_name || !track_name) return res.status(400).json({ error: 'Missing artist_name or track_name' });

  try {
    // 1. Check local DB
    const cached = db.prepare('SELECT syncedLyrics, plainLyrics FROM lyrics WHERE artist = ? AND title = ?').get(artist_name, track_name);
    if (cached) {
      return res.json({ 
        syncedLyrics: cached.syncedLyrics, 
        plainLyrics: cached.plainLyrics,
        source: 'local'
      });
    }

    // 2. Fetch from lrclib
    const params = new URLSearchParams({ artist_name, track_name });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`https://lrclib.net/api/get?${params}`, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (response.status === 404) {
      return res.status(404).json({ error: 'Lyrics not found' });
    }
    
    if (!response.ok) {
      throw new Error('lrclib fetch failed');
    }

    const data = await response.json();
    
    // 3. Save to local DB
    try {
      db.prepare('INSERT OR REPLACE INTO lyrics (artist, title, syncedLyrics, plainLyrics) VALUES (?, ?, ?, ?)').run(
        artist_name, 
        track_name, 
        data.syncedLyrics || null, 
        data.plainLyrics || null
      );
    } catch (dbError) {
      console.error('Failed to cache lyrics:', dbError);
    }

    res.json({
      syncedLyrics: data.syncedLyrics,
      plainLyrics: data.plainLyrics,
      source: 'lrclib'
    });
  } catch (error) {
    console.error('Lyrics API error:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});
// Serve built frontend in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Express 5 compatible catch-all route
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
} else {
  // Catch-all for API 404s if not serving frontend
  app.use((req, res) => res.status(404).send('API route not found or Frontend not built.'));
}
app.listen(PORT, () => {
  console.log(`Shuffle backend running on http://localhost:${PORT}`);
});
