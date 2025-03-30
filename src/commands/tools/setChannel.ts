import {
  ChannelType,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandStringOption,
} from 'discord.js';
import { readFileSync } from 'fs';

import logger from '@/class/logger';

import { R7Command } from '@/class/commands';
import type { ManhuaguiCache } from '@/types/cache';
import { disocrdPath } from '@/utils/const';

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
  ephemeral: false,
  async execute(interaction) {
    const option = interaction.options.getString(`option`, true);
    const channel = interaction.options.getChannel<ChannelType.GuildText>(
      `channel`,
      true,
    );

    const filePath = `${disocrdPath.mahuagui}/${interaction.guildId}.json`;
    const localData: ManhuaguiCache = JSON.parse(
      readFileSync(filePath, 'utf-8'),
    );
    logger.trace(filePath);

    localData.channel = channel.id;
    Bun.write(filePath, JSON.stringify(localData, null, 2));

    await interaction.editReply({
      content: `${interaction.user.displayName}已經將${option}訂閱通知移至${channel.name}`,
    });
  },
});
