import 'dotenv/config';
import type { BallConfig, Rarity } from './models/types.js';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';

export const COOLDOWN_MS = 7000;
export const CATCH_TIMEOUT_MS = 30000;

export const BALLS: Record<string, BallConfig> = {
  pokeball:   { type: 'pokeball',   bonus: 10,  emoji: '🔴', label: 'Pokéball' },
  greatball:  { type: 'greatball',  bonus: 25,  emoji: '🔵', label: 'Greatball' },
  ultraball:  { type: 'ultraball',  bonus: 35,  emoji: '🟡', label: 'Ultraball' },
  premierball:{ type: 'premierball',bonus: 50,  emoji: '⚪', label: 'Premierball' },
  masterball: { type: 'masterball', bonus: 100, emoji: '💜', label: 'Masterball' },
};

export const BALL_ORDER: string[] = ['pokeball', 'greatball', 'ultraball', 'premierball', 'masterball'];

export const BASE_CATCH_RATES: Record<Rarity, number> = {
  common: 70,
  uncommon: 60,
  rare: 50,
  super_rare: 30,
  legendary: 10,
};

export const ENCOUNTER_WEIGHTS: Record<Rarity, number> = {
  common: 400,
  uncommon: 300,
  rare: 150,
  super_rare: 100,
  legendary: 1,
};

export const BASE_COINS: Record<Rarity, number> = {
  common: 150,
  uncommon: 300,
  rare: 500,
  super_rare: 1000,
  legendary: 10000,
};

export const STREAK_BONUS_COINS_MULTIPLIER = 0.1;

export const STARTER_INVENTORY: Record<string, number> = {
  pokeball: 50,
  greatball: 30,
  ultraball: 10,
  premierball: 1,
  masterball: 1,
};
