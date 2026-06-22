import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Pokemon, BallType, CatchResult } from '../models/types.js';
import { BALLS, BALL_ORDER, BASE_CATCH_RATES } from '../config.js';
import { getBallEmoji } from '../emoji-config.js';

const RARITY_COLORS: Record<string, number> = {
  common: 0x3498DB,
  uncommon: 0x1ABC9C,
  rare: 0xE67E22,
  super_rare: 0xF1C40F,
  legendary: 0x9B59B6,
};

const RARITY_EMOJIS: Record<string, string> = {
  common: '●',
  uncommon: '♦',
  rare: '★',
  super_rare: '⭐⭐',
  legendary: '👑',
};

const BALL_BUTTON_STYLES: Record<string, ButtonStyle> = {
  pokeball: ButtonStyle.Secondary,
  greatball: ButtonStyle.Primary,
  ultraball: ButtonStyle.Danger,
  premierball: ButtonStyle.Success,
  masterball: ButtonStyle.Primary,
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
  currentStreak: number,
  totalCaught: number,
): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] } {
  const color = RARITY_COLORS[pokemon.rarity] || 0x95A5A6;
  const rarityEmoji = RARITY_EMOJIS[pokemon.rarity] || '';
  const rarityName = RARITY_NAMES[pokemon.rarity] || pokemon.rarity;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${rarityEmoji} ${pokemon.displayName}  #${String(pokemon.id).padStart(4, '0')}`)
    .addFields(
      { name: 'Rarity', value: rarityName, inline: true },
      { name: 'Type', value: pokemon.types.join(' / ').toUpperCase(), inline: true },
      { name: 'Streak', value: `**${currentStreak}**`, inline: true },
      { name: 'Your Balls', value: BALL_ORDER.map(k => `${getBallEmoji(k) || BALLS[k].emoji} ${userBalls[k] || 0}`).join(' · '), inline: false },
    )
    .setImage(pokemon.sprite)
    .setFooter({ text: `Total caught: ${totalCaught} · Pick a ball to throw!` })
    .setTimestamp();

  const ballCount = BALL_ORDER.length;
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < ballCount; i += 3) {
    const batch = BALL_ORDER.slice(i, i + 3);
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const ballKey of batch) {
      const ball = BALLS[ballKey];
      const qty = userBalls[ballKey] || 0;
      const catchRate = Math.min((BASE_CATCH_RATES[pokemon.rarity] || 0) + ball.bonus, 100);
      const ballEmojiId = getBallEmoji(ballKey);
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`catch_${ballKey}`)
          .setEmoji(ballEmojiId || BALLS[ballKey].emoji)
          .setStyle(BALL_BUTTON_STYLES[ballKey])
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
      .setAuthor({ name: 'CAUGHT!', iconURL: 'https://i.imgur.com/w8CwY2t.png' })
      .setTitle(`✨ ${pokemon.displayName} was caught!`)
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
      .setAuthor({ name: 'FLED...', iconURL: 'https://i.imgur.com/7Z7F7Z7.png' })
      .setTitle(`💨 ${pokemon.displayName} fled!`)
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
