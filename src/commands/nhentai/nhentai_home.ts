import { nHomePage } from '@/api/n';
import { R7Command } from '@/class/commands';
import { getCommandsLink } from '@/utils';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { ArchieNSerachAPI } from '@/api/n/interface';
import logger from '@/class/logger';

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
      embeds: [embed] });
  },

});

const embedBuilder = (data: ArchieNSerachAPI[], index: number) => {
  const doujin = data[index];
  return new EmbedBuilder()
    .setTitle(doujin.title.japanese ?? doujin.title.english ?? doujin.title.pretty ?? '無標題')
    .setColor('Random')
    .setThumbnail(doujin.thumb)
    .setURL(doujin.r7mangaURL)
    .setDescription(`- [前往nhentai](${doujin.sourceURL})\n- [前往r7manga](${doujin.r7mangaURL})\n可以使用下方按鈕來切換`)
    .setFields(
      {
        name: '✏️ 作者',
        value: doujin.author ?? '無作者',
      },
      {
        name: '🏷️ 標籤',
        value: doujin.tags ?? '',
      },
      {
        name: '👤 角色',
        value: doujin.character ?? '',
      },
      {
        name: '🎭 系列',
        value: doujin.parody ?? '',
      },
      {
        name: '📄 頁數',
        value: doujin.page ?? '',
      },
    ).setFooter({
      text: `第 ${index + 1} 部作品`,
    });
};
