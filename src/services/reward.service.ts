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

export function buildSpawnEmbed(
  pokemon: Pokemon,
  userBalls: Record<string, number>,
  currentStreak: number,
  _totalCaught: number,
  hasCaught = false,
  trainerName = 'Trainer',
): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const color = RARITY_COLORS[pokemon.rarity] || 0x0855FB;
  const caughtEmoji = hasCaught ? '✅' : '⬜';
  const streakKey = pokemon.rarity.charAt(0).toUpperCase() + pokemon.rarity.slice(1).replace('_', ' ');
  const rarityLabel = streakKey + encounterRate(pokemon.rarity);

  const ballEntries = BALL_ORDER.filter(k => (userBalls[k] || 0) > 0);
  const mid = Math.ceil(ballEntries.length / 2);
  const fmtBall = (k: string, qty: number) => {
    const label = BALLS[k]?.label || k;
    return `${label.endsWith('s') ? label : label + 's'}: ${qty}`;
  };
  const footerBalls = [
    ballEntries.slice(0, mid).map(k => fmtBall(k, userBalls[k]!)).join('  •  '),
    ...(ballEntries.slice(mid).length > 0 ? [ballEntries.slice(mid).map(k => fmtBall(k, userBalls[k]!)).join('  •  ')] : []),
  ];
  const footerText = [
    rarityLabel,
    `${streakKey} streak: ${currentStreak}`,
    '',
    '══════ Balls left ══════',
    ...footerBalls,
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: 'A wild Pokémon appeared!' })
    .setDescription(`${trainerName} found a wild #${String(pokemon.id).padStart(4, '0')} ${caughtEmoji} ${pokemon.displayName}!`)
    .setImage(pokemon.sprite)
    .setFooter({ text: footerText });

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

export function buildResultEmbed(
  result: CatchResult,
  trainerName = 'Trainer',
  userBalls: Record<string, number> = {},
): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const pokemon = result.pokemon;
  const ballLabel = BALLS[result.ballUsed]?.label || result.ballUsed;
  const streakKey = pokemon.rarity.charAt(0).toUpperCase() + pokemon.rarity.slice(1).replace('_', ' ');
  const encounterRateStr = encounterRate(pokemon.rarity);

  const ballEntries = BALL_ORDER.filter(k => (userBalls[k] || 0) > 0);
  const mid = Math.ceil(ballEntries.length / 2);
  const fmtBall = (k: string, qty: number) => {
    const label = BALLS[k]?.label || k;
    return `${label.endsWith('s') ? label : label + 's'}: ${qty}`;
  };
  const footerBalls = ballEntries.length > 0 ? [
    '',
    '══════ Balls left ══════',
    ...(mid > 0 ? [ballEntries.slice(0, mid).map(k => fmtBall(k, userBalls[k]!)).join('  •  ')] : []),
    ...(ballEntries.slice(mid).length > 0 ? [ballEntries.slice(mid).map(k => fmtBall(k, userBalls[k]!)).join('  •  ')] : []),
  ] : [];

  let embed: EmbedBuilder;

  if (result.success) {
    const footerText = [
      `Rarity: ${streakKey}${encounterRateStr}`,
      `${streakKey} streak: ${result.newStreak}`,
      '',
      `Pokemon roll: ${result.roll.toFixed(0)}%`,
      `Your catch rate: ${result.catchRate.toFixed(0)}%`,
      ...footerBalls,
      '',
      `You earned ${result.coinsEarned} PokeCoins!`,
    ].join('\n');

    embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setAuthor({ name: `Congratulations, ${trainerName}!` })
      .setDescription(`✅ You caught a **${pokemon.displayName}** with a **${ballLabel}**!`)
      .setImage(pokemon.sprite)
      .setFooter({ text: footerText });
  } else {
    const footerText = [
      `Ball used: ${ballLabel}`,
      `Pokemon roll: ${result.roll.toFixed(0)}%`,
      `Your catch rate: ${result.catchRate.toFixed(0)}%`,
      ...footerBalls,
    ].join('\n');

    embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setAuthor({ name: 'FLED...' })
      .setDescription(`The **${pokemon.displayName}** broke out!`)
      .setImage(pokemon.sprite)
      .setFooter({ text: footerText });
  }

  return { embeds: [embed], components: [] };
}
