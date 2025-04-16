import { EmbedBuilder, Events } from 'discord.js';
import { R7EventHandler } from '@/class/events';

import logger from '@/class/logger';
import { readdirSync, readFileSync } from 'fs';
import { disocrdPath } from '@/utils/const';
import { resolve } from 'path';
import type { CacheUser } from '@/types/cache';
import { autoSign } from '@/api/hoyolab';
import type { R7Client } from '@/class/client';

export default new R7EventHandler({
  event: Events.ClientReady,
  async on(client) {
    void client;
    scheduleDailySign(this);
  },
});

const scheduleDailySign = (client: R7Client) => {
  const now = new Date();
  const nextSignTime = new Date();
  nextSignTime.setHours(9, 0, 0, 0);

  if (now >= nextSignTime) {
    nextSignTime.setDate(nextSignTime.getDate() + 1);
  }

  const timeUntilNextSign = nextSignTime.getTime() - now.getTime();
  logger.info(`[discordbot] 下次自動簽到時間: ${nextSignTime.toLocaleString()}`);

  setTimeout(() => {
    signSchedule(client);
    setInterval(() => signSchedule(client), 24 * 60 * 60 * 1000);
  }, timeUntilNextSign);
};

const signSchedule = async (client: R7Client) => {
  const folder = readdirSync(disocrdPath.user);

  for (const file of folder) {
    const data = JSON.parse(readFileSync(resolve(disocrdPath.user, file), 'utf-8')) as CacheUser;

    try {
      const result = await autoSign(data.hoyoAutoSign.game, data.hoyoAutoSign.token);
      const user = await client.users.fetch(data.userId);

      const embeds = new EmbedBuilder().setAuthor({ name: client.user?.displayName ?? 'i Kun v4', iconURL: client.user?.displayAvatarURL() })
        .setTitle('📝 今日的簽到結果')
        .setDescription('‼️ 如果顯示`簽到失敗` 或 `尚未登入`\n請重新使用`/hoyolab-auto-sign` 指令更新`token`')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/zh/f/fc/%E5%8E%9F%E7%A5%9E_%E5%9C%8B%E9%9A%9B%E7%89%88.jpeg')
        .setFields([
          {
            name: '😎 Genshin',
            value: result.Genshin,
          },
          {
            name: '😶‍🌫️ Honkai 3',
            value: result.Honkai_3,
          },
          {
            name: '🤓 Star Rail',
            value: result.Star_Rail,
          },
          {
            name: '🤡 Zenless Zone Zero',
            value: result.Zenless_Zone_Zero,
          },
        ]);

      user.send({
        content: '🎉 今天的hoyolab自動簽到結果~',
        embeds: [embeds],
      });

      logger.info(`已向${user.globalName} 發送簽到完成通知！`);
    }
    catch (error) {
      logger.error('[discordbot]hoyolab-auto-sign fail', error);
    }
  }
};
