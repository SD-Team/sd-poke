import type { ItemRow } from '../../models/types.js';
import { getDb } from '../connection.js';
import { ITEM_NAMES } from '../../config.js';

const insertItem = getDb().prepare('INSERT OR IGNORE INTO items (user_id, item_name, quantity, metadata) VALUES (?, ?, 0, \'{}\')');
const getItemStmt = getDb().prepare('SELECT * FROM items WHERE user_id = ? AND item_name = ?');
const getAllStmt = getDb().prepare('SELECT * FROM items WHERE user_id = ? ORDER BY item_name');
const updateStmt = getDb().prepare('UPDATE items SET quantity = ? WHERE user_id = ? AND item_name = ?');

export function seedItems(userId: string): void {
  for (const name of ITEM_NAMES) {
    insertItem.run(userId, name);
  }
}

export function getItem(userId: string, itemName: string): ItemRow | undefined {
  return getItemStmt.get(userId, itemName) as unknown as ItemRow | undefined;
}

export function getAllItems(userId: string): ItemRow[] {
  return getAllStmt.all(userId) as unknown as ItemRow[];
}

export function setItemQuantity(userId: string, itemName: string, quantity: number): void {
  updateStmt.run(quantity, userId, itemName);
}

export function addItem(userId: string, itemName: string, amount: number): void {
  getDb().prepare('UPDATE items SET quantity = quantity + ? WHERE user_id = ? AND item_name = ?').run(amount, userId, itemName);
}

export function removeItem(userId: string, itemName: string, amount: number): boolean {
  const row = getItem(userId, itemName);
  if (!row || row.quantity < amount) return false;
  setItemQuantity(userId, itemName, row.quantity - amount);
  return true;
}

export function getItemMetadata(userId: string, itemName: string): Record<string, unknown> {
  const row = getItem(userId, itemName);
  if (!row) return {};
  try { return JSON.parse(row.metadata); } catch { return {}; }
}

export function setItemMetadata(userId: string, itemName: string, metadata: Record<string, unknown>): void {
  getDb().prepare('UPDATE items SET metadata = ? WHERE user_id = ? AND item_name = ?').run(JSON.stringify(metadata), userId, itemName);
}
