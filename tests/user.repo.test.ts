import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';

describe('UserRepository', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON');
    db.exec(`CREATE TABLE IF NOT EXISTS users (
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
    )`);
  });

  it('should create user with default values', () => {
    db.prepare('INSERT INTO users (id) VALUES (?)').run('user1');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('user1') as Record<string, unknown>;
    expect(user.coins).toBe(0);
    expect(user.total_caught).toBe(0);
  });

  it('should get existing user', () => {
    db.prepare('INSERT INTO users (id) VALUES (?)').run('user1');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('user1') as Record<string, unknown>;
    expect(user).toBeDefined();
    expect(user.id).toBe('user1');
  });

  it('should return undefined for non-existent user', () => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('nonexistent');
    expect(user).toBeUndefined();
  });

  it('should update coins', () => {
    db.prepare('INSERT INTO users (id) VALUES (?)').run('user1');
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(500, 'user1');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('user1') as Record<string, unknown>;
    expect(user.coins).toBe(500);
  });
});
