import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { R7Command } from '@/class/commands';

import chalk from 'chalk';

import type { local_subscribe } from '@/func/types/subData';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('rm_hanime1')
    .setNameLocalization('zh-TW', '取消訂閱hanime1')
    .setDescription('取消訂閱在 hanime1.me 上的訂閱內容')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('tag')
        .setDescription('已經訂閱的作者或標籤名稱')
        .setRequired(true),
    ),
  defer: true,
  ephemeral: true,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) throw `cannot use this command in there`;
    try {
      const tag = interaction.options.getString('tag', true);
      const filePath = `./resource/hanime1/${interaction.guildId}.json`;

      if (!existsSync(filePath)) {
        console.error(
          chalk.yellow(
            `[hanime1]${interaction.user.displayName} - 伺服器未查詢到資料`,
          ),
        );
        await interaction.editReply({
          content: `該伺服器尚未訂閱任何標籤`,
        });
        return;
      }
      const localData: local_subscribe = JSON.parse(
        readFileSync(filePath, 'utf-8'),
      );

      const originalLength = localData.sub.length;
      localData.sub = localData.sub.filter((value) => value.name !== tag);

      if (localData.sub.length === originalLength) {
        console.log(
          chalk.yellow(`[hanime1]${interaction.user.displayName} - 未找到tag`),
        );
        await interaction.editReply({
          content: `伺服器未定閱此標籤`,
        });
        return;
      }

      writeFileSync(filePath, JSON.stringify(localData, null, 2), 'utf-8');
      await interaction.editReply({
        content: `您已成功取消訂閱${tag}`,
      });
      console.log(chalk.green(`${interaction.guildId} rm ${tag}`));
    }
    catch (error) {
      throw `[hnaime1]${error}`;
    }
  },
});
