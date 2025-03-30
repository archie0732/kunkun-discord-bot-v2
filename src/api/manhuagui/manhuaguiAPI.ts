import { EmbedBuilder } from 'discord.js';

import { R7Client } from '@/class/client';
import { resolve } from 'path';

import { readdirSync, readFileSync, writeFileSync } from 'fs';

import type { SendableChannels } from 'discord.js';

import logger from '@/class/logger';
import { baseManhuaguiURL, discordBotURL, discordDescription } from '@/utils/const';
import { load } from 'cheerio';

import type { HomePageHotAPI, ManhuaguiAPI } from '@/types/manhuagui';
import type { ManhuaguiCache } from '@/types/cache';

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
        const comic = await manhuaguiAPI(sub.id);
        if (comic.update.chapter === sub.new_chapter) {
          continue;
        }
        flag = true;
        sendAnnouncement(client, comic, channel);
        sub.ChapterURL = comic.update.chapterURL;
        sub.new_chapter = comic.update.chapter;
        sub.status = comic.update.status;
      }
      catch (error) {
        logger.error('[manhuagui]manhuaguiAPI fetch Manhuagui update fail', error);
      }
    }
    if (flag) {
      writeFileSync(resolve('.cache', 'manhuagui', file), JSON.stringify(data, null, 2), 'utf-8');
      logger.info('[manhuaguiAPI]已更新檔案: ' + data.guild + '.json');
    }
  }
}

export async function sendAnnouncement(client: R7Client, manhuagui: ManhuaguiAPI, channel: SendableChannels) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${client.user?.username}`,
      iconURL: client.user?.avatarURL() ?? 'https://newsimg.5054399.com/uploads/userup/1906/251634021345.gif',
    })
    .setTitle(`${manhuagui.title} 更新至 ${manhuagui.update.chapter}`)
    .setURL(manhuagui.update.chapterURL)
    .setThumbnail(manhuagui.thum)
    .setDescription(
      `${manhuagui.description}`,
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
        value: `${manhuagui.update.time} | [${manhuagui.update.chapter}](${manhuagui.update.chapterURL})`,
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
      content: `您在[mahuagui](${discordBotURL.manhuaguiBase})訂閱的 [${manhuagui.title}](${discordBotURL.manhuaguiBase}/comic/${manhuagui.id}) 更新了 [${manhuagui.update.chapter}](${manhuagui.update.chapterURL})`,
      embeds: [embed],
    });
    logger.info('[manhugui]Have send update msg');
  }
  catch (error) {
    logger.error('manhuagui when send the update message', error);
  }
}

export const manhuaguiAPI = async (id: string): Promise<ManhuaguiAPI> => {
  const url = baseManhuaguiURL(id);

  const res = await fetch(url);

  if (!res.ok) {
    logger.error(`[manhuagui]ManhuaguiAPI fetch ${url} error, status: ${res.status}`);
    throw new Error(`[manhuagui]ManhuaguiAPI fetch ${url} error, status: ${res.status}`);
  }

  const html = await res.text();

  const $ = load(html);

  const title = $('h1').text();
  const thum = 'https:' + $('.hcover').find('img').attr('src');

  const tags = $('.detail-list').find('li').eq(1).find('span').eq(0).text().split('：').pop() ?? '';
  const author = $('.detail-list').find('li').eq(1).find('span').eq(1).text().split('：').pop() ?? '';
  const status = $('li.status').find('span.red').eq(0).text() ?? '';
  const time = $('li.status').find('span.red').eq(1).text() ?? '';
  const chapterURL = 'https://tw.manhuagui.com' + $('li.status').find('a.blue').attr('href');
  const chapter = $('li.status').find('a.blue').text() ?? '';

  const rank = $('.rank').find('strong').text() ?? '';

  const description = $('#intro-cut').text() ?? '';

  return {
    title, id, tags, thum, author, rank, description,
    update: {
      time, chapterURL, chapter, status,
    },
  } as ManhuaguiAPI;
};

export const searchManhuaguiByKeyword = async (keyword: string): Promise<ManhuaguiAPI[] | null> => {
  const url = `https://tw.manhuagui.com/s/${keyword === '' ? '總之' : keyword}.html`;

  const res = await fetch(url);

  const searchResult: ManhuaguiAPI[] = [];

  if (!res.ok) {
    return null;
  }

  const html = await res.text();
  const $ = load(html);

  $('.book-result').find('li').each((_, element) => {
    const title = $(element).find('a.bcover').attr('title') ?? '';
    const id = $(element).find('a.bcover').attr('href')?.split('/')[2] ?? '';
    const thum = 'https:' + $(element).find('a.bcover').find('img').attr('src');
    const status = $(element).find('dd.tags').eq(0).find('span.red').eq(0).text();
    const time = $(element).find('dd.tags').eq(0).find('span.red').eq(1).text();
    const chapterURL = 'https://tw.manhuagui.com/' + $(element).find('dd.tags').eq(0).find('a').attr('href');
    const chapter = $(element).find('dd.tags').eq(0).find('a').text();
    const author = $(element).find('dd.tags').eq(2).find('a').text();

    const tags = $(element).find('dd.tags').eq(1).find('span').eq(2).text().split('：').pop() ?? '';

    const description = $(element).find('dd.intro').text() ?? '';

    const rank = $(element).find('p.score-avg').find('strong').text();

    if (title) {
      searchResult.push({
        title,
        author,
        description,
        id,
        rank,
        tags,
        thum,
        update: {
          chapter,
          chapterURL,
          status,
          time,
        },
      });
    }
  });

  return searchResult;
};

export const manhuaguiHot = async (): Promise<HomePageHotAPI[]> => {
  const url = 'https://tw.manhuagui.com/';

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`[manhuagui]ManhuaguiHot fetch home page error, status: ${res.status}`);
  }
  const html = await res.text();
  const $ = load(html);

  const result: HomePageHotAPI[] = [];

  $('.cmt-cont').find('li').each((_, element) => {
    const title = $(element).find('a.bcover').attr('title') ?? '';
    const url = 'https://tw.manhuagui.com/' + $(element).find('a.bcover').attr('href');
    const id = url.split('/')[5];
    const thum = $(element).find('a.bcover').find('img').attr('src') ?? $(element).find('a.bcover').find('img').attr('date-src');
    const update = $(element).find('span.tt').text() ?? '';

    if (title !== '') {
      result.push({
        title, update, url, id,
        thum: 'https:' + thum,
      });
    }
  });

  /**
     * 1-12: hot
     * 13-24: end-hot
     * 25-36: new
     * 37-48: 2020
     *
     */

  // logger.debug(JSON.stringify(result[0]));

  return result;
};
