import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import db from './db.js';
import { syncMusicFolder } from './sync.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Fallback dummy cover art
const fallbackCover = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400';

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
    const stmt = db.prepare('SELECT id, title, artist, album, duration FROM tracks ORDER BY artist, album, title');
    const rows = stmt.all();
    
    // Add fake coverart for UI testing since we skipped extracting it to save space
    const tracks = rows.map(r => ({ ...r, coverArt: fallbackCover }));
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
      SELECT tracks.id, tracks.title, tracks.artist, tracks.album, tracks.duration
      FROM tracks_fts
      JOIN tracks ON tracks.rowid = tracks_fts.rowid
      WHERE tracks_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `);
    
    const rows = stmt.all(safeQuery);
    const results = rows.map(r => ({ ...r, coverArt: fallbackCover }));
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
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

app.listen(PORT, () => {
  console.log(`Shuffle backend running on http://localhost:${PORT}`);
});
