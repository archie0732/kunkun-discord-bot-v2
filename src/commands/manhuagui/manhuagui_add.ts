import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { ExtendedClient } from "@/types/ExtendedClient";
import { ManhuaguiError } from "@/api/manhuagui/error";
import { isNumeric } from "@/utils/isNumeric";

import Manhuagui from "@/api/manhuagui";
import logger from "@/utils/logger";

import type { local_subscribe } from "@/types/subData";

export default {
  data: new SlashCommandBuilder()
    .setName(`sub_manhuagui`)
    .setNameLocalization(`zh-TW`, "訂閱漫畫")
    .setDescription(`新增漫畫到訂閱列表在更新時會有通知`)
    .addStringOption(
      new SlashCommandStringOption()
        .setName(`id`)
        .setDescription(`在 https://tw.manhuagui.com/ 上的漫畫id`)
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction, _: ExtendedClient) {
    if (!interaction.inCachedGuild()) return;
    const id = interaction.options.getString("id", true);

    try {
      if (!isNumeric(id)) {
        await interaction.reply({
          content: `輸入非法字元`,
          ephemeral: true,
        });
        return;
      }

      const manhuagui = await Manhuagui.fetchManhuagui(id);

      const filePath = `./resource/manhuagui/${interaction.guild.id}.json`;
      const file = Bun.file(filePath);

      let localData: local_subscribe;

      if (!(await file.exists())) {
        localData = {
          guild: `${interaction.guildId}`,
          channel: interaction.channelId,
          sub: [],
        };
      } else {
        localData = await file.json();
      }

      if (localData.sub.some((value) => value.id === id)) {
        await interaction.reply({
          content: `此漫畫已在訂閱列表中`,
          ephemeral: true,
        });
        return;
      }

      localData.sub.push({
        name: manhuagui.title.Ch,
        id: id!,
        status: manhuagui.status.now,
        last_up: manhuagui.status.lastest_chapter,
        other: manhuagui.status.chapter_url,
      });

      Bun.write(file, JSON.stringify(localData, null, 2));

      await interaction.reply({
        content: `成功訂閱漫畫 : ${manhuagui.title.Ch}`,
        ephemeral: true,
      });

      logger.info(
        `[manhuagui]${interaction.guildId} sub ${manhuagui.title.Ch}`
      );
    } catch (error) {
      if (error instanceof ManhuaguiError) {
        await interaction.reply({
          content: `抓取資料失敗`,
          ephemeral: true,
        });
        logger.error(
          `[manhuagui] ${interaction.user.displayName} - 抓取資料失敗: ${error.message}`,
          error
        );
        return;
      }

      logger.error(`[manhuagui] add error:`, error);
    }
  },
};
