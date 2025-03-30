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

import type { R7Client } from '@/class/client';
import { baseManhuaguiURL, discordBotURL, discordDescription } from '@/utils/const';
import { manhuaguiAPI, searchManhuaguiByKeyword } from '@/api/manhuagui/manhuaguiAPI';
import type { ManhuaguiAPI } from '@/types/manhuagui';

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
        content: `如果是用搜尋作品名字方式，請選擇上方提示!`,
        flags: 1 << 6,
      });
      return;
    }

    const manhuagui = await manhuaguiAPI(id);

    await interaction.editReply({
      content: `您搜尋的結果 : [${manhuagui.title}](${baseManhuaguiURL(manhuagui.id)})`,
      embeds: [serachEmbedBuilder(this, manhuagui)],
      components: [buttonBuilder()],

    });

    logger.info(
      `[discord]Search manhuagui ${manhuagui.title}, and sent msg success!`,
    );
  },

  async onAutocomplete(interaction) {
    const keyword = interaction.options.getString('keyword') ?? '更衣人偶';
    const result = await searchManhuaguiByKeyword(keyword);

    if (result === null) {
      return [{
        name: '總之就是非常可愛 fly me to the moon',
        value: '27099',
      }];
    }

    return result.map((e) => ({
      name: e.title,
      value: e.id,
    }));
  },
});

export const serachEmbedBuilder = (client: R7Client, manhuagui: ManhuaguiAPI) => {
  return new EmbedBuilder().setAuthor({
    name: `${client.user?.username}`,
    iconURL: client.user?.avatarURL() ?? 'https://newsimg.5054399.com/uploads/userup/1906/251634021345.gif',
  })
    .setTitle(`${manhuagui.title}`)
    .setURL(baseManhuaguiURL(manhuagui.id))
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
        name: '🏷️ tags',
        value: `${manhuagui.tags}`,
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
    .setFooter({ text: discordDescription.footer }); ;
};

const buttonBuilder = () => {
  const subManhua = new ButtonBuilder().setCustomId('sub-manhua').setLabel('追蹤').setStyle(ButtonStyle.Primary);
  const viewManhua = new ButtonBuilder().setCustomId('view-manhua').setLabel('預覽').setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(subManhua, viewManhua);
};
