import type { PokedexRow } from '../../models/types.js';
import { getDb } from '../connection.js';

export function addEntry(userId: string, pokemonId: number, shiny: boolean): void {
  getDb().prepare(`
    INSERT INTO pokedex (user_id, pokemon_id, shiny, quantity) VALUES (?, ?, ?, 1)
    ON CONFLICT(user_id, pokemon_id, shiny) DO UPDATE SET quantity = quantity + 1, caught_at = datetime('now')
  `).run(userId, pokemonId, shiny ? 1 : 0);
}

export function hasCaught(userId: string, pokemonId: number): boolean {
  const row = getDb().prepare('SELECT 1 FROM pokedex WHERE user_id = ? AND pokemon_id = ? AND shiny = 0').get(userId, pokemonId);
  return !!row;
}

export function getPokedex(userId: string): PokedexRow[] {
  return getDb().prepare('SELECT * FROM pokedex WHERE user_id = ? ORDER BY caught_at DESC').all(userId) as unknown as PokedexRow[];
}

export function getBoxPage(userId: string, sortBy: string, page: number, perPage: number): { rows: PokedexRow[]; total: number } {
  const countRow = getDb().prepare('SELECT COUNT(*) as count FROM pokedex WHERE user_id = ?').get(userId) as { count: number };
  const total = countRow.count;
  const orderClause = sortBy === 'rarity'
    ? "ORDER BY CASE WHEN shiny > 0 THEN 0 ELSE 1 END, pokemon_id ASC"
    : "ORDER BY caught_at DESC";
  const rows = getDb().prepare(`SELECT * FROM pokedex WHERE user_id = ? ${orderClause} LIMIT ? OFFSET ?`).all(userId, perPage, (page - 1) * perPage) as unknown as PokedexRow[];
  return { rows, total };
}

export function getUniqueCount(userId: string): number {
  const row = getDb().prepare('SELECT COUNT(*) as count FROM pokedex WHERE user_id = ?').get(userId) as { count: number };
  return row.count;
}
