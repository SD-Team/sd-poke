import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.resolve('./data/pokemeow.db');

let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initTables();
  }
  return db;
}

export function getMemoryDb(): DatabaseSync {
  const memDb = new DatabaseSync(':memory:');
  memDb.exec('PRAGMA foreign_keys = ON');
  initTablesForDb(memDb);
  return memDb;
}

function initTables() {
  initTablesForDb(db);
}

function initTablesForDb(database: DatabaseSync) {
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
      ball_type TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      UNIQUE(user_id, ball_type),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS pokedex (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      pokemon_id INTEGER NOT NULL,
      shiny INTEGER DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      caught_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, pokemon_id, shiny),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      metadata TEXT DEFAULT '{}',
      UNIQUE(user_id, item_name),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  addPokedexQuantityColumn(database);
}

function addPokedexQuantityColumn(database: DatabaseSync) {
  const colInfo = database.prepare("PRAGMA table_info('pokedex')").all() as { name: string }[];
  if (!colInfo.find(c => c.name === 'quantity')) {
    database.exec('ALTER TABLE pokedex ADD COLUMN quantity INTEGER DEFAULT 1');
  }
}

export function closeDb() {
  if (db) {
    db.close();
  }
}
