import type { BallType } from '../../models/types.js';
import { getDb } from '../connection.js';

export function getBalls(userId: string): Record<string, number> {
  const rows = getDb().prepare('SELECT ball_type, quantity FROM inventory WHERE user_id = ?').all(userId) as { ball_type: string; quantity: number }[];
  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.ball_type] = row.quantity;
  }
  return result;
}

export function removeBall(userId: string, ballType: BallType): boolean {
  const current = getDb().prepare('SELECT quantity FROM inventory WHERE user_id = ? AND ball_type = ?').get(userId, ballType) as { quantity: number } | undefined;
  if (!current || current.quantity <= 0) return false;
  getDb().prepare('UPDATE inventory SET quantity = quantity - 1 WHERE user_id = ? AND ball_type = ?').run(userId, ballType);
  return true;
}

export function addBalls(userId: string, ballType: BallType, amount: number): void {
  getDb().prepare(`
    INSERT INTO inventory (user_id, ball_type, quantity) VALUES (?, ?, ?)
    ON CONFLICT(user_id, ball_type) DO UPDATE SET quantity = quantity + ?
  `).run(userId, ballType, amount, amount);
}
