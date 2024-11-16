import 'dotenv/config';
import { R7Client } from '@/class/client';
import { GatewayIntentBits } from 'discord.js';

import type { ClientOptions } from 'discord.js';

const options = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent],
} satisfies ClientOptions;

const client = new R7Client(options);

client.login(process.env['TOKEN']).catch(console.error);
