import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve('./data/pokemeow.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

export function getMemoryDb(): Database.Database {
  const memDb = new Database(':memory:');
  memDb.pragma('foreign_keys = ON');
  initTablesForDb(memDb);
  return memDb;
}

function initTables() {
  initTablesForDb(db);
}

function initTablesForDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      coins INTEGER DEFAULT 0,
      streak_common INTEGER DEFAULT 0,
      streak_uncommon INTEGER DEFAULT 0,
      streak_rare INTEGER DEFAULT 0,
      streak_super_rare INTEGER DEFAULT 0,
      streak_legendary INTEGER DEFAULT 0,
      total_caught INTEGER DEFAULT 0,
      amulet_coins INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ball_type TEXT NOT NULL CHECK(ball_type IN ('pokeball','greatball','ultraball','premierball','masterball')),
      quantity INTEGER DEFAULT 0,
      UNIQUE(user_id, ball_type),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS pokedex (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      pokemon_id INTEGER NOT NULL,
      shiny INTEGER DEFAULT 0,
      caught_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, pokemon_id, shiny),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export function closeDb() {
  if (db) {
    db.close();
  }
}
