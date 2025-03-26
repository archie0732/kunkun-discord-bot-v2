import { EmbedBuilder } from 'discord.js';

import { R7Client } from '@/class/client';
import { resolve } from 'path';

import { readdirSync, readFileSync, writeFileSync } from 'fs';

import type { SendableChannels } from 'discord.js';

import logger from '@/class/logger';
import { baseURL, discordBotURL, discordDescription } from '@/utils/const';
import { load } from 'cheerio';

export async function checkManhuaguiUpdate(client: R7Client) {
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
        const comic = await manhuaAPI(sub.cacheId);
        logger.debug(comic.thumb);
        if (comic.update.chapter === sub.latestChapter) {
          continue;
        }
        flag = true;
        sendAnnouncement(client, comic, channel);
        sub.ChapterURL = comic.update.url;
        sub.latestChapter = comic.update.chapter;
        sub.status = comic.update.status;
      }
      catch (error) {
        logger.error('fetch Manhuagui update fail', error);
      }
    }
    if (flag) {
      writeFileSync(resolve('.cache', 'manhuagui', file), JSON.stringify(data, null, 2), 'utf-8');
      logger.info('[manhuaguiAPI]已更新檔案: ' + data.guild + '.json');
    }
  }
}

export async function sendAnnouncement(client: R7Client, manhuagui: ArchieMangaAPI, channel: SendableChannels) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${client.user?.username}`,
      iconURL: client.user?.avatarURL() ?? 'https://newsimg.5054399.com/uploads/userup/1906/251634021345.gif',
    })
    .setTitle(`${manhuagui.title} 更新至 ${manhuagui.update.chapter}`)
    .setURL(manhuagui.update.url)
    .setThumbnail(manhuagui.thumb)
    .setDescription(
      `${manhuagui.descruption}`,
    )
    .setTimestamp(Date.now())
    .addFields(
      {
        name: `🛜 原網站`,
        value: `[manhuagui](${discordBotURL.manhuaguiBase})`,
        inline: true,
      },
      {
        name: `✒️ 作者`,
        value: `${manhuagui.author}`,
        inline: true,
      },
      {
        name: `🔍 狀態`,
        value: `${manhuagui.update.status}`,
        inline: true,
      },
      {
        name: `⏰ 更新`,
        value: `${manhuagui.update.time} | ${manhuagui.update.chapter}`,
        inline: true,
      },
      {
        name: `🏅 排名`,
        value: `${manhuagui.rank}`,
        inline: true,
      },
    )
    .setFooter({ text: discordDescription.footer });

  try {
    await channel.send({
      content: `您在[mahuagui](${discordBotURL.manhuaguiBase})訂閱的 [${manhuagui.title}](${discordBotURL.manhuaguiBase}/comic/${manhuagui.id}) 更新了 [${manhuagui.update.chapter}](${manhuagui.update.url})`,
      embeds: [embed],
    });
    logger.info('[manhugui]Have send update msg');
  }
  catch (error) {
    logger.error('manhuagui when send the update message', error);
  }
}

export const manhuaAPI = async (id: string) => {
  const response = await fetch(baseURL(id));

  if (!response.ok) {
    logger.error('fetch data fail!');
    throw new Error(`fetch manga detail fail, source web status: ${response.status}`);
  }

  logger.info('[ArchieManhuaguiAPI] fetch HTML success!!');

  return new ArchieMangaAPI(await response.text(), id);
};

interface Update {
  time: string;
  chapter: string;
  url: string;
  status: string;
}

export class ArchieMangaAPI {
  title: string = '';
  id: string = '';
  url: string = '';
  thumb: string = '';
  author: string = '';
  rank: string = '';
  update: Update = {
    time: '',
    chapter: '',
    url: '',
    status: '',
  };

  descruption: string = '';

  constructor(html: string, id: string) {
    this.url = baseURL(id);
    this.id = id;

    const $ = load(html);
    this.title = $('h1').text();
    this.thumb = 'https:' + $('p.hcover').find('img').attr('src');
    const status = $('span.red').eq(0).text();

    const chapter = $('a.blue').eq(0).text();
    const updateTime = $('span.red').eq(1).text();
    this.author = $('ul.detail-list').find('li').eq(1).text().split('：').pop() ?? '';

    this.rank = $('.rank').find('strong').text();
    const chapterurl = discordBotURL.manhuaguiBase + $('a.blue').attr('href');
    this.descruption = $('.book-intro').find('p').text();

    this.update = {
      chapter,
      url: chapterurl,
      status,
      time: updateTime,
    };
  }
}

export interface SearchManhuaAPI {
  title: string;
  id: string;

  thumb: string;
  author: string;

  upadte: {
    time: string;
    status: string;
    chapter: string;
  };
}

export interface ManhuaguiCache {
  guild: string;
  channel: string;
  sub: [
    {
      name: string;
      cacheId: string;
      status: string;
      commonURL: string;
      latestChapter: string;
      ChapterURL: string;
    },
  ];
}
