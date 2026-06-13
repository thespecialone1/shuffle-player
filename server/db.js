import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(__dirname, 'music.db');
const db = new Database(dbPath);

// Enable performance pragmas
db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
db.pragma('synchronous = NORMAL');
db.pragma('temp_store = MEMORY');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    duration INTEGER NOT NULL,
    coverArt TEXT,
    filePath TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create a Full-Text Search (FTS5) virtual table for super fast searching
  CREATE VIRTUAL TABLE IF NOT EXISTS tracks_fts USING fts5(
    id UNINDEXED,
    title,
    artist,
    album,
    content='tracks',
    content_rowid='rowid'
  );

  -- Triggers to automatically keep the FTS index in sync with the tracks table
  CREATE TRIGGER IF NOT EXISTS tracks_ai AFTER INSERT ON tracks BEGIN
    INSERT INTO tracks_fts(rowid, id, title, artist, album) 
    VALUES (new.rowid, new.id, new.title, new.artist, new.album);
  END;

  CREATE TRIGGER IF NOT EXISTS tracks_ad AFTER DELETE ON tracks BEGIN
    INSERT INTO tracks_fts(tracks_fts, rowid, id, title, artist, album) 
    VALUES('delete', old.rowid, old.id, old.title, old.artist, old.album);
  END;

  CREATE TRIGGER IF NOT EXISTS tracks_au AFTER UPDATE ON tracks BEGIN
    INSERT INTO tracks_fts(tracks_fts, rowid, id, title, artist, album) 
    VALUES('delete', old.rowid, old.id, old.title, old.artist, old.album);
    INSERT INTO tracks_fts(rowid, id, title, artist, album) 
    VALUES (new.rowid, new.id, new.title, new.artist, new.album);
  END;

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlistId TEXT NOT NULL,
    trackId TEXT NOT NULL,
    position INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlistId, trackId),
    FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (trackId) REFERENCES tracks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lyrics (
    artist TEXT NOT NULL,
    title TEXT NOT NULL,
    syncedLyrics TEXT,
    plainLyrics TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (artist, title)
  );
`);

// Add new columns to tracks if they don't exist (SQLite doesn't support IF NOT EXISTS for ADD COLUMN)
try {
  db.exec('ALTER TABLE tracks ADD COLUMN playCount INTEGER DEFAULT 0');
} catch (e) { /* ignore */ }

try {
  db.exec('ALTER TABLE tracks ADD COLUMN lastPlayed DATETIME');
} catch (e) { /* ignore */ }

export default db;
