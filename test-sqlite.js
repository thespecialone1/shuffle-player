import Database from 'better-sqlite3';
const db = new Database(':memory:');
db.exec('CREATE TABLE tracks (id TEXT PRIMARY KEY, filePath TEXT UNIQUE, coverArt TEXT)');
db.prepare('INSERT INTO tracks (id, filePath, coverArt) VALUES (?, ?, ?)').run('1', '/path/to/file', null);
try {
  db.prepare('INSERT INTO tracks (id, filePath, coverArt) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET coverArt = excluded.coverArt, filePath = excluded.filePath').run('1', '/path/to/file', 'cover.jpg');
  console.log('Success!', db.prepare('SELECT * FROM tracks').get());
} catch (e) {
  console.error('Error:', e.message);
}
