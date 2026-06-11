import fs from 'fs/promises';
import path from 'path';
import { parseFile } from 'music-metadata';
import crypto from 'crypto';
import db from './db.js';

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
    INSERT INTO tracks (id, title, artist, album, duration, filePath)
    VALUES (@id, @title, @artist, @album, @duration, @filePath)
    ON CONFLICT(filePath) DO UPDATE SET
      title = excluded.title,
      artist = excluded.artist,
      album = excluded.album,
      duration = excluded.duration
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
      
      parsedData.push({
        id,
        title,
        artist,
        album,
        duration: Math.floor(duration),
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
