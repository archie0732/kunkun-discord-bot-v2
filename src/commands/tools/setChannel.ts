import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { ExtendedClient } from "@/types/ExtendedClient";

import logger from "@/utils/logger";

import type { local_subscribe } from "@/types/subData";

export default {
  data: new SlashCommandBuilder()
    .setName(`set_channel`)
    .setNameLocalization("zh-TW", "設定通知頻道")
    .setDescription(`設置漫畫通知的頻道`)
    .addStringOption((option) =>
      option
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
          }
        )
        .setRequired(true)
    )
    .addChannelOption((optoin) =>
      optoin.setName(`channel`).setDescription(`要移去的頻道`).setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, _: ExtendedClient) {
    const option = interaction.options.getString(`option`);
    const channel = interaction.options.getChannel(`channel`);
    if (!(channel?.type === ChannelType.GuildText)) {
      await interaction.reply({
        content: `選擇到非法頻道`,
        ephemeral: true,
      });
      return;
    }
    const filePath = `./resource/${option}/${interaction.guildId}.json`;
    const localData: local_subscribe = JSON.parse(
      readFileSync(filePath, "utf-8")
    );
    logger.trace(filePath);
    localData.channel = channel.id;
    writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
    await interaction.reply({
      content: `已經將${option}移至${channel.name}`,
      ephemeral: true,
    });
  },
};
