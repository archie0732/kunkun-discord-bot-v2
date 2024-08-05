import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { describe } from "node:test";
import { ExtendedClient } from "../../types/ExtendedClient";
import { local_subscribe } from "../../types/subData";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";

export default {
  data: new SlashCommandBuilder()
    .setName(`rm_hanime1`)
    .setNameLocalization("zh-TW", "取消訂閱hanime1")
    .setDescription(`取消訂閱在 hanime1.me 上的訂閱內容`)
    .addStringOption((option) => option.setName(`tag`).setDescription(`以訂閱的作者或標籤名`).setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    try {
      const tag = interaction.options.getString(`tag`);
      const filePath = `./resource/hanime1/${interaction.guildId}.json`;

      if (!existsSync(filePath)) {
        console.error(chalk.red(`[hanime1]${interaction.user.displayName} - 伺服器未查詢到資料`));
        await interaction.reply({
          content: `該伺服器尚未訂閱任何標籤`,
          ephemeral: true,
        });
        return;
      }
      const localData: local_subscribe = JSON.parse(readFileSync(filePath, "utf-8"));

      const originalLength = localData.sub.length;
      localData.sub = localData.sub.filter((value) => value.name !== tag);

      if (localData.sub.length === originalLength) {
        console.log(chalk.red(`[hanime1]${interaction.user.displayName} - 未找到tag`));
        await interaction.reply({
          content: `伺服器未定閱此標籤`,
          ephemeral: true,
        });
        return;
      }

      writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
      await interaction.reply({
        content: `您已成功取消訂閱${tag}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(chalk.red(`[hanime1]rm error:`));
      throw error;
    }
  },
};
