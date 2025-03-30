import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import { isNumeric } from '@/utils/isNumeric';
import { R7Command } from '@/class/commands';

import logger from '@/class/logger';

import type { R7Client } from '@/class/client';
import { baseManhuaguiURL, discordBotURL, discordDescription, disocrdPath } from '@/utils/const';
import type { ManhuaguiCache } from '@/types/cache';
import { manhuaguiAPI, searchManhuaguiByKeyword } from '@/api/manhuagui/manhuaguiAPI';
import type { ManhuaguiAPI } from '@/types/manhuagui';

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

    const manhuagui = await manhuaguiAPI(id);

    localData.sub.push({
      name: manhuagui.title,
      id: id!,
      status: manhuagui.update.status,
      new_chapter: manhuagui.update.chapter,
      ChapterURL: baseManhuaguiURL(manhuagui.id),
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

const embedBuilder = (client: R7Client, manhuagui: ManhuaguiAPI) => {
  return new EmbedBuilder().setAuthor({
    name: `${client.user?.username}`,
    iconURL: client.user?.avatarURL() ?? 'https://newsimg.5054399.com/uploads/userup/1906/251634021345.gif',
  })
    .setTitle(`以追蹤 ${manhuagui.title}`)
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
