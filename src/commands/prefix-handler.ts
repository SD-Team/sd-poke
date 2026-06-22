import { Message, ButtonInteraction } from 'discord.js';
import { getOrCreateUser } from '../database/repositories/user.repo.js';
import { getBalls } from '../database/repositories/inventory.repo.js';
import { getRandomPokemon } from '../services/spawn.service.js';
import { processCatch } from '../services/catch-processor.js';
import { buildSpawnEmbed, buildResultEmbed } from '../services/reward.service.js';
import { setActiveSpawn, getActiveSpawn, removeActiveSpawn } from '../services/spawn-tracker.js';
import { COOLDOWN_MS, CATCH_TIMEOUT_MS } from '../config.js';
import type { BallType, CatchResult } from '../models/types.js';

const cooldowns = new Map<string, number>();

const BALL_ALIASES: Record<string, BallType> = {
  pb: 'pokeball',
  gb: 'greatball',
  ub: 'ultraball',
  prb: 'premierball',
  mb: 'masterball',
};

export async function handleTextSpawn(msg: Message, _args: string[]): Promise<void> {
  const userId = msg.author.id;
  const now = Date.now();

  const lastSpawn = cooldowns.get(userId);
  if (lastSpawn && now - lastSpawn < COOLDOWN_MS) {
    return;
  }

  const user = getOrCreateUser(userId);
  const userBalls = getBalls(userId);

  const totalBalls = Object.values(userBalls).reduce((a, b) => a + b, 0);
  if (totalBalls <= 0) return;

  const pokemon = getRandomPokemon();
  const streakKey = `streak_${pokemon.rarity}` as keyof typeof user;
  const currentStreak = (user[streakKey] as number) || 0;

  if (!msg.channel.isTextBased() || msg.channel.isDMBased()) return;

  const { embeds, components } = buildSpawnEmbed(pokemon, userBalls, currentStreak, user.total_caught);
  const message = await msg.channel.send({ embeds, components });

  cooldowns.set(userId, now);
  setActiveSpawn(msg.channelId, { pokemon, userBalls, currentStreak, totalCaught: user.total_caught, message, timestamp: now });

  try {
    const btnInteraction = await message.awaitMessageComponent({
      filter: (i) => i.user.id === userId,
      time: CATCH_TIMEOUT_MS,
    });

    removeActiveSpawn(msg.channelId);

    const ballType = btnInteraction.customId.replace('catch_', '') as BallType;
    const { result, embeds: resultEmbeds, noBalls } = processCatch(
      userId, pokemon, ballType, currentStreak, user.total_caught, user.amulet_coins,
    );

    if (noBalls) {
      await btnInteraction.update({ content: `❌ You have no ${ballType}s left!`, embeds: [], components: [] });
      return;
    }

    await btnInteraction.update({ embeds: resultEmbeds!, components: [] });
  } catch {
    const active = getActiveSpawn(msg.channelId);
    if (active && active.timestamp === now) {
      removeActiveSpawn(msg.channelId);
      const timeoutEmbed = buildResultEmbed({
        success: false, pokemon, ballUsed: 'pokeball',
        catchRate: 0, roll: 0, coinsEarned: 0,
        newStreak: currentStreak, totalCaught: user.total_caught,
      } as CatchResult);
      message.edit({ embeds: timeoutEmbed.embeds, components: [] }).catch(() => {});
    }
  }
}

export async function handleTextCatch(msg: Message, args: string[]): Promise<void> {
  if (args.length === 0) return;

  const alias = args[0].toLowerCase();
  const ballType = BALL_ALIASES[alias];
  if (!ballType) return;

  const active = getActiveSpawn(msg.channelId);
  if (!active) return;

  const userId = msg.author.id;

  removeActiveSpawn(msg.channelId);

  const user = getOrCreateUser(userId);
  const { result, embeds, noBalls } = processCatch(
    userId, active.pokemon, ballType, active.currentStreak, active.totalCaught, user.amulet_coins,
  );

  if (noBalls) {
    await msg.reply(`❌ You have no ${ballType}s left!`);
    return;
  }

  await active.message.edit({ embeds: embeds!, components: [] });
}

export { BALL_ALIASES };
