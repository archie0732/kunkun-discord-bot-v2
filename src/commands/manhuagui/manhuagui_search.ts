import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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
import { discordBotURL, discordDescription } from '@/utils/const';
import type { SearchManhuaAPI } from '@/func/types';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName(`search_manhuagui`)
    .setNameLocalization(`zh-TW`, '搜尋漫畫')
    .setDescription(`搜尋漫畫的詳細資訊`)
    .addStringOption(
      new SlashCommandStringOption()
        .setName(`keyword`)
        .setDescription(`搜尋漫畫名稱，或者用manhuagui上的comic id`)
        .setRequired(true)
        .setAutocomplete(true),
    ),

  defer: false,
  ephemeral: false,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inCachedGuild()) return;
    const id = interaction.options.getString('keyword', true);

    await interaction.deferReply();

    if (!isNumeric(id)) {
      await interaction.editReply({
        content: `如果是用搜尋作品名字方式，請使用autocomplete!`,
      });
      return;
    }

    const manhuagui = await manhuaAPI(id);

    await interaction.editReply({
      content: `您搜尋的結果 : [${manhuagui.title}](${manhuagui.url})`,
      embeds: [embedBuilder(this, manhuagui)],
      components: [buttonBuilder()],

    });


    logger.info(
      `[discord]Search manhuagui ${manhuagui.title}, and sent msg success!`,
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
  const url = `https://www.manhuagui.com/s/${keyword === '' ? '總' : keyword}_p${page ?? 1}.html`;

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
    .setTitle(`${manhuagui.title}`)
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
    .setFooter({ text: discordDescription.footer });;
};



const buttonBuilder = () => {

  const subManhua =  new ButtonBuilder().setCustomId('sub-manhua').setLabel('追蹤').setStyle(ButtonStyle.Primary)
  const viewManhua = new ButtonBuilder().setCustomId('view-manhua').setLabel('預覽').setStyle(ButtonStyle.Secondary)

  return new ActionRowBuilder<ButtonBuilder>().addComponents(subManhua,viewManhua)
}