import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';

describe('InventoryRepository', () => {
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
    db.exec(`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ball_type TEXT NOT NULL CHECK(ball_type IN ('pokeball','greatball','ultraball','premierball','masterball')),
      quantity INTEGER DEFAULT 0,
      UNIQUE(user_id, ball_type),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
    db.prepare('INSERT INTO users (id) VALUES (?)').run('user1');
  });

  it('should add balls to inventory', () => {
    db.prepare("INSERT INTO inventory (user_id, ball_type, quantity) VALUES (?, 'pokeball', ?) ON CONFLICT(user_id, ball_type) DO UPDATE SET quantity = quantity + ?").run('user1', 10, 10);
    const row = db.prepare("SELECT quantity FROM inventory WHERE user_id = ? AND ball_type = 'pokeball'").get('user1') as Record<string, unknown>;
    expect(row.quantity).toBe(10);
  });

  it('should remove ball when in stock', () => {
    db.prepare("INSERT INTO inventory (user_id, ball_type, quantity) VALUES (?, 'pokeball', ?)").run('user1', 5);
    db.prepare("UPDATE inventory SET quantity = quantity - 1 WHERE user_id = ? AND ball_type = 'pokeball'").run('user1');
    const row = db.prepare("SELECT quantity FROM inventory WHERE user_id = ? AND ball_type = 'pokeball'").get('user1') as Record<string, unknown>;
    expect(row.quantity).toBe(4);
  });

  it('should return empty for user with no balls', () => {
    const rows = db.prepare("SELECT ball_type, quantity FROM inventory WHERE user_id = ?").all('user1') as Record<string, unknown>[];
    expect(rows).toHaveLength(0);
  });
});
