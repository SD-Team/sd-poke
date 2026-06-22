import type { PokedexRow } from '../../models/types.js';
import { getDb } from '../connection.js';

export function addEntry(userId: string, pokemonId: number, shiny: boolean): void {
  getDb().prepare(`
    INSERT INTO pokedex (user_id, pokemon_id, shiny) VALUES (?, ?, ?)
    ON CONFLICT(user_id, pokemon_id, shiny) DO UPDATE SET caught_at = datetime('now')
  `).run(userId, pokemonId, shiny ? 1 : 0);
}

export function hasCaught(userId: string, pokemonId: number): boolean {
  const row = getDb().prepare('SELECT 1 FROM pokedex WHERE user_id = ? AND pokemon_id = ? AND shiny = 0').get(userId, pokemonId);
  return !!row;
}

export function getPokedex(userId: string): PokedexRow[] {
  return getDb().prepare('SELECT * FROM pokedex WHERE user_id = ? ORDER BY caught_at DESC').all(userId) as unknown as PokedexRow[];
}

export function getUniqueCount(userId: string): number {
  const row = getDb().prepare('SELECT COUNT(*) as count FROM pokedex WHERE user_id = ?').get(userId) as { count: number };
  return row.count;
}
