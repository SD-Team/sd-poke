import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Pokemon, BallType, CatchResult } from '../models/types.js';
import { BALLS, BALL_ORDER, ENCOUNTER_WEIGHTS } from '../config.js';
import { getBallEmoji } from '../emoji-config.js';

const RARITY_COLORS: Record<string, number> = {
  common: 0x0855FB,
  uncommon: 0x13B5E7,
  rare: 0xFB8A08,
  super_rare: 0xF8F407,
  legendary: 0xA007F8,
};

const TOTAL_WEIGHT = Object.values(ENCOUNTER_WEIGHTS).reduce((a, b) => a + b, 0);

function encounterRate(rarity: string): string {
  const w = ENCOUNTER_WEIGHTS[rarity as keyof typeof ENCOUNTER_WEIGHTS];
  if (!w) return '';
  return ` (${(w / TOTAL_WEIGHT * 100).toFixed(1)}% encounter rate)`;
}

function ballsField(userBalls: Record<string, number>): string {
  const pairs = Object.entries(userBalls).filter(([, qty]) => qty > 0).map(([k, qty]) => {
    const e = getBallEmoji(k) || BALLS[k]?.emoji || '';
    return `${e} ${k.charAt(0).toUpperCase() + k.slice(1).replace('ball', 'balls')}: ${qty}`;
  });
  if (pairs.length === 0) return 'No balls left!';
  const mid = Math.ceil(pairs.length / 2);
  return `\`\`\`\n${pairs.slice(0, mid).join('\n')}\n${pairs.slice(mid).join('\n')}\n\`\`\``.trim();
}

export function buildSpawnEmbed(
  pokemon: Pokemon,
  userBalls: Record<string, number>,
  currentStreak: number,
  _totalCaught: number,
  hasCaught = false,
): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const color = RARITY_COLORS[pokemon.rarity] || 0x0855FB;
  const totalBalls = BALL_ORDER.map(k => userBalls[k] || 0).reduce((a, b) => a + b);
  const caughtEmoji = hasCaught ? '✅' : '⬜';
  const streakKey = pokemon.rarity.charAt(0).toUpperCase() + pokemon.rarity.slice(1).replace('_', ' ');
  const rarityLabel = streakKey + encounterRate(pokemon.rarity);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: 'A wild Pokémon appeared!' })
    .setDescription(`${pokemon.displayName} #${String(pokemon.id).padStart(4, '0')} ${caughtEmoji}`)
    .addFields(
      { name: 'Rarity', value: rarityLabel, inline: true },
      { name: `${streakKey} streak`, value: `${currentStreak}`, inline: true },
    )
    .setImage(pokemon.sprite)
    .setFooter({ text: `═════ Balls left: ${totalBalls} ═════` });

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
      .setImage(pokemon.sprite)
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
      .setImage(pokemon.sprite)
      .setTimestamp();
  }

  return { embeds: [embed], components: [] };
}
