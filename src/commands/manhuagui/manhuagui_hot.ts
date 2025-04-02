import { manhuaguiAPI, manhuaguiHot } from '@/api/manhuagui/manhuaguiAPI';
import { R7Command } from '@/class/commands';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { HomePageHotAPI } from '@/types/manhuagui';
import { serachEmbedBuilder } from './manhuagui_search';
import { getCommandsLink } from '@/utils';

let result: HomePageHotAPI[] = [];

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName(`manhuagui_hot`)
    .setNameLocalization(`zh-TW`, '搜尋熱門漫畫')
    .setDescription(`搜尋熱門的漫畫`),

  defer: true,
  ephemeral: false,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    result = (await manhuaguiHot()).slice(0, 12);

    await interaction.editReply({
      content: '熱門漫畫',
      embeds: [embedBuilder(result[0])],
      components: [buttonBuilder(0, result.length)],
    });
  },

  async onButton(interaction, buttonId) {
    // logger.debug(`click button: ${buttonId}`);

    if (buttonId === 'sub-button') {
      const search = await getCommandsLink(this, 'search_manhuagui');
      const sub = await getCommandsLink(this, 'sub_manhuagui');
      await interaction.followUp({
        content: `此功能目前還在實作中，請先使用:\n- ${search}\n- ${sub}\n替代`,
      });
      return;
    }

    const match = buttonId.match(/(next|last|detail)-hot-(\d+)/);

    if (!match) return;

    const action = match[1];
    let index = parseInt(match[2], 10);

    if (result === undefined || index === undefined || result.length == 0 || result[index].id === undefined) {
      await interaction.followUp({
        content: '漫畫更新已經過時，請重新使用 `/manhuagui_hot` 指令',
      });
      return;
    }

    if (action === 'detail') {
      const manhuagui = await manhuaguiAPI(result[index].id);
      const subButton = new ButtonBuilder().setCustomId('manhuagui_hot:sub-button').setLabel('追蹤').setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(subButton);
      await interaction.followUp({
        content: '您搜尋的漫畫'!,
        embeds: [serachEmbedBuilder(this, manhuagui)],
        components: [row],
      });
      return;
    }

    if (action === 'next' && index < result.length - 1) {
      index++;
    }
    else if (action === 'last' && index > 0) {
      index--;
    }
    else {
      return;
    }

    await interaction.editReply({
      content: '熱門漫畫',
      embeds: [embedBuilder(result[index])],
      components: [buttonBuilder(index, result.length)],
    });
  },
});

const embedBuilder = (manhuagui: HomePageHotAPI) => {
  return new EmbedBuilder().setTitle(manhuagui.title)
    .setURL(manhuagui.url)
    .setThumbnail(manhuagui.thum)
    .setFields({
      name: '更新至',
      value: `[${manhuagui.update}](${manhuagui.url})`,
    });
};

const buttonBuilder = (index: number, total: number) => {
  const test = new ButtonBuilder().setCustomId(`manhuagui_hot:detail-hot-${index}`).setLabel('詳細').setStyle(ButtonStyle.Primary);

  const last = new ButtonBuilder()
    .setCustomId(`manhuagui_hot:last-hot-${index}`)
    .setDisabled(index === 0)
    .setLabel('<')
    .setStyle(ButtonStyle.Secondary);

  const next = new ButtonBuilder()
    .setCustomId(`manhuagui_hot:next-hot-${index}`)
    .setDisabled(index === total - 1)
    .setLabel('>')
    .setStyle(ButtonStyle.Secondary);

  const gotot = new ButtonBuilder()
    .setLabel('前往')
    .setURL(result[index].url)
    .setStyle(ButtonStyle.Link);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(test, last, next, gotot);
};
