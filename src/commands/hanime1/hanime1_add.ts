import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { hanime1_fetch } from '@/func/api/hanime1/hanime1_fetch';
import { R7Command } from '@/class/commands';

import chalk from 'chalk';

import type { local_subscribe } from '@/func/types/subData';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('sub_hanime1')
    .setNameLocalization('zh-TW', '訂閱hanime1')
    .setDescription('訂閱在hanime1的作者或作品標籤，當有更新時通知')
    .addStringOption((option) =>
      option.setName('tag').setDescription('作者名或標籤名').setRequired(true),
    ),
  defer: true,
  ephemeral: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const tag = interaction.options.getString('tag')?.replace(/ /g, '%20');

    if (!interaction.guildId) throw `cannot use this command in there`;

    try {
      const hanime1 = await hanime1_fetch(tag!);
      const filePath = `./resource/hanime1/${interaction.guildId}.json`;

      if (!hanime1) {
        console.error(chalk.red(`[hanime1]${tag} - 抓取資料失敗`));
        await interaction.editReply({
          content: '抓取hanime1 資料時發生錯誤',
        });
        return;
      }

      let localData: local_subscribe;
      if (!existsSync(filePath)) {
        localData = {
          guild: interaction.guildId || '',
          channel: interaction.channelId,
          sub: [],
        };
      }
      else {
        localData = JSON.parse(readFileSync(filePath, 'utf-8'));
      }

      if (
        localData.sub.some((value) => value.name.replace(/ /g, '%20') === tag)
      ) {
        await interaction.editReply({
          content: '此標籤已在訂閱列表中',
        });
        console.log(
          chalk.yellow(
            `[hanime1]${interaction.user.username} - 重複訂閱: ${tag}`,
          ),
        );
        return;
      }

      localData.sub.push({
        name: tag!.replace(/%20/g, ' '),
        id: hanime1.id,
        status: '',
        last_up: hanime1.title,
        other: '',
      });

      writeFileSync(filePath, JSON.stringify(localData, null, 2), 'utf-8');
      console.log(
        chalk.green(`[hanime1]${interaction.guild?.name} 訂閱${tag}`),
      );
      await interaction.editReply({
        content: `您已經訂閱${tag?.replace(/%20/g, ' ')} 成功!`,
      });
      console.log(chalk.green(`[hanime1]${interaction.guildId} sub ${tag}`));
    }
    catch (error) {
      console.error(chalk.red(`[hanime1]add error:${error}`));
      await interaction.editReply({
        content: `訂閱失敗，可能是hanime1維修中或是您的關鍵字${tag}有誤`,
      });
    }
  },
});
