import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import { isNumeric } from '@/utils/isNumeric';
import { R7Command } from '@/class/commands';

import logger from '@/class/logger';


import { load } from 'cheerio';
import { ArchieMangaAPI, manhuaAPI } from '@/api/manhuagui/manhuaguiAPI';
import type { R7Client } from '@/class/client';
import { discordBotURL, discordDescription, disocrdPath } from '@/utils/const';
import type { ManhuaguiCache, SearchManhuaAPI } from '@/func/types';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName(`sub_manhuagui`)
    .setNameLocalization(`zh-TW`, '訂閱漫畫')
    .setDescription(`新增漫畫到訂閱列表在更新時會有通知`)
    .addStringOption(
      new SlashCommandStringOption()
        .setName(`keyword`)
        .setDescription(`搜尋漫畫名稱，或者用manhuagui上的comic id`)
        .setRequired(true)
        .setAutocomplete(true),
    ),

  defer: false,
  ephemeral: true,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inCachedGuild()) return;
    const id = interaction.options.getString('keyword', true);

    await interaction.deferReply({ flags: 1 << 6 });

    if (!isNumeric(id)) {
      await interaction.editReply({
        content: `如果是用搜尋作品名字方式，請使用autocomplete!`,
      });
      return;
    }

    const filePath = `${disocrdPath.mahuagui}/${interaction.guild.id}.json`;
    const file = Bun.file(filePath);

    let localData: ManhuaguiCache;

    if (!(await file.exists())) {
      localData = {
        guild: `${interaction.guildId}`,
        channel: interaction.channelId,
        sub: [],
      };
    }
    else {
      localData = await file.json();
    }

    if (localData.sub.some((value) => value.id === id)) {
      await interaction.editReply({
        content: `此漫畫已在訂閱列表中`,
        flags: 1 << 6,
      });
      return;
    }

    const manhuagui = await manhuaAPI(id);

    localData.sub.push({
      name: manhuagui.title,
      id: id!,
      status: manhuagui.update.status,
      new_chapter: manhuagui.update.chapter,
      ChapterURL: manhuagui.update.url,
    });

    Bun.write(file, JSON.stringify(localData, null, 2));

    await interaction.editReply({
      content: `成功訂閱漫畫 : ${manhuagui.title}`,
      flags: 1 << 6,
      embeds: [embedBuilder(this, manhuagui)],
    });

    logger.info(
      `[discord]${interaction.guildId} sub ${manhuagui.title}`,
    );
  },

  async onAutocomplete(interaction) {
    const keyword = interaction.options.getString('keyword') ?? '更衣人偶';
    const reult = await searchManhuByKeyWord(keyword);

    return reult.map((e) => ({
      name: e.title,
      value: e.id,
    }));
  },
});

const searchManhuByKeyWord = async (keyword: string, page?: number) => {
  const url = `https://www.manhuagui.com/s/${keyword === '' ? '總之就是' : keyword}_p${page ?? 1}.html`;

  const res = await fetch(url);

  if (!res.ok) {
    logger.warn(`[Archie Manhuagui]Search API fetch error, status: ${res.status},utl: ${url}`);
    return [{
      title: '总之就是非常可爱 fly me to the moon',
      id: '27099',
    }];
  }

  const html = await res.text();

  const $ = load(html);

  const manhuaResult: SearchManhuaAPI[] = [];

  $('.book-result')
    .find('li.cf')
    .each((_, element) => {
      const title = $(element).find('dt').find('a').attr('title');
      const id = $(element).find('dt').find('a').attr('href')?.split('/')[2] ?? '';
      const thumb = $(element).find('img').attr('src') ?? '';
      const author = $(element).find('dd.tags').eq(2).text().split('：').pop() ?? '';
      const status = $(element).find('span.red').eq(0).text() ?? '';
      const time = $(element).find('span.red').eq(1).text() ?? '';
      const chapter = $(element).find('a.blue').text() ?? '';

      if (title) {
        manhuaResult.push({
          author,
          id,
          thumb,
          title,
          upadte: {
            time,
            chapter,
            status: status,
          },
        });
      }
    });

  return manhuaResult;
};

const embedBuilder = (client: R7Client, manhuagui: ArchieMangaAPI) => {
  return new EmbedBuilder().setAuthor({
    name: `${client.user?.username}`,
    iconURL: client.user?.avatarURL() ?? 'https://newsimg.5054399.com/uploads/userup/1906/251634021345.gif',
  })
    .setTitle(`以追蹤 ${manhuagui.title}`)
    .setURL(manhuagui.url)
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
        value: `${manhuagui.update.time} | [${manhuagui.update.chapter}](${manhuagui.update.url})`,
        inline: true,
      },
      {
        name: `🏅 排名`,
        value: `${manhuagui.rank}`,
        inline: true,
      },
    )
    .setFooter({ text: discordDescription.footer }); ;
};

