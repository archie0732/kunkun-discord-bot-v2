import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { hanime1A } from '@/func/api/hanime1/hanime1_a';
import { R7Command } from '@/class/commands';

import manhuagui from '@/func/api/manhuagui';
import nhentai from '@/func/notification/nhentai';
import logger from '@/class/logger';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('check_update')
    .setNameLocalization('zh-TW', '檢查訂閱更新')
    .setDescription('除錯用 - 檢查您訂閱的內伺服器訂閱內容是否有更新'),
  defer: true,
  ephemeral: true,
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Step 1: Check hanime1A updates
      await interaction.editReply({
        content: '正在檢查 hanime1A 更新...',
      });
      try {
        await hanime1A(this);
      }
      catch (error) {
        logger.error(`[hanime1A update error] - ${error}`);
        await interaction.followUp({
          content: '檢查 hanime1A 更新時發現錯誤',
          ephemeral: true,
        });
      }

      // Step 2: Check nhentai updates
      await interaction.followUp({
        content: '正在檢查 nhentai 更新...',
        ephemeral: true,
      });
      try {
        await nhentai.checkup(this);
      }
      catch (error) {
        logger.error(`[nhentai update error] - ${error}`);
        await interaction.followUp({
          content: '檢查 nhentai 更新時發現錯誤',
          ephemeral: true,
        });
      }

      // Step 3: Check manhuagui updates
      await interaction.followUp({
        content: '正在檢查 manhuagui 更新...',
        ephemeral: true,
      });
      try {
        await manhuagui.checkUpdateManhuagui(this);
      }
      catch (error) {
        logger.error(`[manhuagui update error] - ${error}`, error);
        await interaction.followUp({
          content: '檢查 manhuagui 更新時發現錯誤',
          ephemeral: true,
        });
      }

      // Final success message
      await interaction.followUp({
        content: '所有訂閱更新檢查完畢，未發現錯誤。',
        ephemeral: true,
      });
    }
    catch (generalError) {
      logger.error(`[check update error] - ${generalError}`);
      await interaction.editReply({
        content: '檢查更新時發現錯誤',
      });
    }
  },
});
