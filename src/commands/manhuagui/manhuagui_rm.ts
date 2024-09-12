import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { ExtendedClient } from "@/types/ExtendedClient";
import { isNumeric } from "@/utils/isNumeric";

import chalk from "chalk";

import type { local_subscribe } from "@/types/subData";
import type { Command } from "..";

export default {
  data: new SlashCommandBuilder()
    .setName("rm_manhuagui")
    .setNameLocalization("zh-TW", "取消訂閱漫畫")
    .setDescription("取消訂閱在 https://tw.manhuagui.com/ 訂閱的漫畫")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("id")
        .setDescription("漫畫的ID")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction, _) {
    if (!interaction.guildId) throw `cannot use this command in there`;
    try {
      const id = interaction.options.getString("id");

      if (!isNumeric(id!)) {
        await interaction.reply({
          content: `您的輸入包含非法字元`,
          ephemeral: true,
        });
        console.log(
          chalk.red(
            `[manhuagui]${
              interaction.user.displayName
            } - 輸入包含非法字元: ${interaction.options.getString("id")}`
          )
        );
        return;
      }
      const filePath = `./resource/manhuagui/${interaction.guildId}.json`;

      if (!existsSync(filePath)) {
        await interaction.reply({
          content: "該伺服器未訂閱任何作品",
          ephemeral: true,
        });
        console.log(
          chalk.red(
            `[manhuagui] ${interaction.user.displayName} - 未找到伺服器資料: ${interaction.guild?.name}`
          )
        );
        return;
      }

      const localData: local_subscribe = JSON.parse(
        readFileSync(filePath, "utf-8")
      );
      const originalLength = localData.sub.length;
      localData.sub = localData.sub.filter((value) => value.id !== id);

      if (localData.sub.length === originalLength) {
        await interaction.reply({
          content: "伺服器未定閱此作品",
          ephemeral: true,
        });
        console.log(
          chalk.red(
            `[manhuagui]${interaction.user.displayName} - 未找到id: ${id}`
          )
        );
        return;
      }

      writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");

      await interaction.reply({
        content: `您已成功取消訂閱漫畫 ID: ${id}`,
        ephemeral: true,
      });
      console.log(chalk.green(`[manhuagui]${interaction.guildId} rm ${id}`));
    } catch (error) {
      throw `[manhuagui]${error}`;
    }
  },
} as Command;
