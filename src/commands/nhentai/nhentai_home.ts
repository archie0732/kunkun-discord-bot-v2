import { nHomePage } from '@/api/n';
import { R7Command } from '@/class/commands';
import { getCommandsLink } from '@/utils';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { ArchieNSerachAPI } from '@/api/n/interface';
import logger from '@/class/logger';
import { discordDescription } from '@/utils/const';

let data: ArchieNSerachAPI[] = [];

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('nhentai_homepage').setNameLocalization('zh-TW', 'n網今日熱門搜尋')
    .setDescription('Search for nhentai doujins'),

  defer: true,
  ephemeral: false,
  async execute(interaction) {
    try {
      data = await nHomePage();
    }
    catch (error) {
      logger.error(`[nhentai_homepage] ${error}`);
      await interaction.editReply({
        content: '發生錯誤，請稍後再試',
      });
      return;
    }

    if (!data || data.length === 0) {
      await interaction.editReply({
        content: `資料已過期\n請重新使用${await getCommandsLink(this, 'nhentai_homepage')}抓取新資料`,
        flags: 1 << 6,
      });
      return;
    }

    const embed = embedBuilder(data, 0);
    interaction.editReply({
      content: `可以使用下方按鈕來切換本子`,
      embeds: [embed],
      components: [buttonBuilder(data, 0)],
    });
  },

  async onButton(interaction, buttonId) {
    if (!buttonId.match(/(last|next)-(\d+)/)) return;

    logger.debug(`[nhentai_homepage] ${buttonId}`);


    if (!data || data.length === 0) {
      await interaction.followUp({
        content: `資料已過期\n請重新使用${await getCommandsLink(this, 'nhentai_homepage')}抓取新資料`,
        flags: 1 << 6,
      });
      return;
    }

    const index = parseInt(buttonId.split('-')[1], 10);
    logger.debug(data[index].thumb);
    const embed = embedBuilder(data, index);
    await interaction.editReply({
      content: `可以使用下方按鈕來切換本子`,
      embeds: [embed],
      components: [buttonBuilder(data, index)],
      flags: 1 << 6,
    });
  },
});

const embedBuilder = (data: ArchieNSerachAPI[], index: number) => {
  const doujin = data[index];
  return new EmbedBuilder()
    .setTitle(doujin.title.japanese ?? doujin.title.english ?? doujin.title.pretty ?? '無標題')
    .setColor('Random')
    .setThumbnail(doujin.thumb)
    .setURL(doujin.r7mangaURL)
    .setDescription(`- [前往nhentai](${doujin.sourceURL})\n- [前往r7manga](${doujin.r7mangaURL})`)
    .setFields(
      {
        name: '✏️ 作者',
        value: doujin.author ?? '',
        inline: true,
      },
      {
        name: '👤 角色',
        value: doujin.character ?? '',
        inline: true,
      },
      {
        name: '🎭 系列',
        value: doujin.parody ?? '',
        inline: true,
      },
      {
        name: '📄 頁數',
        value: doujin.page ?? '',
        inline: true,
      },
      {
        name: '🏷️ 標籤',
        value: doujin.tags ?? '',
        inline: true,
      },
    ).setFooter({
      text: `編號: ${index + 1}, ${discordDescription.footer}`,
    });
};

const buttonBuilder = (data: ArchieNSerachAPI[], index: number) => {
  const last = new ButtonBuilder()
    .setCustomId(`nhentai_homepage:last-${index - 1}`)
    .setLabel('<')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(index === 0);
  const next = new ButtonBuilder()
    .setCustomId(`nhentai_homepage:next-${index + 1}`)
    .setLabel('>')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(index === data.length - 1);
  const r7manga = new ButtonBuilder()
    .setLabel('r7manga')
    .setStyle(ButtonStyle.Link)
    .setURL(data[index].r7mangaURL);
  const nhentai = new ButtonBuilder()
    .setLabel('nhentai')
    .setStyle(ButtonStyle.Link)
    .setURL(data[index].sourceURL);
  return new ActionRowBuilder<ButtonBuilder>().addComponents(last, next, r7manga, nhentai);
};
