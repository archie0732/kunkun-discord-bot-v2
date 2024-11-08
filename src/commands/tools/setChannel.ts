import {
  ChannelType,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandStringOption,
} from 'discord.js';
import { readFileSync } from 'fs';

import logger from '@/class/logger';

import type { local_subscribe } from '@/func/types/subData';
import { R7Command } from '@/class/commands';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName(`set_channel`)
    .setNameLocalization('zh-TW', '設定通知頻道')
    .setDescription(`設置漫畫通知的頻道`)
    .addStringOption(
      new SlashCommandStringOption()
        .setName(`option`)
        .setDescription(`設定要移動的項目`)
        .setChoices(
          {
            name: `hanime1`,
            value: `hanime1`,
          },
          {
            name: `manhuagui`,
            value: `manhuagui`,
          },
        )
        .setRequired(true),
    )
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName(`channel`)
        .setDescription(`要移去的頻道`)
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const option = interaction.options.getString(`option`, true);
    const channel = interaction.options.getChannel<ChannelType.GuildText>(
      `channel`,
      true,
    );

    const filePath = `./resource/${option}/${interaction.guildId}.json`;
    const localData: local_subscribe = JSON.parse(
      readFileSync(filePath, 'utf-8'),
    );
    logger.trace(filePath);

    localData.channel = channel.id;
    Bun.write(filePath, JSON.stringify(localData, null, 2));

    await interaction.editReply({
      content: `已經將${option}移至${channel.name}`,
    });
  },
});
