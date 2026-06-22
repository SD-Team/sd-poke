import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Pokemon, BallType, CatchResult } from '../models/types.js';
import { BALLS, BALL_ORDER, BASE_CATCH_RATES } from '../config.js';

const RARITY_COLORS: Record<string, number> = {
  common: 0x0855FB,
  uncommon: 0x13B5E7,
  rare: 0xFB8A08,
  super_rare: 0xF8F407,
  legendary: 0xA007F8,
};

export function buildSpawnEmbed(
  pokemon: Pokemon,
  userBalls: Record<string, number>,
  currentStreak: number,
  totalCaught: number,
): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const color = RARITY_COLORS[pokemon.rarity] || 0xEA250B;

  const embed = new EmbedBuilder()
    .setTitle(`✨ A wild ${pokemon.displayName} appeared!`)
    .setDescription(`**Rarity:** ${pokemon.rarity.replace('_', ' ').toUpperCase()}
**Types:** ${pokemon.types.join(', ')}
**Streak:** ${currentStreak} | **Caught:** ${totalCaught}`)
    .setColor(color)
    .setThumbnail(pokemon.sprite)
    .setFooter({ text: 'Choose your ball wisely — you only get one shot!' })
    .setTimestamp();

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < BALL_ORDER.length; i += 5) {
    const batch = BALL_ORDER.slice(i, i + 5);
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const ballKey of batch) {
      const ball = BALLS[ballKey];
      const qty = userBalls[ballKey] || 0;
      const catchRate = Math.min((BASE_CATCH_RATES[pokemon.rarity] || 0) + ball.bonus, 100);
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`catch_${ballKey}`)
          .setLabel(`${ball.emoji} ${ball.label} (${qty}) [${catchRate}%]`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(qty <= 0),
      );
    }
    rows.push(row);
  }
  return { embeds: [embed], components: rows };
}

export function buildResultEmbed(result: CatchResult): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const color = result.success ? 0x00FF00 : 0xFF0000;
  const title = result.success
    ? `🎉 You caught ${result.pokemon.displayName}!`
    : `💨 ${result.pokemon.displayName} fled!`;

  const description = result.success
    ? `**Ball used:** ${BALLS[result.ballUsed].emoji} ${BALLS[result.ballUsed].label}
**Catch rate:** ${result.catchRate.toFixed(0)}% | **Roll:** ${result.roll.toFixed(1)}
**Coins earned:** 🪙 ${result.coinsEarned}
**Streak:** ${result.newStreak} | **Total caught:** ${result.totalCaught}`
    : `**Ball used:** ${BALLS[result.ballUsed].emoji} ${BALLS[result.ballUsed].label}
**Catch rate:** ${result.catchRate.toFixed(0)}% | **Roll:** ${result.roll.toFixed(1)}
Better luck next time!`;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setThumbnail(result.pokemon.sprite)
    .setTimestamp();

  return { embeds: [embed], components: [] };
}
