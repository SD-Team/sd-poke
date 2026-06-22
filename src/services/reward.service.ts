import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Pokemon, BallType, CatchResult } from '../models/types.js';
import { BALLS, BALL_ORDER, BASE_CATCH_RATES } from '../config.js';
import { getBallEmoji } from '../emoji-config.js';

const RARITY_COLORS: Record<string, number> = {
  common: 0x0855FB,
  uncommon: 0x13B5E7,
  rare: 0xFB8A08,
  super_rare: 0xF8F407,
  legendary: 0xA007F8,
};

const RARITY_NAMES: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  super_rare: 'Super Rare',
  legendary: 'Legendary',
};

export function buildSpawnEmbed(
  pokemon: Pokemon,
  userBalls: Record<string, number>,
  _currentStreak: number,
  _totalCaught: number,
  hasCaught = false,
): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const color = RARITY_COLORS[pokemon.rarity] || 0x0855FB;
  const totalBalls = BALL_ORDER.map(k => userBalls[k] || 0).reduce((a, b) => a + b);
  const catchStatus = hasCaught ? '' : ' (new!)';

  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: 'Wild Pokémon appeared!' })
    .setDescription(`A wild **${pokemon.displayName}** appeared!${catchStatus}`)
    .setThumbnail(pokemon.sprite)
    .setFooter({ text: `${RARITY_NAMES[pokemon.rarity] || pokemon.rarity}\nBalls left: ${totalBalls}` });

  const ballCount = BALL_ORDER.length;
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < ballCount; i += 3) {
    const batch = BALL_ORDER.slice(i, i + 3);
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const ballKey of batch) {
      const qty = userBalls[ballKey] || 0;
      const ballEmojiId = getBallEmoji(ballKey);
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`catch_${ballKey}`)
          .setEmoji(ballEmojiId || BALLS[ballKey].emoji)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(qty <= 0),
      );
    }
    rows.push(row);
  }
  return { embeds: [embed], components: rows };
}

export function buildResultEmbed(result: CatchResult): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const pokemon = result.pokemon;
  const ballEmoji = getBallEmoji(result.ballUsed) || BALLS[result.ballUsed]?.emoji || '';

  let embed: EmbedBuilder;

  if (result.success) {
    embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setAuthor({ name: 'CAUGHT!' })
      .setDescription(`Great work! You caught a **${pokemon.displayName}**!`)
      .addFields(
        { name: 'Ball', value: `${ballEmoji} ${BALLS[result.ballUsed].label}`, inline: true },
        { name: 'Roll', value: `${result.roll.toFixed(1)}% / ${result.catchRate.toFixed(0)}%`, inline: true },
        { name: 'Coins', value: `🪙 +${result.coinsEarned}`, inline: true },
        { name: 'Streak', value: `🔥 ${result.newStreak}`, inline: true },
        { name: 'Total Caught', value: `📦 ${result.totalCaught}`, inline: true },
      )
      .setThumbnail(pokemon.sprite)
      .setTimestamp();
  } else {
    embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setAuthor({ name: 'FLED...' })
      .setDescription(`The **${pokemon.displayName}** broke out!`)
      .addFields(
        { name: 'Ball', value: `${ballEmoji} ${BALLS[result.ballUsed].label}`, inline: true },
        { name: 'Roll', value: `${result.roll.toFixed(1)}% / ${result.catchRate.toFixed(0)}%`, inline: true },
        { name: 'Better luck next time!', value: 'Tip: Use a stronger ball for better odds.', inline: false },
      )
      .setThumbnail(pokemon.sprite)
      .setTimestamp();
  }

  return { embeds: [embed], components: [] };
}
