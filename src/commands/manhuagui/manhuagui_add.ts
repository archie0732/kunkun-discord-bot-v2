import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { ManhuaguiError } from "@/func/api/manhuagui/error";
import { isNumeric } from "@/utils/isNumeric";
import { R7Command } from "@/class/commands";

import Manhuagui from "@/func/api/manhuagui";
import logger from "@/class/logger";

import type { local_subscribe } from "@/func/types/subData";

export default new R7Command({
  builder: new SlashCommandBuilder()
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

  defer: true,
  ephemeral: true,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inCachedGuild()) return;
    const id = interaction.options.getString("id", true);

    try {
      if (!isNumeric(id)) {
        await interaction.editReply({
          content: `輸入非法字元`,
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
        await interaction.editReply({
          content: `此漫畫已在訂閱列表中`,
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

      await interaction.editReply({
        content: `成功訂閱漫畫 : ${manhuagui.title.Ch}`,
      });

      logger.info(
        `[manhuagui]${interaction.guildId} sub ${manhuagui.title.Ch}`
      );
    } catch (error) {
      if (error instanceof ManhuaguiError) {
        await interaction.editReply({
          content: `抓取資料失敗`,
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
});
