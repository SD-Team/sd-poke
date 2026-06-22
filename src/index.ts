import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { DISCORD_TOKEN } from './config.js';
import { getDb } from './database/connection.js';
import { handleSpawn } from './commands/spawn.js';
import { handleTextSpawn, handleTextCatch, BALL_ALIASES } from './commands/prefix-handler.js';
import { ensureEmoji } from './emoji-config.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  for (const guild of client.guilds.cache.values()) {
    try {
      await ensureEmoji(guild);
    } catch {
      // skip guilds where bot lacks permissions
    }
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const commands = [
    new SlashCommandBuilder()
      .setName('spawn')
      .setDescription('Spawn a wild Pokémon to catch!'),
  ];

  try {
    await rest.put(Routes.applicationCommands(client.user!.id), { body: commands });
    console.log('Slash commands registered');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand() && interaction.commandName === 'spawn') {
    await handleSpawn(interaction);
  }
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  const prefix = ';';
  if (!msg.content.startsWith(prefix)) return;

  const [cmd, ...args] = msg.content.slice(prefix.length).trim().split(/\s+/);

  try {
    if (cmd === 'p' || cmd === 'pokemon') {
      await msg.channel.sendTyping();
      await handleTextSpawn(msg, args);
    } else if (BALL_ALIASES[cmd]) {
      await handleTextCatch(msg, [cmd]);
    }
  } catch (err) {
    console.error('Prefix command error:', err);
    msg.reply('An error occurred while processing your command.').catch(() => {});
  }
});

getDb();
console.log('Database initialized');

client.login(DISCORD_TOKEN).catch((err) => {
  console.error('Failed to login:', err);
  process.exit(1);
});
