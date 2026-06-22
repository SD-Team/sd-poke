import { CommandInteraction, CacheType } from 'discord.js';
import { getOrCreateUser } from '../database/repositories/user.repo.js';
import { getBalls } from '../database/repositories/inventory.repo.js';
import { getRandomPokemon } from '../services/spawn.service.js';
import { processCatch } from '../services/catch-processor.js';
import { buildSpawnEmbed, buildResultEmbed } from '../services/reward.service.js';
import { setActiveSpawn, removeActiveSpawn } from '../services/spawn-tracker.js';
import { COOLDOWN_MS, CATCH_TIMEOUT_MS } from '../config.js';
import type { BallType, CatchResult } from '../models/types.js';

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
  setActiveSpawn(interaction.channelId, { pokemon, userBalls, currentStreak, totalCaught: user.total_caught, message, timestamp: now });

  try {
    const btnInteraction = await message.awaitMessageComponent({
      filter: (i) => {
        if (!i.isButton()) return false;
        return i.user.id === userId;
      },
      time: CATCH_TIMEOUT_MS,
    });

    removeActiveSpawn(interaction.channelId);

    const ballType = btnInteraction.customId.replace('catch_', '') as BallType;

    const { result, embeds: resultEmbeds, noBalls } = processCatch(
      userId, pokemon, ballType, currentStreak, user.total_caught, user.amulet_coins,
    );

    if (noBalls) {
      await btnInteraction.update({ content: '❌ You ran out of that ball type!', embeds: [], components: [] });
      return;
    }

    await btnInteraction.update({ embeds: resultEmbeds!, components: [] });
  } catch {
    removeActiveSpawn(interaction.channelId);
    const timeoutEmbed = buildResultEmbed({
      success: false, pokemon, ballUsed: 'pokeball',
      catchRate: 0, roll: 0, coinsEarned: 0,
      newStreak: currentStreak, totalCaught: user.total_caught,
    } as CatchResult);
    await interaction.editReply({ embeds: timeoutEmbed.embeds, components: [] });
  }
}
