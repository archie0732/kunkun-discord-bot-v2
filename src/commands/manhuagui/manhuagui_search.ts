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
import { baseManhuaguiURL, discordBotURL, discordDescription, disocrdPath } from '@/utils/const';
import { createManhuaguiCacheData, getCommandsLink } from '@/utils';
import { manhuaguiAPI, searchManhuaguiByKeyword } from '@/api/manhuagui/manhuaguiAPI';
import { writeFileSync } from 'fs';
import { join } from 'path';

import logger from '@/class/logger';

import type { ManhuaguiAPI } from '@/types/manhuagui';
import type { R7Client } from '@/class/client';

let manhuagui: ManhuaguiAPI;

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

  defer: true,
  ephemeral: false,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inCachedGuild()) return;
    const id = interaction.options.getString('keyword', true);

    if (!isNumeric(id)) {
      await interaction.editReply({
        content: `如果是用搜尋作品名字方式，請選擇上方提示!`,
        flags: 1 << 6,
      });
      return;
    }

    manhuagui = await manhuaguiAPI(id);

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

  async onButton(interaction, buttonId) {
    if (buttonId !== 'sub-manhua') return;

    if (!manhuagui) {
      await interaction.followUp({
        content: '抱歉，發生錯誤。請使用/sub_manhuagui來追蹤漫畫',
      });
      return;
    }

    const cacheData = createManhuaguiCacheData(interaction.guildId, interaction.channelId);
    if (cacheData.sub.find((e) => e.id === manhuagui.id)) {
      await interaction.followUp({
        content: '你已經訂閱過該漫畫了~',
      });
      return;
    }

    const channel = await this.channels.fetch(cacheData.channel);

    cacheData.sub.push({
      name: manhuagui.title,
      ChapterURL: manhuagui.update.chapterURL,
      id: manhuagui.id,
      new_chapter: manhuagui.update.chapter,
      status: manhuagui.update.status,
    });

    writeFileSync(join(disocrdPath.mahuagui, `${interaction.guildId}.json`), JSON.stringify(cacheData, null, 2), 'utf-8');

    const commandURL = await getCommandsLink(this, 'set_channel');

    await interaction.followUp({
      // </rm_nhentai: 1268082123466739765> 1270769503428415575
      content: `🎉 成功訂閱漫畫!\n漫畫更新時會在 ${channel?.url} 發布通知\n如果要更改通知位置，請使用 ${commandURL}`,
    });
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
    .setFooter({ text: discordDescription.footer });
};

const buttonBuilder = () => {
  const subManhua = new ButtonBuilder().setCustomId('search_manhuagui:sub-manhua').setLabel('追蹤').setStyle(ButtonStyle.Primary);
  const viewManhua = new ButtonBuilder().setCustomId('view-manhua').setLabel('預覽').setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(subManhua, viewManhua);
};
