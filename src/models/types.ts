export type Rarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'legendary';
export type BoxRarity = Rarity | 'mega' | 'shiny';

export type BallType = 'pokeball' | 'greatball' | 'ultraball' | 'premierball' | 'masterball'
  | 'diveball' | 'beastball' | 'luxuryball' | 'netball' | 'lureball'
  | 'duskball' | 'moonball' | 'friendball' | 'loveball' | 'fastball'
  | 'heavyball' | 'quickball';

export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  rarity: Rarity;
  types: string[];
  sprite: string;
}

export interface BallConfig {
  type: BallType;
  bonus: number;
  emoji: string;
  label: string;
}

export interface UserRow {
  id: string;
  coins: number;
  streak_common: number;
  streak_uncommon: number;
  streak_rare: number;
  streak_super_rare: number;
  streak_legendary: number;
  total_caught: number;
  amulet_coins: number;
  created_at: string;
}

export interface InventoryRow {
  user_id: string;
  ball_type: BallType;
  quantity: number;
}

export interface PokedexRow {
  id: number;
  user_id: string;
  pokemon_id: number;
  shiny: number;
  quantity: number;
  caught_at: string;
}

export interface CatchResult {
  success: boolean;
  pokemon: Pokemon;
  ballUsed: BallType;
  catchRate: number;
  roll: number;
  coinsEarned: number;
  newStreak: number;
  totalCaught: number;
}

export interface ItemConfig {
  name: string;
  emoji: string;
  unicodeFallback: string;
  section: string;
  metadata?: boolean;
}

export interface ItemRow {
  id: number;
  user_id: string;
  item_name: string;
  quantity: number;
  metadata: string;
}

export interface BoxEntry {
  dex_id: number;
  name: string;
  rarity: BoxRarity;
  quantity: number;
  shiny: boolean;
}
