import type { UserRow } from '../../models/types.js';
import { getDb } from '../connection.js';
import { STARTER_INVENTORY } from '../../config.js';

export function getUser(userId: string): UserRow | undefined {
  const stmt = getDb().prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(userId) as UserRow | undefined;
}

export function getOrCreateUser(userId: string): UserRow {
  let user = getUser(userId);
  if (!user) {
    getDb().prepare('INSERT INTO users (id) VALUES (?)').run(userId);
    const insertBall = getDb().prepare('INSERT INTO inventory (user_id, ball_type, quantity) VALUES (?, ?, ?)');
    for (const [ball, qty] of Object.entries(STARTER_INVENTORY)) {
      insertBall.run(userId, ball, qty);
    }
    user = getUser(userId)!;
  }
  return user;
}

export function updateCoins(userId: string, amount: number): void {
  getDb().prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(amount, userId);
}

export function updateStreak(userId: string, rarity: string, increment: boolean): void {
  const col = `streak_${rarity}`;
  if (increment) {
    getDb().prepare(`UPDATE users SET ${col} = ${col} + 1 WHERE id = ?`).run(userId);
  } else {
    getDb().prepare(`UPDATE users SET ${col} = 0 WHERE id = ?`).run(userId);
  }
}

export function incrementTotalCaught(userId: string): void {
  getDb().prepare('UPDATE users SET total_caught = total_caught + 1 WHERE id = ?').run(userId);
}
