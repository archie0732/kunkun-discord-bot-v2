import type { CacheUser } from '@/types/cache';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { disocrdPath } from './const';
import type { ChatInputCommandInteraction } from 'discord.js';

export const CreateUserData = (interaction: ChatInputCommandInteraction) => {
  const user = interaction.user?.displayName;

  const userId = interaction.user?.id;

  if (!user || !userId) return -1;

  if (existsSync(join(disocrdPath.user, `${userId}.json`))) {
    return 1;
  }

  const data: CacheUser = {
    userId,
    hoyoAutoSign: {
      token: '',
      game: {
        Genshin: false,
        Honkai_3: false,
        Star_Rail: false,
        Zenless_Zone_Zero: false,
      },
    },
  };

  writeFileSync(join(disocrdPath.user, `${userId}.json`), JSON.stringify(data, null, 2), 'utf-8');
  return 1;
};
