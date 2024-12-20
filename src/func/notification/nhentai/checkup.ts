import { EmbedBuilder } from 'discord.js';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import nhentai from '@/func/api/nhentai';
import logger from '@/class/logger';

import type { R7Client } from '@/class/client';
import type { local_subscribe } from '@/func/types/subData';
import type { Channel } from 'discord.js';
import type { Doujin } from '@/func/api/nhentai/tagAPI';

export async function checkup(client: R7Client): Promise<void> {
  const folderPath = './resource/nhentai';
  const folder = readdirSync(folderPath);

  for (const file of folder) {
    const filePath = join(folderPath, file);
    const localData: local_subscribe = JSON.parse(
      readFileSync(filePath, 'utf-8'),
    );

    let channel = client.channels.cache.get(localData.channel);

    try {
      if (!channel) {
        logger.info(`[nhentai] the cach is empty, try to fetch channel.....`);
        const fetchChannel = await client.channels.fetch(localData.channel);
        if (!fetchChannel) {
          throw `cannot find serve channel`;
        }
        channel = fetchChannel;
      }

      for (const entry of localData.sub) {
        const doujin = await nhentai.getLastTagAPI(entry.id);

        if (
          doujin.title.pretty !== entry.last_up
          && doujin.tags.some((val) => val.name === entry.status)
        ) {
          logger.info(
            `[nhentai] ${entry.name} new upload - ${
              doujin.title.japanese || doujin.title.pretty
            }`,
          );
          entry.last_up = doujin.title.pretty;
          entry.other = 'https://nhentai.net/g/' + doujin.id.toString();
          await sendAnnouncement(doujin, channel, entry.name);
        }
      }
      writeFileSync(filePath, JSON.stringify(localData, null, 2), 'utf-8');
    }
    catch (error) {
      throw new Error(`[nhentai]${error}`);
    }
  }
}

async function sendAnnouncement(
  doujin: Doujin,
  channel: Channel,
  artist: string,
): Promise<void> {
  if (!channel.isTextBased()) throw `channel type error`;

  const coverType
      = doujin.images.cover.t === 'p'
        ? 'png'
        : doujin.images.cover.t === 'j'
          ? 'jpg'
          : 'gif';

  const tags: string[] = [];
  doujin.tags.forEach((val, _) => {
    tags.push(val.name);
  });
  const embeds = new EmbedBuilder()
    .setTitle(`${doujin.title.japanese || doujin.title.pretty}`)
    .setURL(`https://nhentai.net/g/${doujin.id}`)
    .setDescription(
      '- 使用</sub_nhentai: 1271034447130791989> 還訂閱更多作者\n- 或是使用</rm_nhentai: 1268082123466739765>來取消訂閱',
    )
    .setThumbnail(
      'https://archive.org/download/nhentai-logo-3/nhentai-logo-3.jpg',
    )
    .setImage(
      `https://t3.nhentai.net/galleries/${doujin.media_id}/cover.${coverType}`,
    )
    .setTimestamp(Date.now())
    .addFields(
      {
        name: '🛜 原網站',
        value: '[nhentai](https://nhentai.net/)',
        inline: true,
      },
      {
        name: '👾 作者',
        value: artist,
        inline: true,
      },
      {
        name: '🆔 作品id',
        value: doujin.id.toString(),
        inline: true,
      },
      {
        name: '📖 頁數',
        value: doujin.num_pages.toString(),
        inline: true,
      },
      {
        name: '❤️ 喜歡人數',
        value: doujin.num_favorites.toString(),
        inline: true,
      },
      {
        name: '✒️ 標籤',
        value: tags.join(', '),
      },
    )
    .setFooter({
      text: 'archie0732\'s kunkun-bot v2 with TypeScript',
    });

  if (!channel.isSendable()) return;

  await channel.send({
    content: `您在[nhentai](https://nhentai.net/)訂閱的 [${artist}](https://nhentai.net/artist/${artist})更新了[${
      doujin.title.pretty || doujin.id
    }](https://nhentai.net/g/${doujin.id})`,
    embeds: [embeds],
  });
}
