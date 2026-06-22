import { CommandInteraction, CacheType, ButtonInteraction } from 'discord.js';
import { getOrCreateUser, updateCoins, updateStreak, incrementTotalCaught } from '../database/repositories/user.repo.js';
import { getBalls, removeBall } from '../database/repositories/inventory.repo.js';
import { addEntry } from '../database/repositories/pokedex.repo.js';
import { getRandomPokemon } from '../services/spawn.service.js';
import { calculateCatchRate, rollCatch, calculateCoins } from '../services/catch.service.js';
import { buildSpawnEmbed, buildResultEmbed } from '../services/reward.service.js';
import { COOLDOWN_MS, CATCH_TIMEOUT_MS } from '../config.js';
import type { BallType, Rarity, CatchResult } from '../models/types.js';

const cooldowns = new Map<string, number>();

export async function handleSpawn(interaction: CommandInteraction<CacheType>): Promise<void> {
  const userId = interaction.user.id;
  const now = Date.now();

  const lastSpawn = cooldowns.get(userId);
  if (lastSpawn && now - lastSpawn < COOLDOWN_MS) {
    const remaining = ((COOLDOWN_MS - (now - lastSpawn)) / 1000).toFixed(1);
    await interaction.reply({ content: `⏳ Please wait ${remaining}s before using /spawn again.`, ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const user = getOrCreateUser(userId);
  const userBalls = getBalls(userId);

  const totalBalls = Object.values(userBalls).reduce((a, b) => a + b, 0);
  if (totalBalls <= 0) {
    await interaction.editReply({ content: '❌ You have no pokeballs! You need to buy some first.' });
    return;
  }

  const pokemon = getRandomPokemon();
  const streakKey = `streak_${pokemon.rarity}` as keyof typeof user;
  const currentStreak = (user[streakKey] as number) || 0;

  const { embeds, components } = buildSpawnEmbed(pokemon, userBalls, currentStreak, user.total_caught);
  const message = await interaction.editReply({ embeds, components });

  cooldowns.set(userId, now);

  try {
    const btnInteraction = await message.awaitMessageComponent({
      filter: (i) => {
        if (!i.isButton()) return false;
        return i.user.id === userId;
      },
      time: CATCH_TIMEOUT_MS,
    });

    const ballType = btnInteraction.customId.replace('catch_', '') as BallType;

    if (!removeBall(userId, ballType)) {
      await btnInteraction.update({ content: '❌ You ran out of that ball type!', embeds: [], components: [] });
      return;
    }

    const catchRate = calculateCatchRate(pokemon.rarity as Rarity, ballType);
    const { success, roll } = rollCatch(catchRate);

    if (success) {
      const coins = calculateCoins(pokemon.rarity as Rarity, currentStreak, user.amulet_coins);
      updateCoins(userId, coins);
      updateStreak(userId, pokemon.rarity, true);
      incrementTotalCaught(userId);
      addEntry(userId, pokemon.id, false);

      const result: CatchResult = {
        success: true, pokemon, ballUsed: ballType,
        catchRate, roll, coinsEarned: coins,
        newStreak: currentStreak + 1, totalCaught: user.total_caught + 1,
      };
      const { embeds: resultEmbeds } = buildResultEmbed(result);
      await btnInteraction.update({ embeds: resultEmbeds, components: [] });
    } else {
      updateStreak(userId, pokemon.rarity, false);
      const result: CatchResult = {
        success: false, pokemon, ballUsed: ballType,
        catchRate, roll, coinsEarned: 0,
        newStreak: 0, totalCaught: user.total_caught,
      };
      const { embeds: resultEmbeds } = buildResultEmbed(result);
      await btnInteraction.update({ embeds: resultEmbeds, components: [] });
    }
  } catch {
    const timeoutEmbed = buildResultEmbed({
      success: false, pokemon, ballUsed: 'pokeball',
      catchRate: 0, roll: 0, coinsEarned: 0,
      newStreak: currentStreak, totalCaught: user.total_caught,
    });
    await interaction.editReply({ embeds: timeoutEmbed.embeds, components: [] });
  }
}
