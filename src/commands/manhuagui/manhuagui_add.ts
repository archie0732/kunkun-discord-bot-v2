import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { ExtendedClient } from "@/types/ExtendedClient";
import { isNumeric } from "@/utils/isNumeric";

import Manhuagui from "@/api/manhuagui";
import chalk from "chalk";

import type { local_subscribe } from "@/types/subData";

export default {
  data: new SlashCommandBuilder()
    .setName(`sub_manhuagui`)
    .setNameLocalization(`zh-TW`, "訂閱漫畫")
    .setDescription(`新增漫畫到訂閱列表在更新時會有通知`)
    .addStringOption((option) =>
      option.setName(`id`).setDescription(`在 https://tw.manhuagui.com/ 上的漫畫id`).setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction, _: ExtendedClient) {
    try {
      const id = interaction.options.getString("id");
      if (!isNumeric(id || "")) {
        await interaction.reply({
          content: `輸入非法字元`,
          ephemeral: true,
        });
        console.log(chalk.red(`[manhuagui]${interaction.user.displayName} - 輸入非法id: ${id}`));
        return;
      }

      const manhuagui = await Manhuagui.fetchManhuagui(id!);
      if (!manhuagui) {
        await interaction.reply({
          content: `抓取資料失敗`,
          ephemeral: true,
        });
        console.log(`[manhuagui]${interaction.user.displayName} - 抓取資料失敗: ${id}`);
        return;
      }

      const filePath = `./resource/manhuagui/${interaction.guildId}.json`;

      let localData: local_subscribe;
      if (!existsSync(filePath)) {
        localData = {
          guild: `${interaction.guildId}`,
          channel: interaction.channelId,
          sub: [],
        };
      } else {
        localData = JSON.parse(readFileSync(filePath, "utf-8"));
      }

      if (localData.sub.some((value) => value.id === id)) {
        await interaction.reply({
          content: `此漫畫已在訂閱列表中`,
          ephemeral: true,
        });
        console.log(chalk.red(`[manhuagui]${interaction.user.displayName} - 重複訂閱: ${id}`));
        return;
      }

      localData.sub.push({
        name: manhuagui.title.Ch,
        id: id!,
        status: manhuagui.status.now,
        last_up: manhuagui.status.lastest_chapter,
        other: manhuagui.status.chapter_url,
      });

      writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");

      await interaction.reply({
        content: `成功訂閱漫畫 : ${manhuagui.title.Ch}`,
        ephemeral: true,
      });
      console.log(chalk.green(`[manhuagui]${interaction.guildId} sub ${manhuagui.title.Ch}`));
    } catch (error) {
      console.error(chalk.red(`[manhuagui]add error:`));
      throw error;
    }
  },
};
