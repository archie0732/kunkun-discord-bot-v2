import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { search } from './fetch';
import { NhentaiError } from './error';
import { EmbedBuilder } from 'discord.js';

import type { R7Client } from '@/class/client';
import type { Doujin, Nhnetai } from './nehntai.interface';
import type { SendableChannels } from 'discord.js';

import logger from '@/class/logger';

export const checkNhnentai = async (client: R7Client) => {
  const deskPath = resolve('.cache', 'nhentai');
  const folder = readdirSync(deskPath);

  for (const file of folder) {
    const filePath = join(deskPath, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8')) as Nhnetai;
    let flag = false;
    const channel = client.channels.cache.get(data.channel);

    if (!channel || !channel.isSendable()) {
      throw new NhentaiError(`Cannot find the channel ${data.channel}`);
    }
    for (const sub of data.sub) {
      const doujin = (await search(sub.name)).filter();

      if (doujin.title.pretty === sub.latestDoujin) {
        continue;
      }
      flag = true;
      sub.doujinId = doujin.id;
      sub.doujinURL = 'https://nhentai.net/g/' + doujin.id.toString();
      sub.latestDoujin = doujin.title.pretty;
      sendAnnouncement(channel, doujin, sub.name);
    }
    if (flag) {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info(`[nhentai]已更新檔案 ${filePath}`);
    }
  }
};

const sendAnnouncement = async (channel: SendableChannels, doujin: Doujin, artist: string) => {
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

  await channel.send({
    content: `您在[nhentai](https://nhentai.net/)訂閱的 [${artist}](https://nhentai.net/artist/${artist})更新了[${
      doujin.title.pretty || doujin.id
    }](https://nhentai.net/g/${doujin.id})`,
    embeds: [embeds],
  });
};
