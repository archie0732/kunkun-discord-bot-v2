import { EmbedBuilder } from 'discord.js';

import { R7Client } from '@/class/client';
import { fetchManhuagui } from './fetch';
import { resolve } from 'path';

import { readdirSync, readFileSync, writeFileSync } from 'fs';

import type { Manhuagui } from './fetch';
import type { ManhuaguiCache } from '@/api/manhuagui/manhuagui.interface';
import type { SendableChannels } from 'discord.js';

import logger from '@/class/logger';

export async function checkUpdateManhuagui(client: R7Client) {
  const desk = readdirSync(resolve('.cache', 'manhuagui'));

  for (const file of desk) {
    let flag = false;
    const data = JSON.parse(readFileSync(resolve('.cache', 'manhuagui', file), 'utf-8')) as ManhuaguiCache;
    // sub check
    const channel = client.channels.cache.get(data.channel);
    if (!channel || !channel.isSendable()) {
      throw 'channel not exist or cannot sendMessage';
    }
    for (const sub of data.sub) {
      try {
        const comic = await fetchManhuagui(sub.cacheId);
        if (comic.status.lastest_chapter === sub.latestChapter) {
          continue;
        }
        flag = true;
        sendAnnouncement(client, comic, channel);
        sub.ChapterURL = comic.status.chapter_url;
        sub.latestChapter = comic.status.lastest_chapter;
        sub.status = comic.status.now;
      }
      catch (error) {
        logger.error('fetch Manhuagui update fail', error);
      }
    }
    if (flag) {
      writeFileSync(resolve('.cache', 'manhuagui', file), JSON.stringify(data, null, 2), 'utf-8');
      logger.info('[manhuagui]已更新檔案: ' + data.guild + '.json');
    }
  }
}

export async function sendAnnouncement(
  client: R7Client,
  manhuagui: Manhuagui,
  channel: SendableChannels,
) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${client.user?.username} - 被切斷的五條悟: manhuagui`,
      iconURL: client.user?.displayAvatarURL() || undefined,
    })
    .setTitle(
      `${manhuagui.title.Ch} 更新至 ${manhuagui.status.lastest_chapter}`,
    )
    .setURL(`${manhuagui.status.chapter_url}`)
    .setThumbnail(manhuagui.cover)
    .setDescription(
      `- 您可以使用 </sub_manhuagui:1268082123466739764> 來訂閱\n- 或者使用 </rm_manhuagui:1268082123466739765> 來取消訂閱`,
    )
    .setTimestamp(Date.now())
    .addFields(
      {
        name: `🛜 原網站`,
        value: `[manhuagui](https://tw.manhuagui.com/)`,
        inline: true,
      },
      {
        name: `✒️ 作者`,
        value: `${manhuagui.introduce.author}`,
        inline: true,
      },
      {
        name: `🎈 出品年代`,
        value: `${manhuagui.introduce.y_publish}`,
        inline: true,
      },
      {
        name: `🗺️ 漫畫類型`,
        value: `${manhuagui.introduce.local_publish}`,
        inline: true,
      },
      {
        name: `🔍 目前狀態`,
        value: `${manhuagui.status.now}，${manhuagui.status.date}更新到: ${manhuagui.status.lastest_chapter}`,
      },
      {
        name: `🏷️ 標籤`,
        value: `${manhuagui.introduce.categories.join(', ')}`,
      },
    )
    .setFooter({ text: `archie0732's kunkun-bot v2 with TypeScripe` });

  try {
    await channel.send({
      content: `您在[mahuagui](https://tw.manhuagui.com)訂閱的 [${manhuagui.title.Ch}](https://tw.manhuagui.com/comic/${manhuagui.title.id}) 更新了 [${manhuagui.status.lastest_chapter}](${manhuagui.status.chapter_url})`,
      embeds: [embed],
    });
  }
  catch (error) {
    logger.error('manhuagui when send the update message', error);
  }
}
