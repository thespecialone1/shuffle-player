import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFile } from 'music-metadata';
import crypto from 'crypto';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COVERS_DIR = path.join(__dirname, '../public/covers');

const MUSIC_DIR = process.env.MUSIC_DIR || '/home/ubuntu/music';
const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.flac', '.m4a', '.wav', '.aac', '.ogg']);

export async function syncMusicFolder() {
  console.log(`Starting sync from: ${MUSIC_DIR}`);
  
  try {
    // Ensure the directory exists
    await fs.access(MUSIC_DIR);
  } catch (err) {
    console.error(`Music directory ${MUSIC_DIR} does not exist or is inaccessible.`);
    return { success: false, error: 'Music directory not found' };
  }

  // Ensure covers directory exists
  try {
    await fs.mkdir(COVERS_DIR, { recursive: true });
  } catch (err) {
    console.error(`Failed to create covers directory ${COVERS_DIR}:`, err);
  }

  const newFiles = [];
  let processed = 0;
  let errors = 0;

  async function walk(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await walk(fullPath);
      } else if (file.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(file.name).toLowerCase())) {
        newFiles.push(fullPath);
      }
    }
  }

  await walk(MUSIC_DIR);
  console.log(`Found ${newFiles.length} supported audio files.`);

  // Prepare SQLite statements
  const insertStmt = db.prepare(`
    INSERT INTO tracks (id, title, artist, album, duration, coverArt, filePath)
    VALUES (@id, @title, @artist, @album, @duration, @coverArt, @filePath)
    ON CONFLICT(filePath) DO UPDATE SET
      title = excluded.title,
      artist = excluded.artist,
      album = excluded.album,
      duration = excluded.duration,
      coverArt = excluded.coverArt
  `);

  const existingPaths = new Set(db.prepare('SELECT filePath FROM tracks').all().map(row => row.filePath));
  
  const parsedData = [];
  for (const filePath of newFiles) {
    try {
      const metadata = await parseFile(filePath);
      
      const id = crypto.createHash('md5').update(filePath).digest('hex');
      
      const title = metadata.common.title || path.basename(filePath, path.extname(filePath));
      const artist = metadata.common.artist || metadata.common.albumartist || 'Unknown Artist';
      const album = metadata.common.album || 'Unknown Album';
      const duration = metadata.format.duration || 0;
      
      let coverArt = null;
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        const ext = pic.format === 'image/png' ? 'png' : 'jpg';
        const coverFileName = `${id}.${ext}`;
        const coverPath = path.join(COVERS_DIR, coverFileName);
        
        try {
          await fs.writeFile(coverPath, pic.data);
          coverArt = `/covers/${coverFileName}`;
        } catch (e) {
          console.error('Failed to write cover art:', e);
        }
      }
      
      parsedData.push({
        id,
        title,
        artist,
        album,
        duration: Math.floor(duration),
        coverArt,
        filePath
      });
      
      processed++;
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
      errors++;
    }
  }

  // Transaction for faster inserts (must be fully synchronous in better-sqlite3)
  const syncTransaction = db.transaction((data) => {
    for (const item of data) {
      existingPaths.delete(item.filePath); // Mark as still existing
      insertStmt.run(item);
    }
  });

  syncTransaction(parsedData);

  // Clean up deleted files from DB
  if (existingPaths.size > 0) {
    const deleteStmt = db.prepare('DELETE FROM tracks WHERE filePath = ?');
    db.transaction((paths) => {
      for (const p of paths) {
        deleteStmt.run(p);
      }
    })(Array.from(existingPaths));
    console.log(`Removed ${existingPaths.size} missing files from database.`);
  }

  return { success: true, processed, errors, removed: existingPaths.size };
}
