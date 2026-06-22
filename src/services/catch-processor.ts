import type { Pokemon, BallType, Rarity, CatchResult } from '../models/types.js';
import { getOrCreateUser } from '../database/repositories/user.repo.js';
import { removeBall } from '../database/repositories/inventory.repo.js';
import { updateCoins, updateStreak, incrementTotalCaught } from '../database/repositories/user.repo.js';
import { addEntry } from '../database/repositories/pokedex.repo.js';
import { calculateCatchRate, rollCatch, calculateCoins } from './catch.service.js';
import { buildResultEmbed } from './reward.service.js';

export function processCatch(
  userId: string,
  pokemon: Pokemon,
  ballType: BallType,
  currentStreak: number,
  totalCaught: number,
  amuletCoins: number,
): { success: boolean; result: CatchResult | null; embeds: ReturnType<typeof buildResultEmbed>['embeds'] | null; noBalls: boolean } {
  if (!removeBall(userId, ballType)) {
    return { success: false, result: null, embeds: null, noBalls: true };
  }

  const catchRate = calculateCatchRate(pokemon.rarity as Rarity, ballType);
  const { success, roll } = rollCatch(catchRate);

  if (success) {
    const coins = calculateCoins(pokemon.rarity as Rarity, currentStreak, amuletCoins);
    updateCoins(userId, coins);
    updateStreak(userId, pokemon.rarity as Rarity, true);
    incrementTotalCaught(userId);
    addEntry(userId, pokemon.id, false);

    const result: CatchResult = {
      success: true, pokemon, ballUsed: ballType,
      catchRate, roll, coinsEarned: coins,
      newStreak: currentStreak + 1, totalCaught: totalCaught + 1,
    };
    return { success: true, result, embeds: buildResultEmbed(result).embeds, noBalls: false };
  }

  updateStreak(userId, pokemon.rarity as Rarity, false);
  const result: CatchResult = {
    success: false, pokemon, ballUsed: ballType,
    catchRate, roll, coinsEarned: 0,
    newStreak: 0, totalCaught,
  };
  return { success: false, result, embeds: buildResultEmbed(result).embeds, noBalls: false };
}
