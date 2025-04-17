import 'dotenv/config';
import { R7Client } from '@/class/client';
import { GatewayIntentBits } from 'discord.js';

import type { ClientOptions } from 'discord.js';
import { mkdirSync } from 'fs';
import { join, resolve } from 'path';

const options = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
} satisfies ClientOptions;

const cacheFolder = resolve('.cache');

for (const subfolder of ['guild', 'hanime1', 'nhentai', 'manhuagui', 'user']) {
  mkdirSync(join(cacheFolder, subfolder), { recursive: true });
}

const client = new R7Client(options);


client.login(process.env['TOKEN']).catch(console.error);
