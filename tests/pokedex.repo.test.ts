import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';

describe('PokedexRepository', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON');
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, coins INTEGER DEFAULT 0, streak_common INTEGER DEFAULT 0,
      streak_uncommon INTEGER DEFAULT 0, streak_rare INTEGER DEFAULT 0,
      streak_super_rare INTEGER DEFAULT 0, streak_legendary INTEGER DEFAULT 0,
      total_caught INTEGER DEFAULT 0, amulet_coins INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS pokedex (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      pokemon_id INTEGER NOT NULL,
      shiny INTEGER DEFAULT 0,
      caught_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, pokemon_id, shiny),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
    db.prepare('INSERT INTO users (id) VALUES (?)').run('user1');
  });

  it('should add entry for caught pokemon', () => {
    db.prepare("INSERT INTO pokedex (user_id, pokemon_id, shiny) VALUES (?, ?, ?) ON CONFLICT(user_id, pokemon_id, shiny) DO UPDATE SET caught_at = datetime('now')").run('user1', 1, 0);
    const row = db.prepare('SELECT * FROM pokedex WHERE user_id = ? AND pokemon_id = ?').get('user1', 1) as Record<string, unknown>;
    expect(row).toBeDefined();
    expect(row.shiny).toBe(0);
  });

  it('should detect previously caught pokemon', () => {
    db.prepare('INSERT INTO pokedex (user_id, pokemon_id, shiny) VALUES (?, ?, ?)').run('user1', 25, 0);
    const exists = db.prepare('SELECT 1 FROM pokedex WHERE user_id = ? AND pokemon_id = ? AND shiny = 0').get('user1', 25);
    expect(exists).toBeDefined();
  });

  it('should return empty pokedex for user with no catches', () => {
    const rows = db.prepare('SELECT * FROM pokedex WHERE user_id = ? ORDER BY caught_at DESC').all('user1') as Record<string, unknown>[];
    expect(rows).toHaveLength(0);
  });

  it('should count unique catches', () => {
    db.prepare('INSERT INTO pokedex (user_id, pokemon_id, shiny) VALUES (?, ?, ?)').run('user1', 1, 0);
    db.prepare('INSERT INTO pokedex (user_id, pokemon_id, shiny) VALUES (?, ?, ?)').run('user1', 4, 0);
    const row = db.prepare('SELECT COUNT(*) as count FROM pokedex WHERE user_id = ?').get('user1') as { count: number };
    expect(row.count).toBe(2);
  });
});
