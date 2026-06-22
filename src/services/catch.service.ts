import type { BallType, Rarity } from '../models/types.js';
import { BALLS, BASE_CATCH_RATES, BASE_COINS, STREAK_BONUS_COINS_MULTIPLIER } from '../config.js';

export function calculateCatchRate(rarity: Rarity, ballType: BallType): number {
  const base = BASE_CATCH_RATES[rarity];
  const bonus = BALLS[ballType].bonus;
  return Math.min(base + bonus, 100);
}

export function rollCatch(catchRate: number): { success: boolean; roll: number } {
  const roll = Math.random() * 100;
  return { success: roll < catchRate, roll };
}

export function calculateCoins(rarity: Rarity, streak: number, amuletCoins: number): number {
  const base = BASE_COINS[rarity];
  const streakMultiplier = 1 + streak * STREAK_BONUS_COINS_MULTIPLIER;
  const amuletMultiplier = 1 + 0.05 * amuletCoins;
  return Math.floor(base * streakMultiplier * amuletMultiplier);
}
